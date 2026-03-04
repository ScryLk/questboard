import type { TerrainType, WallSegment, MapObjectCell } from "./gameplay-mock-data";

export interface RoomTemplate {
  id: string;
  name: string;
  icon: string;
  category: "dungeon" | "tavern" | "outdoor" | "special";
  width: number;
  height: number;
  terrain: { dx: number; dy: number; type: TerrainType }[];
  walls: { dx: number; dy: number; side: "top" | "right" | "bottom" | "left"; isDoor?: boolean; doorState?: "closed" | "open" | "locked" }[];
  objects: { dx: number; dy: number; type: string }[];
}

function fillRect(
  w: number,
  h: number,
  type: TerrainType,
): { dx: number; dy: number; type: TerrainType }[] {
  const cells: { dx: number; dy: number; type: TerrainType }[] = [];
  for (let dx = 0; dx < w; dx++) {
    for (let dy = 0; dy < h; dy++) {
      cells.push({ dx, dy, type });
    }
  }
  return cells;
}

function rectWalls(
  w: number,
  h: number,
): RoomTemplate["walls"] {
  const walls: RoomTemplate["walls"] = [];
  for (let x = 0; x < w; x++) {
    walls.push({ dx: x, dy: 0, side: "top" });
    walls.push({ dx: x, dy: h - 1, side: "bottom" });
  }
  for (let y = 0; y < h; y++) {
    walls.push({ dx: 0, dy: y, side: "left" });
    walls.push({ dx: w - 1, dy: y, side: "right" });
  }
  return walls;
}

