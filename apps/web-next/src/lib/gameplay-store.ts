import { create } from "zustand";
import type {
  MapTool,
  RightPanelTab,
  ChatChannel,
  CombatState,
  GameToken,
  ChatMessage,
  ConditionType,
  TokenAlignment,
  TokenVisibility,
  RulerPoint,
  AOEInstance,
  AOEShape,
  AOEColor,
  PingEffect,
  DamageFloat,
  DrawingTool,
  DrawStroke,
  TerrainType,
  TerrainEditorTool,
  TerrainCell,
  FogSettings,
  MapPin,
  MapNote,
  Toast,
  VisionConfig,
  WallSegment,
  WallSide,
  WallMaterial,
  WallType,
  WallStyle,
  WallData,
  WallDrawMode,
  LightSourceFixed,
  MapObjectCell,
  MapObjectType,
} from "./gameplay-mock-data";
import {
  MOCK_COMBAT,
  MOCK_TOKENS,
  MOCK_MESSAGES,
  DEFAULT_FOG_SETTINGS,
  DEFAULT_VISION,
  MOCK_MAP,
} from "./gameplay-mock-data";
import type { TerrainCategoryId } from "./terrain-catalog";
import type { RoomTemplate } from "./room-templates";
import { wallSideToEdgeKey } from "./wall-helpers";
import { playSFXSync } from "./audio/sfx-triggers";
import { broadcastSend } from "./broadcast-sync";
import { useCameraStore } from "./camera-store";
import { CELL_SIZE } from "./gameplay/constants";
import type { SceneCard as PlayerSceneCard } from "./player-view-store";


// ── Path Planning Types ──

export interface PathCell {
  x: number;
  y: number;
  ftCost: number;
  totalFt: number;
  isDiagonal: boolean;
  isDifficultTerrain: boolean;
  events: PathCellEvent[];
}

export interface PathCellEvent {
  type: PathEventType;
  severity: "info" | "warning" | "danger";
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  relatedTokenId?: string;
}

export type PathEventType =
  | "opportunity_attack"
  | "enters_enemy_vision"
  | "enters_enemy_reach"
  | "difficult_terrain"
  | "hazardous_terrain"
  | "door_closed"
  | "door_locked"
  | "over_speed_limit";

// ── Turn Actions (combat action economy) ──

export interface TurnActions {
  actionUsed: boolean;
  bonusActionUsed: boolean;
  reactionUsed: boolean;
  isDodging: boolean;
  isDisengaging: boolean;
  isDashing: boolean;
  attackedThisTurn: boolean;
  castBonusSpell: boolean;
}

export const DEFAULT_TURN_ACTIONS: TurnActions = {
  actionUsed: false,
  bonusActionUsed: false,
  reactionUsed: false,
  isDodging: false,
  isDisengaging: false,
  isDashing: false,
  attackedThisTurn: false,
  castBonusSpell: false,
};

export type ModalName =
  | "createScene"
  | "sceneCard"
  | "soundtrack"
  | "createToken"
  | "startCombat"
  | "endSession"
  | "shareSession"
  | "invitePlayers"
  | "hpAdjust"
  | "characterSheet"
  | "creatureCompendium"
  | "npcEditor"
  | "tokenEditor"
  | "encounterGroupEditor"
  | "objectEditor"
  | "characterEditor"
  | "dialogueTreeEditor"
  | "behaviorCreator"
  | null;

export interface ContextMenuState {
  open: boolean;
  type: "token" | "cell" | "canvas";
  tokenId: string | null;
  cellX: number;
  cellY: number;
  x: number;
  y: number;
}

export interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface RegionSelection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  finalized: boolean;
}

export interface AISelection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  finalized: boolean;
}

export interface AIGeneratedLayer {
  id: string;
  imageDataUrl: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  name: string;
  timestamp: number;
}

export type AIGenerationStatus = "idle" | "generating" | "error";

export interface MovementHistoryEntry {
  tokenId: string;
  positions: { x: number; y: number }[];
}

interface GameplayState {
  // Tools
  activeTool: MapTool;
  setActiveTool: (tool: MapTool) => void;

  // Panels
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  leftPanelWidth: number;
  rightPanelWidth: number;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelWidth: (w: number) => void;
  setRightPanelWidth: (w: number) => void;

  // Right panel tab
  rightTab: RightPanelTab;
  setRightTab: (tab: RightPanelTab) => void;

  // Chat
  chatChannel: ChatChannel;
  setChatChannel: (ch: ChatChannel) => void;
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;

  // Combat
  combat: CombatState;
  nextTurn: () => void;
  prevTurn: () => void;
  endCombat: () => void;
  movementUsedFt: number;
  resetMovement: () => void;
  addMovementFt: (ft: number) => void;

  // Turn actions
  turnActions: TurnActions;
  useAction: () => void;
  useBonusAction: () => void;
  useReaction: () => void;
  setDodging: (v: boolean) => void;
  setDashing: (v: boolean) => void;
  setDisengaging: (v: boolean) => void;
  setAttackedThisTurn: (v: boolean) => void;
  setCastBonusSpell: (v: boolean) => void;
  resetTurnActions: () => void;
  addCombatLogMessage: (content: string) => void;

  // Reactions (per-combatant tracking)
  reactionUsedMap: Record<string, boolean>;
  useReactionFor: (tokenId: string) => void;
  pendingReaction: import("./reactions").PendingReaction | null;
  setPendingReaction: (r: import("./reactions").PendingReaction | null) => void;

  // Token ↔ Creature mapping (for AI features)
  tokenCreatureMap: Record<string, string>;
  linkTokenToCreature: (tokenId: string, creatureId: string) => void;
  unlinkTokenCreature: (tokenId: string) => void;

  // Tokens
  tokens: GameToken[];
  selectedTokenIds: string[];
  hoveredTokenId: string | null;
  selectToken: (id: string | null) => void;
  toggleTokenSelection: (id: string) => void;
  selectAllTokens: () => void;
  clearSelection: () => void;
  setHoveredToken: (id: string | null) => void;
  moveToken: (id: string, x: number, y: number) => void;
  removeToken: (id: string) => void;
  duplicateToken: (id: string) => void;
  updateTokenHp: (id: string, hp: number) => void;
  updateTokenAc: (id: string, ac: number) => void;
  toggleTokenCondition: (id: string, cond: ConditionType) => void;
  setTokenVisibility: (id: string, vis: TokenVisibility) => void;
  setTokenAlignment: (id: string, alignment: TokenAlignment) => void;
  setTokenSize: (id: string, size: number) => void;

  // Movement history (undo)
  movementHistory: MovementHistoryEntry[];
  pushMovementHistory: (tokenId: string, x: number, y: number) => void;
  undoMovement: (tokenId: string) => void;

  // Waypoint movement
  dragWaypoints: { x: number; y: number }[];
  addDragWaypoint: (x: number, y: number) => void;
  clearDragWaypoints: () => void;

  // Selection box
  selectionBox: SelectionBox | null;
  setSelectionBox: (box: SelectionBox | null) => void;

