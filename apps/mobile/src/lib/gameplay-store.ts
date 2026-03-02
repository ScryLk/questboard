import { create } from "zustand";

// ─── State Interfaces ────────────────────────────────────

export interface TokenState {
  id: string;
  name: string;
  imageUrl: string | null;
  emoji: string;
  x: number;
  y: number;
  size: number;
  layer: "character" | "npc" | "object";
  visible: boolean;
  characterId: string | null;
  hp: { current: number; max: number } | null;
  conditions: string[];
  ownerId: string;
  color: string;
}

export interface FogAreaState {
  id: string;
  type: "rectangle";
  x: number;
  y: number;
  width: number;
  height: number;
  revealed: boolean;
}

export interface CombatParticipant {
  id: string;
  tokenId: string;
  name: string;
  emoji: string;
  initiative: number;
  isNPC: boolean;
  isDead: boolean;
}

export type ChatChannel = "GENERAL" | "IN_CHARACTER" | "WHISPER" | "GM_ONLY" | "SYSTEM";

export type ChatMessageType =
  | "text"
  | "in_character"
  | "whisper"
  | "gm_only"
  | "system"
  | "dice_roll"
  | "narrative";

export interface ChatMessage {
  id: string;
  channel: ChatChannel;
  type: ChatMessageType;
  content: string;
  senderName: string;
  senderEmoji: string;
  characterName?: string;
  timestamp: string;
  diceResult?: {
    formula: string;
    rolls: number[];
    total: number;
    label?: string;
    isNat20?: boolean;
    isNat1?: boolean;
  };
  targetName?: string;
}

export interface DiceResultData {
  rollerName: string;
  rollerEmoji: string;
  label: string;
  formula: string;
  rolls: number[];
  total: number;
  isNat20: boolean;
  isNat1: boolean;
}

export interface SceneCardData {
  variant: "cinematic" | "title" | "location";
  title: string;
  subtitle?: string;
  chapter?: string;
  details?: string[];
}

export interface OnlinePlayer {
  id: string;
  name: string;
  emoji: string;
  role: "gm" | "player";
  characterName: string | null;
  isOnline: boolean;
}

export type PanelType = "chat" | "dice" | "sheet" | "gmtools" | null;

// ─── Store Interface ─────────────────────────────────────

export interface GameplayStore {
  // Session
  sessionId: string;
  sessionName: string;
  sessionSystem: string;
  sessionStatus: "IDLE" | "LIVE" | "PAUSED" | "ENDED";
  isGM: boolean;
  myPlayerId: string;
  myTokenId: string | null;

  // Map
  mapImage: { url: string; width: number; height: number } | null;
  viewport: { x: number; y: number; zoom: number };
  gridType: "SQUARE" | "HEX" | "NONE";
  gridSize: number;
  gridVisible: boolean;

  // Tokens
  tokens: Record<string, TokenState>;
  selectedTokenId: string | null;

  // Fog
  fogAreas: FogAreaState[];
  fogBrushActive: boolean;
  fogBrushMode: "reveal" | "hide";

  // Combat
  combatActive: boolean;
  combatRound: number;
  combatParticipants: CombatParticipant[];
  currentTurnIndex: number;

  // Chat
  messages: ChatMessage[];
  activeChannel: ChatChannel;
  chatUnreadCount: number;

  // Dice
  lastDiceResult: DiceResultData | null;
  diceResultVisible: boolean;

  // Scene Card
  sceneCard: SceneCardData | null;
  sceneCardVisible: boolean;

  // Panels
  activePanel: PanelType;

  // Players
  onlinePlayers: OnlinePlayer[];

  // Context menu
  contextMenuTokenId: string | null;
  contextMenuPosition: { x: number; y: number } | null;

  // ─── Actions ───────────────────────────────────────

  // Viewport
  setViewport: (viewport: Partial<GameplayStore["viewport"]>) => void;
  toggleGrid: () => void;

  // Tokens
  selectToken: (tokenId: string | null) => void;
  moveToken: (tokenId: string, x: number, y: number) => void;
  updateTokenHp: (tokenId: string, delta: number) => void;
  addToken: (token: TokenState) => void;
  removeToken: (tokenId: string) => void;

  // Fog
  toggleFogArea: (areaId: string) => void;
  setFogBrush: (active: boolean, mode?: "reveal" | "hide") => void;

  // Combat
  startCombat: (participants: CombatParticipant[]) => void;
  endCombat: () => void;
  nextTurn: () => void;

  // Chat
  addMessage: (message: ChatMessage) => void;
  setActiveChannel: (channel: ChatChannel) => void;
  clearUnread: () => void;

  // Dice
  showDiceResult: (result: DiceResultData) => void;
  hideDiceResult: () => void;

  // Scene Card
  showSceneCard: (card: SceneCardData) => void;
  hideSceneCard: () => void;

  // Panels
  setActivePanel: (panel: PanelType) => void;
  togglePanel: (panel: PanelType) => void;

  // Context Menu
  showContextMenu: (tokenId: string | null, position: { x: number; y: number }) => void;
  hideContextMenu: () => void;

