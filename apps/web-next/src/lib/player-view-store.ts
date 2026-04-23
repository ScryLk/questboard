import { create } from "zustand";
import type {
  ChatMessage,
  ConditionType,
  MapPin,
  MapNote,
  AOEInstance,
  CombatState,
  GameToken,
  FogSettings,
  TokenAlignment,
} from "./gameplay-mock-data";
import { MOCK_SESSION_MAPS } from "./gameplay-mock-data";
import { getZoomInLevel, getZoomOutLevel } from "./map-scale";

// ── Player-visible token (filtered info) ──────────────────────

export interface PlayerToken {
  id: string;
  x: number;
  y: number;
  size: number;
  name: string; // "Criatura" if not revealed
  type: TokenAlignment;
  icon?: string;
  isMe: boolean;

  // HP — depends on type + GM config
  hp?: number;
  maxHp?: number;
  hpDescription?: string; // enemies: "Ferido", "Quase morto"
  hpBarPercent?: number; // visual bar (allies)

  ac?: number; // only own token
  speed?: number;
  conditions: ConditionType[];
  isInvisibleDetected: boolean;
  playerId?: string;
}

// ── Combat filtered for player ────────────────────────────────

export interface PlayerCombatParticipant {
  tokenId: string;
  name: string;
  initiative: number;
  type: TokenAlignment;
  isMe: boolean;
  hpDescription?: string;
  hp?: number;
  maxHp?: number;
  hpBarPercent?: number;
  conditions: ConditionType[];
  isDead: boolean;
}

export interface PlayerCombatState {
  active: boolean;
  round: number;
  currentTurnTokenId: string | null;
  currentTurnName: string;
  participants: PlayerCombatParticipant[];
}

// ── Scene card ────────────────────────────────────────────────

export type SceneCardStyle =
  | "cinematic"
  | "chapter"
  | "location"
  | "mystery"
  | "danger"
  | "flashback"
  | "weather";

export interface SceneCard {
  style: SceneCardStyle;
  title: string;
  subtitle?: string;
  description?: string;
  duration: number; // ms
  tags?: string[];
  chapter?: string;
  linkedMapId?: string;
  linkedMapName?: string;
  autoSwitchMap?: boolean;
}

// ── Lobby types ──────────────────────────────────────────────

export interface LobbyCharacter {
  id: string;
  name: string;
  class: string;
  level: number;
  portraitUrl?: string;
  emoji?: string;
  taken: boolean;
  takenBy?: string;
}

export interface LobbyPlayer {
  id: string;
  name: string;
  characterId: string | null;
  characterName: string | null;
  ready: boolean;
  isMe: boolean;
}

// ── Session summary for end screen ──────────────────────────

export interface SessionSummary {
  duration: string;
  totalRounds: number;
  totalMessages: number;
  totalRolls: number;
  mvp?: string;
}

// ── GM settings that affect player view ───────────────────────

export interface PlayerViewSettings {
  showEnemyNames: boolean;
  showEnemyHpDescription: boolean;
  showEnemyHpNumeric: boolean;
  showEnemyConditions: boolean;
  showAllyHpNumeric: boolean;
  showAllyConditions: boolean;
  canMoveOutOfCombat: boolean;
  canMoveOnTurn: boolean;
  canMoveFreely: boolean;
  showMovementArea: boolean;
  showMovementTracker: boolean;
  canZoom: boolean;
  canPan: boolean;
  canUseRuler: boolean;
  centerOnCurrentTurn: boolean;
  rememberExploredAreas: boolean;
  showTokensInExplored: boolean;
}

export const DEFAULT_PLAYER_VIEW_SETTINGS: PlayerViewSettings = {
  showEnemyNames: true,
  showEnemyHpDescription: true,
  showEnemyHpNumeric: false,
  showEnemyConditions: true,
  showAllyHpNumeric: true,
  showAllyConditions: true,
  canMoveOutOfCombat: true,
  canMoveOnTurn: true,
  canMoveFreely: false,
  showMovementArea: true,
  showMovementTracker: true,
  canZoom: true,
  canPan: true,
  canUseRuler: false,
  centerOnCurrentTurn: true,
  rememberExploredAreas: true,
  showTokensInExplored: false,
};

// ── Player tab types ──────────────────────────────────────────

export type PlayerTab = "ficha" | "chat" | "dados" | "combate";

// ── Player view state ─────────────────────────────────────────

