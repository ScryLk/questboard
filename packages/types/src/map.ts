// ── Map System Types ──

// ── Terrain Types ──

export type TerrainType =
  // Dungeon
  | "stone_floor"
  | "stone_wall"
  | "dirt_floor"
  | "wooden_floor"
  | "water_shallow"
  | "water_deep"
  | "lava"
  | "ice"
  | "sand"
  | "grass"
  | "cobblestone"
  | "marble"
  | "carpet"
  | "void"
  // Natural
  | "forest_floor"
  | "mud"
  | "snow"
  | "rocky"
  | "swamp"
  // Special
  | "magic_circle"
  | "trap"
  | "pit"
  | "bridge"
  | "stairs_up"
  | "stairs_down"
  | "portal"
  | "altar"
  | "custom"
  // Extended
  | "cave_floor"
  | "tiles_white"
  | "acid"
  | "blood"
  | "wood_wall"
  | "dungeon_wall"
  | "brick_wall"
  | "dense_trees"
  | "light_trees";

export type BiomeType =
  | "dungeon"
  | "forest"
  | "city"
  | "cave"
  | "desert"
  | "swamp"
  | "mountain"
  | "coast"
  | "underground"
  | "ice";

export type VisualStyle =
  | "realistic"
  | "fantasy"
  | "cartoon"
  | "dark"
  | "painterly";

export enum GridType {
  SQUARE = "SQUARE",
  HEX = "HEX",
}

export enum MapGenerationStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// ── Terrain Detail (in-game interaction) ──

export interface TerrainPerception {
  dc: number;
  description: string;
}

export interface TerrainInvestigation {
  dc: number;
  description: string;
}

export interface TerrainDetail {
  name: string;
  description: string;
  detailImageUrl: string;
  difficulty?: string;
  effect?: string;
  perception?: TerrainPerception;
  investigation?: TerrainInvestigation;
  isInteractable: boolean;
  interactionLabel?: string;
  interactionResult?: string;
  lore?: string;
}

// ── Terrain Tile ──

export interface TerrainTile {
  x: number;
  y: number;
  type: TerrainType;
  variant: number;
  elevation: number;
  detail: TerrainDetail | null;
  tintColor: string | null;
  opacity: number;
}

export interface TerrainLayer {
  tiles: (TerrainTile | null)[][];
}

// ── Object Layer ──

export type MapObjectType =
  | "table"
  | "chair"
  | "bed"
  | "chest"
  | "barrel"
  | "bookshelf"
  | "throne"
  | "fountain"
  | "statue"
  | "pillar"
  | "campfire"
  | "tree"
  | "bush"
  | "rock_large"
  | "rock_small"
  | "mushroom"
  | "torch_stand"
  | "banner"
  | "rug"
  | "altar"
  | "cage"
  | "well"
  | "cart"
  | "crate"
  | "sack"
  | "weapon_rack"
  | "anvil"
  | "cauldron"
  | "mirror"
  | "painting"
  | "custom";

export interface MapObjectDetail {
  description: string;
  detailImageUrl?: string;
  loot?: string[];
  trapDC?: number;
}

export interface MapObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: MapObjectType;
  name: string;
  rotation: number;
  isInteractable: boolean;
  interactionLabel?: string;
  detail?: MapObjectDetail;
  layer: "below_tokens" | "above_tokens";
  opacity: number;
  tintColor?: string;
}

export interface ObjectLayer {
  objects: MapObject[];
}

// ── Structure Layer ──

export type WallType =
  | "stone"
  | "wood"
  | "iron"
  | "magic"
  | "natural"
  | "invisible";

export interface Wall {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  type: WallType;
  thickness: number;
  hp?: number;
  blocksVision: boolean;
  blocksMovement: boolean;
}

export type DoorType =
  | "wood"
  | "iron"
  | "stone"
  | "portcullis"
  | "secret"
  | "magic";

export type DoorState =
  | "open"
  | "closed"
  | "locked"
  | "barred"
  | "secret"
  | "broken";

export type DoorSide = "north" | "south" | "east" | "west";

export interface Door {
  id: string;
  x: number;
  y: number;
  side: DoorSide;
  state: DoorState;
  lockDC?: number;
  hp?: number;
  type: DoorType;
  isInteractable: boolean;
  keyItem?: string;
}

export interface Stair {
  id: string;
  x: number;
  y: number;
  direction: "up" | "down";
  targetFloor?: number;
}