  // Session
  setSessionStatus: (status: GameplayStore["sessionStatus"]) => void;

  // Init
  loadMockData: () => void;
}

// ─── Store ───────────────────────────────────────────────

export const useGameplayStore = create<GameplayStore>((set, get) => ({
  // Session
  sessionId: "",
  sessionName: "",
  sessionSystem: "",
  sessionStatus: "IDLE",
  isGM: true,
  myPlayerId: "player-1",
  myTokenId: "token-eldrin",

  // Map
  mapImage: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  gridType: "SQUARE",
  gridSize: 50,
  gridVisible: true,

  // Tokens
  tokens: {},
  selectedTokenId: null,

  // Fog
  fogAreas: [],
  fogBrushActive: false,
  fogBrushMode: "reveal",

  // Combat
  combatActive: false,
  combatRound: 1,
  combatParticipants: [],
  currentTurnIndex: 0,

  // Chat
  messages: [],
  activeChannel: "GENERAL",
  chatUnreadCount: 0,

  // Dice
  lastDiceResult: null,
  diceResultVisible: false,

  // Scene Card
  sceneCard: null,
  sceneCardVisible: false,

  // Panels
  activePanel: null,

  // Players
  onlinePlayers: [],

  // Context Menu
  contextMenuTokenId: null,
  contextMenuPosition: null,

  // ─── Actions ───────────────────────────────────────

  setViewport: (partial) =>
    set((s) => ({ viewport: { ...s.viewport, ...partial } })),

  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),

  selectToken: (tokenId) => set({ selectedTokenId: tokenId }),

  moveToken: (tokenId, x, y) =>
    set((s) => ({
      tokens: {
        ...s.tokens,
        [tokenId]: { ...s.tokens[tokenId], x, y },
      },
    })),

  updateTokenHp: (tokenId, delta) =>
    set((s) => {
      const token = s.tokens[tokenId];
      if (!token?.hp) return s;
      const newCurrent = Math.max(0, Math.min(token.hp.max, token.hp.current + delta));
      return {
        tokens: {
          ...s.tokens,
          [tokenId]: {
            ...token,
            hp: { ...token.hp, current: newCurrent },
          },
        },
      };
    }),

  addToken: (token) =>
    set((s) => ({ tokens: { ...s.tokens, [token.id]: token } })),

  removeToken: (tokenId) =>
    set((s) => {
      const { [tokenId]: _, ...rest } = s.tokens;
      return { tokens: rest, selectedTokenId: s.selectedTokenId === tokenId ? null : s.selectedTokenId };
    }),

  toggleFogArea: (areaId) =>
    set((s) => ({
      fogAreas: s.fogAreas.map((a) =>
        a.id === areaId ? { ...a, revealed: !a.revealed } : a,
      ),
    })),

  setFogBrush: (active, mode) =>
    set({ fogBrushActive: active, fogBrushMode: mode ?? "reveal" }),

  startCombat: (participants) =>
    set({
      combatActive: true,
      combatRound: 1,
      combatParticipants: [...participants].sort(
        (a, b) => b.initiative - a.initiative,
      ),
      currentTurnIndex: 0,
    }),

  endCombat: () =>
    set({
      combatActive: false,
      combatRound: 1,
      combatParticipants: [],
      currentTurnIndex: 0,
    }),

  nextTurn: () =>
    set((s) => {
      const nextIndex = s.currentTurnIndex + 1;
      if (nextIndex >= s.combatParticipants.length) {
        return { currentTurnIndex: 0, combatRound: s.combatRound + 1 };
      }
      return { currentTurnIndex: nextIndex };
    }),

  addMessage: (message) =>
    set((s) => ({
      messages: [...s.messages, message],
      chatUnreadCount:
        s.activePanel === "chat" ? s.chatUnreadCount : s.chatUnreadCount + 1,
    })),

  setActiveChannel: (channel) => set({ activeChannel: channel }),

  clearUnread: () => set({ chatUnreadCount: 0 }),

  showDiceResult: (result) =>
    set({ lastDiceResult: result, diceResultVisible: true }),

  hideDiceResult: () => set({ diceResultVisible: false }),

  showSceneCard: (card) =>
    set({ sceneCard: card, sceneCardVisible: true }),

  hideSceneCard: () => set({ sceneCardVisible: false }),

  setActivePanel: (panel) => {
    set({ activePanel: panel });
    if (panel === "chat") {
      set({ chatUnreadCount: 0 });
    }
  },

  togglePanel: (panel) => {
    const current = get().activePanel;
    if (current === panel) {
      set({ activePanel: null });
    } else {
      set({ activePanel: panel });
      if (panel === "chat") {
        set({ chatUnreadCount: 0 });
      }
    }
  },

  showContextMenu: (tokenId, position) =>
    set({ contextMenuTokenId: tokenId, contextMenuPosition: position }),

  hideContextMenu: () =>
    set({ contextMenuTokenId: null, contextMenuPosition: null }),

  setSessionStatus: (status) => set({ sessionStatus: status }),

  loadMockData: () => {
    // Populated by gameplay-mock-data.ts
  },
}));