interface PlayerViewState {
  // Connection
  sessionCode: string;
  playerId: string;
  playerName: string;
  characterId: string | null;
  connected: boolean;
  joinStep: "enter-code" | "waiting-gm" | "playing" | "ended";

  // Session info for lobby/join
  campaignName: string;
  gmName: string;
  playerCount: number;
  sessionNumber: number;
  availableCharacters: LobbyCharacter[];
  lobbyPlayers: LobbyPlayer[];

  // My character info
  myToken: PlayerToken | null;

  // Map — filtered (only what player can see)
  visibleTokens: PlayerToken[];
  fogCells: Set<string>;
  exploredCells: Set<string>;
  visibleMarkers: MapPin[];
  visibleNotes: MapNote[];
  visibleAOE: AOEInstance[];

  // Combat
  combat: PlayerCombatState | null;
  isMyTurn: boolean;
  movementUsedFt: number;
  movementMaxFt: number;

  // Chat (filtered — no mesa-gm, no other whispers)
  messages: ChatMessage[];
  chatChannel: "geral" | "sussurro";

  // UI
  activeTab: PlayerTab;
  panelVisible: boolean;

  // Soundtrack
  soundtrack: { playing: boolean; track: string; volume: number; muted: boolean };

  // Scene card
  activeScene: SceneCard | null;

  // Active map
  activeMapId: string | null;
  activeMapName: string | null;

  // Session state
  sessionPaused: boolean;
  sessionEnded: boolean;

  // GM settings
  settings: PlayerViewSettings;

  // Effects
  damageVignette: boolean;
  healGlow: boolean;
  screenShake: boolean;
  natCelebration: "nat20" | "nat1" | null;

  // Fog settings (synced from GM)
  fogSettings: FogSettings;

  // ── Actions ──

  // Connection
  setSessionCode: (code: string) => void;
  setPlayerName: (name: string) => void;
  /** Seta o id do jogador atual. Usado pelo `useIdentityFromUrl` pra
   *  alinhar com `?as=p1|p2|p3` (e com `token.playerId` do GM). */
  setPlayerId: (id: string) => void;
  joinSession: (code: string, name: string) => void;
  setJoinStep: (step: "enter-code" | "waiting-gm" | "playing" | "ended") => void;
  setConnected: (v: boolean) => void;

  // Sync from GM state
  syncFromGM: (data: GMSyncPayload) => void;

  // Player actions
  setActiveTab: (tab: PlayerTab) => void;
  setPanelVisible: (v: boolean) => void;
  setChatChannel: (ch: "geral" | "sussurro") => void;
  addMessage: (msg: ChatMessage) => void;
  addMovementFt: (ft: number) => void;
  resetMovement: () => void;
  endTurn: () => void;
  moveMyToken: (x: number, y: number) => void;

  // Soundtrack
  toggleMute: () => void;
  setVolume: (v: number) => void;

  // Scene card
  setActiveScene: (scene: SceneCard | null) => void;

  // Active map
  setActiveMap: (mapId: string, mapName?: string) => void;

  // Effects
  triggerDamageVignette: () => void;
  triggerHealGlow: () => void;
  triggerScreenShake: () => void;
  triggerNatCelebration: (type: "nat20" | "nat1") => void;

  // Session
  setSessionPaused: (v: boolean) => void;
  setSessionEnded: (v: boolean) => void;

  // Lobby / Join flow
  setCampaignInfo: (info: { campaignName: string; gmName: string; playerCount: number; sessionNumber: number }) => void;
  setAvailableCharacters: (chars: LobbyCharacter[]) => void;
  setLobbyPlayers: (players: LobbyPlayer[]) => void;
  addLobbyPlayer: (player: LobbyPlayer) => void;
  removeLobbyPlayer: (playerId: string) => void;
  setCharacterId: (id: string | null) => void;

  // Summary
  sessionSummary: SessionSummary | null;
  setSessionSummary: (summary: SessionSummary | null) => void;

  // Whisper
  pendingWhisper: {
    fromName: string;
    message: string;
    fromId: string;
    imageUrl?: string;
  } | null;
  showWhisper: (whisper: {
    fromName: string;
    message: string;
    fromId: string;
    imageUrl?: string;
  }) => void;
  dismissWhisper: () => void;

  // Signal
  playerSignal: string | null;
  sendSignal: (type: string) => void;

