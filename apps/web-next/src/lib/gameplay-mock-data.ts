// ── Types ────────────────────────────────────────────

export type PlayerStatus = "online" | "offline" | "away";
export type TokenAlignment = "player" | "hostile" | "neutral" | "ally";
export type CombatantStatus = "active" | "dead" | "unconscious";
export type ChatChannel = "geral" | "mesa-gm" | "sussurro";
export type ChatMessageType = "normal" | "system" | "whisper" | "roll";
export type MapTool =
  | "pointer"
  | "pan"
  | "ruler"
  | "fog"
  | "grid"
  | "aoe"
  | "draw"
  | "region"
  | "wall"
  | "vision"
  | "terrain"
  | "objects"
  | "ai";
export type RightPanelTab = "chat" | "dice" | "sheet";
export type DieType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100";
export type TokenVisibility = "visible" | "hidden" | "invisible";
export type FogStyle = "solid" | "fog" | "shadows";
export type FogColor = "gray" | "blue" | "red" | "green";

export interface FogSettings {
  style: FogStyle;
  color: FogColor;
  density: number;
  speed: number;
  softEdges: boolean;
  revealAnimation: boolean;
}

export const FOG_COLOR_THEMES: Record<
  FogColor,
  {
    base: string;
    accent: string;
    /** Base fill RGB (dark) */
    r: number; g: number; b: number;
    /** Smoke wisp RGB (lighter — must contrast with base for visible noise) */
    sr: number; sg: number; sb: number;
  }
> = {
  gray: { base: "#1a1a1a", accent: "#333333", r: 16, g: 16, b: 20, sr: 80, sg: 75, sb: 95 },
  blue: { base: "#0a1628", accent: "#1a3050", r: 8, g: 14, b: 30, sr: 35, sg: 65, sb: 120 },
  red: { base: "#1a0a0a", accent: "#3a1a1a", r: 22, g: 8, b: 8, sr: 85, sg: 30, sb: 35 },
  green: { base: "#0a1a0a", accent: "#1a3a1a", r: 8, g: 22, b: 10, sr: 35, sg: 85, sb: 40 },
};

export const DEFAULT_FOG_SETTINGS: FogSettings = {
  style: "fog",
  color: "gray",
  density: 0.9,
  speed: 1.0,
  softEdges: true,
  revealAnimation: true,
};
export type AOEShape = "circle" | "cone" | "line" | "cube";
export type AOEColor =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "white";
export type ConditionType =
  | "blinded"
  | "charmed"
  | "deafened"
  | "frightened"
  | "grappled"
  | "incapacitated"
  | "invisible"
  | "paralyzed"
  | "petrified"
  | "poisoned"
  | "prone"
  | "restrained"
  | "stunned"
  | "unconscious"
  | "concentrating";

export const ALL_CONDITIONS: { key: ConditionType; label: string }[] = [
  { key: "blinded", label: "Cego" },
  { key: "charmed", label: "Enfeiticado" },
  { key: "deafened", label: "Surdo" },
  { key: "frightened", label: "Amedrontado" },
  { key: "grappled", label: "Agarrado" },
  { key: "incapacitated", label: "Incapacitado" },
  { key: "invisible", label: "Invisivel" },
  { key: "paralyzed", label: "Paralisado" },
  { key: "petrified", label: "Petrificado" },
  { key: "poisoned", label: "Envenenado" },
  { key: "prone", label: "Caido" },
  { key: "restrained", label: "Contido" },
  { key: "stunned", label: "Atordoado" },
  { key: "unconscious", label: "Inconsciente" },
  { key: "concentrating", label: "Concentrando" },
];

export interface GamePlayer {
  id: string;
  name: string;
  character: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  ac: number;
  status: PlayerStatus;
  avatarInitials: string;
  color: string;
}

export interface GameToken {
  id: string;
  name: string;
  alignment: TokenAlignment;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  size: number; // grid cells
  x: number; // grid col
  y: number; // grid row
  onMap: boolean;
  conditions: ConditionType[];
  visibility: TokenVisibility;
  speed: number; // ft (movement per turn)
  playerId?: string;
  icon?: string;
  label?: string;
  elevation?: number;
}

export interface Combatant {
  tokenId: string;
  initiative: number;
  status: CombatantStatus;
}

