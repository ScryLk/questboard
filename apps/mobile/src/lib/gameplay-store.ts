import { create } from "zustand";

// ─── State Interfaces ────────────────────────────────────

export interface TokenState {
  id: string;
  name: string;
  imageUrl: string | null;
  icon: string;
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
  ac: number | null;
  hostility: NPCHostility | null;
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
  icon: string;
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
  senderIcon: string;
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
  rollerIcon: string;
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
  icon: string;
  role: "gm" | "player";
  characterName: string | null;
  isOnline: boolean;
}

export type PanelType = "chat" | "dice" | "sheet" | "gmtools" | null;

// ─── GM Tool Sub-Modal Types ────────────────────────────

export type GMToolView =
  | "token-manager"
  | "combat-manager"
  | "scene-card"
  | "soundtrack"
  | null;

export type TokenLayerFilter = "all" | "character" | "npc" | "object";
export type InitiativeMode = "auto" | "manual";
export type NPCHostility = "hostile" | "neutral" | "friendly";
export type SoundtrackCategory =
  | "all"
  | "ambient"
  | "combat"
  | "exploration"
  | "horror"
  | "dramatic"
  | "rest";

export interface SceneCardDraft {
  id: string;
  label: string;
  card: SceneCardData;
}

export interface SoundtrackTrack {
  id: string;
  name: string;
  category: SoundtrackCategory;
  duration: number;
  isLoop: boolean;
  isFavorite: boolean;
}

export interface AmbientLayer {
  id: string;
  name: string;
  icon: string;
  volume: number;
}

export interface SoundtrackState {
  currentTrack: SoundtrackTrack | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  activeCategory: SoundtrackCategory;
  ambientLayers: AmbientLayer[];
}

// ─── Character Sheet & NPC Types ────────────────────────

export interface CharacterSheetAbility {
  score: number;
  modifier: number;
  saveProficiency: boolean;
}

export interface CharacterSheetSkill {
  name: string;
  modifier: number;
  proficient: boolean;
}

export interface CharacterSheetFeature {
  name: string;
  description: string;
  uses: { current: number; max: number } | null;
}

export interface CharacterSheetData {
  name: string;
  playerName: string;
  class: string;
  race: string;
  level: number;
  hp: { current: number; max: number };
  ac: number;
  initiative: number;
  speed: number;
  abilities: Record<string, CharacterSheetAbility>;
  skills: CharacterSheetSkill[];
  proficiencies: {
    armor: string[];
    weapons: string[];
    languages: string[];
  };
  features: CharacterSheetFeature[];
}

export interface NPCAction {
  name: string;
  description: string;
  attackBonus?: number;
  damage?: string;
}

