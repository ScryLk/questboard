import { create } from "zustand";
import type {
  TerrainTile,
  TerrainType,
  MapObject,
  Wall,
  Door,
  LightSource,
  MapAnnotation,
  EditorTool,
  BrushShape,
  LayerVisibility,
  GameMapLayers,
  GameMapSettings,
  BiomeType,
  AmbianceType,
  WallType,
  DoorType,
  DoorState,
  LightType,
  ObjectType,
  TerrainDetail,
} from "@questboard/shared";

// ─── Selection ───

interface SelectionState {
  type: "terrain" | "object" | "wall" | "door" | "light" | "annotation" | null;
  id: string | null;
  tileX: number | null;
  tileY: number | null;
}

// ─── Undo/Redo ───

interface HistoryEntry {
  layers: GameMapLayers;
  description: string;
}

// ─── Viewport ───

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

// ─── Editor State ───

export interface MapEditorState {
  // Map metadata
  mapId: string | null;
  mapName: string;
  width: number;
  height: number;
  tileSize: number;
  gridType: "SQUARE" | "HEX";
  gridScale: string;
  biome: BiomeType;
  ambiance: AmbianceType;
  description: string;
  settings: GameMapSettings;

  // Layers
  layers: GameMapLayers;

  // Tool state
  activeTool: EditorTool;
  brushSize: number;
  brushShape: BrushShape;
  selectedTerrainType: TerrainType;
  selectedWallType: WallType;
  selectedDoorType: DoorType;
  selectedDoorState: DoorState;
  selectedLightType: LightType;
  selectedObjectType: ObjectType;

  // Layer visibility
  layerVisibility: LayerVisibility;

  // Selection
  selection: SelectionState;

  // Viewport
  viewport: Viewport;
  gridVisible: boolean;
  snapToGrid: boolean;

  // Wall drawing state
  wallDrawing: { startX: number; startY: number } | null;

  // Undo/Redo
  history: HistoryEntry[];
  historyIndex: number;

  // UI state
  showAIZoneModal: boolean;
  aiZoneSelection: { x: number; y: number; width: number; height: number } | null;
  isSaving: boolean;
  lastSavedAt: Date | null;
  isDirty: boolean;

  // Actions: Map setup
  initializeMap: (params: {
    id?: string;
    name: string;
    width: number;
    height: number;
    biome?: BiomeType;
    ambiance?: AmbianceType;
  }) => void;
  setMapName: (name: string) => void;
  setMapDescription: (description: string) => void;
  setBiome: (biome: BiomeType) => void;
  setAmbiance: (ambiance: AmbianceType) => void;

  // Actions: Tool selection
  setActiveTool: (tool: EditorTool) => void;
  setBrushSize: (size: number) => void;
  setBrushShape: (shape: BrushShape) => void;
  setSelectedTerrainType: (type: TerrainType) => void;
  setSelectedWallType: (type: WallType) => void;
  setSelectedDoorType: (type: DoorType) => void;
  setSelectedLightType: (type: LightType) => void;
  setSelectedObjectType: (type: ObjectType) => void;

  // Actions: Terrain
  paintTerrain: (x: number, y: number) => void;
  paintTerrainArea: (tiles: { x: number; y: number }[]) => void;
  eraseTerrain: (x: number, y: number) => void;
  setTerrainDetail: (x: number, y: number, detail: TerrainDetail | null) => void;
  setTerrainElevation: (x: number, y: number, elevation: number) => void;
  setTerrainVariant: (x: number, y: number, variant: number) => void;

  // Actions: Objects
  addObject: (object: MapObject) => void;
  moveObject: (objectId: string, x: number, y: number) => void;
  rotateObject: (objectId: string) => void;
  removeObject: (objectId: string) => void;
  updateObject: (objectId: string, updates: Partial<MapObject>) => void;

  // Actions: Walls
  addWall: (wall: Wall) => void;
  removeWall: (wallId: string) => void;
  updateWall: (wallId: string, updates: Partial<Wall>) => void;
  setWallDrawing: (start: { startX: number; startY: number } | null) => void;

