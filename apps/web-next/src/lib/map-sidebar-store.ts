import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  SessionScene,
  LayerState,
  LayerId,
  AmbientLight,
  SceneTransition,
  GridType,
  MinimapPosition,
  MinimapSize,
  MapSidebarSectionKey,
  SceneSavedState,
} from "./map-sidebar-types";
import { DEFAULT_LAYERS, DEFAULT_VISIBLE_SECTIONS } from "./map-sidebar-types";
import { useGameplayStore } from "./gameplay-store";
import { MOCK_MAP } from "./gameplay-mock-data";

// ── Helpers ──

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function createDefaultScene(partial?: Partial<SessionScene>): SessionScene {
  return {
    id: generateId(),
    name: "Nova Cena",
    thumbnail: "",
    category: "Dungeon",
    dimensions: `${MOCK_MAP.gridCols}×${MOCK_MAP.gridRows}`,
    order: 0,
    savedState: null,
    isActive: false,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

// ── Store Interface ──

interface MapSidebarState {
  // Scenes
  scenes: SessionScene[];
  activeSceneId: string | null;
  sceneTransition: SceneTransition;
  isTransitioning: boolean;

  addScene: (partial?: Partial<SessionScene>) => SessionScene;
  removeScene: (sceneId: string) => void;
  updateScene: (sceneId: string, updates: Partial<SessionScene>) => void;
  setActiveScene: (sceneId: string) => void;
  reorderScenes: (fromIndex: number, toIndex: number) => void;
  saveCurrentSceneState: () => void;
  loadSceneState: (sceneId: string) => void;
  setSceneTransition: (t: SceneTransition) => void;
  setIsTransitioning: (v: boolean) => void;

  // Layers
  layers: LayerState[];
  toggleLayerVisible: (layerId: LayerId) => void;
  toggleLayerLocked: (layerId: LayerId) => void;
  setLayerOpacity: (layerId: LayerId, opacity: number) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  soloLayer: (layerId: LayerId) => void;
  showAllLayers: () => void;
  hideAllLayers: () => void;
  _soloLayerId: LayerId | null;
  _preSoloVisibility: Record<string, boolean>;

  // Lighting
  ambientLight: AmbientLight;
  setAmbientLight: (light: AmbientLight) => void;

  // Grid (extended beyond gameplay-store)
  gridType: GridType;
  gridSnap: boolean;
  gridShowCoordinates: boolean;
  gridHoverHighlight: boolean;
  cellSizeFt: number;
  setGridType: (type: GridType) => void;
  setGridSnap: (snap: boolean) => void;
  setGridShowCoordinates: (show: boolean) => void;
  setGridHoverHighlight: (show: boolean) => void;
  setCellSizeFt: (ft: number) => void;

  // Annotations visibility
  showGMNotes: boolean;
  showMarkers: boolean;
  toggleGMNotes: () => void;
  toggleMarkers: () => void;

  // Minimap
  minimapVisible: boolean;
  minimapPosition: MinimapPosition;
  minimapSize: MinimapSize;
  minimapOpacity: number;
  minimapShowTokens: boolean;
  minimapShowViewport: boolean;
  minimapShowFog: boolean;
  setMinimapVisible: (v: boolean) => void;
  setMinimapPosition: (p: MinimapPosition) => void;
  setMinimapSize: (s: MinimapSize) => void;
  setMinimapOpacity: (o: number) => void;
  setMinimapShowTokens: (v: boolean) => void;
  setMinimapShowViewport: (v: boolean) => void;
  setMinimapShowFog: (v: boolean) => void;

  // Sidebar config
  visibleSections: Record<MapSidebarSectionKey, boolean>;
  sidebarLayout: "compact" | "expanded";
  toggleSectionVisibility: (key: MapSidebarSectionKey) => void;
  setSidebarLayout: (layout: "compact" | "expanded") => void;
  resetSidebarSettings: () => void;
}

// ── Store ──

export const useMapSidebarStore = create<MapSidebarState>()(
  persist(
    (set, get) => ({
      // ── Scenes ──
      scenes: [],
      activeSceneId: null,
      sceneTransition: "fade",
      isTransitioning: false,

      addScene: (partial) => {
        const scene = createDefaultScene({
          order: get().scenes.length,
          ...partial,
        });
        set((s) => ({ scenes: [...s.scenes, scene] }));
        return scene;
      },

      removeScene: (sceneId) => {
        set((s) => ({
          scenes: s.scenes.filter((sc) => sc.id !== sceneId),
          activeSceneId: s.activeSceneId === sceneId ? null : s.activeSceneId,
        }));
      },

      updateScene: (sceneId, updates) => {
        set((s) => ({
          scenes: s.scenes.map((sc) =>
            sc.id === sceneId ? { ...sc, ...updates } : sc,
          ),
        }));
      },

      setActiveScene: (sceneId) => {
        const state = get();
        // Save current scene state before switching
        if (state.activeSceneId) {
          state.saveCurrentSceneState();
        }

        set((s) => ({
          activeSceneId: sceneId,
          scenes: s.scenes.map((sc) => ({
            ...sc,
            isActive: sc.id === sceneId,
          })),
        }));

        // Load new scene state
        state.loadSceneState(sceneId);
      },

      reorderScenes: (fromIndex, toIndex) => {
        set((s) => {
          const arr = [...s.scenes];
          const [moved] = arr.splice(fromIndex, 1);
          arr.splice(toIndex, 0, moved);
          return { scenes: arr.map((sc, i) => ({ ...sc, order: i })) };
        });
      },

      saveCurrentSceneState: () => {
        const { activeSceneId } = get();
        if (!activeSceneId) return;

        const gs = useGameplayStore.getState();
        const savedState: SceneSavedState = {
          tokens: gs.tokens,
          fogCells: Array.from(gs.fogCells),
          markers: gs.markers,
          notes: gs.notes,
          aoeInstances: gs.aoeInstances,
          lightSources: gs.lightSources,
          terrainCells: gs.terrainCells,
          wallEdges: gs.wallEdges,
          mapObjects: gs.mapObjects,
          cameraPosition: {
            scrollLeft: gs.mapViewport.scrollLeft,
            scrollTop: gs.mapViewport.scrollTop,
            zoom: gs.zoom,
          },
          ambientLight: get().ambientLight,
          gridVisible: gs.gridVisible,
        };

        set((s) => ({
          scenes: s.scenes.map((sc) =>
            sc.id === activeSceneId ? { ...sc, savedState } : sc,
          ),
        }));
      },

      loadSceneState: (sceneId) => {
        const scene = get().scenes.find((sc) => sc.id === sceneId);
        if (!scene?.savedState) return;

        const saved = scene.savedState;
        const gs = useGameplayStore.getState();

        // Restore gameplay-store state
        // We set fields directly via the store's set function
        useGameplayStore.setState({
          tokens: saved.tokens,
          fogCells: new Set(saved.fogCells),
          markers: saved.markers,
          notes: saved.notes,
          aoeInstances: saved.aoeInstances,
          lightSources: saved.lightSources,
          terrainCells: saved.terrainCells,
          wallEdges: saved.wallEdges,
          mapObjects: saved.mapObjects,
          zoom: saved.cameraPosition.zoom,
          gridVisible: saved.gridVisible,
        });

        // Restore ambient light
        set({ ambientLight: saved.ambientLight });
      },

      setSceneTransition: (t) => set({ sceneTransition: t }),
      setIsTransitioning: (v) => set({ isTransitioning: v }),

      // ── Layers ──
      layers: DEFAULT_LAYERS,
      _soloLayerId: null,
      _preSoloVisibility: {},

      toggleLayerVisible: (layerId) => {
        set((s) => ({
          layers: s.layers.map((l) =>
            l.id === layerId ? { ...l, visible: !l.visible } : l,
          ),
          _soloLayerId: null,
        }));
      },

      toggleLayerLocked: (layerId) => {
        set((s) => ({
          layers: s.layers.map((l) =>
            l.id === layerId ? { ...l, locked: !l.locked } : l,
          ),
        }));
      },

      setLayerOpacity: (layerId, opacity) => {
        set((s) => ({
          layers: s.layers.map((l) =>
            l.id === layerId ? { ...l, opacity } : l,
          ),
        }));
      },

      reorderLayers: (fromIndex, toIndex) => {
        set((s) => {
          const arr = [...s.layers];
          const [moved] = arr.splice(fromIndex, 1);
          arr.splice(toIndex, 0, moved);
          return { layers: arr.map((l, i) => ({ ...l, order: arr.length - 1 - i })) };
        });
      },

      soloLayer: (layerId) => {
        const state = get();
        if (state._soloLayerId === layerId) {
          // Unsolo: restore previous visibility
          set((s) => ({
            layers: s.layers.map((l) => ({
              ...l,
              visible: s._preSoloVisibility[l.id] ?? true,
            })),
            _soloLayerId: null,
            _preSoloVisibility: {},
          }));
        } else {
          // Solo: save current, show only target
          const visMap: Record<string, boolean> = {};
          state.layers.forEach((l) => { visMap[l.id] = l.visible; });
          set((s) => ({
            layers: s.layers.map((l) => ({
              ...l,
              visible: l.id === layerId,
            })),
            _soloLayerId: layerId,
            _preSoloVisibility: visMap,
          }));
        }
      },

      showAllLayers: () => {
        set((s) => ({
          layers: s.layers.map((l) => ({ ...l, visible: true })),
          _soloLayerId: null,
        }));
      },

      hideAllLayers: () => {
        set((s) => ({
          layers: s.layers.map((l) => ({ ...l, visible: false })),
          _soloLayerId: null,
        }));
      },

      // ── Lighting ──
      ambientLight: "bright",
      setAmbientLight: (light) => set({ ambientLight: light }),

      // ── Grid ──
      gridType: "square",
      gridSnap: true,
      gridShowCoordinates: false,
      gridHoverHighlight: true,
      cellSizeFt: 5,
      setGridType: (type) => set({ gridType: type }),
      setGridSnap: (snap) => set({ gridSnap: snap }),
      setGridShowCoordinates: (show) => set({ gridShowCoordinates: show }),
      setGridHoverHighlight: (show) => set({ gridHoverHighlight: show }),
      setCellSizeFt: (ft) => set({ cellSizeFt: ft }),

      // ── Annotations ──
      showGMNotes: true,
      showMarkers: true,
      toggleGMNotes: () => set((s) => ({ showGMNotes: !s.showGMNotes })),
      toggleMarkers: () => set((s) => ({ showMarkers: !s.showMarkers })),

      // ── Minimap ──
      minimapVisible: true,
      minimapPosition: "bl",
      minimapSize: "medium",
      minimapOpacity: 70,
      minimapShowTokens: true,
      minimapShowViewport: true,
      minimapShowFog: false,
      setMinimapVisible: (v) => set({ minimapVisible: v }),
      setMinimapPosition: (p) => set({ minimapPosition: p }),
      setMinimapSize: (s) => set({ minimapSize: s }),
      setMinimapOpacity: (o) => set({ minimapOpacity: o }),
      setMinimapShowTokens: (v) => set({ minimapShowTokens: v }),
      setMinimapShowViewport: (v) => set({ minimapShowViewport: v }),
      setMinimapShowFog: (v) => set({ minimapShowFog: v }),

      // ── Sidebar config ──
      visibleSections: { ...DEFAULT_VISIBLE_SECTIONS },
      sidebarLayout: "compact",

      toggleSectionVisibility: (key) => {
        set((s) => ({
          visibleSections: {
            ...s.visibleSections,
            [key]: !s.visibleSections[key],
          },
        }));
      },

      setSidebarLayout: (layout) => set({ sidebarLayout: layout }),

      resetSidebarSettings: () =>
        set({
          visibleSections: { ...DEFAULT_VISIBLE_SECTIONS },
          sidebarLayout: "compact",
        }),
    }),
    {
      name: "questboard-map-sidebar",
      version: 1,
      partialize: (state) => ({
        scenes: state.scenes,
        activeSceneId: state.activeSceneId,
        sceneTransition: state.sceneTransition,
        layers: state.layers,
        ambientLight: state.ambientLight,
        gridType: state.gridType,
        gridSnap: state.gridSnap,
        gridShowCoordinates: state.gridShowCoordinates,
        gridHoverHighlight: state.gridHoverHighlight,
        cellSizeFt: state.cellSizeFt,
        showGMNotes: state.showGMNotes,
        showMarkers: state.showMarkers,
        minimapVisible: state.minimapVisible,
        minimapPosition: state.minimapPosition,
        minimapSize: state.minimapSize,
        minimapOpacity: state.minimapOpacity,
        minimapShowTokens: state.minimapShowTokens,
        minimapShowViewport: state.minimapShowViewport,
        minimapShowFog: state.minimapShowFog,
        visibleSections: state.visibleSections,
        sidebarLayout: state.sidebarLayout,
      }),
    },
  ),
);
