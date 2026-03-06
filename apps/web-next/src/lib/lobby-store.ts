import { create } from "zustand";

// ── Types ──

export type PlayerLobbyStatus =
  | "connecting"
  | "choosing_character"
  | "ready"
  | "not_ready"
  | "afk"
  | "disconnected";

export type SessionLobbyStatus =
  | "waiting"        // Not started yet
  | "in_progress"    // Game running
  | "paused"
  | "ended"
  | "full";

export interface LobbyPlayer {
  id: string;
  name: string;
  avatar: string | null;
  status: PlayerLobbyStatus;
  characterId: string | null;
  characterName: string | null;
  characterClass: string | null;
  characterLevel: number | null;
  role: "GM" | "PLAYER" | "SPECTATOR";
  joinedAt: string;
  lastActivity: string;
  isReconnecting: boolean;
}

export interface LobbyMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  type: "message" | "system" | "gm_announcement";
}

export interface PendingJoinRequest {
  playerId: string;
  playerName: string;
  avatar: string | null;
  requestedAt: string;
  previousCharacter?: string;
}

export interface LobbySessionInfo {
  id: string;
  name: string;
  campaignName: string;
  inviteCode: string;
  mapName: string | null;
  maxPlayers: number;
  status: SessionLobbyStatus;
  date: string;
}

// ── Store ──

interface LobbyState {
  // Status
  lobbyActive: boolean;
  sessionInfo: LobbySessionInfo | null;
  isGM: boolean;
  myPlayerId: string;

  // Players
  players: LobbyPlayer[];

  // Pending requests (session in progress)
  pendingRequests: PendingJoinRequest[];

  // Chat
  chatMessages: LobbyMessage[];

  // Countdown
  countdownActive: boolean;
  countdownSeconds: number;

  // Lobby music
  lobbyMusic: string | null;

  // Player join flow state
  joinRequestStatus: "idle" | "pending" | "accepted" | "rejected" | "timeout";

  // ── GM Actions ──
  setSessionInfo: (info: LobbySessionInfo) => void;
  setIsGM: (v: boolean) => void;
  setMyPlayerId: (id: string) => void;
  setLobbyActive: (v: boolean) => void;

  addPlayer: (player: LobbyPlayer) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerStatus: (playerId: string, status: PlayerLobbyStatus) => void;
  updatePlayerCharacter: (
    playerId: string,
    characterId: string,
    characterName: string,
    characterClass: string,
    characterLevel: number,
  ) => void;
  setPlayers: (players: LobbyPlayer[]) => void;

  // Pending join requests
  addPendingRequest: (req: PendingJoinRequest) => void;
  removePendingRequest: (playerId: string) => void;
  acceptPlayer: (playerId: string) => void;
  rejectPlayer: (playerId: string) => void;

  // Chat
  addChatMessage: (msg: LobbyMessage) => void;
  sendMessage: (text: string) => void;

  // Countdown
  startCountdown: (seconds: number) => void;
  tickCountdown: () => void;
  cancelCountdown: () => void;

  // Music
  setLobbyMusic: (track: string | null) => void;

  // Player-side
  setJoinRequestStatus: (status: LobbyState["joinRequestStatus"]) => void;

  // Reset
  resetLobby: () => void;
}

const initialState = {
  lobbyActive: false,
  sessionInfo: null,
  isGM: false,
  myPlayerId: "",
  players: [],
  pendingRequests: [],
  chatMessages: [],
  countdownActive: false,
  countdownSeconds: 0,
  lobbyMusic: null,
  joinRequestStatus: "idle" as const,
};

