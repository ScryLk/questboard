// ── Terrain Visual Catalog ──
// Maps each TerrainType to its visual properties (color, pattern, movement, vision)

import type { TerrainType } from "@questboard/types";

export type TerrainCategoryId = "dungeon" | "natural" | "urban" | "special";

export type TerrainPatternType =
  | "bricks"
  | "waves"
  | "dots"
  | "lines"
  | "planks"
  | "diamonds"
  | "grass"
  | "cracks"
  | "noise"
  | "none";

export interface TerrainPattern {
  type: TerrainPatternType;
  color: string;
  opacity: number;
}

export interface TerrainVisualInfo {
  type: TerrainType;
  label: string;
  category: TerrainCategoryId;
  color: string;
  borderColor: string;
  pattern: TerrainPattern | null;
  icon: string;
  movementCost: number; // 1=normal, 2=difficult, 0=impassable
  blocksVision: boolean;
}

export const TERRAIN_CATALOG: Record<string, TerrainVisualInfo> = {
  // ── Dungeon ──
  stone_floor: {
    type: "stone_floor",
    label: "Piso de Pedra",
    category: "dungeon",
    color: "rgba(75, 75, 88, 0.35)",
    borderColor: "rgba(100, 100, 115, 0.15)",
    pattern: { type: "bricks", color: "rgba(140, 140, 155, 0.12)", opacity: 0.3 },
    icon: "🧱",
    movementCost: 1,
    blocksVision: false,
  },
  stone_wall: {
    type: "stone_wall",
    label: "Parede de Pedra",
    category: "dungeon",
    color: "rgba(50, 50, 62, 0.65)",
    borderColor: "rgba(80, 80, 95, 0.3)",
    pattern: { type: "bricks", color: "rgba(90, 90, 105, 0.2)", opacity: 0.4 },
    icon: "🪨",
    movementCost: 0,
    blocksVision: true,
  },
  dirt_floor: {
    type: "dirt_floor",
    label: "Piso de Terra",
    category: "dungeon",
    color: "rgba(107, 68, 35, 0.3)",
    borderColor: "rgba(130, 90, 55, 0.15)",
    pattern: { type: "noise", color: "rgba(80, 50, 25, 0.15)", opacity: 0.3 },
    icon: "🟤",
    movementCost: 1,
    blocksVision: false,
  },
  wooden_floor: {
    type: "wooden_floor",
    label: "Piso de Madeira",
    category: "dungeon",
    color: "rgba(92, 61, 46, 0.35)",
    borderColor: "rgba(115, 80, 60, 0.15)",
    pattern: { type: "planks", color: "rgba(60, 40, 25, 0.2)", opacity: 0.35 },
    icon: "🪵",
    movementCost: 1,
    blocksVision: false,
  },
  cobblestone: {
    type: "cobblestone",
    label: "Paralelepipedo",
    category: "dungeon",
    color: "rgba(90, 90, 100, 0.3)",
    borderColor: "rgba(110, 110, 120, 0.15)",
    pattern: { type: "bricks", color: "rgba(120, 120, 135, 0.1)", opacity: 0.25 },
    icon: "🟫",
    movementCost: 1,
    blocksVision: false,
  },
  marble: {
    type: "marble",
    label: "Marmore",
    category: "dungeon",
    color: "rgba(200, 200, 210, 0.2)",
    borderColor: "rgba(180, 180, 195, 0.12)",
    pattern: { type: "diamonds", color: "rgba(220, 220, 235, 0.08)", opacity: 0.2 },
    icon: "⬜",
    movementCost: 1,
    blocksVision: false,
  },
  carpet: {
    type: "carpet",
    label: "Tapete",
    category: "dungeon",
    color: "rgba(139, 26, 26, 0.3)",
    borderColor: "rgba(160, 45, 45, 0.15)",
    pattern: null,
    icon: "🟥",
    movementCost: 1,
    blocksVision: false,
  },

  // ── Natural ──
  grass: {
    type: "grass",
    label: "Grama",
    category: "natural",
    color: "rgba(45, 90, 39, 0.3)",
    borderColor: "rgba(60, 110, 50, 0.12)",
    pattern: { type: "grass", color: "rgba(70, 140, 60, 0.15)", opacity: 0.3 },
    icon: "🌿",
    movementCost: 1,
    blocksVision: false,
  },
  forest_floor: {
    type: "forest_floor",
    label: "Chao de Floresta",
    category: "natural",
    color: "rgba(55, 75, 35, 0.3)",
    borderColor: "rgba(70, 95, 45, 0.12)",
    pattern: { type: "dots", color: "rgba(40, 60, 25, 0.2)", opacity: 0.3 },
    icon: "🌲",
    movementCost: 1,
    blocksVision: false,
  },
  sand: {
    type: "sand",
    label: "Areia",
    category: "natural",
    color: "rgba(194, 166, 69, 0.25)",
    borderColor: "rgba(210, 185, 90, 0.12)",
    pattern: { type: "dots", color: "rgba(220, 200, 110, 0.1)", opacity: 0.2 },
    icon: "🏖️",
    movementCost: 1,
    blocksVision: false,
  },
  mud: {
    type: "mud",
    label: "Lama",
    category: "natural",
    color: "rgba(85, 65, 40, 0.35)",
    borderColor: "rgba(100, 80, 50, 0.15)",
    pattern: { type: "noise", color: "rgba(60, 45, 25, 0.2)", opacity: 0.3 },
    icon: "🟤",
    movementCost: 2,
    blocksVision: false,
  },
  snow: {
    type: "snow",
    label: "Neve",
    category: "natural",
    color: "rgba(220, 230, 245, 0.2)",
    borderColor: "rgba(200, 210, 230, 0.1)",
    pattern: { type: "dots", color: "rgba(240, 245, 255, 0.1)", opacity: 0.2 },
    icon: "❄️",
    movementCost: 2,
    blocksVision: false,
  },
  rocky: {
    type: "rocky",
    label: "Rochoso",
    category: "natural",
    color: "rgba(80, 78, 72, 0.3)",
    borderColor: "rgba(100, 98, 90, 0.15)",
    pattern: { type: "noise", color: "rgba(60, 58, 52, 0.2)", opacity: 0.3 },
    icon: "⛰️",
    movementCost: 2,
    blocksVision: false,
  },
  swamp: {
    type: "swamp",
    label: "Pantano",
    category: "natural",
    color: "rgba(59, 83, 35, 0.35)",
    borderColor: "rgba(75, 100, 45, 0.15)",
    pattern: { type: "dots", color: "rgba(40, 65, 20, 0.2)", opacity: 0.3 },
    icon: "🐸",
    movementCost: 2,
    blocksVision: false,
  },
  water_shallow: {
    type: "water_shallow",
    label: "Agua Rasa",
    category: "natural",
    color: "rgba(26, 107, 138, 0.3)",
    borderColor: "rgba(40, 130, 165, 0.15)",
    pattern: { type: "waves", color: "rgba(80, 180, 220, 0.12)", opacity: 0.3 },
    icon: "🌊",
    movementCost: 2,
    blocksVision: false,
  },
  water_deep: {
    type: "water_deep",
    label: "Agua Profunda",
    category: "natural",
    color: "rgba(13, 59, 102, 0.4)",
    borderColor: "rgba(25, 75, 125, 0.2)",
    pattern: { type: "waves", color: "rgba(50, 120, 180, 0.12)", opacity: 0.3 },
    icon: "🌊",
    movementCost: 0,
    blocksVision: false,
  },
  lava: {
    type: "lava",
    label: "Lava",
    category: "natural",
    color: "rgba(204, 51, 0, 0.35)",
    borderColor: "rgba(230, 80, 20, 0.2)",
    pattern: { type: "cracks", color: "rgba(255, 160, 40, 0.2)", opacity: 0.35 },
    icon: "🔥",
    movementCost: 0,
    blocksVision: false,
  },
  ice: {
    type: "ice",
    label: "Gelo",
    category: "natural",
    color: "rgba(168, 216, 234, 0.2)",
    borderColor: "rgba(190, 230, 245, 0.1)",
    pattern: { type: "cracks", color: "rgba(200, 240, 255, 0.1)", opacity: 0.2 },
    icon: "🧊",
    movementCost: 2,
    blocksVision: false,
  },

  // ── Special ──
  void: {
    type: "void",
    label: "Vazio (Abismo)",
    category: "special",
    color: "rgba(0, 0, 0, 0.6)",
    borderColor: "rgba(30, 30, 40, 0.3)",
    pattern: null,
    icon: "⬛",
    movementCost: 0,
    blocksVision: false,
  },
  magic_circle: {
    type: "magic_circle",
    label: "Circulo Magico",
    category: "special",
    color: "rgba(108, 92, 231, 0.2)",
    borderColor: "rgba(130, 115, 240, 0.15)",
    pattern: { type: "diamonds", color: "rgba(150, 135, 255, 0.12)", opacity: 0.25 },
    icon: "✨",
    movementCost: 1,
    blocksVision: false,
  },
  trap: {
    type: "trap",
    label: "Armadilha",
    category: "special",
    color: "rgba(255, 68, 68, 0.15)",
    borderColor: "rgba(255, 100, 100, 0.1)",
    pattern: { type: "lines", color: "rgba(255, 80, 80, 0.12)", opacity: 0.2 },
    icon: "⚠️",
    movementCost: 1,
    blocksVision: false,
  },
  pit: {
    type: "pit",
    label: "Fosso",
    category: "special",
    color: "rgba(0, 0, 0, 0.45)",
    borderColor: "rgba(40, 40, 50, 0.25)",
    pattern: { type: "lines", color: "rgba(30, 30, 40, 0.2)", opacity: 0.3 },
    icon: "🕳️",
    movementCost: 0,
    blocksVision: false,
  },
  bridge: {
    type: "bridge",
    label: "Ponte",
    category: "special",
    color: "rgba(110, 80, 50, 0.3)",
    borderColor: "rgba(130, 100, 65, 0.15)",
    pattern: { type: "planks", color: "rgba(80, 55, 30, 0.2)", opacity: 0.3 },
    icon: "🌉",
    movementCost: 1,
    blocksVision: false,
  },
  stairs_up: {
    type: "stairs_up",
    label: "Escada (Subir)",
    category: "special",
    color: "rgba(90, 85, 78, 0.3)",
    borderColor: "rgba(110, 105, 95, 0.15)",
    pattern: { type: "lines", color: "rgba(130, 125, 115, 0.15)", opacity: 0.25 },
    icon: "⬆️",
    movementCost: 1,
    blocksVision: false,
  },
  stairs_down: {
    type: "stairs_down",
    label: "Escada (Descer)",
    category: "special",
    color: "rgba(70, 65, 58, 0.35)",
    borderColor: "rgba(90, 85, 75, 0.15)",
    pattern: { type: "lines", color: "rgba(110, 105, 95, 0.15)", opacity: 0.25 },
    icon: "⬇️",
    movementCost: 1,
    blocksVision: false,
  },
  portal: {
    type: "portal",
    label: "Portal",
    category: "special",
    color: "rgba(162, 155, 254, 0.25)",
    borderColor: "rgba(180, 175, 255, 0.15)",
    pattern: { type: "diamonds", color: "rgba(200, 195, 255, 0.12)", opacity: 0.25 },
    icon: "🌀",
    movementCost: 1,
    blocksVision: false,
  },
  altar: {
    type: "altar",
    label: "Altar",
    category: "special",
    color: "rgba(253, 203, 110, 0.2)",
    borderColor: "rgba(255, 220, 140, 0.12)",
    pattern: null,
    icon: "⛩️",
    movementCost: 1,
    blocksVision: false,
  },

  // ── Extended ──
  cave_floor: {
    type: "cave_floor",
    label: "Chao de Caverna",
    category: "dungeon",
    color: "rgba(30, 30, 38, 0.4)",
    borderColor: "rgba(50, 50, 60, 0.15)",
    pattern: { type: "noise", color: "rgba(40, 40, 50, 0.2)", opacity: 0.3 },
    icon: "🕳️",
    movementCost: 1,
    blocksVision: false,
  },
  tiles_white: {
    type: "tiles_white",
    label: "Piso Azulejo",
    category: "dungeon",
    color: "rgba(230, 225, 218, 0.25)",
    borderColor: "rgba(170, 170, 170, 0.2)",
    pattern: { type: "bricks", color: "rgba(170, 170, 170, 0.1)", opacity: 0.2 },
    icon: "⬜",
    movementCost: 1,
    blocksVision: false,
  },
  acid: {
    type: "acid",
    label: "Acido",
    category: "natural",
    color: "rgba(43, 92, 30, 0.35)",
    borderColor: "rgba(80, 200, 40, 0.2)",
    pattern: { type: "dots", color: "rgba(100, 255, 50, 0.12)", opacity: 0.25 },
    icon: "☣️",
    movementCost: 0,
    blocksVision: false,
  },
  blood: {
    type: "blood",
    label: "Sangue",
    category: "natural",
    color: "rgba(46, 10, 10, 0.4)",
    borderColor: "rgba(120, 20, 20, 0.2)",
    pattern: null,
    icon: "🩸",
    movementCost: 1,
    blocksVision: false,
  },
  wood_wall: {
    type: "wood_wall",
    label: "Parede de Madeira",
    category: "dungeon",
    color: "rgba(42, 26, 14, 0.6)",
    borderColor: "rgba(60, 40, 20, 0.3)",
    pattern: { type: "planks", color: "rgba(50, 30, 15, 0.2)", opacity: 0.35 },
    icon: "🪵",
    movementCost: 0,
    blocksVision: true,
  },
  dungeon_wall: {
    type: "dungeon_wall",
    label: "Parede de Dungeon",
    category: "dungeon",
    color: "rgba(15, 15, 21, 0.7)",
    borderColor: "rgba(30, 30, 40, 0.3)",
    pattern: { type: "noise", color: "rgba(20, 40, 15, 0.15)", opacity: 0.3 },
    icon: "🏚️",
    movementCost: 0,
    blocksVision: true,
  },
  brick_wall: {
    type: "brick_wall",
    label: "Parede de Tijolos",
    category: "dungeon",
    color: "rgba(139, 58, 42, 0.5)",
    borderColor: "rgba(138, 128, 120, 0.25)",
    pattern: { type: "bricks", color: "rgba(120, 50, 30, 0.15)", opacity: 0.3 },
    icon: "🧱",
    movementCost: 0,
    blocksVision: true,
  },
  dense_trees: {
    type: "dense_trees",
    label: "Floresta Densa",
    category: "natural",
    color: "rgba(26, 46, 18, 0.5)",
    borderColor: "rgba(35, 60, 25, 0.2)",
    pattern: { type: "dots", color: "rgba(30, 70, 20, 0.15)", opacity: 0.3 },
    icon: "🌳",
    movementCost: 0,
    blocksVision: true,
  },
  light_trees: {
    type: "light_trees",
    label: "Arvores Leves",
    category: "natural",
    color: "rgba(45, 90, 39, 0.25)",
    borderColor: "rgba(55, 100, 45, 0.12)",
    pattern: { type: "grass", color: "rgba(40, 100, 30, 0.1)", opacity: 0.2 },
    icon: "🌲",
    movementCost: 2,
    blocksVision: false,
  },
};