  // Region selection
  regionSelection: RegionSelection | null;
  setRegionSelection: (r: RegionSelection | null) => void;
  finalizeRegion: () => void;
  clearRegion: () => void;
  regionFog: () => void;
  regionReveal: () => void;
  regionPaintTerrain: () => void;
  regionClear: () => void;

  // Context menu
  contextMenu: ContextMenuState;
  openTokenContextMenu: (tokenId: string, x: number, y: number) => void;
  openCellContextMenu: (cellX: number, cellY: number, x: number, y: number) => void;
  openCanvasContextMenu: (x: number, y: number) => void;
  closeContextMenu: () => void;

  // HP adjust target
  hpAdjustTargetId: string | null;
  setHpAdjustTarget: (id: string | null) => void;

  // Character sheet target
  characterSheetTargetId: string | null;
  setCharacterSheetTarget: (tokenId: string | null) => void;

  // NPC editor target
  npcEditorTargetId: string | null;
  setNpcEditorTarget: (id: string | null) => void;

  // Token editor target
  tokenEditorTargetId: string | null;
  setTokenEditorTarget: (id: string | null) => void;

  // Encounter group editor target
  encounterGroupEditorTargetId: string | null;
  setEncounterGroupEditorTarget: (id: string | null) => void;

  // Object editor target
  objectEditorTargetId: string | null;
  setObjectEditorTarget: (id: string | null) => void;

  // Character editor target
  characterEditorTargetId: string | null;
  setCharacterEditorTarget: (id: string | null) => void;

  // Creature compendium favorites
  compendiumFavorites: Set<string>;
  toggleCompendiumFavorite: (id: string) => void;

  // Modal
  activeModal: ModalName;
  openModal: (name: ModalName) => void;
  closeModal: () => void;

  // Scene card (narrative overlay for players)
  activeSceneCard: PlayerSceneCard | null;
  sceneCardFiredAt: number | null;
  fireSceneCard: (card: PlayerSceneCard) => void;
  dismissSceneCard: () => void;

  // Ruler
  rulerPoints: RulerPoint[];
  rulerActive: boolean;
  addRulerPoint: (p: RulerPoint) => void;
  clearRuler: () => void;
  setRulerActive: (v: boolean) => void;

  // AOE
  aoeShape: AOEShape;
  aoeColor: AOEColor;
  setAoeShape: (s: AOEShape) => void;
  setAoeColor: (c: AOEColor) => void;
  aoePlacing: AOEInstance | null;
  setAoePlacing: (aoe: AOEInstance | null) => void;
  aoeInstances: AOEInstance[];
  addAoe: (aoe: AOEInstance) => void;
  removeAoe: (id: string) => void;
  clearAoe: () => void;

  // Pings
  pings: PingEffect[];
  addPing: (x: number, y: number) => void;
  removePing: (id: string) => void;

  // Damage floats
  damageFloats: DamageFloat[];
  addDamageFloat: (tokenId: string, amount: number, isHeal: boolean, isCrit: boolean) => void;
  removeDamageFloat: (id: string) => void;

  // Drawing
  drawingTool: DrawingTool;
  drawColor: string;
  drawWidth: number;
  setDrawingTool: (t: DrawingTool) => void;
  setDrawColor: (c: string) => void;
  setDrawWidth: (w: number) => void;
  drawStrokes: DrawStroke[];
  activeStroke: DrawStroke | null;
  setActiveStroke: (s: DrawStroke | null) => void;
  addStroke: (s: DrawStroke) => void;
  undoStroke: () => void;
  clearStrokes: () => void;

  // Terrain
  terrainCells: TerrainCell[];
  activeTerrainType: TerrainType;
  setActiveTerrainType: (t: TerrainType) => void;
  paintTerrain: (x: number, y: number) => void;
  clearTerrain: () => void;

  // Terrain editor
  terrainEditorTool: TerrainEditorTool;
  terrainBrushSize: 1 | 2 | 3;
  terrainCategory: TerrainCategoryId | "all";
  terrainRectPreview: { x1: number; y1: number; x2: number; y2: number } | null;
  hoverCell: { x: number; y: number } | null;
  setTerrainEditorTool: (tool: TerrainEditorTool) => void;
  setTerrainBrushSize: (size: 1 | 2 | 3) => void;
  setTerrainCategory: (cat: TerrainCategoryId | "all") => void;
  paintTerrainArea: (cells: { x: number; y: number }[]) => void;
  fillTerrain: (x: number, y: number) => void;
  eraseTerrainArea: (cells: { x: number; y: number }[]) => void;
  setTerrainRectPreview: (rect: { x1: number; y1: number; x2: number; y2: number } | null) => void;
  setHoverCell: (cell: { x: number; y: number } | null) => void;

  // Attack line
  attackLine: {
    attackerId: string;
    targetId: string;
    roll: number | null;
    damage: number | null;
  } | null;
  setAttackLine: (line: GameplayState["attackLine"]) => void;
  clearAttackLine: () => void;

  // Fog of War
  fogCells: Set<string>;
  fogSettings: FogSettings;
  recentlyRevealedCells: Set<string>;
  recentlyCoveredCells: Set<string>;
  setFogSettings: (s: Partial<FogSettings>) => void;
  toggleFogCell: (x: number, y: number) => void;
  addFogCells: (cells: { x: number; y: number }[]) => void;
  removeFogCells: (cells: { x: number; y: number }[]) => void;
  clearFog: () => void;
  clearRecentlyRevealed: (keys: string[]) => void;
  clearRecentlyCovered: (keys: string[]) => void;

  // Map
  zoom: number;
  setZoom: (z: number) => void;
  gridVisible: boolean;
  toggleGrid: () => void;
  mapBackgroundImage: string | null;
  mapBackgroundOpacity: number;
  mapGridOffsetX: number;
  mapGridOffsetY: number;
  setMapBackgroundImage: (url: string | null) => void;
  setMapBackgroundOpacity: (opacity: number) => void;
  setMapGridOffset: (x: number, y: number) => void;

  // Map viewport (for placing tokens in visible area)
  mapViewport: { scrollLeft: number; scrollTop: number; viewportW: number; viewportH: number; cellSize: number };
  setMapViewport: (v: { scrollLeft: number; scrollTop: number; viewportW: number; viewportH: number; cellSize: number }) => void;
  getViewportCenter: () => { x: number; y: number };

  // Collapsible sections
  collapsedSections: Record<string, boolean>;
  toggleSection: (key: string) => void;

  // Markers
  markers: MapPin[];
  addMarker: (m: MapPin) => void;
  removeMarker: (id: string) => void;

  // Notes
  notes: MapNote[];
  addNote: (n: MapNote) => void;
  removeNote: (id: string) => void;

  // Toasts
  toasts: Toast[];
  addToast: (text: string, action?: { label: string; onClick: () => void }) => void;
  removeToast: (id: string) => void;

  // Add token to map
  addToken: (t: {
    id?: string;
    name: string;
    x: number;
    y: number;
    alignment?: TokenAlignment;
    hp?: number;
    maxHp?: number;
    ac?: number;
    size?: number;
    speed?: number;
    icon?: string;
  }) => void;

