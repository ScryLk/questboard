// ── Map Sidebar Types ──
// Types for the map sidebar panel: scenes, layers, lighting, grid, minimap, settings

import type {
  GameToken,
  MapPin,
  MapNote,
  AOEInstance,
  FogSettings,
  LightSourceFixed,
  TerrainCell,
  WallData,
  MapObjectCell,
} from "./gameplay-mock-data";

// ── Scene System ──

export type SceneTransition =
  | "fade"
  | "slide-left"
  | "slide-up"
  | "dissolve"
  | "curtain"
  | "instant";

export type SceneCardStyle =
  | "location"
  | "chapter"
  | "cinematic"
  | "flashback";

export interface SceneSavedState {
  tokens: GameToken[];
  fogCells: string[]; // serialized from Set<string>
  markers: MapPin[];
  notes: MapNote[];
  aoeInstances: AOEInstance[];
  lightSources: LightSourceFixed[];
  terrainCells: TerrainCell[];
  wallEdges: Record<string, WallData>;
  mapObjects: MapObjectCell[];
  cameraPosition: { scrollLeft: number; scrollTop: number; zoom: number };
  ambientLight: AmbientLight;
  gridVisible: boolean;
}

export interface SessionScene {
  id: string;
  name: string;
  thumbnail: string; // base64 mini preview or empty
  category: string; // "Dungeon", "Overworld", etc
  dimensions: string; // "25×25"
  order: number;
  savedState: SceneSavedState | null;
  isActive: boolean;
  createdAt: string;
}

// ── Layer System ──

export type LayerId =
  | "fog"
  | "effects"
  | "tokens"
  | "decorations"
  | "walls"
  | "terrain"
  | "grid"
  | "background";

export interface LayerState {
  id: LayerId;
  name: string;
  icon: string; // Lucide icon name
  visible: boolean;
  locked: boolean;
  opacity: number; // 0-100
  order: number;
}

export const DEFAULT_LAYERS: LayerState[] = [
  { id: "fog", name: "Fog of War", icon: "Cloud", visible: true, locked: false, opacity: 100, order: 7 },
  { id: "effects", name: "Efeitos / AOE", icon: "Sparkles", visible: true, locked: false, opacity: 100, order: 6 },
  { id: "tokens", name: "Tokens", icon: "Circle", visible: true, locked: false, opacity: 100, order: 5 },
  { id: "decorations", name: "Decorações", icon: "Armchair", visible: true, locked: false, opacity: 100, order: 4 },
  { id: "walls", name: "Paredes", icon: "Fence", visible: true, locked: false, opacity: 100, order: 3 },
  { id: "terrain", name: "Terreno", icon: "Square", visible: true, locked: false, opacity: 100, order: 2 },
  { id: "grid", name: "Grid", icon: "Grid3x3", visible: true, locked: false, opacity: 40, order: 1 },
  { id: "background", name: "Background", icon: "Image", visible: true, locked: false, opacity: 80, order: 0 },
];

// ── Lighting ──

export type AmbientLight = "bright" | "dim" | "dark" | "pitch_black";

export const AMBIENT_LIGHT_CONFIG: Record<AmbientLight, { label: string; icon: string; overlay: number; desaturation: number }> = {
  bright: { label: "Claro", icon: "Sun", overlay: 0, desaturation: 0 },
  dim: { label: "Penumbra", icon: "Sunset", overlay: 0.15, desaturation: 0.2 },
  dark: { label: "Escuro", icon: "Moon", overlay: 0.4, desaturation: 0.6 },
  pitch_black: { label: "Escuridão", icon: "Square", overlay: 0.85, desaturation: 1 },
};

// ── Grid ──

export type GridType = "square" | "hex-flat" | "hex-pointy" | "none";

export const GRID_TYPE_LABELS: Record<GridType, string> = {
  square: "Quadrado",
  "hex-flat": "Hex (flat)",
  "hex-pointy": "Hex (pointy)",
  none: "Sem grid",
};

// ── Minimap ──

export type MinimapPosition = "bl" | "br" | "tl" | "tr";
export type MinimapSize = "small" | "medium" | "large";

export const MINIMAP_POSITION_LABELS: Record<MinimapPosition, string> = {
  bl: "Inf. Esq.",
  br: "Inf. Dir.",
  tl: "Sup. Esq.",
  tr: "Sup. Dir.",
};

export const MINIMAP_SIZE_LABELS: Record<MinimapSize, string> = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
};

// ── Fog style/color ──

export type QuickFogStyle = "mist" | "shadow" | "solid";
export type QuickFogColor = "gray" | "blue" | "red" | "green" | "purple";

export const FOG_STYLE_LABELS: Record<QuickFogStyle, string> = {
  mist: "Névoa animada",
  shadow: "Sombra suave",
  solid: "Preto sólido",
};

export const FOG_COLOR_LABELS: Record<QuickFogColor, string> = {
  gray: "Cinza",
  blue: "Azul",
  red: "Vermelho",
  green: "Verde",
  purple: "Roxo",
};

// ── Scene transition labels ──

export const SCENE_TRANSITION_LABELS: Record<SceneTransition, string> = {
  fade: "Fade",
  "slide-left": "Deslizar",
  "slide-up": "Subir",
  dissolve: "Dissolver",
  curtain: "Cortina",
  instant: "Instantâneo",
};

// ── Scene category options ──

export const SCENE_CATEGORIES = [
  "Dungeon",
  "Overworld",
  "Town",
  "Interior",
  "Cave",
  "Forest",
  "Battle",
  "Outro",
] as const;

// ── Sidebar visible sections ──

export const MAP_SIDEBAR_SECTIONS = [
  { key: "activeScene", label: "Cena ativa" },
  { key: "sceneList", label: "Cenas rápidas" },
  { key: "layers", label: "Layers" },
  { key: "lighting", label: "Iluminação" },
  { key: "fog", label: "Fog rápido" },
  { key: "grid", label: "Grid" },
  { key: "annotations", label: "Anotações" },
  { key: "quickActions", label: "Ações rápidas" },
  { key: "minimap", label: "Mini-mapa" },
] as const;

export type MapSidebarSectionKey = (typeof MAP_SIDEBAR_SECTIONS)[number]["key"];

export const DEFAULT_VISIBLE_SECTIONS: Record<MapSidebarSectionKey, boolean> = {
  activeScene: true,
  sceneList: true,
  layers: true,
  lighting: true,
  fog: true,
  grid: false,
  annotations: false,
  quickActions: false,
  minimap: false,
};
