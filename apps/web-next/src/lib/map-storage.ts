import type { TerrainCell, WallSegment, MapObjectCell } from "./gameplay-mock-data";

const STORAGE_KEY = "questboard_saved_maps";

export interface SavedMap {
  id: string;
  name: string;
  savedAt: number;
  gridCols: number;
  gridRows: number;
  terrainCells: TerrainCell[];
  walls: WallSegment[];
  mapObjects: MapObjectCell[];
}

function getSavedMaps(): SavedMap[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedMap[];
  } catch {
    return [];
  }
}

function persistMaps(maps: SavedMap[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
}

export function listSavedMaps(): SavedMap[] {
  return getSavedMaps().sort((a, b) => b.savedAt - a.savedAt);
}

export function saveMap(map: Omit<SavedMap, "id" | "savedAt">): SavedMap {
  const saved: SavedMap = {
    ...map,
    id: `map_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    savedAt: Date.now(),
  };
  const all = getSavedMaps();
  all.push(saved);
  persistMaps(all);
  return saved;
}

export function updateMap(id: string, map: Partial<Omit<SavedMap, "id">>): void {
  const all = getSavedMaps();
  const idx = all.findIndex((m) => m.id === id);
  if (idx < 0) return;
  all[idx] = { ...all[idx], ...map, savedAt: Date.now() };
  persistMaps(all);
}

export function deleteMap(id: string): void {
  const all = getSavedMaps().filter((m) => m.id !== id);
  persistMaps(all);
}

export function loadMap(id: string): SavedMap | null {
  return getSavedMaps().find((m) => m.id === id) ?? null;
}