  // Clear cell contents
  clearCell: (x: number, y: number) => void;

  // Vision system (config only — rendering is on-demand per selected token)
  tokenVision: Record<string, VisionConfig>;
  walls: WallSegment[]; // legacy (room templates)
  lightSources: LightSourceFixed[];

  setTokenVision: (tokenId: string, config: Partial<VisionConfig>) => void;
  toggleTokenVision: (tokenId: string) => void;

  // Legacy wall API (kept for room template stamping)
  activeWallType: WallMaterial;
  setActiveWallType: (type: WallMaterial) => void;
  addWall: (w: WallSegment) => void;
  removeWall: (x: number, y: number, side: WallSide) => void;
  toggleDoor: (x: number, y: number, side: WallSide) => void;
  clearWalls: () => void;

  // Edge-based wall system
  wallEdges: Record<string, WallData>;
  activeWallEdgeType: WallType;
  activeWallStyle: WallStyle;
  wallDrawMode: WallDrawMode;
  setActiveWallEdgeType: (type: WallType) => void;
  setActiveWallStyle: (style: WallStyle) => void;
  setWallDrawMode: (mode: WallDrawMode) => void;
  addWallEdge: (key: string, data: WallData) => void;
  removeWallEdge: (key: string) => void;
  updateWallEdge: (key: string, updates: Partial<WallData>) => void;
  toggleDoorEdge: (key: string) => void;
  clearWallEdges: () => void;

  addLightSource: (l: LightSourceFixed) => void;
  removeLightSource: (id: string) => void;

  // Map objects
  mapObjects: MapObjectCell[];
  activeObjectType: MapObjectType;
  setActiveObjectType: (type: MapObjectType) => void;
  placeObject: (x: number, y: number) => void;
  removeObject: (id: string) => void;
  rotateObject: (id: string) => void;
  clearObjects: () => void;

  // Terrain undo/redo
  terrainHistory: TerrainCell[][];
  terrainFuture: TerrainCell[][];
  pushTerrainSnapshot: () => void;
  undoTerrain: () => void;
  redoTerrain: () => void;

  // Room template stamp
  stampTemplate: (template: RoomTemplate, originX: number, originY: number) => void;

  // AI Map Generation
  aiSelection: AISelection | null;
  setAISelection: (sel: AISelection | null) => void;
  finalizeAISelection: () => void;
  clearAISelection: () => void;
  aiLayers: AIGeneratedLayer[];
  addAILayer: (layer: AIGeneratedLayer) => void;
  removeAILayer: (id: string) => void;
  undoLastAILayer: () => void;
  aiGenerationStatus: AIGenerationStatus;
  setAIGenerationStatus: (status: AIGenerationStatus) => void;
  aiPanelOpen: boolean;
  setAIPanelOpen: (open: boolean) => void;

  // Path planning (combat movement)
  pathPlanningActive: boolean;
  pathPlanningTokenId: string | null;
  plannedPath: PathCell[];
  pathUndoStack: PathCell[][];
  enterPathPlanning: (tokenId: string) => void;
  exitPathPlanning: () => void;
  addPathCell: (cell: PathCell) => void;
  setPlannedPath: (path: PathCell[]) => void;
  undoPathStep: () => void;
  clearPath: () => void;
}

const DEFAULT_CONTEXT_MENU: ContextMenuState = {
  open: false,
  type: "token",
  tokenId: null,
  cellX: 0,
  cellY: 0,
  x: 0,
  y: 0,
};