export interface NPCStatBlock {
  name: string;
  type: string;
  hp: { current: number; max: number };
  ac: number;
  speed: number;
  passivePerception: number;
  hostility: "hostile" | "neutral" | "friendly";
  abilities: Record<string, { score: number; modifier: number }>;
  actions: NPCAction[];
  traits?: { name: string; description: string }[];
  conditions: string[];
}

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
  activeGMToolView: GMToolView;

  // Scene Card Drafts
  sceneCardDrafts: SceneCardDraft[];

  // Soundtrack
  soundtrack: SoundtrackState;

  // Players
  onlinePlayers: OnlinePlayer[];

  // Context menu
  contextMenuTokenId: string | null;
  contextMenuPosition: { x: number; y: number } | null;

  // Character Sheet Viewing
  viewingCharacterId: string | null;
  viewingTokenId: string | null;
  viewingType: "player" | "npc" | null;
  gmNotes: Record<string, string>;

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

  // GM Tool Sub-Modals
  openGMToolView: (view: GMToolView) => void;
  closeGMToolView: () => void;

  // Token Manager
  updateToken: (tokenId: string, updates: Partial<TokenState>) => void;
  toggleTokenVisibility: (tokenId: string) => void;
  centerOnToken: (tokenId: string) => void;

  // Combat Manager Extensions
  updateParticipantInitiative: (id: string, initiative: number) => void;
  removeParticipant: (id: string) => void;
  addParticipantMidCombat: (participant: CombatParticipant) => void;
  toggleParticipantDead: (id: string) => void;
  reorderParticipant: (id: string, newIndex: number) => void;
  delayTurn: (id: string) => void;

  // Scene Card Drafts
  saveSceneCardDraft: (draft: SceneCardDraft) => void;
  deleteSceneCardDraft: (draftId: string) => void;

  // Soundtrack
  setCurrentTrack: (track: SoundtrackTrack | null) => void;
  togglePlayback: () => void;
  setSoundtrackVolume: (volume: number) => void;
  setSoundtrackCategory: (category: SoundtrackCategory) => void;
  toggleTrackFavorite: (trackId: string) => void;
  setAmbientLayerVolume: (layerId: string, volume: number) => void;
  toggleMuteAll: () => void;

  // Context Menu
  showContextMenu: (tokenId: string | null, position: { x: number; y: number }) => void;
  hideContextMenu: () => void;

  // Session
  setSessionStatus: (status: GameplayStore["sessionStatus"]) => void;

  // Character Sheet Viewing
  openCharacterSheet: (tokenId: string) => void;
  closeCharacterSheet: () => void;
  closeAllPanels: () => void;
  updateGMNote: (characterId: string, note: string) => void;
  updateTokenConditions: (tokenId: string, conditions: string[]) => void;

  // Map image
  setMapImage: (image: GameplayStore["mapImage"]) => void;

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
  activeGMToolView: null,

  // Scene Card Drafts
  sceneCardDrafts: [],

  // Soundtrack
  soundtrack: {
    currentTrack: null,
    isPlaying: false,
    volume: 80,
    isMuted: false,
    activeCategory: "all",
    ambientLayers: [],
  },

  // Players
  onlinePlayers: [],

  // Context Menu
  contextMenuTokenId: null,
  contextMenuPosition: null,

  // Character Sheet Viewing
  viewingCharacterId: null,
  viewingTokenId: null,
  viewingType: null,
  gmNotes: {},

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
      return {
        tokens: rest,
        selectedTokenId: s.selectedTokenId === tokenId ? null : s.selectedTokenId,
        ...(s.viewingTokenId === tokenId
          ? { viewingTokenId: null, viewingCharacterId: null, viewingType: null }
          : {}),
      };
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

  // ─── GM Tool Sub-Modals ─────────────────────────────

  openGMToolView: (view) =>
    set({ activePanel: null, activeGMToolView: view }),

  closeGMToolView: () =>
    set({ activeGMToolView: null, activePanel: "gmtools" }),

  // ─── Token Manager ────────────────────────────────────

  updateToken: (tokenId, updates) =>
    set((s) => {
      const token = s.tokens[tokenId];
      if (!token) return s;
      return {
        tokens: { ...s.tokens, [tokenId]: { ...token, ...updates } },
      };
    }),

  toggleTokenVisibility: (tokenId) =>
    set((s) => {
      const token = s.tokens[tokenId];
      if (!token) return s;
      return {
        tokens: {
          ...s.tokens,
          [tokenId]: { ...token, visible: !token.visible },
        },
      };
    }),

  centerOnToken: (tokenId) => {
    const token = get().tokens[tokenId];
    if (!token) return;
    set({
      viewport: { x: token.x * get().gridSize, y: token.y * get().gridSize, zoom: get().viewport.zoom },
    });
  },

  // ─── Combat Manager Extensions ────────────────────────

  updateParticipantInitiative: (id, initiative) =>
    set((s) => ({
      combatParticipants: s.combatParticipants.map((p) =>
        p.id === id ? { ...p, initiative } : p,
      ),
    })),

  removeParticipant: (id) =>
    set((s) => {
      const filtered = s.combatParticipants.filter((p) => p.id !== id);
      return {
        combatParticipants: filtered,
        currentTurnIndex: Math.min(s.currentTurnIndex, Math.max(0, filtered.length - 1)),
      };
    }),

  addParticipantMidCombat: (participant) =>
    set((s) => ({
      combatParticipants: [...s.combatParticipants, participant].sort(
        (a, b) => b.initiative - a.initiative,
      ),
    })),

  toggleParticipantDead: (id) =>
    set((s) => ({
      combatParticipants: s.combatParticipants.map((p) =>
        p.id === id ? { ...p, isDead: !p.isDead } : p,
      ),
    })),

  reorderParticipant: (id, newIndex) =>
    set((s) => {
      const list = [...s.combatParticipants];
      const oldIndex = list.findIndex((p) => p.id === id);
      if (oldIndex === -1 || newIndex < 0 || newIndex >= list.length) return s;
      const [item] = list.splice(oldIndex, 1);
      list.splice(newIndex, 0, item);
      return { combatParticipants: list };
    }),

  delayTurn: (id) =>
    set((s) => {
      const list = [...s.combatParticipants];
      const idx = list.findIndex((p) => p.id === id);
      if (idx === -1 || idx >= list.length - 1) return s;
      const [item] = list.splice(idx, 1);
      list.splice(idx + 1, 0, item);
      return { combatParticipants: list };
    }),

  // ─── Scene Card Drafts ────────────────────────────────

  saveSceneCardDraft: (draft) =>
    set((s) => {
      const existing = s.sceneCardDrafts.findIndex((d) => d.id === draft.id);
      if (existing >= 0) {
        const updated = [...s.sceneCardDrafts];
        updated[existing] = draft;
        return { sceneCardDrafts: updated };
      }
      return { sceneCardDrafts: [...s.sceneCardDrafts, draft] };
    }),

  deleteSceneCardDraft: (draftId) =>
    set((s) => ({
      sceneCardDrafts: s.sceneCardDrafts.filter((d) => d.id !== draftId),
    })),

  // ─── Soundtrack ───────────────────────────────────────

  setCurrentTrack: (track) =>
    set((s) => ({
      soundtrack: { ...s.soundtrack, currentTrack: track, isPlaying: !!track },
    })),

  togglePlayback: () =>
    set((s) => ({
      soundtrack: { ...s.soundtrack, isPlaying: !s.soundtrack.isPlaying },
    })),

  setSoundtrackVolume: (volume) =>
    set((s) => ({
      soundtrack: { ...s.soundtrack, volume },
    })),

  setSoundtrackCategory: (category) =>
    set((s) => ({
      soundtrack: { ...s.soundtrack, activeCategory: category },
    })),

  toggleTrackFavorite: (trackId) =>
    set((s) => {
      const track = s.soundtrack.currentTrack;
      if (track && track.id === trackId) {
        return {
          soundtrack: {
            ...s.soundtrack,
            currentTrack: { ...track, isFavorite: !track.isFavorite },
          },
        };
      }
      return s;
    }),

  setAmbientLayerVolume: (layerId, volume) =>
    set((s) => ({
      soundtrack: {
        ...s.soundtrack,
        ambientLayers: s.soundtrack.ambientLayers.map((l) =>
          l.id === layerId ? { ...l, volume } : l,
        ),
      },
    })),

  toggleMuteAll: () =>
    set((s) => ({
      soundtrack: { ...s.soundtrack, isMuted: !s.soundtrack.isMuted },
    })),

  // ─── Context Menu ─────────────────────────────────────

  showContextMenu: (tokenId, position) =>
    set({ contextMenuTokenId: tokenId, contextMenuPosition: position }),

  hideContextMenu: () =>
    set({ contextMenuTokenId: null, contextMenuPosition: null }),

  setSessionStatus: (status) => set({ sessionStatus: status }),

  openCharacterSheet: (tokenId) => {
    const token = get().tokens[tokenId];
    if (!token) return;
    const type = token.layer === "character" ? "player" : "npc";
    const characterId = token.characterId || token.id;
    set({
      activePanel: null,
      viewingTokenId: tokenId,
      viewingCharacterId: characterId,
      viewingType: type,
    });
  },

  closeCharacterSheet: () =>
    set({
      viewingTokenId: null,
      viewingCharacterId: null,
      viewingType: null,
    }),

  closeAllPanels: () =>
    set({
      activePanel: null,
      viewingTokenId: null,
      viewingCharacterId: null,
      viewingType: null,
    }),

  updateGMNote: (characterId, note) =>
    set((s) => ({
      gmNotes: { ...s.gmNotes, [characterId]: note },
    })),

  updateTokenConditions: (tokenId, conditions) =>
    set((s) => {
      const token = s.tokens[tokenId];
      if (!token) return s;
      return {
        tokens: {
          ...s.tokens,
          [tokenId]: { ...token, conditions },
        },
      };
    }),

  setMapImage: (image) => set({ mapImage: image }),

  loadMockData: () => {
    // Populated by gameplay-mock-data.ts
  },
}));
