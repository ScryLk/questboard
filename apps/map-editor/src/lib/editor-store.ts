import { create } from "zustand";
import type {
  TerrainType,
  TerrainTile,
  TerrainDetail,
  MapObject,
  Wall,
  Door,
  LightSource,
  MapAnnotation,
  EditorTool,
  BrushShape,
  EditorLayerVisibility,
  MapBiome,
  MapAmbiance,
  GameMap,
  GameMapLayers,
} from "@questboard/shared/types";

// ─── Editor State ────────────────────────────────────────

export interface EditorViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface EditorSelection {
  type: "tile" | "object" | "wall" | "door" | "light" | "annotation";
  id: string;
  x: number;
  y: number;
}

export interface EditorState {
  // Map metadata
  mapName: string;
  mapWidth: number;
  mapHeight: number;
  tileSize: number;
  biome: MapBiome;
  ambiance: MapAmbiance;
  gridScale: string;

  // Layers
  layers: GameMapLayers;

  // Viewport
  viewport: EditorViewport;
  gridVisible: boolean;
  snapToGrid: boolean;

  // Tool state
  activeTool: EditorTool;
  selectedTerrainType: TerrainType;
  selectedWallType: Wall["type"];
  selectedDoorType: Door["type"];
  selectedLightType: LightSource["type"];
  brushSize: number;
  brushShape: BrushShape;

  // Selection
  selection: EditorSelection | null;
  multiSelection: EditorSelection[];

  // Layer visibility
  layerVisibility: EditorLayerVisibility;

  // UI
  showAIZoneModal: boolean;
  aiZoneSelection: { x: number; y: number; width: number; height: number } | null;
  isSaving: boolean;
  lastSaved: Date | null;
  isDirty: boolean;

  // Actions
  setMapMeta: (data: Partial<Pick<EditorState, "mapName" | "mapWidth" | "mapHeight" | "biome" | "ambiance" | "gridScale">>) => void;
  setActiveTool: (tool: EditorTool) => void;
  setSelectedTerrainType: (type: TerrainType) => void;
  setBrushSize: (size: number) => void;
  setBrushShape: (shape: BrushShape) => void;
  setViewport: (viewport: Partial<EditorViewport>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  toggleLayerVisibility: (layer: keyof EditorLayerVisibility) => void;
  setSelection: (sel: EditorSelection | null) => void;
  paintTerrain: (x: number, y: number) => void;
  eraseTerrain: (x: number, y: number) => void;
  updateTileDetail: (x: number, y: number, detail: TerrainDetail | null) => void;
  addObject: (obj: MapObject) => void;
  removeObject: (id: string) => void;
  addWall: (wall: Wall) => void;
  removeWall: (id: string) => void;
  addDoor: (door: Door) => void;
  removeDoor: (id: string) => void;
  addLight: (light: LightSource) => void;
  removeLight: (id: string) => void;
  toggleFogTile: (x: number, y: number) => void;
  showAIZone: (selection: { x: number; y: number; width: number; height: number }) => void;
  closeAIZone: () => void;
  markSaved: () => void;
  initMap: (width: number, height: number) => void;
}

// ─── Helpers ─────────────────────────────────────────────

function createEmptyTerrainGrid(width: number, height: number): (TerrainTile | null)[][] {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => null),
  );
}

function createEmptyFogGrid(width: number, height: number) {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      x,
      y,
      revealed: false,
      explored: false,
    })),
  );
}

function createEmptyLayers(width: number, height: number): GameMapLayers {
  return {
    terrain: { tiles: createEmptyTerrainGrid(width, height) },
    objects: { objects: [] },
    structures: { walls: [], doors: [], stairs: [], windows: [] },
    lighting: { globalLight: 0.8, ambientColor: "#FFD700", sources: [] },
    annotations: { annotations: [] },
    fog: { tiles: createEmptyFogGrid(width, height) },
  };
}

// ─── Store ───────────────────────────────────────────────

const DEFAULT_WIDTH = 40;
const DEFAULT_HEIGHT = 30;