  // Focus-self trigger — incrementar faz o PlayerCanvas centralizar
  // no próprio token. Padrão "counter" evita guardar ação no store.
  focusSelfTick: number;
  requestFocusSelf: () => void;

  // Movimento com aprovação do GM. Fluxo:
  //  1. Player clica célula → stagedMove { toX, toY, awaitingGM: false }
  //  2. Player confirma → awaitingGM vira true, broadcast pro GM
  //  3. GM aprova → token move via sync, stagedMove some
  //  4. GM rejeita → stagedMove some, toast opcional
  stagedMove: {
    toX: number;
    toY: number;
    awaitingGM: boolean;
    /** Timestamp de quando o staged entrou neste estado (pré-confirm
     *  ou aguardando). Usado pra timer/countdown no UI. */
    stateStartedAt: number;
  } | null;
  stageMove: (toX: number, toY: number) => void;
  confirmStagedMove: () => void;
  clearStagedMove: () => void;

  // Zoom do player canvas (separado do GM/camera-store). Snap nos
  // mesmos 7 níveis discretos do `map-scale`. Default 1.0 = 100%.
  playerZoom: number;
  playerZoomIn: () => void;
  playerZoomOut: () => void;
  resetPlayerZoom: () => void;

  /** Modo do canvas do player:
   *  - "pan" = mão — arrastar para panning + wheel zooma sem modifier
   *  - "action" = ponteiro — clique stageia movimento, drag move token */
  canvasTool: "pan" | "action";
  setCanvasTool: (tool: "pan" | "action") => void;

  /** Token atualmente focado na aba "Alvo". Setado ao short-tap num
   *  token que não é o próprio. Null = aba vazia/empty state. */
  targetTokenId: string | null;
  setTargetTokenId: (id: string | null) => void;
}

// ── Payload from GM sync ──────────────────────────────────────

export interface GMSyncPayload {
  tokens: GameToken[];
  fogCells: Set<string>;
  exploredCells?: Set<string>;
  combat: CombatState;
  messages: ChatMessage[];
  markers: MapPin[];
  notes: MapNote[];
  aoeInstances: AOEInstance[];
  fogSettings: FogSettings;
  settings?: Partial<PlayerViewSettings>;
  soundtrack?: { playing: boolean; track: string; volume: number };
  scene?: SceneCard | null;
  sessionPaused?: boolean;
  sessionEnded?: boolean;
}

// ── Store ─────────────────────────────────────────────────────

