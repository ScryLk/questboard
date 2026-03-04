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
  TerrainCell,
  FogSettings,
  MapPin,
  MapNote,
  Toast,
  VisionConfig,
  WallSegment,
  WallSide,
  LightSourceFixed,
} from "./gameplay-mock-data";
import {
  MOCK_COMBAT,
  MOCK_TOKENS,
  MOCK_MESSAGES,
  DEFAULT_FOG_SETTINGS,
  DEFAULT_VISION,
} from "./gameplay-mock-data";


export type ModalName =
  | "createScene"
  | "soundtrack"
  | "createToken"
  | "startCombat"
  | "endSession"
  | "shareSession"
  | "hpAdjust"
  | "characterSheet"
  | "creatureCompendium"
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

  // Creature compendium favorites
  compendiumFavorites: Set<string>;
  toggleCompendiumFavorite: (id: string) => void;

  // Modal
  activeModal: ModalName;
  openModal: (name: ModalName) => void;
  closeModal: () => void;

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
  addToast: (text: string) => void;
  removeToast: (id: string) => void;

  // Add token to map
  addToken: (t: {
    name: string;
    x: number;
    y: number;
    alignment?: TokenAlignment;
    hp?: number;
    maxHp?: number;
    ac?: number;
    size?: number;
  }) => void;

  // Clear cell contents
  clearCell: (x: number, y: number) => void;

  // Vision system (config only — rendering is on-demand per selected token)
  tokenVision: Record<string, VisionConfig>;
  walls: WallSegment[];
  lightSources: LightSourceFixed[];

  setTokenVision: (tokenId: string, config: Partial<VisionConfig>) => void;
  toggleTokenVision: (tokenId: string) => void;
  addWall: (w: WallSegment) => void;
  removeWall: (x: number, y: number, side: WallSide) => void;
  toggleDoor: (x: number, y: number, side: WallSide) => void;
  addLightSource: (l: LightSourceFixed) => void;
  removeLightSource: (id: string) => void;
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
  setActiveTool: (tool) => set({ activeTool: tool }),

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
      return {
        combat: { ...s.combat, turnIndex: next, round: newRound },
        movementUsedFt: 0,
      };
    });
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
  endCombat: () => set((s) => ({ combat: { ...s.combat, active: false } })),
  movementUsedFt: 0,
  resetMovement: () => set({ movementUsedFt: 0 }),
  addMovementFt: (ft) => set((s) => ({ movementUsedFt: s.movementUsedFt + ft })),

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
  activeTerrainType: "difficult" as TerrainType,
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

  mapViewport: { scrollLeft: 0, scrollTop: 0, viewportW: 800, viewportH: 600, cellSize: 40 },
  setMapViewport: (v) => set({ mapViewport: v }),
  getViewportCenter: () => {
    const { mapViewport: v } = get();
    const centerX = Math.floor((v.scrollLeft + v.viewportW / 2) / v.cellSize);
    const centerY = Math.floor((v.scrollTop + v.viewportH / 2) / v.cellSize);
    return { x: centerX, y: centerY };
  },

  collapsedSections: { tokens: true, quicknpc: true },
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
  addToast: (text) => {
    const id = `toast_${Date.now()}`;
    const toast: Toast = { id, text, timestamp: Date.now() };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // Add token
  addToken: (t) =>
    set((s) => ({
      tokens: [
        ...s.tokens,
        {
          id: `token_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
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
          speed: 30,
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
  addWall: (w) => {
    set((s) => ({ walls: [...s.walls, w] }));
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
      walls: s.walls.map((w) =>
        w.x === x && w.y === y && w.side === side
          ? { ...w, doorOpen: !w.doorOpen }
          : w,
      ),
    }));
  },
  addLightSource: (l) => {
    set((s) => ({ lightSources: [...s.lightSources, l] }));
  },
  removeLightSource: (id) => {
    set((s) => ({
      lightSources: s.lightSources.filter((l) => l.id !== id),
    }));
  },
}));