export const useLobbyStore = create<LobbyState>((set, get) => ({
  ...initialState,

  setSessionInfo: (info) => set({ sessionInfo: info }),
  setIsGM: (v) => set({ isGM: v }),
  setMyPlayerId: (id) => set({ myPlayerId: id }),
  setLobbyActive: (v) => set({ lobbyActive: v }),

  addPlayer: (player) =>
    set((s) => {
      // Don't add duplicates
      if (s.players.some((p) => p.id === player.id)) {
        return {
          players: s.players.map((p) => (p.id === player.id ? { ...p, ...player } : p)),
        };
      }
      return { players: [...s.players, player] };
    }),

  removePlayer: (playerId) =>
    set((s) => ({ players: s.players.filter((p) => p.id !== playerId) })),

  updatePlayerStatus: (playerId, status) =>
    set((s) => ({
      players: s.players.map((p) =>
        p.id === playerId ? { ...p, status, lastActivity: new Date().toISOString() } : p,
      ),
    })),

  updatePlayerCharacter: (playerId, characterId, characterName, characterClass, characterLevel) =>
    set((s) => ({
      players: s.players.map((p) =>
        p.id === playerId
          ? { ...p, characterId, characterName, characterClass, characterLevel, status: "not_ready" }
          : p,
      ),
    })),

  setPlayers: (players) => set({ players }),

  addPendingRequest: (req) =>
    set((s) => {
      if (s.pendingRequests.some((r) => r.playerId === req.playerId)) return s;
      return { pendingRequests: [...s.pendingRequests, req] };
    }),

  removePendingRequest: (playerId) =>
    set((s) => ({
      pendingRequests: s.pendingRequests.filter((r) => r.playerId !== playerId),
    })),

  acceptPlayer: (playerId) => {
    const req = get().pendingRequests.find((r) => r.playerId === playerId);
    if (req) {
      get().removePendingRequest(playerId);
      get().addPlayer({
        id: req.playerId,
        name: req.playerName,
        avatar: req.avatar,
        status: "choosing_character",
        characterId: null,
        characterName: null,
        characterClass: null,
        characterLevel: null,
        role: "PLAYER",
        joinedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        isReconnecting: false,
      });
      get().addChatMessage({
        id: `sys-${Date.now()}`,
        senderId: "system",
        senderName: "Sistema",
        text: `${req.playerName} entrou na sessão`,
        timestamp: new Date().toISOString(),
        type: "system",
      });
    }
  },

  rejectPlayer: (playerId) => {
    get().removePendingRequest(playerId);
  },

  addChatMessage: (msg) =>
    set((s) => ({ chatMessages: [...s.chatMessages, msg] })),

  sendMessage: (text) => {
    const { myPlayerId, players, isGM } = get();
    const me = players.find((p) => p.id === myPlayerId);
    const name = me?.name ?? (isGM ? "GM" : "Jogador");

    const msg: LobbyMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId: myPlayerId,
      senderName: name,
      text,
      timestamp: new Date().toISOString(),
      type: isGM ? "gm_announcement" : "message",
    };

    get().addChatMessage(msg);
  },

  startCountdown: (seconds) => set({ countdownActive: true, countdownSeconds: seconds }),

  tickCountdown: () =>
    set((s) => {
      if (!s.countdownActive) return s;
      const next = s.countdownSeconds - 1;
      if (next <= 0) return { countdownActive: false, countdownSeconds: 0 };
      return { countdownSeconds: next };
    }),

  cancelCountdown: () => set({ countdownActive: false, countdownSeconds: 0 }),

  setLobbyMusic: (track) => set({ lobbyMusic: track }),

  setJoinRequestStatus: (status) => set({ joinRequestStatus: status }),

  resetLobby: () => set(initialState),
}));

// ── Mock data for development ──

export const MOCK_LOBBY_SESSION: LobbySessionInfo = {
  id: "sess-14",
  name: "A Maldição de Strahd",
  campaignName: "Curse of Strahd",
  inviteCode: "B7M2X4",
  mapName: "Castelo de Ravenloft — Andar 3",
  maxPlayers: 6,
  status: "waiting",
  date: new Date().toISOString(),
};

export const MOCK_LOBBY_PLAYERS: LobbyPlayer[] = [
  {
    id: "gm-1",
    name: "Lucas",
    avatar: null,
    status: "ready",
    characterId: null,
    characterName: null,
    characterClass: null,
    characterLevel: null,
    role: "GM",
    joinedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    isReconnecting: false,
  },
  {
    id: "p-1",
    name: "Maria Santos",
    avatar: null,
    status: "ready",
    characterId: "c1",
    characterName: "Eldrin Ventoalto",
    characterClass: "Mago",
    characterLevel: 5,
    role: "PLAYER",
    joinedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    isReconnecting: false,
  },
  {
    id: "p-2",
    name: "Pedro Almeida",
    avatar: null,
    status: "ready",
    characterId: "c2",
    characterName: "Kira Shadowblade",
    characterClass: "Ladina",
    characterLevel: 5,
    role: "PLAYER",
    joinedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    isReconnecting: false,
  },
  {
    id: "p-3",
    name: "Ana Rodrigues",
    avatar: null,
    status: "choosing_character",
    characterId: null,
    characterName: null,
    characterClass: null,
    characterLevel: null,
    role: "PLAYER",
    joinedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    isReconnecting: false,
  },
];

export const MOCK_LOBBY_MESSAGES: LobbyMessage[] = [
  {
    id: "sys-1",
    senderId: "system",
    senderName: "Sistema",
    text: "Maria entrou na sala",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    type: "system",
  },
  {
    id: "msg-1",
    senderId: "p-1",
    senderName: "Maria Santos",
    text: "bora jogar!",
    timestamp: new Date(Date.now() - 240000).toISOString(),
    type: "message",
  },
  {
    id: "msg-2",
    senderId: "p-2",
    senderName: "Pedro Almeida",
    text: "to pronto",
    timestamp: new Date(Date.now() - 180000).toISOString(),
    type: "message",
  },
  {
    id: "sys-2",
    senderId: "system",
    senderName: "Sistema",
    text: "Ana entrou na sala",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    type: "system",
  },
  {
    id: "msg-3",
    senderId: "gm-1",
    senderName: "Lucas",
    text: "Começamos em 5 minutos, revisem as fichas!",
    timestamp: new Date(Date.now() - 30000).toISOString(),
    type: "gm_announcement",
  },
];
