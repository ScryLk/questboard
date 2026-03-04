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

export interface SceneCard {
  style: "cinematic" | "chapter" | "location";
  title: string;
  subtitle?: string;
  description?: string;
  duration: number; // ms
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
  joinStep: "enter-code" | "waiting-gm" | "playing";

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
  joinSession: (code: string, name: string) => void;
  setJoinStep: (step: "enter-code" | "waiting-gm" | "playing") => void;
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

  // Effects
  triggerDamageVignette: () => void;
  triggerHealGlow: () => void;
  triggerScreenShake: () => void;
  triggerNatCelebration: (type: "nat20" | "nat1") => void;

  // Session
  setSessionPaused: (v: boolean) => void;
  setSessionEnded: (v: boolean) => void;
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
}));
