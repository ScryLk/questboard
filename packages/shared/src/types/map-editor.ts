// ─── Terrain Types ───

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
  | "custom";

export type ObjectType =
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
  | "altar_object"
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

export type WallType =
  | "stone"
  | "wood"
  | "iron"
  | "magic"
  | "natural"
  | "invisible";

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

export type LightType =
  | "torch"
  | "lantern"
  | "campfire"
  | "magic"
  | "sunlight"
  | "moonlight";

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

export type AmbianceType = "dark" | "bright" | "mystical" | "horror";

export type FogDefaultState = "ALL_HIDDEN" | "ALL_VISIBLE" | "EXPLORED_ONLY";

// ─── Terrain Detail (in-game interaction) ───

export interface TerrainDetailPerception {
  dc: number;
  description: string;
}

export interface TerrainDetailInvestigation {
  dc: number;
  description: string;
}

export interface TerrainDetail {
  name: string;
  description: string;
  detailImageUrl: string;
  difficulty?: string;
  effect?: string;
  perception?: TerrainDetailPerception | null;
  investigation?: TerrainDetailInvestigation | null;
  isInteractable: boolean;
  interactionLabel?: string;
  interactionResult?: string;
  lore?: string;
}

// ─── Terrain Layer ───

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

// ─── Object Layer ───

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

// ─── Structure Layer ───

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
  targetX?: number;
  targetY?: number;
}

export interface MapWindow {
  id: string;
  x: number;
  y: number;
  side: DoorSide;
  blocksMovement: boolean;
  blocksVision: boolean;
}

export interface StructureLayer {
  walls: Wall[];
  doors: Door[];
  stairs: Stair[];
  windows: MapWindow[];
}

// ─── Lighting Layer ───

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

// ─── Annotation Layer ───

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

// ─── Fog Layer ───

export interface FogTile {
  x: number;
  y: number;
  state: "hidden" | "explored" | "visible";
}

export interface FogLayer {
  defaultState: FogDefaultState;
  tiles: FogTile[];
}

// ─── Game Map (full structure) ───

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
  defaultFogState: FogDefaultState;
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
  biome: BiomeType;
  ambiance: AmbianceType;
  description: string;
  thumbnailUrl: string;
  backgroundImage?: string;
  settings: GameMapSettings;
}

// ─── Editor Tool Types ───

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

// ─── AI Generation Types ───

export type ZoneType = "room" | "corridor" | "outdoor" | "cave" | "custom";

export type VisualStyle =
  | "realistic"
  | "fantasy"
  | "cartoon"
  | "dark"
  | "painterly";

export type DetailLevel = "simple" | "moderate" | "detailed";

export interface AIZoneGenerationParams {
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
  includeInteractiveDetails: boolean;
  width: number;
  height: number;
  startX: number;
  startY: number;
}

export interface AIFullMapGenerationParams {
  width: number;
  height: number;
  mapType: string;
  description: string;
  roomCount: number;
  dangerLevel: number;
  mood: string;
  biome: BiomeType;
  visualStyle: VisualStyle;
}

export interface AITileDetailParams {
  tileType: TerrainType;
  biome: BiomeType;
  zoneDescription: string;
  adjacentTypes: TerrainType[];
  objects: string[];
}

export interface AIGenerationResult {
  terrain?: TerrainTile[][];
  objects?: MapObject[];
  walls?: Wall[];
  doors?: Door[];
  lights?: LightSource[];
  descriptions?: Record<string, TerrainDetail>;
}

// ─── Layer Visibility ───

export type LayerName =
  | "terrain"
  | "objects"
  | "structures"
  | "lighting"
  | "annotations"
  | "fog";

export interface LayerVisibility {
  terrain: boolean;
  objects: boolean;
  structures: boolean;
  lighting: boolean;
  annotations: boolean;
  fog: boolean;
}

// ─── Terrain Palette ───

export interface TerrainPaletteEntry {
  type: TerrainType;
  label: string;
  category: TerrainCategory;
  variants: number;
  color: string;
}

export type TerrainCategory =
  | "dungeon"
  | "natural"
  | "water"
  | "hazard"
  | "special";

// ─── Map Editor Socket Events ───

export interface MapEditorServerEvents {
  "map:terrain-updated": (data: {
    mapId: string;
    tiles: TerrainTile[];
  }) => void;
  "map:object-added": (data: { mapId: string; object: MapObject }) => void;
  "map:object-moved": (data: {
    mapId: string;
    objectId: string;
    x: number;
    y: number;
  }) => void;
  "map:object-removed": (data: {
    mapId: string;
    objectId: string;
  }) => void;
  "map:wall-added": (data: { mapId: string; wall: Wall }) => void;
  "map:wall-removed": (data: { mapId: string; wallId: string }) => void;
  "map:door-added": (data: { mapId: string; door: Door }) => void;
  "map:door-state-changed": (data: {
    mapId: string;
    doorId: string;
    state: DoorState;
  }) => void;
  "map:light-added": (data: {
    mapId: string;
    light: LightSource;
  }) => void;
  "map:light-removed": (data: {
    mapId: string;
    lightId: string;
  }) => void;
  "map:fog-updated": (data: { mapId: string; fogTiles: FogTile[] }) => void;
  "map:layers-synced": (data: {
    mapId: string;
    layers: GameMapLayers;
  }) => void;
}

export interface MapEditorClientEvents {
  "map:update-terrain": (data: {
    mapId: string;
    tiles: TerrainTile[];
  }) => void;
  "map:add-object": (data: { mapId: string; object: MapObject }) => void;
  "map:move-object": (data: {
    mapId: string;
    objectId: string;
    x: number;
    y: number;
  }) => void;
  "map:remove-object": (data: {
    mapId: string;
    objectId: string;
  }) => void;
  "map:add-wall": (data: { mapId: string; wall: Wall }) => void;
  "map:remove-wall": (data: { mapId: string; wallId: string }) => void;
  "map:add-door": (data: { mapId: string; door: Door }) => void;
  "map:change-door-state": (data: {
    mapId: string;
    doorId: string;
    state: DoorState;
  }) => void;
  "map:add-light": (data: { mapId: string; light: LightSource }) => void;
  "map:remove-light": (data: {
    mapId: string;
    lightId: string;
  }) => void;
  "map:update-fog": (data: { mapId: string; fogTiles: FogTile[] }) => void;
  "map:request-sync": (data: { mapId: string }) => void;
}