export interface TerrainCategoryDef {
  id: TerrainCategoryId;
  label: string;
  types: string[];
}

export const TERRAIN_CATEGORIES: TerrainCategoryDef[] = [
  {
    id: "dungeon",
    label: "Masmorra",
    types: [
      "stone_floor", "stone_wall", "dirt_floor", "wooden_floor",
      "cobblestone", "marble", "carpet", "cave_floor", "tiles_white",
      "wood_wall", "dungeon_wall", "brick_wall",
    ],
  },
  {
    id: "natural",
    label: "Natural",
    types: [
      "grass", "forest_floor", "sand", "mud", "snow", "rocky", "swamp",
      "water_shallow", "water_deep", "lava", "ice",
      "acid", "blood", "dense_trees", "light_trees",
    ],
  },
  {
    id: "special",
    label: "Especial",
    types: [
      "void", "magic_circle", "trap", "pit", "bridge",
      "stairs_up", "stairs_down", "portal", "altar",
    ],
  },
];

/** Get all terrain types, optionally filtered by category */
export function getTerrainsByCategory(
  category: TerrainCategoryId | "all",
): TerrainVisualInfo[] {
  if (category === "all") {
    return Object.values(TERRAIN_CATALOG);
  }
  const cat = TERRAIN_CATEGORIES.find((c) => c.id === category);
  if (!cat) return [];
  return cat.types
    .map((t) => TERRAIN_CATALOG[t])
    .filter(Boolean);
}