export const useGameplayStore = create<GameplayState>((set, get) => ({
  activeTool: "pointer",
  setActiveTool: (tool) => {
    const prev = get().activeTool;
    if (prev === "ai" && tool !== "ai") {
      set({ aiSelection: null, aiPanelOpen: false });
    }
    set({ activeTool: tool });
  },

  leftPanelOpen: true,
  rightPanelOpen: true,
  leftPanelWidth: 240,
  rightPanelWidth: 300,
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setLeftPanelWidth: (w) => set({ leftPanelWidth: w }),
  setRightPanelWidth: (w) => set({ rightPanelWidth: w }),

  rightTab: "chat",
  setRightTab: (tab) => set({ rightTab: tab }),

  chatChannel: "geral",
  setChatChannel: (ch) => set({ chatChannel: ch }),
  messages: MOCK_MESSAGES,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  combat: MOCK_COMBAT,
  nextTurn: () => {
    set((s) => {
      const order = s.combat.order;
      let next = (s.combat.turnIndex + 1) % order.length;
      while (order[next].status === "dead" && next !== s.combat.turnIndex) {
        next = (next + 1) % order.length;
      }
      const newRound =
        next <= s.combat.turnIndex ? s.combat.round + 1 : s.combat.round;
      // Reset reaction only for the combatant whose turn is starting
      const nextTokenId = order[next].tokenId;
      const newReactionMap = { ...s.reactionUsedMap };
      delete newReactionMap[nextTokenId];

      return {
        combat: { ...s.combat, turnIndex: next, round: newRound },
        movementUsedFt: 0,
        turnActions: { ...DEFAULT_TURN_ACTIONS },
        reactionUsedMap: newReactionMap,
      };
    });
    playSFXSync("combat:turn_change");
  },
  prevTurn: () => {
    set((s) => {
      const order = s.combat.order;
      let prev = (s.combat.turnIndex - 1 + order.length) % order.length;
      while (order[prev].status === "dead" && prev !== s.combat.turnIndex) {
        prev = (prev - 1 + order.length) % order.length;
      }
      const newRound =
        prev >= s.combat.turnIndex && s.combat.round > 1
          ? s.combat.round - 1
          : s.combat.round;
      return {
        combat: { ...s.combat, turnIndex: prev, round: newRound },
        movementUsedFt: 0,
      };
    });
  },
  endCombat: () => {
    set((s) => ({ combat: { ...s.combat, active: false } }));
    // Lazy-import phase store to avoid circular deps
    import("@/stores/phaseStore").then(({ usePhaseStore }) => {
      const ps = usePhaseStore.getState();
      if (ps.current.type === "combat") {
        ps.openModal();
      }
    });
    get().addToast("Combate encerrado. Clique na fase para alterar.");
  },
  movementUsedFt: 0,
  resetMovement: () => set({ movementUsedFt: 0 }),
  addMovementFt: (ft) => set((s) => ({ movementUsedFt: s.movementUsedFt + ft })),

  // Turn actions
  turnActions: { ...DEFAULT_TURN_ACTIONS },
  useAction: () => set((s) => ({ turnActions: { ...s.turnActions, actionUsed: true } })),
  useBonusAction: () => set((s) => ({ turnActions: { ...s.turnActions, bonusActionUsed: true } })),
  useReaction: () => set((s) => ({ turnActions: { ...s.turnActions, reactionUsed: true } })),
  setDodging: (v) => set((s) => ({ turnActions: { ...s.turnActions, isDodging: v } })),
  setDashing: (v) => set((s) => ({ turnActions: { ...s.turnActions, isDashing: v } })),
  setDisengaging: (v) => set((s) => ({ turnActions: { ...s.turnActions, isDisengaging: v } })),
  setAttackedThisTurn: (v) => set((s) => ({ turnActions: { ...s.turnActions, attackedThisTurn: v } })),
  setCastBonusSpell: (v) => set((s) => ({ turnActions: { ...s.turnActions, castBonusSpell: v } })),
  resetTurnActions: () => set({ turnActions: { ...DEFAULT_TURN_ACTIONS } }),
  addCombatLogMessage: (content) => {
    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      channel: "geral",
      type: "system",
      sender: "Sistema",
      senderInitials: "S",
      isGM: false,
      content,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    set((s) => ({ messages: [...s.messages, msg] }));
  },

  // Reactions (per-combatant)
  reactionUsedMap: {},
  useReactionFor: (tokenId) =>
    set((s) => ({ reactionUsedMap: { ...s.reactionUsedMap, [tokenId]: true } })),
  pendingReaction: null,
  setPendingReaction: (r) => set({ pendingReaction: r }),

  // Token ↔ Creature mapping
  tokenCreatureMap: {
    tok_skel1: "skeleton",
    tok_skel2: "skeleton",
  },
  linkTokenToCreature: (tokenId, creatureId) =>
    set((s) => ({ tokenCreatureMap: { ...s.tokenCreatureMap, [tokenId]: creatureId } })),
  unlinkTokenCreature: (tokenId) =>
    set((s) => {
      const next = { ...s.tokenCreatureMap };
      delete next[tokenId];
      return { tokenCreatureMap: next };
    }),

  tokens: MOCK_TOKENS,
  selectedTokenIds: [],
  hoveredTokenId: null,
  selectToken: (id) =>
    set({
      selectedTokenIds: id ? [id] : [],
      rightTab: id ? "sheet" : get().rightTab,
    }),
  toggleTokenSelection: (id) =>
    set((s) => {
      const has = s.selectedTokenIds.includes(id);
      return {
        selectedTokenIds: has
          ? s.selectedTokenIds.filter((i) => i !== id)
          : [...s.selectedTokenIds, id],
      };
    }),
  selectAllTokens: () =>
    set((s) => ({
      selectedTokenIds: s.tokens.filter((t) => t.onMap).map((t) => t.id),
    })),
  clearSelection: () => set({ selectedTokenIds: [] }),
  setHoveredToken: (id) => set({ hoveredTokenId: id }),
  moveToken: (id, x, y) => {
    set((s) => ({
      tokens: s.tokens.map((t) => (t.id === id ? { ...t, x, y } : t)),
    }));
  },
  removeToken: (id) => {
    set((s) => ({
      tokens: s.tokens.filter((t) => t.id !== id),
      selectedTokenIds: s.selectedTokenIds.filter((i) => i !== id),
    }));
  },
  duplicateToken: (id) =>
    set((s) => {
      const original = s.tokens.find((t) => t.id === id);
      if (!original) return s;
      const clone: GameToken = {
        ...original,
        id: `${original.id}_copy_${Date.now()}`,
        name: `${original.name} (copia)`,
        x: original.x + 1,
        y: original.y,
      };
      return { tokens: [...s.tokens, clone] };
    }),
  updateTokenHp: (id, hp) =>
    set((s) => ({
      tokens: s.tokens.map((t) =>
        t.id === id ? { ...t, hp: Math.max(0, Math.min(t.maxHp, hp)) } : t,
      ),
    })),
  updateTokenAc: (id, ac) =>
    set((s) => ({
      tokens: s.tokens.map((t) => (t.id === id ? { ...t, ac } : t)),
    })),
  toggleTokenCondition: (id, cond) =>
    set((s) => ({
      tokens: s.tokens.map((t) => {
        if (t.id !== id) return t;
        const has = t.conditions.includes(cond);
        return {
          ...t,
          conditions: has
            ? t.conditions.filter((c) => c !== cond)
            : [...t.conditions, cond],
        };
      }),
    })),
  setTokenVisibility: (id, vis) =>
    set((s) => ({
      tokens: s.tokens.map((t) => (t.id === id ? { ...t, visibility: vis } : t)),
    })),
  setTokenAlignment: (id, alignment) => {
    set((s) => ({
      tokens: s.tokens.map((t) => (t.id === id ? { ...t, alignment } : t)),
    }));
    broadcastSend("gm:token-alignment", { tokenId: id, alignment }, "gm");
  },
  setTokenSize: (id, size) =>
    set((s) => ({
      tokens: s.tokens.map((t) => (t.id === id ? { ...t, size } : t)),
    })),

  movementHistory: [],
  pushMovementHistory: (tokenId, x, y) =>
    set((s) => {
      const existing = s.movementHistory.find((h) => h.tokenId === tokenId);
      if (existing) {
        const positions = [...existing.positions, { x, y }].slice(-5);
        return {
          movementHistory: s.movementHistory.map((h) =>
            h.tokenId === tokenId ? { ...h, positions } : h,
          ),
        };
      }
      return {
        movementHistory: [
          ...s.movementHistory,
          { tokenId, positions: [{ x, y }] },
        ],
      };
    }),
  undoMovement: (tokenId) =>
    set((s) => {
      const hist = s.movementHistory.find((h) => h.tokenId === tokenId);
      if (!hist || hist.positions.length === 0) return s;
      const pos = hist.positions[hist.positions.length - 1];
      return {
        tokens: s.tokens.map((t) =>
          t.id === tokenId ? { ...t, x: pos.x, y: pos.y } : t,
        ),
        movementHistory: s.movementHistory.map((h) =>
          h.tokenId === tokenId
            ? { ...h, positions: h.positions.slice(0, -1) }
            : h,
        ),
      };
    }),

  dragWaypoints: [],
  addDragWaypoint: (x, y) =>
    set((s) => ({ dragWaypoints: [...s.dragWaypoints, { x, y }] })),
  clearDragWaypoints: () => set({ dragWaypoints: [] }),

  selectionBox: null,
  setSelectionBox: (box) => set({ selectionBox: box }),

  regionSelection: null,
  setRegionSelection: (r) => set({ regionSelection: r }),
  finalizeRegion: () =>
    set((s) => {
      if (!s.regionSelection) return s;
      const { x1, y1, x2, y2 } = s.regionSelection;
      return {
        regionSelection: {
          x1: Math.min(x1, x2),
          y1: Math.min(y1, y2),
          x2: Math.max(x1, x2),
          y2: Math.max(y1, y2),
          finalized: true,
        },
      };
    }),
  clearRegion: () => set({ regionSelection: null }),
  regionFog: () => {
    const s = get();
    if (!s.regionSelection) return;
    const { x1, y1, x2, y2 } = s.regionSelection;
    const cells: { x: number; y: number }[] = [];
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        cells.push({ x, y });
      }
    }
    s.addFogCells(cells);
  },
  regionReveal: () => {
    const s = get();
    if (!s.regionSelection) return;
    const { x1, y1, x2, y2 } = s.regionSelection;
    const cells: { x: number; y: number }[] = [];
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        cells.push({ x, y });
      }
    }
    s.removeFogCells(cells);
  },
  regionPaintTerrain: () =>
    set((s) => {
      if (!s.regionSelection) return s;
      const { x1, y1, x2, y2 } = s.regionSelection;
      const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
      let newCells = [...s.terrainCells];
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          const idx = newCells.findIndex((c) => c.x === x && c.y === y);
          if (s.activeTerrainType === "normal") {
            if (idx >= 0) newCells = newCells.filter((c) => !(c.x === x && c.y === y));
          } else if (idx >= 0) {
            newCells[idx] = { x, y, type: s.activeTerrainType };
          } else {
            newCells.push({ x, y, type: s.activeTerrainType });
          }
        }
      }
      return { terrainCells: newCells };
    }),
  regionClear: () => {
    const s = get();
    if (!s.regionSelection) return;
    const { x1, y1, x2, y2 } = s.regionSelection;
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    // Remove fog
    const cells: { x: number; y: number }[] = [];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        cells.push({ x, y });
      }
    }
    s.removeFogCells(cells);
    // Remove terrain
    set((prev) => ({
      terrainCells: prev.terrainCells.filter(
        (c) => !(c.x >= minX && c.x <= maxX && c.y >= minY && c.y <= maxY),
      ),
    }));
  },

  contextMenu: DEFAULT_CONTEXT_MENU,
  openTokenContextMenu: (tokenId, x, y) =>
    set({ contextMenu: { open: true, type: "token", tokenId, cellX: 0, cellY: 0, x, y } }),
  openCellContextMenu: (cellX, cellY, x, y) =>
    set({ contextMenu: { open: true, type: "cell", tokenId: null, cellX, cellY, x, y } }),
  openCanvasContextMenu: (x, y) =>
    set({ contextMenu: { open: true, type: "canvas", tokenId: null, cellX: 0, cellY: 0, x, y } }),
  closeContextMenu: () => set({ contextMenu: DEFAULT_CONTEXT_MENU }),

  hpAdjustTargetId: null,
  setHpAdjustTarget: (id) => set({ hpAdjustTargetId: id }),

  characterSheetTargetId: null,
  setCharacterSheetTarget: (tokenId) => set({ characterSheetTargetId: tokenId }),

  npcEditorTargetId: null,
  setNpcEditorTarget: (id) => set({ npcEditorTargetId: id }),

  tokenEditorTargetId: null,
  setTokenEditorTarget: (id) => set({ tokenEditorTargetId: id }),

  encounterGroupEditorTargetId: null,
  setEncounterGroupEditorTarget: (id) => set({ encounterGroupEditorTargetId: id }),

  objectEditorTargetId: null,
  setObjectEditorTarget: (id) => set({ objectEditorTargetId: id }),

  characterEditorTargetId: null,
  setCharacterEditorTarget: (id) => set({ characterEditorTargetId: id }),

  compendiumFavorites: new Set<string>(),
  toggleCompendiumFavorite: (id) =>
    set((s) => {
      const next = new Set(s.compendiumFavorites);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { compendiumFavorites: next };
    }),

  activeModal: null,
  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),

  activeSceneCard: null,
  sceneCardFiredAt: null,
  fireSceneCard: (card) => {
    set({ activeSceneCard: card, sceneCardFiredAt: Date.now() });
    broadcastSend("gm:scene-show", card, "gm");

    // Se tem mapa vinculado e autoSwitch → trocar mapa
    if (card.linkedMapId && card.autoSwitchMap !== false) {
      broadcastSend("gm:map-switch", {
        mapId: card.linkedMapId,
        mapName: card.linkedMapName,
      }, "gm");
      // F-33: Reset camera on map switch
      useCameraStore.getState().reset();
    }

    // Auto-clear after duration
    const duration = card.duration || 6000;
    setTimeout(() => {
      const current = get().activeSceneCard;
      if (current && current.title === card.title) {
        set({ activeSceneCard: null, sceneCardFiredAt: null });
      }
    }, duration);
  },
  dismissSceneCard: () => {
    set({ activeSceneCard: null, sceneCardFiredAt: null });
    broadcastSend("gm:scene-dismiss", null, "gm");
  },

  rulerPoints: [],
  rulerActive: false,
  addRulerPoint: (p) => set((s) => ({ rulerPoints: [...s.rulerPoints, p] })),
  clearRuler: () => set({ rulerPoints: [], rulerActive: false }),
  setRulerActive: (v) => set({ rulerActive: v }),

  aoeShape: "circle",
  aoeColor: "red",
  setAoeShape: (s) => set({ aoeShape: s }),
  setAoeColor: (c) => set({ aoeColor: c }),
  aoePlacing: null,
  setAoePlacing: (aoe) => set({ aoePlacing: aoe }),
  aoeInstances: [],
  addAoe: (aoe) => set((s) => ({ aoeInstances: [...s.aoeInstances, aoe], aoePlacing: null })),
  removeAoe: (id) => set((s) => ({ aoeInstances: s.aoeInstances.filter((a) => a.id !== id) })),
  clearAoe: () => set({ aoeInstances: [] }),

  pings: [],
  addPing: (x, y) =>
    set((s) => ({
      pings: [...s.pings, { id: `ping_${Date.now()}`, x, y, timestamp: Date.now() }],
    })),
  removePing: (id) => set((s) => ({ pings: s.pings.filter((p) => p.id !== id) })),

  damageFloats: [],
  addDamageFloat: (tokenId, amount, isHeal, isCrit) =>
    set((s) => ({
      damageFloats: [
        ...s.damageFloats,
        {
          id: `dmg_${Date.now()}_${Math.random()}`,
          tokenId,
          amount,
          isHeal,
          isCrit,
          timestamp: Date.now(),
        },
      ],
    })),
  removeDamageFloat: (id) =>
    set((s) => ({ damageFloats: s.damageFloats.filter((d) => d.id !== id) })),

  drawingTool: "freehand" as DrawingTool,
  drawColor: "#FF4444",
  drawWidth: 3,
  setDrawingTool: (t) => set({ drawingTool: t }),
  setDrawColor: (c) => set({ drawColor: c }),
  setDrawWidth: (w) => set({ drawWidth: w }),
  drawStrokes: [],
  activeStroke: null,
  setActiveStroke: (s) => set({ activeStroke: s }),
  addStroke: (stroke) => set((s) => ({ drawStrokes: [...s.drawStrokes, stroke], activeStroke: null })),
  undoStroke: () => set((s) => ({ drawStrokes: s.drawStrokes.slice(0, -1) })),
  clearStrokes: () => set({ drawStrokes: [] }),

  terrainCells: [],
  activeTerrainType: "stone_floor" as TerrainType,
  setActiveTerrainType: (t) => set({ activeTerrainType: t }),
  paintTerrain: (x, y) =>
    set((s) => {
      const existing = s.terrainCells.findIndex((c) => c.x === x && c.y === y);
      if (s.activeTerrainType === "normal") {
        return { terrainCells: s.terrainCells.filter((c) => !(c.x === x && c.y === y)) };
      }
      if (existing >= 0) {
        const updated = [...s.terrainCells];
        updated[existing] = { x, y, type: s.activeTerrainType };
        return { terrainCells: updated };
      }
      return { terrainCells: [...s.terrainCells, { x, y, type: s.activeTerrainType }] };
    }),
  clearTerrain: () => set({ terrainCells: [] }),

  // Terrain editor
  terrainEditorTool: "brush" as TerrainEditorTool,
  terrainBrushSize: 1 as 1 | 2 | 3,
  terrainCategory: "all" as TerrainCategoryId | "all",
  terrainRectPreview: null,
  hoverCell: null,
  setTerrainEditorTool: (tool) => set({ terrainEditorTool: tool }),
  setTerrainBrushSize: (size) => set({ terrainBrushSize: size }),
  setTerrainCategory: (cat) => set({ terrainCategory: cat }),
  paintTerrainArea: (cells) =>
    set((s) => {
      const newCells = [...s.terrainCells];
      for (const { x, y } of cells) {
        const idx = newCells.findIndex((c) => c.x === x && c.y === y);
        if (idx >= 0) {
          newCells[idx] = { x, y, type: s.activeTerrainType };
        } else {
          newCells.push({ x, y, type: s.activeTerrainType });
        }
      }
      return {
        terrainCells: newCells,
        terrainHistory: [...s.terrainHistory.slice(-49), [...s.terrainCells]],
        terrainFuture: [],
      };
    }),
  fillTerrain: (x, y) =>
    set((s) => {
      const { gridCols, gridRows } = MOCK_MAP;
      const targetType =
        s.terrainCells.find((c) => c.x === x && c.y === y)?.type ?? null;
      if (targetType === s.activeTerrainType) return s;

      const visited = new Set<string>();
      const queue: { x: number; y: number }[] = [{ x, y }];
      const filled: { x: number; y: number }[] = [];

      while (queue.length > 0) {
        const cell = queue.pop()!;
        const key = `${cell.x},${cell.y}`;
        if (visited.has(key)) continue;
        if (cell.x < 0 || cell.y < 0 || cell.x >= gridCols || cell.y >= gridRows) continue;
        const cellType =
          s.terrainCells.find((c) => c.x === cell.x && c.y === cell.y)?.type ?? null;
        if (cellType !== targetType) continue;
        visited.add(key);
        filled.push(cell);
        queue.push(
          { x: cell.x + 1, y: cell.y },
          { x: cell.x - 1, y: cell.y },
          { x: cell.x, y: cell.y + 1 },
          { x: cell.x, y: cell.y - 1 },
        );
      }

      if (filled.length === 0) return s;

      const newCells = [...s.terrainCells];
      for (const fc of filled) {
        const idx = newCells.findIndex((c) => c.x === fc.x && c.y === fc.y);
        if (idx >= 0) {
          newCells[idx] = { x: fc.x, y: fc.y, type: s.activeTerrainType };
        } else {
          newCells.push({ x: fc.x, y: fc.y, type: s.activeTerrainType });
        }
      }
      return {
        terrainCells: newCells,
        terrainHistory: [...s.terrainHistory.slice(-49), [...s.terrainCells]],
        terrainFuture: [],
      };
    }),
  eraseTerrainArea: (cells) =>
    set((s) => {
      const removeSet = new Set(cells.map((c) => `${c.x},${c.y}`));
      return {
        terrainCells: s.terrainCells.filter((c) => !removeSet.has(`${c.x},${c.y}`)),
        terrainHistory: [...s.terrainHistory.slice(-49), [...s.terrainCells]],
        terrainFuture: [],
      };
    }),
  setTerrainRectPreview: (rect) => set({ terrainRectPreview: rect }),
  setHoverCell: (cell) => set({ hoverCell: cell }),

  attackLine: null,
  setAttackLine: (line) => set({ attackLine: line }),
  clearAttackLine: () => set({ attackLine: null }),

  fogCells: (() => {
    const cells = new Set<string>();
    for (let x = 13; x < 25; x++) {
      for (let y = 0; y < 25; y++) {
        cells.add(`${x},${y}`);
      }
    }
    return cells;
  })(),
  fogSettings: DEFAULT_FOG_SETTINGS,
  recentlyRevealedCells: new Set<string>(),
  recentlyCoveredCells: new Set<string>(),
  setFogSettings: (partial) =>
    set((s) => ({ fogSettings: { ...s.fogSettings, ...partial } })),
  toggleFogCell: (x, y) =>
    set((s) => {
      const key = `${x},${y}`;
      const next = new Set(s.fogCells);
      if (next.has(key)) {
        next.delete(key);
        const rev = new Set(s.recentlyRevealedCells);
        rev.add(key);
        return { fogCells: next, recentlyRevealedCells: rev };
      }
      next.add(key);
      const cov = new Set(s.recentlyCoveredCells);
      cov.add(key);
      return { fogCells: next, recentlyCoveredCells: cov };
    }),
  addFogCells: (cells) =>
    set((s) => {
      const next = new Set(s.fogCells);
      const cov = new Set(s.recentlyCoveredCells);
      cells.forEach(({ x, y }) => {
        const key = `${x},${y}`;
        next.add(key);
        cov.add(key);
      });
      return { fogCells: next, recentlyCoveredCells: cov };
    }),
  removeFogCells: (cells) =>
    set((s) => {
      const next = new Set(s.fogCells);
      const rev = new Set(s.recentlyRevealedCells);
      cells.forEach(({ x, y }) => {
        const key = `${x},${y}`;
        next.delete(key);
        rev.add(key);
      });
      return { fogCells: next, recentlyRevealedCells: rev };
    }),
  clearFog: () =>
    set({
      fogCells: new Set<string>(),
      recentlyRevealedCells: new Set<string>(),
      recentlyCoveredCells: new Set<string>(),
    }),
  clearRecentlyRevealed: (keys) =>
    set((s) => {
      const rev = new Set(s.recentlyRevealedCells);
      keys.forEach((k) => rev.delete(k));
      return { recentlyRevealedCells: rev };
    }),
  clearRecentlyCovered: (keys) =>
    set((s) => {
      const cov = new Set(s.recentlyCoveredCells);
      keys.forEach((k) => cov.delete(k));
      return { recentlyCoveredCells: cov };
    }),

  zoom: 100,
  setZoom: (z) => set({ zoom: Math.max(50, Math.min(200, z)) }),
  gridVisible: true,
  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
  mapBackgroundImage: null,
  mapBackgroundOpacity: 0.5,
  mapGridOffsetX: 0,
  mapGridOffsetY: 0,
  setMapBackgroundImage: (url) => set({ mapBackgroundImage: url }),
  setMapBackgroundOpacity: (opacity) => set({ mapBackgroundOpacity: Math.max(0, Math.min(1, opacity)) }),
  setMapGridOffset: (x, y) => set({ mapGridOffsetX: x, mapGridOffsetY: y }),

  mapViewport: { scrollLeft: 0, scrollTop: 0, viewportW: 800, viewportH: 600, cellSize: CELL_SIZE },
  setMapViewport: (v) => set({ mapViewport: v }),
  getViewportCenter: () => {
    const { mapViewport: v } = get();
    const centerX = Math.floor((v.scrollLeft + v.viewportW / 2) / v.cellSize);
    const centerY = Math.floor((v.scrollTop + v.viewportH / 2) / v.cellSize);
    return { x: centerX, y: centerY };
  },

  collapsedSections: { tokens: true, npcs: true, characters: true, audio: true, behaviors: true },
  toggleSection: (key) =>
    set((s) => ({
      collapsedSections: {
        ...s.collapsedSections,
        [key]: !s.collapsedSections[key],
      },
    })),

  // Markers
  markers: [],
  addMarker: (m) => set((s) => ({ markers: [...s.markers, m] })),
  removeMarker: (id) => set((s) => ({ markers: s.markers.filter((m) => m.id !== id) })),

  // Notes
  notes: [],
  addNote: (n) => set((s) => ({ notes: [...s.notes, n] })),
  removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

  // Toasts
  toasts: [],
  addToast: (text, action?) => {
    const id = `toast_${Date.now()}`;
    const toast: Toast = { id, text, timestamp: Date.now(), action };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, action ? 8000 : 3000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // Add token
  addToken: (t) =>
    set((s) => ({
      tokens: [
        ...s.tokens,
        {
          id: t.id ?? `token_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: t.name,
          alignment: t.alignment ?? "hostile",
          hp: t.hp ?? 10,
          maxHp: t.maxHp ?? t.hp ?? 10,
          ac: t.ac ?? 10,
          initiative: 0,
          size: t.size ?? 1,
          x: t.x,
          y: t.y,
          onMap: true,
          conditions: [],
          visibility: "visible",
          speed: t.speed ?? 30,
          icon: t.icon,
        },
      ],
    })),

  // Clear cell
  clearCell: (x, y) =>
    set((s) => ({
      terrainCells: s.terrainCells.filter((c) => c.x !== x || c.y !== y),
      markers: s.markers.filter((m) => m.x !== x || m.y !== y),
      notes: s.notes.filter((n) => n.x !== x || n.y !== y),
    })),

  // Vision system (config only — rendering is on-demand per selected token)
  tokenVision: (() => {
    const v: Record<string, VisionConfig> = {};
    for (const t of MOCK_TOKENS) {
      if (t.alignment === "player") {
        v[t.id] = { ...DEFAULT_VISION };
      }
    }
    return v;
  })(),
  walls: [],
  lightSources: [],

  setTokenVision: (tokenId, config) => {
    set((s) => ({
      tokenVision: {
        ...s.tokenVision,
        [tokenId]: { ...(s.tokenVision[tokenId] ?? DEFAULT_VISION), ...config },
      },
    }));
  },
  toggleTokenVision: (tokenId) => {
    set((s) => {
      const current = s.tokenVision[tokenId] ?? DEFAULT_VISION;
      return {
        tokenVision: {
          ...s.tokenVision,
          [tokenId]: { ...current, enabled: !current.enabled },
        },
      };
    });
  },
  activeWallType: "stone" as WallMaterial,
  setActiveWallType: (type) => set({ activeWallType: type }),
  addWall: (w) => {
    set((s) => ({ walls: [...s.walls, { ...w, wallType: w.wallType ?? s.activeWallType }] }));
  },
  removeWall: (x, y, side) => {
    set((s) => ({
      walls: s.walls.filter(
        (w) => !(w.x === x && w.y === y && w.side === side),
      ),
    }));
  },
  toggleDoor: (x, y, side) => {
    set((s) => ({
      walls: s.walls.map((w) => {
        if (w.x !== x || w.y !== y || w.side !== side) return w;
        // Cycle: closed -> open -> locked -> secret -> closed
        const states: import("./gameplay-mock-data").DoorState[] = ["closed", "open", "locked", "secret"];
        const current = w.doorState ?? (w.doorOpen ? "open" : "closed");
        const idx = states.indexOf(current);
        const next = states[(idx + 1) % states.length];
        return { ...w, doorOpen: next === "open", doorState: next };
      }),
    }));
  },
  clearWalls: () => set({ walls: [] }),

  // ── Edge-based wall system ──
  wallEdges: {} as Record<string, WallData>,
  activeWallEdgeType: "wall" as WallType,
  activeWallStyle: "stone" as WallStyle,
  wallDrawMode: "line" as WallDrawMode,
  setActiveWallEdgeType: (type) => set({ activeWallEdgeType: type }),
  setActiveWallStyle: (style) => set({ activeWallStyle: style }),
  setWallDrawMode: (mode) => set({ wallDrawMode: mode }),
  addWallEdge: (key, data) => {
    set((s) => ({
      wallEdges: { ...s.wallEdges, [key]: data },
    }));
  },
  removeWallEdge: (key) => {
    set((s) => {
      const next = { ...s.wallEdges };
      delete next[key];
      return { wallEdges: next };
    });
  },
  updateWallEdge: (key, updates) => {
    set((s) => {
      const existing = s.wallEdges[key];
      if (!existing) return s;
      return {
        wallEdges: { ...s.wallEdges, [key]: { ...existing, ...updates } },
      };
    });
  },
  toggleDoorEdge: (key) => {
    set((s) => {
      const wall = s.wallEdges[key];
      if (!wall) return s;
      let nextType: WallType;
      if (wall.type === "door-closed") nextType = "door-open";
      else if (wall.type === "door-open") nextType = "door-closed";
      else if (wall.type === "door-locked") nextType = "door-locked"; // stays locked
      else return s; // not a door
      return {
        wallEdges: { ...s.wallEdges, [key]: { ...wall, type: nextType } },
      };
    });
    playSFXSync("map:door_open");
  },
  clearWallEdges: () => set({ wallEdges: {} }),

  addLightSource: (l) => {
    set((s) => ({ lightSources: [...s.lightSources, l] }));
  },
  removeLightSource: (id) => {
    set((s) => ({
      lightSources: s.lightSources.filter((l) => l.id !== id),
    }));
  },

  // Map objects
  mapObjects: [] as MapObjectCell[],
  activeObjectType: "chest" as MapObjectType,
  setActiveObjectType: (type) => set({ activeObjectType: type }),
  placeObject: (x, y) =>
    set((s) => {
      const existing = s.mapObjects.find((o) => o.x === x && o.y === y);
      if (existing) {
        return {
          mapObjects: s.mapObjects.map((o) =>
            o.x === x && o.y === y
              ? { ...o, type: s.activeObjectType }
              : o,
          ),
        };
      }
      return {
        mapObjects: [
          ...s.mapObjects,
          {
            id: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
            x,
            y,
            type: s.activeObjectType,
            rotation: 0,
          },
        ],
      };
    }),
  removeObject: (id) =>
    set((s) => ({ mapObjects: s.mapObjects.filter((o) => o.id !== id) })),
  rotateObject: (id) =>
    set((s) => ({
      mapObjects: s.mapObjects.map((o) =>
        o.id === id ? { ...o, rotation: (o.rotation + 90) % 360 } : o,
      ),
    })),
  clearObjects: () => set({ mapObjects: [] }),

  // Terrain undo/redo
  terrainHistory: [] as TerrainCell[][],
  terrainFuture: [] as TerrainCell[][],
  pushTerrainSnapshot: () =>
    set((s) => ({
      terrainHistory: [...s.terrainHistory.slice(-49), [...s.terrainCells]],
      terrainFuture: [],
    })),
  undoTerrain: () =>
    set((s) => {
      if (s.terrainHistory.length === 0) return s;
      const prev = s.terrainHistory[s.terrainHistory.length - 1];
      return {
        terrainHistory: s.terrainHistory.slice(0, -1),
        terrainFuture: [...s.terrainFuture, [...s.terrainCells]],
        terrainCells: prev,
      };
    }),
  redoTerrain: () =>
    set((s) => {
      if (s.terrainFuture.length === 0) return s;
      const next = s.terrainFuture[s.terrainFuture.length - 1];
      return {
        terrainFuture: s.terrainFuture.slice(0, -1),
        terrainHistory: [...s.terrainHistory, [...s.terrainCells]],
        terrainCells: next,
      };
    }),

  // Room template stamp
  stampTemplate: (template, originX, originY) =>
    set((s) => {
      // Snapshot terrain for undo
      const newTerrainCells = [...s.terrainCells];
      for (const t of template.terrain) {
        const x = originX + t.dx;
        const y = originY + t.dy;
        if (x < 0 || y < 0 || x >= MOCK_MAP.gridCols || y >= MOCK_MAP.gridRows) continue;
        const idx = newTerrainCells.findIndex((c) => c.x === x && c.y === y);
        if (idx >= 0) {
          newTerrainCells[idx] = { x, y, type: t.type };
        } else {
          newTerrainCells.push({ x, y, type: t.type });
        }
      }

      // Add walls (legacy format)
      const newWalls = [...s.walls];
      for (const w of template.walls) {
        const x = originX + w.dx;
        const y = originY + w.dy;
        if (x < 0 || y < 0 || x >= MOCK_MAP.gridCols || y >= MOCK_MAP.gridRows) continue;
        const exists = newWalls.some((e) => e.x === x && e.y === y && e.side === w.side);
        if (!exists) {
          newWalls.push({
            x,
            y,
            side: w.side,
            isDoor: w.isDoor ?? false,
            doorOpen: w.doorState === "open",
            wallType: s.activeWallType,
            doorState: w.doorState ?? (w.isDoor ? "closed" : undefined),
          });
        }
      }

      // Also add to edge-based wall system
      const newEdges = { ...s.wallEdges };
      for (const w of template.walls) {
        const x = originX + w.dx;
        const y = originY + w.dy;
        if (x < 0 || y < 0 || x >= MOCK_MAP.gridCols || y >= MOCK_MAP.gridRows) continue;
        const edgeKey = wallSideToEdgeKey(x, y, w.side);
        if (!newEdges[edgeKey]) {
          let wallType: import("./gameplay-mock-data").WallType = "wall";
          if (w.isDoor) {
            wallType = w.doorState === "open" ? "door-open"
              : w.doorState === "locked" ? "door-locked"
              : "door-closed";
          }
          newEdges[edgeKey] = { type: wallType, style: s.activeWallStyle };
        }
      }

      // Add objects
      const newObjects = [...s.mapObjects];
      for (const o of template.objects) {
        const x = originX + o.dx;
        const y = originY + o.dy;
        if (x < 0 || y < 0 || x >= MOCK_MAP.gridCols || y >= MOCK_MAP.gridRows) continue;
        const exists = newObjects.some((e) => e.x === x && e.y === y);
        if (!exists) {
          newObjects.push({
            id: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
            x,
            y,
            type: o.type as import("./gameplay-mock-data").MapObjectType,
            rotation: 0,
          });
        }
      }

      return {
        terrainCells: newTerrainCells,
        terrainHistory: [...s.terrainHistory.slice(-49), [...s.terrainCells]],
        terrainFuture: [],
        walls: newWalls,
        wallEdges: newEdges,
        mapObjects: newObjects,
      };
    }),

  // ── Path Planning ──
  pathPlanningActive: false,
  pathPlanningTokenId: null,
  plannedPath: [],
  pathUndoStack: [],

  enterPathPlanning: (tokenId) =>
    set({
      pathPlanningActive: true,
      pathPlanningTokenId: tokenId,
      plannedPath: [],
      pathUndoStack: [],
    }),

  exitPathPlanning: () =>
    set({
      pathPlanningActive: false,
      pathPlanningTokenId: null,
      plannedPath: [],
      pathUndoStack: [],
    }),

  addPathCell: (cell) =>
    set((s) => ({
      pathUndoStack: [...s.pathUndoStack, [...s.plannedPath]],
      plannedPath: [...s.plannedPath, cell],
    })),

  setPlannedPath: (path) =>
    set((s) => ({
      pathUndoStack: [...s.pathUndoStack, [...s.plannedPath]],
      plannedPath: path,
    })),

  undoPathStep: () =>
    set((s) => {
      if (s.pathUndoStack.length === 0) return s;
      const prev = s.pathUndoStack[s.pathUndoStack.length - 1];
      return {
        pathUndoStack: s.pathUndoStack.slice(0, -1),
        plannedPath: prev,
      };
    }),

  clearPath: () =>
    set((s) => ({
      pathUndoStack: [...s.pathUndoStack, [...s.plannedPath]],
      plannedPath: [],
    })),

  // ── AI Map Generation ──

  aiSelection: null,
  setAISelection: (sel) => set({ aiSelection: sel }),
  finalizeAISelection: () =>
    set((s) => {
      if (!s.aiSelection) return s;
      const { x1, y1, x2, y2 } = s.aiSelection;
      return {
        aiSelection: {
          x1: Math.min(x1, x2),
          y1: Math.min(y1, y2),
          x2: Math.max(x1, x2),
          y2: Math.max(y1, y2),
          finalized: true,
        },
        aiPanelOpen: true,
      };
    }),
  clearAISelection: () => set({ aiSelection: null, aiPanelOpen: false, aiGenerationStatus: "idle" }),

  aiLayers: [],
  addAILayer: (layer) => set((s) => ({ aiLayers: [...s.aiLayers, layer] })),
  removeAILayer: (id) => set((s) => ({ aiLayers: s.aiLayers.filter((l) => l.id !== id) })),
  undoLastAILayer: () =>
    set((s) => {
      if (s.aiLayers.length === 0) return s;
      return { aiLayers: s.aiLayers.slice(0, -1) };
    }),

  aiGenerationStatus: "idle" as AIGenerationStatus,
  setAIGenerationStatus: (status) => set({ aiGenerationStatus: status }),
  aiPanelOpen: false,
  setAIPanelOpen: (open) => set({ aiPanelOpen: open }),
}));