export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: "small_stone_room",
    name: "Sala de Pedra",
    icon: "🏰",
    category: "dungeon",
    width: 5,
    height: 5,
    terrain: fillRect(5, 5, "stone_floor"),
    walls: [
      ...rectWalls(5, 5),
      { dx: 2, dy: 0, side: "top", isDoor: true, doorState: "closed" },
    ],
    objects: [],
  },
  {
    id: "tavern_main",
    name: "Taverna",
    icon: "🍺",
    category: "tavern",
    width: 8,
    height: 6,
    terrain: fillRect(8, 6, "wooden_floor"),
    walls: [
      ...rectWalls(8, 6),
      { dx: 4, dy: 5, side: "bottom", isDoor: true, doorState: "closed" },
    ],
    objects: [
      { dx: 2, dy: 2, type: "table" },
      { dx: 5, dy: 2, type: "table" },
      { dx: 2, dy: 4, type: "table" },
      { dx: 1, dy: 2, type: "chair" },
      { dx: 3, dy: 2, type: "chair" },
      { dx: 4, dy: 2, type: "chair" },
      { dx: 6, dy: 2, type: "chair" },
      { dx: 7, dy: 1, type: "barrel" },
      { dx: 7, dy: 0, type: "barrel" },
    ],
  },
  {
    id: "corridor_h",
    name: "Corredor Horizontal",
    icon: "↔️",
    category: "dungeon",
    width: 10,
    height: 3,
    terrain: fillRect(10, 3, "stone_floor"),
    walls: (() => {
      const w: RoomTemplate["walls"] = [];
      for (let x = 0; x < 10; x++) {
        w.push({ dx: x, dy: 0, side: "top" });
        w.push({ dx: x, dy: 2, side: "bottom" });
      }
      return w;
    })(),
    objects: [
      { dx: 2, dy: 1, type: "torch_stand" },
      { dx: 7, dy: 1, type: "torch_stand" },
    ],
  },
  {
    id: "throne_room",
    name: "Sala do Trono",
    icon: "👑",
    category: "dungeon",
    width: 8,
    height: 10,
    terrain: [
      ...fillRect(8, 10, "stone_floor"),
      { dx: 3, dy: 1, type: "carpet" },
      { dx: 4, dy: 1, type: "carpet" },
      { dx: 3, dy: 2, type: "carpet" },
      { dx: 4, dy: 2, type: "carpet" },
      { dx: 3, dy: 3, type: "carpet" },
      { dx: 4, dy: 3, type: "carpet" },
      { dx: 3, dy: 4, type: "carpet" },
      { dx: 4, dy: 4, type: "carpet" },
      { dx: 3, dy: 5, type: "carpet" },
      { dx: 4, dy: 5, type: "carpet" },
      { dx: 3, dy: 6, type: "carpet" },
      { dx: 4, dy: 6, type: "carpet" },
      { dx: 3, dy: 7, type: "carpet" },
      { dx: 4, dy: 7, type: "carpet" },
      { dx: 3, dy: 8, type: "carpet" },
      { dx: 4, dy: 8, type: "carpet" },
    ],
    walls: [
      ...rectWalls(8, 10),
      { dx: 3, dy: 9, side: "bottom", isDoor: true, doorState: "closed" },
      { dx: 4, dy: 9, side: "bottom", isDoor: true, doorState: "closed" },
    ],
    objects: [
      { dx: 3, dy: 1, type: "throne" },
      { dx: 1, dy: 1, type: "pillar" },
      { dx: 6, dy: 1, type: "pillar" },
      { dx: 1, dy: 5, type: "pillar" },
      { dx: 6, dy: 5, type: "pillar" },
      { dx: 0, dy: 3, type: "banner" },
      { dx: 7, dy: 3, type: "banner" },
    ],
  },
  {
    id: "forest_clearing",
    name: "Clareira",
    icon: "🌳",
    category: "outdoor",
    width: 7,
    height: 7,
    terrain: [
      ...fillRect(7, 7, "grass"),
      { dx: 3, dy: 3, type: "dirt_floor" },
      { dx: 3, dy: 4, type: "dirt_floor" },
      { dx: 4, dy: 3, type: "dirt_floor" },
    ],
    walls: [],
    objects: [
      { dx: 0, dy: 0, type: "tree" },
      { dx: 1, dy: 0, type: "tree" },
      { dx: 5, dy: 0, type: "tree" },
      { dx: 6, dy: 0, type: "tree" },
      { dx: 0, dy: 6, type: "tree" },
      { dx: 6, dy: 6, type: "tree" },
      { dx: 0, dy: 3, type: "bush" },
      { dx: 6, dy: 3, type: "bush" },
      { dx: 3, dy: 3, type: "campfire" },
    ],
  },
  {
    id: "prison_cell",
    name: "Cela de Prisao",
    icon: "⛓️",
    category: "dungeon",
    width: 4,
    height: 4,
    terrain: fillRect(4, 4, "stone_floor"),
    walls: [
      ...rectWalls(4, 4),
      { dx: 1, dy: 3, side: "bottom", isDoor: true, doorState: "locked" },
    ],
    objects: [
      { dx: 0, dy: 0, type: "bed" },
      { dx: 3, dy: 3, type: "sack" },
    ],
  },
  {
    id: "library",
    name: "Biblioteca",
    icon: "📚",
    category: "dungeon",
    width: 6,
    height: 8,
    terrain: [
      ...fillRect(6, 8, "wooden_floor"),
      { dx: 2, dy: 4, type: "carpet" },
      { dx: 3, dy: 4, type: "carpet" },
      { dx: 2, dy: 5, type: "carpet" },
      { dx: 3, dy: 5, type: "carpet" },
    ],
    walls: [
      ...rectWalls(6, 8),
      { dx: 2, dy: 7, side: "bottom", isDoor: true, doorState: "closed" },
    ],
    objects: [
      { dx: 0, dy: 0, type: "bookshelf" },
      { dx: 1, dy: 0, type: "bookshelf" },
      { dx: 4, dy: 0, type: "bookshelf" },
      { dx: 5, dy: 0, type: "bookshelf" },
      { dx: 0, dy: 2, type: "bookshelf" },
      { dx: 5, dy: 2, type: "bookshelf" },
      { dx: 2, dy: 4, type: "table" },
      { dx: 3, dy: 4, type: "chair" },
      { dx: 0, dy: 6, type: "torch_stand" },
      { dx: 5, dy: 6, type: "torch_stand" },
    ],
  },
  {
    id: "treasure_vault",
    name: "Sala do Tesouro",
    icon: "💰",
    category: "special",
    width: 5,
    height: 5,
    terrain: [
      ...fillRect(5, 5, "marble"),
      { dx: 2, dy: 2, type: "magic_circle" },
    ],
    walls: [
      ...rectWalls(5, 5),
      { dx: 2, dy: 4, side: "bottom", isDoor: true, doorState: "locked" },
    ],
    objects: [
      { dx: 1, dy: 1, type: "chest" },
      { dx: 3, dy: 1, type: "chest" },
      { dx: 0, dy: 0, type: "pillar" },
      { dx: 4, dy: 0, type: "pillar" },
      { dx: 2, dy: 0, type: "statue" },
    ],
  },
  {
    id: "stream_crossing",
    name: "Travessia do Rio",
    icon: "🌊",
    category: "outdoor",
    width: 10,
    height: 6,
    terrain: [
      ...fillRect(10, 6, "grass"),
      // River strip
      ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((x) => [
        { dx: x, dy: 2, type: "water_shallow" as TerrainType },
        { dx: x, dy: 3, type: "water_shallow" as TerrainType },
      ]),
      // Bridge
      { dx: 4, dy: 2, type: "bridge" as TerrainType },
      { dx: 5, dy: 2, type: "bridge" as TerrainType },
      { dx: 4, dy: 3, type: "bridge" as TerrainType },
      { dx: 5, dy: 3, type: "bridge" as TerrainType },
    ],
    walls: [],
    objects: [
      { dx: 1, dy: 0, type: "tree" },
      { dx: 8, dy: 0, type: "tree" },
      { dx: 0, dy: 5, type: "rock_large" },
      { dx: 9, dy: 5, type: "bush" },
    ],
  },
  {
    id: "altar_room",
    name: "Sala do Altar",
    icon: "⛪",
    category: "special",
    width: 6,
    height: 8,
    terrain: [
      ...fillRect(6, 8, "stone_floor"),
      { dx: 2, dy: 1, type: "magic_circle" },
      { dx: 3, dy: 1, type: "magic_circle" },
      { dx: 2, dy: 2, type: "magic_circle" },
      { dx: 3, dy: 2, type: "magic_circle" },
    ],
    walls: [
      ...rectWalls(6, 8),
      { dx: 2, dy: 7, side: "bottom", isDoor: true, doorState: "closed" },
    ],
    objects: [
      { dx: 2, dy: 1, type: "altar" as string },
      { dx: 0, dy: 0, type: "pillar" },
      { dx: 5, dy: 0, type: "pillar" },
      { dx: 0, dy: 4, type: "pillar" },
      { dx: 5, dy: 4, type: "pillar" },
      { dx: 0, dy: 1, type: "torch_stand" },
      { dx: 5, dy: 1, type: "torch_stand" },
      { dx: 0, dy: 5, type: "torch_stand" },
      { dx: 5, dy: 5, type: "torch_stand" },
    ],
  },
];

export const TEMPLATE_CATEGORIES = [
  { id: "all" as const, label: "Todos" },
  { id: "dungeon" as const, label: "Masmorra" },
  { id: "tavern" as const, label: "Taverna" },
  { id: "outdoor" as const, label: "Externo" },
  { id: "special" as const, label: "Especial" },
];