  // Actions: Doors
  addDoor: (door: Door) => void;
  removeDoor: (doorId: string) => void;
  updateDoor: (doorId: string, updates: Partial<Door>) => void;

  // Actions: Lights
  addLight: (light: LightSource) => void;
  removeLight: (lightId: string) => void;
  updateLight: (lightId: string, updates: Partial<LightSource>) => void;
  setGlobalLight: (value: number) => void;
  setAmbientColor: (color: string) => void;

  // Actions: Fog
  setFogTile: (x: number, y: number, state: "hidden" | "explored" | "visible") => void;
  setFogArea: (tiles: { x: number; y: number }[], state: "hidden" | "explored" | "visible") => void;
  resetFog: (state: "hidden" | "visible") => void;

  // Actions: Annotations
  addAnnotation: (annotation: MapAnnotation) => void;
  removeAnnotation: (annotationId: string) => void;
  updateAnnotation: (annotationId: string, updates: Partial<MapAnnotation>) => void;

  // Actions: Selection
  setSelection: (selection: SelectionState) => void;
  clearSelection: () => void;

  // Actions: Viewport
  setViewport: (viewport: Partial<Viewport>) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  setLayerVisibility: (layer: keyof LayerVisibility, visible: boolean) => void;

  // Actions: History
  undo: () => void;
  redo: () => void;
  pushHistory: (description: string) => void;

  // Actions: AI
  setShowAIZoneModal: (show: boolean) => void;
  setAIZoneSelection: (selection: { x: number; y: number; width: number; height: number } | null) => void;
  applyAIGeneration: (result: Partial<GameMapLayers>) => void;

  // Actions: Persistence
  setIsSaving: (saving: boolean) => void;
  markSaved: () => void;
  getLayerData: () => GameMapLayers;
  loadLayerData: (data: GameMapLayers) => void;
}

function createEmptyLayers(width: number, height: number): GameMapLayers {
  const tiles: (TerrainTile | null)[][] = [];
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y]![x] = null;
    }
  }

  return {
    terrain: { tiles },
    objects: { objects: [] },
    structures: { walls: [], doors: [], stairs: [], windows: [] },
    lighting: { globalLight: 0.3, ambientColor: "#FFD700", sources: [] },
    annotations: { annotations: [] },
    fog: { defaultState: "ALL_HIDDEN", tiles: [] },
  };
}

