import type { TerrainType, MapBiome } from "@questboard/shared/types";

export interface TerrainInfo {
  type: TerrainType;
  name: string;
  color: string;
  category: string;
}

export const TERRAIN_PALETTE: TerrainInfo[] = [
  // Dungeon
  { type: "stone_floor", name: "Piso de Pedra", color: "#4A4A5A", category: "Dungeon" },
  { type: "wooden_floor", name: "Piso de Madeira", color: "#8B6E4E", category: "Dungeon" },
  { type: "dirt_floor", name: "Piso de Terra", color: "#6B5B3E", category: "Dungeon" },
  { type: "marble", name: "Mármore", color: "#C8C8D4", category: "Dungeon" },
  { type: "cobblestone", name: "Pavimento", color: "#5A5A6E", category: "Dungeon" },
  { type: "carpet", name: "Carpete", color: "#8B2252", category: "Dungeon" },
  { type: "stone_wall", name: "Parede de Pedra", color: "#3A3A4A", category: "Dungeon" },
  // Natural
  { type: "grass", name: "Grama", color: "#4A7A3A", category: "Natural" },
  { type: "forest_floor", name: "Chão de Floresta", color: "#3B5E2B", category: "Natural" },
  { type: "sand", name: "Areia", color: "#D4B96A", category: "Natural" },
  { type: "mud", name: "Lama", color: "#5A4A2A", category: "Natural" },
  { type: "snow", name: "Neve", color: "#E8E8F0", category: "Natural" },
  { type: "rocky", name: "Rocha", color: "#6A6A7A", category: "Natural" },
  { type: "swamp", name: "Pântano", color: "#3A5A3A", category: "Natural" },
  // Agua
  { type: "water_shallow", name: "Água Rasa", color: "#4A8AB4", category: "Água" },
  { type: "water_deep", name: "Água Profunda", color: "#2A5A8A", category: "Água" },
  // Perigoso
  { type: "lava", name: "Lava", color: "#E94560", category: "Perigoso" },
  { type: "ice", name: "Gelo Fino", color: "#A0D4E8", category: "Perigoso" },
  // Especial
  { type: "magic_circle", name: "Círculo Mágico", color: "#6C5CE7", category: "Especial" },
  { type: "trap", name: "Armadilha", color: "#E94560", category: "Especial" },
  { type: "pit", name: "Fosso", color: "#1A1A2A", category: "Especial" },
  { type: "bridge", name: "Ponte", color: "#8B7355", category: "Especial" },
  { type: "stairs_up", name: "Escada (sobe)", color: "#7A7A8A", category: "Especial" },
  { type: "stairs_down", name: "Escada (desce)", color: "#5A5A6A", category: "Especial" },
  { type: "portal", name: "Portal", color: "#A855F7", category: "Especial" },
  { type: "altar", name: "Altar", color: "#FDCB6E", category: "Especial" },
];

export const TERRAIN_BY_CATEGORY = TERRAIN_PALETTE.reduce(
  (acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category]!.push(t);
    return acc;
  },
  {} as Record<string, TerrainInfo[]>,
);

export function getTerrainColor(type: TerrainType): string {
  return TERRAIN_PALETTE.find((t) => t.type === type)?.color ?? "#1A1A2A";
}

export function getTerrainName(type: TerrainType): string {
  return TERRAIN_PALETTE.find((t) => t.type === type)?.name ?? type;
}

export const BIOME_OPTIONS: { key: MapBiome; label: string }[] = [
  { key: "dungeon", label: "Dungeon" },
  { key: "forest", label: "Floresta" },
  { key: "city", label: "Cidade" },
  { key: "cave", label: "Caverna" },
  { key: "desert", label: "Deserto" },
  { key: "swamp", label: "Pântano" },
  { key: "mountain", label: "Montanha" },
  { key: "coast", label: "Costa" },
  { key: "underground", label: "Subterrâneo" },
  { key: "ice", label: "Gelo" },
];
