import type { TerrainType, TerrainCategory } from "@questboard/shared";

export const TERRAIN_COLORS: Record<TerrainType, string> = {
  // Dungeon
  stone_floor: "#6B7280",
  stone_wall: "#374151",
  dirt_floor: "#92753A",
  wooden_floor: "#A0764D",
  water_shallow: "#60A5FA",
  water_deep: "#2563EB",
  lava: "#EF4444",
  ice: "#BAE6FD",
  sand: "#E5C07B",
  grass: "#4ADE80",
  cobblestone: "#9CA3AF",
  marble: "#E5E7EB",
  carpet: "#7C3AED",
  void: "#0A0A0F",
  // Natural
  forest_floor: "#2D5A27",
  mud: "#6B5B3A",
  snow: "#F0F9FF",
  rocky: "#78716C",
  swamp: "#4A6741",
  // Special
  magic_circle: "#A855F7",
  trap: "#DC2626",
  pit: "#1C1917",
  bridge: "#B45309",
  stairs_up: "#22D3EE",
  stairs_down: "#0891B2",
  portal: "#C084FC",
  altar: "#FBBF24",
  custom: "#6B7280",
};

export const TERRAIN_LABELS: Record<TerrainType, string> = {
  stone_floor: "Piso de Pedra",
  stone_wall: "Parede de Pedra",
  dirt_floor: "Piso de Terra",
  wooden_floor: "Piso de Madeira",
  water_shallow: "Água Rasa",
  water_deep: "Água Profunda",
  lava: "Lava",
  ice: "Gelo",
  sand: "Areia",
  grass: "Grama",
  cobblestone: "Pavimento",
  marble: "Mármore",
  carpet: "Carpete",
  void: "Vazio",
  forest_floor: "Chão de Floresta",
  mud: "Lama",
  snow: "Neve",
  rocky: "Rochoso",
  swamp: "Pântano",
  magic_circle: "Círculo Mágico",
  trap: "Armadilha",
  pit: "Fosso",
  bridge: "Ponte",
  stairs_up: "Escada (Sobe)",
  stairs_down: "Escada (Desce)",
  portal: "Portal",
  altar: "Altar",
  custom: "Personalizado",
};

export const TERRAIN_CATEGORIES: TerrainCategory[] = [
  {
    id: "dungeon",
    label: "Dungeon",
    terrains: [
      { type: "stone_floor", label: "Piso de Pedra", color: TERRAIN_COLORS.stone_floor, category: "dungeon", variants: 4 },
      { type: "wooden_floor", label: "Piso de Madeira", color: TERRAIN_COLORS.wooden_floor, category: "dungeon", variants: 3 },
      { type: "dirt_floor", label: "Piso de Terra", color: TERRAIN_COLORS.dirt_floor, category: "dungeon", variants: 2 },
      { type: "marble", label: "Mármore", color: TERRAIN_COLORS.marble, category: "dungeon", variants: 2 },
      { type: "carpet", label: "Carpete", color: TERRAIN_COLORS.carpet, category: "dungeon", variants: 3 },
      { type: "cobblestone", label: "Pavimento", color: TERRAIN_COLORS.cobblestone, category: "dungeon", variants: 2 },
      { type: "stone_wall", label: "Parede de Pedra", color: TERRAIN_COLORS.stone_wall, category: "dungeon", variants: 2 },
    ],
  },
  {
    id: "natural",
    label: "Natural",
    terrains: [
      { type: "grass", label: "Grama", color: TERRAIN_COLORS.grass, category: "natural", variants: 4 },
      { type: "forest_floor", label: "Chão de Floresta", color: TERRAIN_COLORS.forest_floor, category: "natural", variants: 2 },
      { type: "mud", label: "Terra/Lama", color: TERRAIN_COLORS.mud, category: "natural", variants: 2 },
      { type: "sand", label: "Areia", color: TERRAIN_COLORS.sand, category: "natural", variants: 2 },
      { type: "snow", label: "Neve", color: TERRAIN_COLORS.snow, category: "natural", variants: 2 },
      { type: "rocky", label: "Rochoso", color: TERRAIN_COLORS.rocky, category: "natural", variants: 2 },
      { type: "swamp", label: "Pântano", color: TERRAIN_COLORS.swamp, category: "natural", variants: 2 },
    ],
  },
  {
    id: "water",
    label: "Água",
    terrains: [
      { type: "water_shallow", label: "Água Rasa", color: TERRAIN_COLORS.water_shallow, category: "water", variants: 2 },
      { type: "water_deep", label: "Água Profunda", color: TERRAIN_COLORS.water_deep, category: "water", variants: 2 },
    ],
  },
  {
    id: "hazard",
    label: "Perigoso",
    terrains: [
      { type: "lava", label: "Lava", color: TERRAIN_COLORS.lava, category: "hazard", variants: 2 },
      { type: "ice", label: "Gelo Fino", color: TERRAIN_COLORS.ice, category: "hazard", variants: 2 },
      { type: "trap", label: "Armadilha", color: TERRAIN_COLORS.trap, category: "hazard", variants: 1 },
      { type: "pit", label: "Fosso", color: TERRAIN_COLORS.pit, category: "hazard", variants: 1 },
    ],
  },
  {
    id: "special",
    label: "Especial",
    terrains: [
      { type: "magic_circle", label: "Círculo Mágico", color: TERRAIN_COLORS.magic_circle, category: "special", variants: 2 },
      { type: "portal", label: "Portal", color: TERRAIN_COLORS.portal, category: "special", variants: 1 },
      { type: "stairs_up", label: "Escada (Sobe)", color: TERRAIN_COLORS.stairs_up, category: "special", variants: 1 },
      { type: "stairs_down", label: "Escada (Desce)", color: TERRAIN_COLORS.stairs_down, category: "special", variants: 1 },
      { type: "altar", label: "Altar", color: TERRAIN_COLORS.altar, category: "special", variants: 1 },
      { type: "bridge", label: "Ponte", color: TERRAIN_COLORS.bridge, category: "special", variants: 1 },
    ],
  },
];