export const useMapEditorStore = create<MapEditorState>((set, get) => ({
  // Map metadata
  mapId: null,
  mapName: "Novo Mapa",
  width: 40,
  height: 30,
  tileSize: 70,
  gridType: "SQUARE",
  gridScale: "5 pés",
  biome: "dungeon",
  ambiance: "dark",
  description: "",
  settings: {
    enableAutoLighting: true,
    enableTerrainInteraction: true,
    defaultFogState: "ALL_HIDDEN",
  },

  // Layers
  layers: createEmptyLayers(40, 30),

  // Tool state
  activeTool: "terrain",
  brushSize: 1,
  brushShape: "square",
  selectedTerrainType: "stone_floor",
  selectedWallType: "stone",
  selectedDoorType: "wood",
  selectedDoorState: "closed",
  selectedLightType: "torch",
  selectedObjectType: "table",

  // Layer visibility
  layerVisibility: {
    terrain: true,
    objects: true,
    structures: true,
    lighting: false,
    annotations: false,
    fog: true,
  },

  // Selection
  selection: { type: null, id: null, tileX: null, tileY: null },

  // Viewport
  viewport: { x: 0, y: 0, zoom: 1 },
  gridVisible: true,
  snapToGrid: true,

  // Wall drawing
  wallDrawing: null,

  // History
  history: [],
  historyIndex: -1,

  // UI
  showAIZoneModal: false,
  aiZoneSelection: null,
  isSaving: false,
  lastSavedAt: null,
  isDirty: false,

  // ─── Map setup ───

  initializeMap: (params) => {
    const width = params.width;
    const height = params.height;
    set({
      mapId: params.id ?? null,
      mapName: params.name,
      width,
      height,
      biome: params.biome ?? "dungeon",
      ambiance: params.ambiance ?? "dark",
      layers: createEmptyLayers(width, height),
      history: [],
      historyIndex: -1,
      isDirty: false,
    });
  },

  setMapName: (name) => set({ mapName: name, isDirty: true }),
  setMapDescription: (description) => set({ description, isDirty: true }),
  setBiome: (biome) => set({ biome, isDirty: true }),
  setAmbiance: (ambiance) => set({ ambiance, isDirty: true }),

  // ─── Tool selection ───

  setActiveTool: (tool) => set({ activeTool: tool, wallDrawing: null }),
  setBrushSize: (size) => set({ brushSize: Math.max(1, Math.min(5, size)) }),
  setBrushShape: (shape) => set({ brushShape: shape }),
  setSelectedTerrainType: (type) => set({ selectedTerrainType: type }),
  setSelectedWallType: (type) => set({ selectedWallType: type }),
  setSelectedDoorType: (type) => set({ selectedDoorType: type }),
  setSelectedLightType: (type) => set({ selectedLightType: type }),
  setSelectedObjectType: (type) => set({ selectedObjectType: type }),

  // ─── Terrain ───

  paintTerrain: (x, y) => {
    const state = get();
    if (x < 0 || x >= state.width || y < 0 || y >= state.height) return;

    const newTiles = state.layers.terrain.tiles.map((row) => [...row]);
    const existing = newTiles[y]?.[x];
    newTiles[y]![x] = {
      x,
      y,
      type: state.selectedTerrainType,
      variant: Math.floor(Math.random() * 4),
      elevation: existing?.elevation ?? 0,
      detail: existing?.detail ?? null,
      imageUrl: null,
      tintColor: null,
      opacity: 1,
    };

    set({
      layers: {
        ...state.layers,
        terrain: { tiles: newTiles },
      },
      isDirty: true,
    });
  },

  paintTerrainArea: (tiles) => {
    const state = get();
    const newTiles = state.layers.terrain.tiles.map((row) => [...row]);

    for (const { x, y } of tiles) {
      if (x < 0 || x >= state.width || y < 0 || y >= state.height) continue;
      const existing = newTiles[y]?.[x];
      newTiles[y]![x] = {
        x,
        y,
        type: state.selectedTerrainType,
        variant: Math.floor(Math.random() * 4),
        elevation: existing?.elevation ?? 0,
        detail: existing?.detail ?? null,
        imageUrl: null,
        tintColor: null,
        opacity: 1,
      };
    }

    set({
      layers: {
        ...state.layers,
        terrain: { tiles: newTiles },
      },
      isDirty: true,
    });
  },

  eraseTerrain: (x, y) => {
    const state = get();
    if (x < 0 || x >= state.width || y < 0 || y >= state.height) return;

    const newTiles = state.layers.terrain.tiles.map((row) => [...row]);
    newTiles[y]![x] = null;

    set({
      layers: {
        ...state.layers,
        terrain: { tiles: newTiles },
      },
      isDirty: true,
    });
  },

  setTerrainDetail: (x, y, detail) => {
    const state = get();
    const tile = state.layers.terrain.tiles[y]?.[x];
    if (!tile) return;

    const newTiles = state.layers.terrain.tiles.map((row) => [...row]);
    newTiles[y]![x] = { ...tile, detail };

    set({
      layers: {
        ...state.layers,
        terrain: { tiles: newTiles },
      },
      isDirty: true,
    });
  },

  setTerrainElevation: (x, y, elevation) => {
    const state = get();
    const tile = state.layers.terrain.tiles[y]?.[x];
    if (!tile) return;

    const newTiles = state.layers.terrain.tiles.map((row) => [...row]);
    newTiles[y]![x] = { ...tile, elevation };

    set({
      layers: {
        ...state.layers,
        terrain: { tiles: newTiles },
      },
      isDirty: true,
    });
  },

  setTerrainVariant: (x, y, variant) => {
    const state = get();
    const tile = state.layers.terrain.tiles[y]?.[x];
    if (!tile) return;

    const newTiles = state.layers.terrain.tiles.map((row) => [...row]);
    newTiles[y]![x] = { ...tile, variant };

    set({
      layers: {
        ...state.layers,
        terrain: { tiles: newTiles },
      },
      isDirty: true,
    });
  },

  // ─── Objects ───

  addObject: (object) => {
    set((state) => ({
      layers: {
        ...state.layers,
        objects: {
          objects: [...state.layers.objects.objects, object],
        },
      },
      isDirty: true,
    }));
  },

  moveObject: (objectId, x, y) => {
    set((state) => ({
      layers: {
        ...state.layers,
        objects: {
          objects: state.layers.objects.objects.map((obj) =>
            obj.id === objectId ? { ...obj, x, y } : obj
          ),
        },
      },
      isDirty: true,
    }));
  },

  rotateObject: (objectId) => {
    set((state) => ({
      layers: {
        ...state.layers,
        objects: {
          objects: state.layers.objects.objects.map((obj) =>
            obj.id === objectId
              ? { ...obj, rotation: (obj.rotation + 90) % 360 }
              : obj
          ),
        },
      },
      isDirty: true,
    }));
  },

  removeObject: (objectId) => {
    set((state) => ({
      layers: {
        ...state.layers,
        objects: {
          objects: state.layers.objects.objects.filter(
            (obj) => obj.id !== objectId
          ),
        },
      },
      isDirty: true,
    }));
  },

  updateObject: (objectId, updates) => {
    set((state) => ({
      layers: {
        ...state.layers,
        objects: {
          objects: state.layers.objects.objects.map((obj) =>
            obj.id === objectId ? { ...obj, ...updates } : obj
          ),
        },
      },
      isDirty: true,
    }));
  },

  // ─── Walls ───

  addWall: (wall) => {
    set((state) => ({
      layers: {
        ...state.layers,
        structures: {
          ...state.layers.structures,
          walls: [...state.layers.structures.walls, wall],
        },
      },
      isDirty: true,
    }));
  },

  removeWall: (wallId) => {
    set((state) => ({
      layers: {
        ...state.layers,
        structures: {
          ...state.layers.structures,
          walls: state.layers.structures.walls.filter((w) => w.id !== wallId),
        },
      },
      isDirty: true,
    }));
  },

  updateWall: (wallId, updates) => {
    set((state) => ({
      layers: {
        ...state.layers,
        structures: {
          ...state.layers.structures,
          walls: state.layers.structures.walls.map((w) =>
            w.id === wallId ? { ...w, ...updates } : w
          ),
        },
      },
      isDirty: true,
    }));
  },

  setWallDrawing: (start) => set({ wallDrawing: start }),

  // ─── Doors ───

  addDoor: (door) => {
    set((state) => ({
      layers: {
        ...state.layers,
        structures: {
          ...state.layers.structures,
          doors: [...state.layers.structures.doors, door],
        },
      },
      isDirty: true,
    }));
  },

  removeDoor: (doorId) => {
    set((state) => ({
      layers: {
        ...state.layers,
        structures: {
          ...state.layers.structures,
          doors: state.layers.structures.doors.filter((d) => d.id !== doorId),
        },
      },
      isDirty: true,
    }));
  },

  updateDoor: (doorId, updates) => {
    set((state) => ({
      layers: {
        ...state.layers,
        structures: {
          ...state.layers.structures,
          doors: state.layers.structures.doors.map((d) =>
            d.id === doorId ? { ...d, ...updates } : d
          ),
        },
      },
      isDirty: true,
    }));
  },

  // ─── Lights ───

  addLight: (light) => {
    set((state) => ({
      layers: {
        ...state.layers,
        lighting: {
          ...state.layers.lighting,
          sources: [...state.layers.lighting.sources, light],
        },
      },
      isDirty: true,
    }));
  },

  removeLight: (lightId) => {
    set((state) => ({
      layers: {
        ...state.layers,
        lighting: {
          ...state.layers.lighting,
          sources: state.layers.lighting.sources.filter(
            (l) => l.id !== lightId
          ),
        },
      },
      isDirty: true,
    }));
  },

  updateLight: (lightId, updates) => {
    set((state) => ({
      layers: {
        ...state.layers,
        lighting: {
          ...state.layers.lighting,
          sources: state.layers.lighting.sources.map((l) =>
            l.id === lightId ? { ...l, ...updates } : l
          ),
        },
      },
      isDirty: true,
    }));
  },

  setGlobalLight: (value) => {
    set((state) => ({
      layers: {
        ...state.layers,
        lighting: { ...state.layers.lighting, globalLight: value },
      },
      isDirty: true,
    }));
  },

  setAmbientColor: (color) => {
    set((state) => ({
      layers: {
        ...state.layers,
        lighting: { ...state.layers.lighting, ambientColor: color },
      },
      isDirty: true,
    }));
  },

  // ─── Fog ───

  setFogTile: (x, y, state) => {
    set((s) => {
      const existing = s.layers.fog.tiles.findIndex(
        (t) => t.x === x && t.y === y
      );
      const newTiles = [...s.layers.fog.tiles];
      if (existing >= 0) {
        newTiles[existing] = { x, y, state };
      } else {
        newTiles.push({ x, y, state });
      }
      return {
        layers: {
          ...s.layers,
          fog: { ...s.layers.fog, tiles: newTiles },
        },
        isDirty: true,
      };
    });
  },

  setFogArea: (tiles, fogState) => {
    set((s) => {
      const newFogTiles = [...s.layers.fog.tiles];
      for (const { x, y } of tiles) {
        const existing = newFogTiles.findIndex(
          (t) => t.x === x && t.y === y
        );
        if (existing >= 0) {
          newFogTiles[existing] = { x, y, state: fogState };
        } else {
          newFogTiles.push({ x, y, state: fogState });
        }
      }
      return {
        layers: {
          ...s.layers,
          fog: { ...s.layers.fog, tiles: newFogTiles },
        },
        isDirty: true,
      };
    });
  },

  resetFog: (fogState) => {
    set((s) => ({
      layers: {
        ...s.layers,
        fog: {
          ...s.layers.fog,
          tiles: [],
          defaultState: fogState === "hidden" ? "ALL_HIDDEN" : "ALL_VISIBLE",
        },
      },
      isDirty: true,
    }));
  },

  // ─── Annotations ───

  addAnnotation: (annotation) => {
    set((state) => ({
      layers: {
        ...state.layers,
        annotations: {
          annotations: [
            ...state.layers.annotations.annotations,
            annotation,
          ],
        },
      },
      isDirty: true,
    }));
  },

  removeAnnotation: (annotationId) => {
    set((state) => ({
      layers: {
        ...state.layers,
        annotations: {
          annotations: state.layers.annotations.annotations.filter(
            (a) => a.id !== annotationId
          ),
        },
      },
      isDirty: true,
    }));
  },

  updateAnnotation: (annotationId, updates) => {
    set((state) => ({
      layers: {
        ...state.layers,
        annotations: {
          annotations: state.layers.annotations.annotations.map((a) =>
            a.id === annotationId ? { ...a, ...updates } : a
          ),
        },
      },
      isDirty: true,
    }));
  },

  // ─── Selection ───

  setSelection: (selection) => set({ selection }),
  clearSelection: () =>
    set({ selection: { type: null, id: null, tileX: null, tileY: null } }),

  // ─── Viewport ───

  setViewport: (viewport) =>
    set((state) => ({ viewport: { ...state.viewport, ...viewport } })),
  toggleGrid: () => set((state) => ({ gridVisible: !state.gridVisible })),
  toggleSnap: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
  setLayerVisibility: (layer, visible) =>
    set((state) => ({
      layerVisibility: { ...state.layerVisibility, [layer]: visible },
    })),

  // ─── History (Undo/Redo) ───

  pushHistory: (description) => {
    const state = get();
    const entry: HistoryEntry = {
      layers: JSON.parse(JSON.stringify(state.layers)),
      description,
    };
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(entry);
    // Keep max 50 history entries
    if (newHistory.length > 50) newHistory.shift();
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;
    const prevEntry = state.history[state.historyIndex - 1];
    if (!prevEntry) return;
    set({
      layers: JSON.parse(JSON.stringify(prevEntry.layers)),
      historyIndex: state.historyIndex - 1,
      isDirty: true,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;
    const nextEntry = state.history[state.historyIndex + 1];
    if (!nextEntry) return;
    set({
      layers: JSON.parse(JSON.stringify(nextEntry.layers)),
      historyIndex: state.historyIndex + 1,
      isDirty: true,
    });
  },

  // ─── AI ───

  setShowAIZoneModal: (show) => set({ showAIZoneModal: show }),
  setAIZoneSelection: (selection) => set({ aiZoneSelection: selection }),

  applyAIGeneration: (result) => {
    const state = get();
    get().pushHistory("Before AI generation");

    const newLayers = { ...state.layers };

    if (result.terrain) {
      const newTiles = state.layers.terrain.tiles.map((row) => [...row]);
      for (const row of result.terrain.tiles) {
        for (const tile of row) {
          if (tile && tile.y >= 0 && tile.y < state.height && tile.x >= 0 && tile.x < state.width) {
            newTiles[tile.y]![tile.x] = tile;
          }
        }
      }
      newLayers.terrain = { tiles: newTiles };
    }

    if (result.objects) {
      newLayers.objects = {
        objects: [
          ...state.layers.objects.objects,
          ...result.objects.objects,
        ],
      };
    }

    if (result.structures) {
      newLayers.structures = {
        walls: [
          ...state.layers.structures.walls,
          ...(result.structures.walls ?? []),
        ],
        doors: [
          ...state.layers.structures.doors,
          ...(result.structures.doors ?? []),
        ],
        stairs: [
          ...state.layers.structures.stairs,
          ...(result.structures.stairs ?? []),
        ],
        windows: [
          ...state.layers.structures.windows,
          ...(result.structures.windows ?? []),
        ],
      };
    }

    if (result.lighting) {
      newLayers.lighting = {
        ...state.layers.lighting,
        sources: [
          ...state.layers.lighting.sources,
          ...(result.lighting.sources ?? []),
        ],
      };
    }

    set({ layers: newLayers, isDirty: true });
  },

  // ─── Persistence ───

  setIsSaving: (saving) => set({ isSaving: saving }),
  markSaved: () => set({ isSaving: false, lastSavedAt: new Date(), isDirty: false }),
  getLayerData: () => get().layers,
  loadLayerData: (data) => set({ layers: data, isDirty: false }),
}));

// ─── Brush helper: get tiles affected by brush ───

export function getBrushTiles(
  centerX: number,
  centerY: number,
  size: number,
  shape: BrushShape,
  mapWidth: number,
  mapHeight: number
): { x: number; y: number }[] {
  const tiles: { x: number; y: number }[] = [];
  const half = Math.floor(size / 2);

  for (let dy = -half; dy <= half; dy++) {
    for (let dx = -half; dx <= half; dx++) {
      const x = centerX + dx;
      const y = centerY + dy;
      if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) continue;

      if (shape === "circle") {
        if (dx * dx + dy * dy <= half * half) {
          tiles.push({ x, y });
        }
      } else if (shape === "diamond") {
        if (Math.abs(dx) + Math.abs(dy) <= half) {
          tiles.push({ x, y });
        }
      } else {
        // square
        tiles.push({ x, y });
      }
    }
  }

  return tiles;
}