export interface CombatState {
  active: boolean;
  round: number;
  turnIndex: number;
  order: Combatant[];
}

export interface ChatMessage {
  id: string;
  channel: ChatChannel;
  type: ChatMessageType;
  sender: string;
  senderInitials: string;
  isGM: boolean;
  content: string;
  timestamp: string;
  rollFormula?: string;
  rollResult?: number;
  rollDetails?: string;
  isNat20?: boolean;
  isNat1?: boolean;
  whisperTo?: string;
}

export interface MapConfig {
  name: string;
  gridCols: number;
  gridRows: number;
  cellSize: number; // px
  cellSizeFt: number; // ft per cell
}

export interface SessionInfo {
  id: string;
  number: number;
  name: string;
  campaign: string;
  startedAt: Date;
  status: "live";
}

export interface RulerPoint {
  x: number;
  y: number;
}

export interface AOEInstance {
  id: string;
  shape: AOEShape;
  color: AOEColor;
  originX: number;
  originY: number;
  radius?: number;
  endX?: number;
  endY?: number;
  width?: number;
  fixed: boolean;
}

export interface PingEffect {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

export interface DamageFloat {
  id: string;
  tokenId: string;
  amount: number;
  isHeal: boolean;
  isCrit: boolean;
  timestamp: number;
}

export type DrawingTool = "freehand" | "line" | "rect" | "eraser";
export type TerrainType =
  // Legacy (kept for backward compat)
  | "normal"
  | "difficult"
  | "water"
  // Dungeon
  | "stone_floor"
  | "stone_wall"
  | "dirt_floor"
  | "wooden_floor"
  | "cobblestone"
  | "marble"
  | "carpet"
  // Natural
  | "grass"
  | "forest_floor"
  | "sand"
  | "mud"
  | "snow"
  | "rocky"
  | "swamp"
  | "water_shallow"
  | "water_deep"
  | "lava"
  | "ice"
  // Special
  | "void"
  | "magic_circle"
  | "trap"
  | "pit"
  | "bridge"
  | "stairs_up"
  | "stairs_down"
  | "portal"
  | "altar"
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

export type TerrainEditorTool = "brush" | "rectangle" | "fill" | "eraser";

export interface DrawStroke {
  id: string;
  tool: DrawingTool;
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

export interface TerrainCell {
  x: number;
  y: number;
  type: TerrainType;
}

export const TERRAIN_TYPES: { key: TerrainType; label: string; color: string }[] = [
  { key: "normal", label: "Normal", color: "transparent" },
  { key: "difficult", label: "Terreno Dificil", color: "rgba(253, 203, 110, 0.2)" },
  { key: "water", label: "Agua", color: "rgba(68, 136, 255, 0.2)" },
  { key: "lava", label: "Lava", color: "rgba(255, 68, 68, 0.2)" },
  { key: "pit", label: "Fosso", color: "rgba(0, 0, 0, 0.4)" },
  { key: "ice", label: "Gelo", color: "rgba(200, 240, 255, 0.2)" },
];

export interface MapPin {
  id: string;
  x: number;
  y: number;
  type: "flag" | "alert" | "question" | "star" | "skull" | "heart";
  color: string;
  label?: string;
  gmOnly: boolean;
}

export type NoteColor = "yellow" | "blue" | "green" | "pink";

export interface MapNote {
  id: string;
  x: number;
  y: number;
  text: string;
  color: NoteColor;
  gmOnly: boolean;
}

export interface Toast {
  id: string;
  text: string;
  timestamp: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ── Vision System ────────────────────────────────────

export type VisionType = "normal" | "darkvision" | "blindsight" | "truesight" | "tremorsense";
export type LightType = "none" | "torch" | "lamp" | "light_cantrip" | "custom";
export type FogMode = "manual" | "dynamic" | "hybrid";
export type WallSide = "top" | "right" | "bottom" | "left";
export type WallMaterial = "stone" | "wood" | "iron" | "magic";
export type DoorState = "none" | "open" | "closed" | "locked" | "secret";

// ── Edge-based Wall System ──

export type WallType =
  | "wall"
  | "door-closed"
  | "door-open"
  | "door-locked"
  | "window"
  | "half-wall"
  | "secret"
  | "illusory"
  | "portcullis";

export type WallStyle = "stone" | "wood" | "metal" | "magic" | "natural" | "brick";

export interface WallData {
  type: WallType;
  style: WallStyle;
  lockDC?: number;
}

export type WallDrawMode = "line" | "rectangle" | "erase";

export interface VisionConfig {
  enabled: boolean;
  normal: number;
  darkvision: number;
  blindsight: number;
  truesight: number;
  tremorsense: number;
  lightType: LightType;
  lightBright: number;
  lightDim: number;
}

export const DEFAULT_VISION: VisionConfig = {
  enabled: true,
  normal: 12,
  darkvision: 0,
  blindsight: 0,
  truesight: 0,
  tremorsense: 0,
  lightType: "none",
  lightBright: 0,
  lightDim: 0,
};

export const VISION_PRESETS: Record<string, Partial<VisionConfig>> = {
  human: { normal: 12 },
  elf: { normal: 12, darkvision: 12 },
  dwarf: { normal: 12, darkvision: 12 },
  deep_gnome: { normal: 12, darkvision: 24 },
  torch: { lightType: "torch", lightBright: 8, lightDim: 8 },
  lamp: { lightType: "lamp", lightBright: 6, lightDim: 6 },
  light_cantrip: { lightType: "light_cantrip", lightBright: 8, lightDim: 8 },
};

export interface WallSegment {
  x: number;
  y: number;
  side: WallSide;
  isDoor: boolean;
  doorOpen: boolean;
  wallType?: WallMaterial;
  doorState?: DoorState;
}

// ── Map Objects ──

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
  | "torch_stand"
  | "banner"
  | "rug"
  | "cage"
  | "well"
  | "cart"
  | "crate"
  | "sack"
  | "weapon_rack"
  | "anvil"
  | "cauldron"
  | "skull_pile"
  | "spider_web"
  | "flask_monster"
  | "rotating_blades"
  | "guillotine"
  | "bomb";

export interface MapObjectCell {
  id: string;
  x: number;
  y: number;
  type: MapObjectType;
  rotation: number;
}

import {
  Armchair,
  Bed,
  Bomb,
  Box,
  BookOpen,
  CircleDot,
  Columns3,
  Crown,
  Disc3,
  FlaskConical,
  Flag,
  Flame,
  Grid3x3,
  Hammer,
  Hexagon,
  Leaf,
  Mountain,
  Package,
  Scissors,
  ShoppingBag,
  ShoppingCart,
  Skull,
  Square,
  Swords,
  Table2,
  TreePine,
  User,
  Wine,
  Droplets,
  type LucideIcon,
} from "lucide-react";

export interface MapObjectInfo {
  type: MapObjectType;
  label: string;
  icon: LucideIcon;
  category: "furniture" | "container" | "decoration" | "nature" | "light";
}

export const MAP_OBJECT_CATALOG: MapObjectInfo[] = [
  // Furniture
  { type: "table", label: "Mesa", icon: Table2, category: "furniture" },
  { type: "chair", label: "Cadeira", icon: Armchair, category: "furniture" },
  { type: "bed", label: "Cama", icon: Bed, category: "furniture" },
  { type: "throne", label: "Trono", icon: Crown, category: "furniture" },
  { type: "bookshelf", label: "Estante", icon: BookOpen, category: "furniture" },
  { type: "weapon_rack", label: "Rack de Armas", icon: Swords, category: "furniture" },
  // Containers
  { type: "chest", label: "Bau", icon: Package, category: "container" },
  { type: "barrel", label: "Barril", icon: Wine, category: "container" },
  { type: "crate", label: "Caixote", icon: Box, category: "container" },
  { type: "sack", label: "Saco", icon: ShoppingBag, category: "container" },
  { type: "cage", label: "Jaula", icon: Grid3x3, category: "container" },
  { type: "cart", label: "Carrinho", icon: ShoppingCart, category: "container" },
  // Decoration
  { type: "statue", label: "Estatua", icon: User, category: "decoration" },
  { type: "pillar", label: "Pilar", icon: Columns3, category: "decoration" },
  { type: "fountain", label: "Fonte", icon: Droplets, category: "decoration" },
  { type: "banner", label: "Bandeira", icon: Flag, category: "decoration" },
  { type: "rug", label: "Tapete", icon: Square, category: "decoration" },
  { type: "well", label: "Poco", icon: CircleDot, category: "decoration" },
  { type: "anvil", label: "Bigorna", icon: Hammer, category: "decoration" },
  { type: "cauldron", label: "Caldeirao", icon: FlaskConical, category: "decoration" },
  // Nature
  { type: "tree", label: "Arvore", icon: TreePine, category: "nature" },
  { type: "bush", label: "Arbusto", icon: Leaf, category: "nature" },
  { type: "rock_large", label: "Pedra Grande", icon: Mountain, category: "nature" },
  { type: "rock_small", label: "Pedra Peq.", icon: Mountain, category: "nature" },
  // Light
  { type: "torch_stand", label: "Tocha", icon: Flame, category: "light" },
  { type: "campfire", label: "Fogueira", icon: Flame, category: "light" },
  // New sprite-backed types (no Lucide equivalent; icons are approximations)
  { type: "skull_pile", label: "Crânios", icon: Skull, category: "decoration" },
  { type: "spider_web", label: "Teia", icon: Hexagon, category: "decoration" },
  { type: "flask_monster", label: "Frasco", icon: FlaskConical, category: "decoration" },
  { type: "rotating_blades", label: "Lâminas", icon: Disc3, category: "decoration" },
  { type: "guillotine", label: "Guilhotina", icon: Scissors, category: "decoration" },
  { type: "bomb", label: "Bomba", icon: Bomb, category: "decoration" },
];

export interface LightSourceFixed {
  id: string;
  x: number;
  y: number;
  type: string;
  brightRadius: number;
  dimRadius: number;
  color: string;
}

// ── Empty data (previously mock) ─────────────────────

export const MOCK_SESSION: SessionInfo = {
  id: "",
  number: 0,
  name: "",
  campaign: "",
  startedAt: new Date(),
  status: "live",
};

export const MOCK_PLAYERS: GamePlayer[] = [];

export const MOCK_TOKENS: GameToken[] = [];

export const MOCK_COMBAT: CombatState = {
  active: false,
  round: 0,
  turnIndex: 0,
  order: [],
};

export const MOCK_MESSAGES: ChatMessage[] = [];

export const MOCK_MAP: MapConfig = {
  name: "",
  gridCols: 25,
  gridRows: 25,
  cellSize: 64,
  cellSizeFt: 5,
};

// ── Session Maps ────────────────────────────────────

export interface SessionMapItem {
  id: string;
  name: string;
  gridCols: number;
  gridRows: number;
  thumbnail: string | null;
  category: string;
  isActive: boolean;
}

export const MOCK_SESSION_MAPS: SessionMapItem[] = [
  { id: "map-1", name: "Cena 1", gridCols: 25, gridRows: 25, thumbnail: null, category: "Dungeon", isActive: true },
  { id: "map-2", name: "Sala do Trono", gridCols: 30, gridRows: 20, thumbnail: null, category: "Dungeon", isActive: false },
  { id: "map-3", name: "Floresta Svalich", gridCols: 40, gridRows: 30, thumbnail: null, category: "Overworld", isActive: false },
];

// ── Helpers ──────────────────────────────────────────

export function getElapsedTime(startedAt: Date): string {
  const diff = Date.now() - startedAt.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h${m.toString().padStart(2, "0")}m`;
}

export function getAlignmentColor(alignment: TokenAlignment): string {
  switch (alignment) {
    case "player":
      return "#6C5CE7";
    case "hostile":
      return "#FF4444";
    case "ally":
      return "#00B894";
    case "neutral":
      return "#FDCB6E";
  }
}

export function getHpPercent(hp: number, maxHp: number): number {
  if (maxHp === 0) return 0;
  return Math.max(0, Math.min(100, (hp / maxHp) * 100));
}

export function getHpColor(percent: number): string {
  if (percent > 50) return "#00B894";
  if (percent > 25) return "#FDCB6E";
  return "#FF6B6B";
}

export function gridDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cellSizeFt: number,
): number {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  return Math.max(dx, dy) * cellSizeFt;
}

export function cellsInRadius(
  cx: number,
  cy: number,
  radiusCells: number,
  gridCols: number,
  gridRows: number,
): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  const r = Math.ceil(radiusCells);
  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -r; dy <= r; dy++) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= gridCols || ny >= gridRows) continue;
      if (Math.max(Math.abs(dx), Math.abs(dy)) <= radiusCells) {
        cells.push({ x: nx, y: ny });
      }
    }
  }
  return cells;
}