export const OBJECT_CATEGORIES = [
  {
    id: "furniture",
    label: "Mobília",
    objects: [
      { type: "table", label: "Mesa", w: 2, h: 1 },
      { type: "chair", label: "Cadeira", w: 1, h: 1 },
      { type: "bed", label: "Cama", w: 1, h: 2 },
      { type: "bookshelf", label: "Estante", w: 2, h: 1 },
      { type: "throne", label: "Trono", w: 1, h: 1 },
    ],
  },
  {
    id: "containers",
    label: "Containers",
    objects: [
      { type: "chest", label: "Baú", w: 1, h: 1 },
      { type: "barrel", label: "Barril", w: 1, h: 1 },
      { type: "crate", label: "Caixote", w: 1, h: 1 },
      { type: "sack", label: "Saco", w: 1, h: 1 },
    ],
  },
  {
    id: "decoration",
    label: "Decoração",
    objects: [
      { type: "rug", label: "Tapete", w: 2, h: 2 },
      { type: "banner", label: "Estandarte", w: 1, h: 1 },
      { type: "statue", label: "Estátua", w: 1, h: 1 },
      { type: "painting", label: "Quadro", w: 1, h: 1 },
      { type: "mirror", label: "Espelho", w: 1, h: 1 },
    ],
  },
  {
    id: "nature",
    label: "Natureza",
    objects: [
      { type: "tree", label: "Árvore", w: 2, h: 2 },
      { type: "bush", label: "Arbusto", w: 1, h: 1 },
      { type: "rock_large", label: "Pedra Grande", w: 2, h: 2 },
      { type: "rock_small", label: "Pedra Pequena", w: 1, h: 1 },
      { type: "mushroom", label: "Cogumelo", w: 1, h: 1 },
    ],
  },
  {
    id: "structures",
    label: "Estruturas",
    objects: [
      { type: "pillar", label: "Pilar", w: 1, h: 1 },
      { type: "altar", label: "Altar", w: 2, h: 1 },
      { type: "fountain", label: "Fonte", w: 2, h: 2 },
      { type: "well", label: "Poço", w: 1, h: 1 },
      { type: "anvil", label: "Bigorna", w: 1, h: 1 },
      { type: "cauldron", label: "Caldeirão", w: 1, h: 1 },
      { type: "cage", label: "Gaiola", w: 1, h: 1 },
    ],
  },
  {
    id: "lighting",
    label: "Iluminação",
    objects: [
      { type: "torch_stand", label: "Tocha", w: 1, h: 1 },
      { type: "campfire", label: "Fogueira", w: 1, h: 1 },
    ],
  },
] as const;

export const WALL_TYPES = [
  { type: "stone", label: "Pedra", color: "#4B5563", thickness: 3 },
  { type: "wood", label: "Madeira", color: "#92400E", thickness: 2 },
  { type: "iron", label: "Ferro", color: "#9CA3AF", thickness: 1 },
  { type: "natural", label: "Natural", color: "#6B7280", thickness: 2 },
  { type: "magic", label: "Mágica", color: "#A855F7", thickness: 2 },
  { type: "invisible", label: "Invisível", color: "#FFFFFF40", thickness: 1 },
] as const;

export const DOOR_TYPES = [
  { type: "wood", label: "Madeira" },
  { type: "iron", label: "Ferro" },
  { type: "stone", label: "Pedra" },
  { type: "portcullis", label: "Grade" },
  { type: "secret", label: "Secreta" },
  { type: "magic", label: "Mágica" },
] as const;

export const LIGHT_TYPES = [
  { type: "torch", label: "Tocha", defaultColor: "#FF9F43", defaultRadius: 4 },
  { type: "lantern", label: "Lanterna", defaultColor: "#FFEAA7", defaultRadius: 6 },
  { type: "campfire", label: "Fogueira", defaultColor: "#FF6B6B", defaultRadius: 5 },
  { type: "magic", label: "Mágica", defaultColor: "#A29BFE", defaultRadius: 4 },
  { type: "sunlight", label: "Sol", defaultColor: "#FFF3CD", defaultRadius: 10 },
  { type: "moonlight", label: "Lua", defaultColor: "#DFE6E9", defaultRadius: 8 },
] as const;
