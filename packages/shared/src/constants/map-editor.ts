import type {
  TerrainPaletteEntry,
  TerrainCategory,
  TerrainType,
} from "../types/map-editor.js";

export const TERRAIN_PALETTE: TerrainPaletteEntry[] = [
  // Dungeon
  { type: "stone_floor", label: "Piso de Pedra", category: "dungeon", variants: 4, color: "#6B6B6B" },
  { type: "wooden_floor", label: "Piso de Madeira", category: "dungeon", variants: 3, color: "#8B6914" },
  { type: "dirt_floor", label: "Piso de Terra", category: "dungeon", variants: 2, color: "#7A5C3A" },
  { type: "marble", label: "Mármore", category: "dungeon", variants: 2, color: "#D4D4D8" },
  { type: "carpet", label: "Carpete", category: "dungeon", variants: 3, color: "#8B1A1A" },
  { type: "cobblestone", label: "Pavimento", category: "dungeon", variants: 2, color: "#555555" },
  { type: "stone_wall", label: "Parede de Pedra", category: "dungeon", variants: 2, color: "#3A3A3A" },

  // Natural
  { type: "grass", label: "Grama", category: "natural", variants: 4, color: "#3D7A3D" },
  { type: "forest_floor", label: "Chão de Floresta", category: "natural", variants: 3, color: "#4A6B3A" },
  { type: "sand", label: "Areia", category: "natural", variants: 2, color: "#D4B36A" },
  { type: "snow", label: "Neve", category: "natural", variants: 2, color: "#E8E8F0" },
  { type: "rocky", label: "Rocha", category: "natural", variants: 3, color: "#5A5A5A" },
  { type: "mud", label: "Lama", category: "natural", variants: 2, color: "#5C3D1A" },
  { type: "swamp", label: "Pântano", category: "natural", variants: 2, color: "#3A5A3A" },

  // Water
  { type: "water_shallow", label: "Água Rasa", category: "water", variants: 2, color: "#4A90C4" },
  { type: "water_deep", label: "Água Profunda", category: "water", variants: 2, color: "#1A3A6B" },

  // Hazard
  { type: "lava", label: "Lava", category: "hazard", variants: 2, color: "#E04A00" },
  { type: "ice", label: "Gelo Fino", category: "hazard", variants: 2, color: "#A0D4E8" },
  { type: "trap", label: "Armadilha", category: "hazard", variants: 1, color: "#8B0000" },
  { type: "pit", label: "Fosso", category: "hazard", variants: 1, color: "#1A1A1A" },

  // Special
  { type: "magic_circle", label: "Círculo Mágico", category: "special", variants: 2, color: "#8B4AE8" },
  { type: "portal", label: "Portal", category: "special", variants: 2, color: "#6A0DAD" },
  { type: "stairs_up", label: "Escada (Sobe)", category: "special", variants: 1, color: "#888888" },
  { type: "stairs_down", label: "Escada (Desce)", category: "special", variants: 1, color: "#666666" },
  { type: "bridge", label: "Ponte", category: "special", variants: 2, color: "#8B7355" },
  { type: "altar", label: "Altar", category: "special", variants: 1, color: "#9B9B9B" },
  { type: "void", label: "Vazio", category: "special", variants: 1, color: "#0A0A0F" },
];

export const TERRAIN_CATEGORIES: { key: TerrainCategory; label: string }[] = [
  { key: "dungeon", label: "Dungeon" },
  { key: "natural", label: "Natural" },
  { key: "water", label: "Água" },
  { key: "hazard", label: "Perigoso" },
  { key: "special", label: "Especial" },
];

export const TERRAIN_COLOR_MAP: Record<TerrainType, string> = Object.fromEntries(
  TERRAIN_PALETTE.map((entry) => [entry.type, entry.color])
) as Record<TerrainType, string>;