export const useEditorStore = create<EditorState>((set, get) => ({
  mapName: "Novo Mapa",
  mapWidth: DEFAULT_WIDTH,
  mapHeight: DEFAULT_HEIGHT,
  tileSize: 70,
  biome: "dungeon",
  ambiance: "dark",
  gridScale: "5 pés",

  layers: createEmptyLayers(DEFAULT_WIDTH, DEFAULT_HEIGHT),

  viewport: { x: 0, y: 0, zoom: 1 },
  gridVisible: true,
  snapToGrid: true,

  activeTool: "cursor",
  selectedTerrainType: "stone_floor",
  selectedWallType: "stone",
  selectedDoorType: "wood",
  selectedLightType: "torch",
  brushSize: 1,
  brushShape: "square",

  selection: null,
  multiSelection: [],

  layerVisibility: {
    terrain: true,
    objects: true,
    structures: true,
    lighting: false,
    annotations: false,
    fog: true,
  },

  showAIZoneModal: false,
  aiZoneSelection: null,
  isSaving: false,
  lastSaved: null,
  isDirty: false,

  setMapMeta: (data) => set((s) => ({ ...data, isDirty: true })),

  setActiveTool: (tool) => set({ activeTool: tool, selection: null }),

  setSelectedTerrainType: (type) => set({ selectedTerrainType: type }),

  setBrushSize: (size) => set({ brushSize: Math.max(1, Math.min(5, size)) }),

  setBrushShape: (shape) => set({ brushShape: shape }),

  setViewport: (viewport) =>
    set((s) => ({ viewport: { ...s.viewport, ...viewport } })),

  zoomIn: () =>
    set((s) => ({
      viewport: { ...s.viewport, zoom: Math.min(4, s.viewport.zoom * 1.2) },
    })),

  zoomOut: () =>
    set((s) => ({
      viewport: { ...s.viewport, zoom: Math.max(0.25, s.viewport.zoom / 1.2) },
    })),

  resetZoom: () =>
    set((s) => ({ viewport: { ...s.viewport, zoom: 1, x: 0, y: 0 } })),

  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),

  toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),

  toggleLayerVisibility: (layer) =>
    set((s) => ({
      layerVisibility: {
        ...s.layerVisibility,
        [layer]: !s.layerVisibility[layer],
      },
    })),

  setSelection: (sel) => set({ selection: sel }),

  paintTerrain: (x, y) => {
    const state = get();
    const { brushSize, selectedTerrainType, layers, mapWidth, mapHeight } = state;
    const half = Math.floor(brushSize / 2);
    const newTiles = layers.terrain.tiles.map((row) => [...row]);

    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        const tx = x + dx;
        const ty = y + dy;
        if (tx < 0 || tx >= mapWidth || ty < 0 || ty >= mapHeight) continue;

        if (state.brushShape === "circle") {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > half + 0.5) continue;
        } else if (state.brushShape === "diamond") {
          if (Math.abs(dx) + Math.abs(dy) > half) continue;
        }

        const row = newTiles[ty];
        if (row) {
          row[tx] = {
            x: tx,
            y: ty,
            type: selectedTerrainType,
            variant: Math.floor(Math.random() * 4),
            elevation: 0,
            detail: null,
            imageUrl: null,
            tintColor: null,
            opacity: 1,
          };
        }
      }
    }

    set({
      layers: {
        ...layers,
        terrain: { tiles: newTiles },
      },
      isDirty: true,
    });
  },

  eraseTerrain: (x, y) => {
    const { layers, mapWidth, mapHeight } = get();
    if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) return;
    const newTiles = layers.terrain.tiles.map((row) => [...row]);
    const row = newTiles[y];
    if (row) {
      row[x] = null;
    }
    set({
      layers: { ...layers, terrain: { tiles: newTiles } },
      isDirty: true,
    });
  },

  updateTileDetail: (x, y, detail) => {
    const { layers } = get();
    const newTiles = layers.terrain.tiles.map((row) => [...row]);
    const tile = newTiles[y]?.[x];
    if (tile) {
      newTiles[y]![x] = { ...tile, detail };
      set({
        layers: { ...layers, terrain: { tiles: newTiles } },
        isDirty: true,
      });
    }
  },

  addObject: (obj) =>
    set((s) => ({
      layers: {
        ...s.layers,
        objects: { objects: [...s.layers.objects.objects, obj] },
      },
      isDirty: true,
    })),

  removeObject: (id) =>
    set((s) => ({
      layers: {
        ...s.layers,
        objects: {
          objects: s.layers.objects.objects.filter((o) => o.id !== id),
        },
      },
      isDirty: true,
    })),

  addWall: (wall) =>
    set((s) => ({
      layers: {
        ...s.layers,
        structures: {
          ...s.layers.structures,
          walls: [...s.layers.structures.walls, wall],
        },
      },
      isDirty: true,
    })),

  removeWall: (id) =>
    set((s) => ({
      layers: {
        ...s.layers,
        structures: {
          ...s.layers.structures,
          walls: s.layers.structures.walls.filter((w) => w.id !== id),
        },
      },
      isDirty: true,
    })),

  addDoor: (door) =>
    set((s) => ({
      layers: {
        ...s.layers,
        structures: {
          ...s.layers.structures,
          doors: [...s.layers.structures.doors, door],
        },
      },
      isDirty: true,
    })),

  removeDoor: (id) =>
    set((s) => ({
      layers: {
        ...s.layers,
        structures: {
          ...s.layers.structures,
          doors: s.layers.structures.doors.filter((d) => d.id !== id),
        },
      },
      isDirty: true,
    })),

  addLight: (light) =>
    set((s) => ({
      layers: {
        ...s.layers,
        lighting: {
          ...s.layers.lighting,
          sources: [...s.layers.lighting.sources, light],
        },
      },
      isDirty: true,
    })),

  removeLight: (id) =>
    set((s) => ({
      layers: {
        ...s.layers,
        lighting: {
          ...s.layers.lighting,
          sources: s.layers.lighting.sources.filter((l) => l.id !== id),
        },
      },
      isDirty: true,
    })),

  toggleFogTile: (x, y) => {
    const { layers } = get();
    const row = layers.fog.tiles[y];
    const tile = row?.[x];
    if (!tile) return;
    const newFog = layers.fog.tiles.map((r) => [...r]);
    newFog[y]![x] = { ...tile, revealed: !tile.revealed };
    set({
      layers: { ...layers, fog: { tiles: newFog } },
      isDirty: true,
    });
  },

  showAIZone: (selection) =>
    set({ showAIZoneModal: true, aiZoneSelection: selection }),

  closeAIZone: () =>
    set({ showAIZoneModal: false, aiZoneSelection: null }),

  markSaved: () => set({ isSaving: false, lastSaved: new Date(), isDirty: false }),

  initMap: (width, height) =>
    set({
      mapWidth: width,
      mapHeight: height,
      layers: createEmptyLayers(width, height),
      selection: null,
      multiSelection: [],
      isDirty: false,
    }),
}));
