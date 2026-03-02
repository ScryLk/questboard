// ─── Map System Types ────────────────────────────────────
// Comprehensive types for the QuestBoard interactive map system.

// ─── Terrain Types ───────────────────────────────────────

export type TerrainType =
  // Dungeon
  | "stone_floor" | "stone_wall" | "dirt_floor" | "wooden_floor"
  | "water_shallow" | "water_deep" | "lava" | "ice" | "sand"
  | "grass" | "cobblestone" | "marble" | "carpet" | "void"
  // Natural
  | "forest_floor" | "mud" | "snow" | "rocky" | "swamp"
  // Special
  | "magic_circle" | "trap" | "pit" | "bridge"
  | "stairs_up" | "stairs_down" | "portal" | "altar" | "custom";

export type ObjectType =
  | "table" | "chair" | "bed" | "chest" | "barrel" | "bookshelf"
  | "throne" | "fountain" | "statue" | "pillar" | "campfire"
  | "tree" | "bush" | "rock_large" | "rock_small" | "mushroom"
  | "torch_stand" | "banner" | "rug" | "altar" | "cage" | "well"
  | "cart" | "crate" | "sack" | "weapon_rack" | "anvil"
  | "cauldron" | "mirror" | "painting" | "custom";

export type WallType =
  | "stone" | "wood" | "iron" | "magic" | "natural" | "invisible";

export type DoorType =
  | "wood" | "iron" | "stone" | "portcullis" | "secret" | "magic";

export type DoorState =
  | "open" | "closed" | "locked" | "barred" | "secret" | "broken";

export type LightType =
  | "torch" | "lantern" | "campfire" | "magic" | "sunlight" | "moonlight";

export type MapBiome =
  | "dungeon" | "forest" | "city" | "cave" | "desert"
  | "swamp" | "mountain" | "coast" | "underground" | "ice";

export type MapAmbiance =
  | "dark" | "bright" | "mystical" | "horror" | "cozy" | "epic";

export type VisualStyle =
  | "realistic" | "fantasy" | "cartoon" | "dark" | "painterly";

export type FogState =
  | "ALL_HIDDEN" | "ALL_VISIBLE" | "EXPLORED_ONLY";

// ─── Terrain Detail (in-game interaction) ────────────────

export interface TerrainPerceptionCheck {
  dc: number;
  description: string;
}

export interface TerrainInvestigationCheck {
  dc: number;
  description: string;
}

export interface TerrainDetail {
  name: string;
  description: string;
  detailImageUrl: string;
  difficulty?: string;
  effect?: string;
  perception?: TerrainPerceptionCheck | null;
  investigation?: TerrainInvestigationCheck | null;
  isInteractable: boolean;
  interactionLabel?: string;
  interactionResult?: string;
  lore?: string;
}

// ─── Terrain Layer ───────────────────────────────────────

export interface TerrainTile {
  x: number;
  y: number;
  type: TerrainType;
  variant: number;
  elevation: number;
  detail: TerrainDetail | null;
  imageUrl: string | null;
  tintColor: string | null;
  opacity: number;
}

export interface TerrainLayer {
  tiles: (TerrainTile | null)[][];
}

// ─── Object Layer ────────────────────────────────────────

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
  type: ObjectType;
  name: string;
  imageUrl: string;
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

// ─── Structure Layer ─────────────────────────────────────

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

export interface Door {
  id: string;
  x: number;
  y: number;
  side: "north" | "south" | "east" | "west";
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
  targetFloor: number;
  targetX: number;
  targetY: number;
}

export interface MapWindow {
  id: string;
  x: number;
  y: number;
  side: "north" | "south" | "east" | "west";
  blocksMovement: boolean;
  blocksVision: boolean;
}

export interface StructureLayer {
  walls: Wall[];
  doors: Door[];
  stairs: Stair[];
  windows: MapWindow[];
}

// ─── Lighting Layer ──────────────────────────────────────

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

// ─── Annotation Layer ────────────────────────────────────

export interface MapAnnotation {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  icon?: string;
}

export interface AnnotationLayer {
  annotations: MapAnnotation[];
}

// ─── Fog Layer ───────────────────────────────────────────

export interface FogTile {
  x: number;
  y: number;
  revealed: boolean;
  explored: boolean;
}

export interface FogLayer {
  tiles: FogTile[][];
}

// ─── Complete Map ────────────────────────────────────────

export interface GameMapLayers {
  terrain: TerrainLayer;
  objects: ObjectLayer;
  structures: StructureLayer;
  lighting: LightingLayer;
  annotations: AnnotationLayer;
  fog: FogLayer;
}

export interface GameMapSettings {
  enableAutoLighting: boolean;
  enableTerrainInteraction: boolean;
  defaultFogState: FogState;
}

export interface GameMap {
  id: string;
  name: string;
  creatorId: string;
  width: number;
  height: number;
  tileSize: number;
  gridType: "SQUARE" | "HEX";
  gridScale: string;
  layers: GameMapLayers;
  biome: MapBiome;
  ambiance: MapAmbiance;
  description: string;
  thumbnailUrl: string;
  backgroundImage?: string;
  settings: GameMapSettings;
  floor: number;
  totalFloors: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Editor Types ────────────────────────────────────────

export type EditorTool =
  | "cursor" | "terrain" | "objects" | "walls" | "doors"
  | "lights" | "fog" | "annotate" | "eraser" | "ia_zone";

export type BrushShape = "square" | "circle" | "diamond";

export interface EditorBrushSettings {
  size: number;
  shape: BrushShape;
}

export interface EditorSelection {
  type: "tile" | "object" | "wall" | "door" | "light" | "annotation";
  id: string;
  x: number;
  y: number;
}

export interface EditorLayerVisibility {
  terrain: boolean;
  objects: boolean;
  structures: boolean;
  lighting: boolean;
  annotations: boolean;
  fog: boolean;
}

// ─── AI Generation Types ─────────────────────────────────

export type ZoneType =
  | "room" | "corridor" | "outdoor" | "cave" | "custom";

export type DetailLevel = "simple" | "moderate" | "detailed";

export interface AIZoneRequest {
  zoneX: number;
  zoneY: number;
  zoneWidth: number;
  zoneHeight: number;
  zoneType: ZoneType;
  biome: MapBiome;
  description: string;
  visualStyle: VisualStyle;
  detailLevel: DetailLevel;
  include: {
    terrain: boolean;
    objects: boolean;
    lighting: boolean;
    walls: boolean;
    descriptions: boolean;
    interactiveDetails: boolean;
  };
}

export interface AIZoneResult {
  terrain: TerrainTile[][];
  objects: MapObject[];
  walls: Wall[];
  doors: Door[];
  lights: LightSource[];
  annotations: MapAnnotation[];
}

export interface AITileDetailRequest {
  tileType: TerrainType;
  biome: MapBiome;
  zoneDescription: string;
  adjacentTypes: TerrainType[];
  objects: string[];
}

export interface AIFullMapRequest {
  width: number;
  height: number;
  biome: MapBiome;
  description: string;
  roomCount: number;
  dangerLevel: number;
  ambiance: MapAmbiance;
  visualStyle: VisualStyle;
}

// ─── In-Game Interaction Types ───────────────────────────

export interface TileInteractionResult {
  type: "perception" | "investigation" | "interaction";
  success: boolean;
  dc?: number;
  roll?: number;
  description: string;
}

export interface DoorInteractionResult {
  type: "open" | "close" | "unlock" | "break" | "examine";
  success: boolean;
  description: string;
}