export interface MapWindow {
  id: string;
  x: number;
  y: number;
  side: DoorSide;
  isOpen: boolean;
}

export interface StructureLayer {
  walls: Wall[];
  doors: Door[];
  stairs: Stair[];
  windows: MapWindow[];
}

// ── Lighting Layer ──

export type LightType =
  | "torch"
  | "lantern"
  | "campfire"
  | "magic"
  | "sunlight"
  | "moonlight";

export interface LightSource {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity: number;
  type: LightType;
  flicker: boolean;
  castsShadows: boolean;
}

export interface LightingLayer {
  globalLight: number;
  ambientColor: string;
  sources: LightSource[];
}

// ── Annotation Layer ──

export interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  isGmOnly: boolean;
}

export interface AnnotationLayer {
  annotations: Annotation[];
}

// ── Fog Layer ──

export type FogState = "hidden" | "explored" | "visible";

export interface FogLayer {
  defaultState: FogState;
  tiles: FogState[][];
}

// ── Full Game Map ──

export interface GameMapLayers {
  terrain: TerrainLayer;
  objects: ObjectLayer;
  structures: StructureLayer;
  lighting: LightingLayer;
  annotations: AnnotationLayer;
  fog: FogLayer;
}

export type LayerName = keyof GameMapLayers;

export interface GameMapSettings {
  enableAutoLighting: boolean;
  enableTerrainInteraction: boolean;
  defaultFogState: "ALL_HIDDEN" | "ALL_VISIBLE" | "EXPLORED_ONLY";
}

export interface GameMap {
  id: string;
  name: string;
  creatorId: string;
  width: number;
  height: number;
  tileSize: number;
  gridType: GridType;
  gridScale: string;
  layers: GameMapLayers;
  biome: BiomeType;
  ambiance: string;
  description: string;
  thumbnailUrl: string;
  backgroundImage?: string;
  settings: GameMapSettings;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Simple Map (legacy, pre-editor) ──

export interface MapData {
  id: string;
  name: string;
  imageUrl: string;
  gridType: GridType;
  gridSize: number;
  width: number;
  height: number;
  sessionId: string;
  createdAt: Date;
}

export interface Token {
  id: string;
  x: number;
  y: number;
  size: number;
  imageUrl: string | null;
  label: string | null;
  conditions: string[];
  currentHp: number | null;
  maxHp: number | null;
  isVisible: boolean;
  mapId: string;
  characterId: string | null;
}

export interface TokenDTO {
  id: string;
  x: number;
  y: number;
  size: number;
  imageUrl: string | null;
  label: string | null;
  conditions: string[];
  currentHp: number | null;
  maxHp: number | null;
  isVisible: boolean;
  characterId: string | null;
}

export interface FogArea {
  id: string;
  type: string;
  points: unknown;
  revealed: boolean;
  mapId: string;
}

export interface FogAreaDTO {
  id: string;
  type: string;
  points: unknown;
  revealed: boolean;
}

export interface MapLayer {
  id: string;
  type: string;
  data: unknown;
  zIndex: number;
  visible: boolean;
  mapId: string;
}

// ── Editor Tool Types ──

export type EditorTool =
  | "cursor"
  | "terrain"
  | "objects"
  | "walls"
  | "doors"
  | "lights"
  | "fog"
  | "annotate"
  | "eraser"
  | "ai_zone";

export type BrushShape = "square" | "circle" | "diamond";

export interface BrushSettings {
  size: number;
  shape: BrushShape;
}

// ── AI Zone Generation ──

export type ZoneType =
  | "room"
  | "corridor"
  | "outdoor"
  | "cave"
  | "custom";

export type DetailLevel = "simple" | "moderate" | "detailed";

export interface AIZoneRequest {
  zoneStartX: number;
  zoneStartY: number;
  zoneWidth: number;
  zoneHeight: number;
  zoneType: ZoneType;
  biome: BiomeType;
  description: string;
  visualStyle: VisualStyle;
  detailLevel: DetailLevel;
  includeTerrain: boolean;
  includeObjects: boolean;
  includeLighting: boolean;
  includeWalls: boolean;
  includeDescriptions: boolean;
  includeInteractions: boolean;
}

// ── Terrain Data (palette configuration) ──

export interface TerrainCategory {
  id: string;
  label: string;
  terrains: TerrainInfo[];
}

export interface TerrainInfo {
  type: TerrainType;
  label: string;
  color: string;
  category: string;
  variants: number;
}
