import { create } from "zustand";
import type {
  TerrainType,
  TerrainTile,
  Wall,
  Door,
  MapObject,
  LightSource,
  Annotation,
  EditorTool,
  BrushShape,
  BiomeType,
  WallType,
  DoorType,
  DoorState,
  LightType,
  FogState,
  LayerName,
  GameMapLayers,
  MapObjectType,
} from "@questboard/shared";

// ── Helper to create empty layers ──

function createEmptyLayers(width: number, height: number): GameMapLayers {
  const terrainTiles: (TerrainTile | null)[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => null)
  );

  const fogTiles: FogState[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => "hidden" as FogState)
  );

  return {
    terrain: { tiles: terrainTiles },
    objects: { objects: [] },
    structures: { walls: [], doors: [], stairs: [], windows: [] },
    lighting: { globalLight: 0.3, ambientColor: "#FFD700", sources: [] },
    annotations: { annotations: [] },
    fog: { defaultState: "hidden", tiles: fogTiles },
  };
}

// ── Selection State ──

interface TileCoord {
  x: number;
  y: number;
}

// ── Store State ──

interface MapEditorState {
  // Map metadata
  mapId: string | null;
  mapName: string;
  mapWidth: number;
  mapHeight: number;
  tileSize: number;
  biome: BiomeType;
  gridScale: string;

  // Layers
  layers: GameMapLayers;

  // Layer visibility
  layerVisibility: Record<LayerName, boolean>;

  // Active tool
  activeTool: EditorTool;

  // Terrain tool
  selectedTerrain: TerrainType;
  brushSize: number;
  brushShape: BrushShape;

  // Wall tool
  selectedWallType: WallType;
  wallDrawStart: TileCoord | null;

  // Door tool
  selectedDoorType: DoorType;
  selectedDoorState: DoorState;

  // Light tool
  selectedLightType: LightType;
  lightRadius: number;
  lightColor: string;
  lightIntensity: number;

  // Object tool
  selectedObjectType: MapObjectType;

  // Fog tool
  fogBrushMode: "reveal" | "hide";

  // Viewport
  viewportX: number;
  viewportY: number;
  zoom: number;

  // Selection
  selectedTile: TileCoord | null;
  selectedWall: string | null;
  selectedDoor: string | null;
  selectedObject: string | null;
  selectedLight: string | null;

  // UI State
  gridVisible: boolean;
  snapToGrid: boolean;
  isDirty: boolean;
  isPainting: boolean;

  // Undo/redo
  undoStack: GameMapLayers[];
  redoStack: GameMapLayers[];

  // Actions
  initMap: (width: number, height: number, name?: string, biome?: BiomeType) => void;
  setActiveTool: (tool: EditorTool) => void;
  setSelectedTerrain: (terrain: TerrainType) => void;
  setBrushSize: (size: number) => void;
  setBrushShape: (shape: BrushShape) => void;
  setSelectedWallType: (type: WallType) => void;
  setSelectedDoorType: (type: DoorType) => void;
  setSelectedDoorState: (state: DoorState) => void;
  setSelectedLightType: (type: LightType) => void;
  setLightRadius: (r: number) => void;
  setLightColor: (c: string) => void;
  setLightIntensity: (i: number) => void;
  setSelectedObjectType: (type: MapObjectType) => void;
  setFogBrushMode: (mode: "reveal" | "hide") => void;
  toggleLayerVisibility: (layer: LayerName) => void;
  setGridVisible: (v: boolean) => void;
  setSnapToGrid: (v: boolean) => void;
  setZoom: (z: number) => void;
  pan: (dx: number, dy: number) => void;
  setViewport: (x: number, y: number) => void;

  // Tile operations
  paintTerrain: (x: number, y: number) => void;
  eraseTerrain: (x: number, y: number) => void;
  selectTile: (x: number, y: number) => void;
  clearSelection: () => void;
  updateTileDetail: (x: number, y: number, detail: Partial<TerrainTile>) => void;

  // Wall operations
  addWall: (wall: Omit<Wall, "id">) => void;
  removeWall: (id: string) => void;
  setWallDrawStart: (coord: TileCoord | null) => void;

  // Door operations
  addDoor: (door: Omit<Door, "id">) => void;
  removeDoor: (id: string) => void;

  // Object operations
  addObject: (obj: Omit<MapObject, "id">) => void;
  removeObject: (id: string) => void;
  moveObject: (id: string, x: number, y: number) => void;