export const usePlayerViewStore = create<PlayerViewState>((set, get) => ({
  // Connection
  sessionCode: "",
  playerId: "p1", // default to player 1 for mock
  playerName: "",
  characterId: "p1",
  connected: false,
  joinStep: "enter-code",

  campaignName: "",
  gmName: "",
  playerCount: 0,
  sessionNumber: 0,
  availableCharacters: [],
  lobbyPlayers: [],

  myToken: null,
  visibleTokens: [],
  fogCells: new Set<string>(),
  exploredCells: new Set<string>(),
  visibleMarkers: [],
  visibleNotes: [],
  visibleAOE: [],

  combat: null,
  isMyTurn: false,
  movementUsedFt: 0,
  movementMaxFt: 30,

  messages: [],
  chatChannel: "geral",

  activeTab: "chat",
  panelVisible: true,

  soundtrack: { playing: false, track: "", volume: 80, muted: false },

  activeScene: null,
  activeMapId: MOCK_SESSION_MAPS.find((m) => m.isActive)?.id ?? null,
  activeMapName: MOCK_SESSION_MAPS.find((m) => m.isActive)?.name ?? null,
  sessionPaused: false,
  sessionEnded: false,

  settings: DEFAULT_PLAYER_VIEW_SETTINGS,

  damageVignette: false,
  healGlow: false,
  screenShake: false,
  natCelebration: null,

  fogSettings: {
    style: "fog",
    color: "gray",
    density: 0.95,
    speed: 1.0,
    softEdges: true,
    revealAnimation: true,
  },

  // ── Actions ──

  setSessionCode: (code) => set({ sessionCode: code }),
  setPlayerName: (name) => set({ playerName: name }),
  setPlayerId: (id) => set({ playerId: id }),
  joinSession: (code, name) =>
    set({ sessionCode: code.toUpperCase(), playerName: name, joinStep: "waiting-gm" }),
  setJoinStep: (step) => set({ joinStep: step }),
  setConnected: (v) => set({ connected: v }),

  syncFromGM: (_data) => {
    // Sync is handled by BroadcastSync component which calls buildPlayerView directly
    // and sets state via usePlayerViewStore.setState(). This action is kept as a
    // placeholder for future Socket.IO integration.
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setPanelVisible: (v) => set({ panelVisible: v }),
  setChatChannel: (ch) => set({ chatChannel: ch }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  addMovementFt: (ft) => set((s) => ({ movementUsedFt: s.movementUsedFt + ft })),
  resetMovement: () => set({ movementUsedFt: 0 }),
  endTurn: () => set({ isMyTurn: false, movementUsedFt: 0 }),

  moveMyToken: (x, y) => {
    set((s) => ({
      visibleTokens: s.visibleTokens.map((t) =>
        t.isMe ? { ...t, x, y } : t,
      ),
      myToken: s.myToken ? { ...s.myToken, x, y } : null,
    }));
  },

  toggleMute: () =>
    set((s) => ({
      soundtrack: { ...s.soundtrack, muted: !s.soundtrack.muted },
    })),
  setVolume: (v) =>
    set((s) => ({
      soundtrack: { ...s.soundtrack, volume: v },
    })),

  setActiveScene: (scene) => set({ activeScene: scene }),
  setActiveMap: (mapId, mapName) => set({ activeMapId: mapId, activeMapName: mapName ?? null }),

  triggerDamageVignette: () => {
    set({ damageVignette: true, screenShake: true });
    setTimeout(() => set({ damageVignette: false, screenShake: false }), 300);
  },
  triggerHealGlow: () => {
    set({ healGlow: true });
    setTimeout(() => set({ healGlow: false }), 400);
  },
  triggerScreenShake: () => {
    set({ screenShake: true });
    setTimeout(() => set({ screenShake: false }), 250);
  },
  triggerNatCelebration: (type) => {
    set({ natCelebration: type });
    setTimeout(() => set({ natCelebration: null }), 2500);
  },

  setSessionPaused: (v) => set({ sessionPaused: v }),
  setSessionEnded: (v) => set({ sessionEnded: v }),

  // Lobby / Join flow
  setCampaignInfo: (info) => set(info),
  setAvailableCharacters: (chars) => set({ availableCharacters: chars }),
  setLobbyPlayers: (players) => set({ lobbyPlayers: players }),
  addLobbyPlayer: (player) =>
    set((s) => ({ lobbyPlayers: [...s.lobbyPlayers, player] })),
  removeLobbyPlayer: (playerId) =>
    set((s) => ({ lobbyPlayers: s.lobbyPlayers.filter((p) => p.id !== playerId) })),
  setCharacterId: (id) => set({ characterId: id }),

  // Summary
  sessionSummary: null,
  setSessionSummary: (summary) => set({ sessionSummary: summary }),

  // Whisper
  pendingWhisper: null,
  showWhisper: (whisper) => set({ pendingWhisper: whisper }),
  dismissWhisper: () => set({ pendingWhisper: null }),

  // Signal
  playerSignal: null,
  sendSignal: (type) => {
    set({ playerSignal: type });
    setTimeout(() => set({ playerSignal: null }), 3000);
  },

  focusSelfTick: 0,
  requestFocusSelf: () => set((s) => ({ focusSelfTick: s.focusSelfTick + 1 })),

  stagedMove: null,
  stageMove: (toX, toY) =>
    set({
      stagedMove: {
        toX,
        toY,
        awaitingGM: false,
        stateStartedAt: Date.now(),
      },
    }),
  confirmStagedMove: () =>
    set((s) =>
      s.stagedMove
        ? {
            stagedMove: {
              ...s.stagedMove,
              awaitingGM: true,
              stateStartedAt: Date.now(),
            },
          }
        : s,
    ),
  clearStagedMove: () => set({ stagedMove: null }),

  playerZoom: 1.0,
  playerZoomIn: () =>
    set((s) => ({ playerZoom: getZoomInLevel(s.playerZoom) })),
  playerZoomOut: () =>
    set((s) => ({ playerZoom: getZoomOutLevel(s.playerZoom) })),
  resetPlayerZoom: () => set({ playerZoom: 1.0 }),

  canvasTool: "action",
  setCanvasTool: (tool) => set({ canvasTool: tool }),

  targetTokenId: null,
  setTargetTokenId: (id) => set({ targetTokenId: id }),
}));