export const OBJECT_CATEGORIES = [
  {
    key: "furniture",
    label: "Mobília",
    types: ["table", "chair", "bed", "bookshelf", "throne"] as const,
  },
  {
    key: "containers",
    label: "Containers",
    types: ["chest", "barrel", "crate", "sack"] as const,
  },
  {
    key: "decoration",
    label: "Decoração",
    types: ["rug", "banner", "painting", "mirror", "statue"] as const,
  },
  {
    key: "nature",
    label: "Natureza",
    types: ["tree", "bush", "rock_large", "rock_small", "mushroom"] as const,
  },
  {
    key: "structures",
    label: "Estruturas",
    types: ["pillar", "altar_object", "fountain", "well", "anvil", "cauldron", "cage"] as const,
  },
  {
    key: "lighting",
    label: "Iluminação",
    types: ["torch_stand", "campfire"] as const,
  },
] as const;

export const WALL_TYPES = [
  { key: "stone" as const, label: "Pedra", color: "#4A4A4A" },
  { key: "wood" as const, label: "Madeira", color: "#8B6914" },
  { key: "iron" as const, label: "Ferro", color: "#A0A0A0" },
  { key: "natural" as const, label: "Natural", color: "#5A4A3A" },
  { key: "magic" as const, label: "Mágica", color: "#8B4AE8" },
  { key: "invisible" as const, label: "Invisível", color: "#FFFFFF40" },
];

export const DOOR_TYPES = [
  { key: "wood" as const, label: "Madeira" },
  { key: "iron" as const, label: "Ferro" },
  { key: "stone" as const, label: "Pedra" },
  { key: "portcullis" as const, label: "Grade" },
  { key: "secret" as const, label: "Secreta" },
  { key: "magic" as const, label: "Mágica" },
];

export const LIGHT_TYPES = [
  { key: "torch" as const, label: "Tocha", defaultColor: "#FF9933", defaultRadius: 6 },
  { key: "lantern" as const, label: "Lanterna", defaultColor: "#FFD700", defaultRadius: 8 },
  { key: "campfire" as const, label: "Fogueira", defaultColor: "#FF6600", defaultRadius: 10 },
  { key: "magic" as const, label: "Mágica", defaultColor: "#8B4AE8", defaultRadius: 6 },
  { key: "sunlight" as const, label: "Sol", defaultColor: "#FFF8DC", defaultRadius: 20 },
  { key: "moonlight" as const, label: "Lua", defaultColor: "#C0C0E0", defaultRadius: 12 },
];

export const BIOME_OPTIONS = [
  { key: "dungeon" as const, label: "Dungeon" },
  { key: "forest" as const, label: "Floresta" },
  { key: "city" as const, label: "Cidade" },
  { key: "cave" as const, label: "Caverna" },
  { key: "desert" as const, label: "Deserto" },
  { key: "swamp" as const, label: "Pântano" },
  { key: "mountain" as const, label: "Montanha" },
  { key: "coast" as const, label: "Costa" },
  { key: "underground" as const, label: "Subterrâneo" },
  { key: "ice" as const, label: "Gelo" },
];

export const DEFAULT_MAP_SETTINGS = {
  width: 40,
  height: 30,
  tileSize: 70,
  gridType: "SQUARE" as const,
  gridScale: "5 pés",
  biome: "dungeon" as const,
  ambiance: "dark" as const,
};

export const MAP_LIMITS = {
  FREE: { maxMaps: 3, maxSize: 20, aiCredits: 0 },
  ADVENTURER: { maxMaps: 15, maxSize: 50, aiCredits: 30 },
  LEGENDARY: { maxMaps: Infinity, maxSize: 100, aiCredits: 100 },
} as const;

export const AI_CREDIT_COSTS = {
  ZONE_SMALL: 1,
  ZONE_LARGE: 2,
  FULL_MAP: 3,
  TILE_DETAIL: 0.1,
  TILE_IMAGE: 0.5,
} as const;