  // Light operations
  addLight: (light: Omit<LightSource, "id">) => void;
  removeLight: (id: string) => void;
  updateLight: (id: string, updates: Partial<LightSource>) => void;
  setGlobalLight: (value: number) => void;
  setAmbientColor: (color: string) => void;

  // Annotation operations
  addAnnotation: (annotation: Omit<Annotation, "id">) => void;
  removeAnnotation: (id: string) => void;

  // Fog operations
  setFogTile: (x: number, y: number, state: FogState) => void;
  revealAllFog: () => void;
  hideAllFog: () => void;

  // Painting state
  startPainting: () => void;
  stopPainting: () => void;

  // Undo/redo
  pushUndo: () => void;
  undo: () => void;
  redo: () => void;

  // Map name
  setMapName: (name: string) => void;
  setBiome: (biome: BiomeType) => void;

  // Selection
  selectWall: (id: string | null) => void;
  selectDoor: (id: string | null) => void;
  selectObject: (id: string | null) => void;
  selectLight: (id: string | null) => void;
}

let idCounter = 0;
function genId() {
  return `obj_${Date.now()}_${++idCounter}`;
}

export const useMapEditorStore = create<MapEditorState>((set, get) => ({
  // Map metadata
  mapId: null,
  mapName: "Novo Mapa",
  mapWidth: 40,
  mapHeight: 30,
  tileSize: 70,
  biome: "dungeon",
  gridScale: "5 pés",

  // Layers
  layers: createEmptyLayers(40, 30),

  // Layer visibility
  layerVisibility: {
    terrain: true,
    objects: true,
    structures: true,
    lighting: true,
    annotations: false,
    fog: true,
  },

  // Tools
  activeTool: "terrain",
  selectedTerrain: "stone_floor",
  brushSize: 1,
  brushShape: "square",
  selectedWallType: "stone",
  wallDrawStart: null,
  selectedDoorType: "wood",
  selectedDoorState: "closed",
  selectedLightType: "torch",
  lightRadius: 4,
  lightColor: "#FF9F43",
  lightIntensity: 0.8,
  selectedObjectType: "chest",
  fogBrushMode: "reveal",

  // Viewport
  viewportX: 0,
  viewportY: 0,
  zoom: 1,

  // Selection
  selectedTile: null,
  selectedWall: null,
  selectedDoor: null,
  selectedObject: null,
  selectedLight: null,

  // UI
  gridVisible: true,
  snapToGrid: true,
  isDirty: false,
  isPainting: false,

  // Undo
  undoStack: [],
  redoStack: [],

  // ── Actions ──

  initMap: (width, height, name = "Novo Mapa", biome = "dungeon") => {
    set({
      mapWidth: width,
      mapHeight: height,
      mapName: name,
      biome,
      layers: createEmptyLayers(width, height),
      undoStack: [],
      redoStack: [],
      isDirty: false,
      viewportX: 0,
      viewportY: 0,
      zoom: 1,
      selectedTile: null,
    });
  },

  setActiveTool: (tool) => set({ activeTool: tool, wallDrawStart: null }),
  setSelectedTerrain: (terrain) => set({ selectedTerrain: terrain }),
  setBrushSize: (size) => set({ brushSize: Math.max(1, Math.min(5, size)) }),
  setBrushShape: (shape) => set({ brushShape: shape }),
  setSelectedWallType: (type) => set({ selectedWallType: type }),
  setSelectedDoorType: (type) => set({ selectedDoorType: type }),
  setSelectedDoorState: (state) => set({ selectedDoorState: state }),
  setSelectedLightType: (type) => set({ selectedLightType: type }),
  setLightRadius: (r) => set({ lightRadius: r }),
  setLightColor: (c) => set({ lightColor: c }),
  setLightIntensity: (i) => set({ lightIntensity: i }),
  setSelectedObjectType: (type) => set({ selectedObjectType: type }),
  setFogBrushMode: (mode) => set({ fogBrushMode: mode }),
  toggleLayerVisibility: (layer) =>
    set((s) => ({
      layerVisibility: { ...s.layerVisibility, [layer]: !s.layerVisibility[layer] },
    })),
  setGridVisible: (v) => set({ gridVisible: v }),
  setSnapToGrid: (v) => set({ snapToGrid: v }),
  setZoom: (z) => set({ zoom: Math.max(0.25, Math.min(3, z)) }),
  pan: (dx, dy) =>
    set((s) => ({ viewportX: s.viewportX + dx, viewportY: s.viewportY + dy })),
  setViewport: (x, y) => set({ viewportX: x, viewportY: y }),

  // ── Brush tiles helper ──

  paintTerrain: (x, y) => {
    const { brushSize, brushShape, selectedTerrain, layers, mapWidth, mapHeight } = get();
    const newTiles = layers.terrain.tiles.map((row) => [...row]);
    const half = Math.floor(brushSize / 2);

    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        const tx = x + dx;
        const ty = y + dy;
        if (tx < 0 || ty < 0 || tx >= mapWidth || ty >= mapHeight) continue;

        // Shape check
        if (brushShape === "circle") {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > half + 0.5) continue;
        } else if (brushShape === "diamond") {
          if (Math.abs(dx) + Math.abs(dy) > half) continue;
        }

        const existing = newTiles[ty]?.[tx];
        if (newTiles[ty]) {
          newTiles[ty][tx] = {
            x: tx,
            y: ty,
            type: selectedTerrain,
            variant: existing?.variant ?? Math.floor(Math.random() * 4),
            elevation: existing?.elevation ?? 0,
            detail: existing?.detail ?? null,
            tintColor: existing?.tintColor ?? null,
            opacity: existing?.opacity ?? 1,
          };
        }
      }
    }

    set((s) => ({
      layers: {
        ...s.layers,
        terrain: { tiles: newTiles },
      },
      isDirty: true,
    }));
  },

  eraseTerrain: (x, y) => {
    const { brushSize, brushShape, layers, mapWidth, mapHeight } = get();
    const newTiles = layers.terrain.tiles.map((row) => [...row]);
    const half = Math.floor(brushSize / 2);

    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        const tx = x + dx;
        const ty = y + dy;
        if (tx < 0 || ty < 0 || tx >= mapWidth || ty >= mapHeight) continue;

        if (brushShape === "circle") {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > half + 0.5) continue;
        } else if (brushShape === "diamond") {
          if (Math.abs(dx) + Math.abs(dy) > half) continue;
        }

        if (newTiles[ty]) {
          newTiles[ty][tx] = null;
        }
      }
    }

    set((s) => ({
      layers: {
        ...s.layers,
        terrain: { tiles: newTiles },
      },
      isDirty: true,
    }));
  },

  selectTile: (x, y) => set({ selectedTile: { x, y } }),
  clearSelection: () =>
    set({
      selectedTile: null,
      selectedWall: null,
      selectedDoor: null,
      selectedObject: null,
      selectedLight: null,
    }),

  updateTileDetail: (x, y, detail) => {
    const { layers, mapWidth, mapHeight } = get();
    if (x < 0 || y < 0 || x >= mapWidth || y >= mapHeight) return;
    const row = layers.terrain.tiles[y];
    if (!row) return;
    const existing = row[x];
    if (!existing) return;

    const newTiles = layers.terrain.tiles.map((r) => [...r]);
    if (newTiles[y]) {
      newTiles[y][x] = { ...existing, ...detail };
    }
    set((s) => ({
      layers: { ...s.layers, terrain: { tiles: newTiles } },
      isDirty: true,
    }));
  },

  // ── Walls ──

  addWall: (wall) => {
    const id = genId();
    set((s) => ({
      layers: {
        ...s.layers,
        structures: {
          ...s.layers.structures,
          walls: [...s.layers.structures.walls, { ...wall, id }],
        },
      },
      isDirty: true,
    }));
  },

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

  setWallDrawStart: (coord) => set({ wallDrawStart: coord }),

  // ── Doors ──

  addDoor: (door) => {
    const id = genId();
    set((s) => ({
      layers: {
        ...s.layers,
        structures: {
          ...s.layers.structures,
          doors: [...s.layers.structures.doors, { ...door, id }],
        },
      },
      isDirty: true,
    }));
  },

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

  // ── Objects ──

  addObject: (obj) => {
    const id = genId();
    set((s) => ({
      layers: {
        ...s.layers,
        objects: {
          objects: [...s.layers.objects.objects, { ...obj, id }],
        },
      },
      isDirty: true,
    }));
  },

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

  moveObject: (id, x, y) =>
    set((s) => ({
      layers: {
        ...s.layers,
        objects: {
          objects: s.layers.objects.objects.map((o) =>
            o.id === id ? { ...o, x, y } : o
          ),
        },
      },
      isDirty: true,
    })),

  // ── Lights ──

  addLight: (light) => {
    const id = genId();
    set((s) => ({
      layers: {
        ...s.layers,
        lighting: {
          ...s.layers.lighting,
          sources: [...s.layers.lighting.sources, { ...light, id }],
        },
      },
      isDirty: true,
    }));
  },

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

  updateLight: (id, updates) =>
    set((s) => ({
      layers: {
        ...s.layers,
        lighting: {
          ...s.layers.lighting,
          sources: s.layers.lighting.sources.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        },
      },
      isDirty: true,
    })),

  setGlobalLight: (value) =>
    set((s) => ({
      layers: {
        ...s.layers,
        lighting: { ...s.layers.lighting, globalLight: value },
      },
      isDirty: true,
    })),

  setAmbientColor: (color) =>
    set((s) => ({
      layers: {
        ...s.layers,
        lighting: { ...s.layers.lighting, ambientColor: color },
      },
      isDirty: true,
    })),

  // ── Annotations ──

  addAnnotation: (annotation) => {
    const id = genId();
    set((s) => ({
      layers: {
        ...s.layers,
        annotations: {
          annotations: [...s.layers.annotations.annotations, { ...annotation, id }],
        },
      },
      isDirty: true,
    }));
  },

  removeAnnotation: (id) =>
    set((s) => ({
      layers: {
        ...s.layers,
        annotations: {
          annotations: s.layers.annotations.annotations.filter((a) => a.id !== id),
        },
      },
      isDirty: true,
    })),

  // ── Fog ──

  setFogTile: (x, y, state) => {
    const { layers, mapWidth, mapHeight } = get();
    if (x < 0 || y < 0 || x >= mapWidth || y >= mapHeight) return;
    const newFog = layers.fog.tiles.map((row) => [...row]);
    if (newFog[y]) {
      newFog[y][x] = state;
    }
    set((s) => ({
      layers: { ...s.layers, fog: { ...s.layers.fog, tiles: newFog } },
      isDirty: true,
    }));
  },

  revealAllFog: () => {
    const { mapWidth, mapHeight } = get();
    const newFog: FogState[][] = Array.from({ length: mapHeight }, () =>
      Array.from({ length: mapWidth }, () => "visible" as FogState)
    );
    set((s) => ({
      layers: { ...s.layers, fog: { ...s.layers.fog, tiles: newFog } },
      isDirty: true,
    }));
  },

  hideAllFog: () => {
    const { mapWidth, mapHeight } = get();
    const newFog: FogState[][] = Array.from({ length: mapHeight }, () =>
      Array.from({ length: mapWidth }, () => "hidden" as FogState)
    );
    set((s) => ({
      layers: { ...s.layers, fog: { ...s.layers.fog, tiles: newFog } },
      isDirty: true,
    }));
  },

  // Painting
  startPainting: () => {
    get().pushUndo();
    set({ isPainting: true });
  },
  stopPainting: () => set({ isPainting: false }),

  // ── Undo/Redo ──

  pushUndo: () => {
    const { layers, undoStack } = get();
    const snapshot = JSON.parse(JSON.stringify(layers));
    set({
      undoStack: [...undoStack.slice(-49), snapshot],
      redoStack: [],
    });
  },

  undo: () => {
    const { undoStack, layers } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set((s) => ({
      undoStack: s.undoStack.slice(0, -1),
      redoStack: [...s.redoStack, JSON.parse(JSON.stringify(layers))],
      layers: prev,
      isDirty: true,
    }));
  },

  redo: () => {
    const { redoStack, layers } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set((s) => ({
      redoStack: s.redoStack.slice(0, -1),
      undoStack: [...s.undoStack, JSON.parse(JSON.stringify(layers))],
      layers: next,
      isDirty: true,
    }));
  },

  // Map metadata
  setMapName: (name) => set({ mapName: name, isDirty: true }),
  setBiome: (biome) => set({ biome, isDirty: true }),

  // Selection helpers
  selectWall: (id) => set({ selectedWall: id, selectedDoor: null, selectedObject: null, selectedLight: null }),
  selectDoor: (id) => set({ selectedDoor: id, selectedWall: null, selectedObject: null, selectedLight: null }),
  selectObject: (id) => set({ selectedObject: id, selectedWall: null, selectedDoor: null, selectedLight: null }),
  selectLight: (id) => set({ selectedLight: id, selectedWall: null, selectedDoor: null, selectedObject: null }),
}));
