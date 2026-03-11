import type {
  TerrainCell,
  MapObjectCell,
  WallData,
  WallStyle,
  WallSegment,
} from "./gameplay-mock-data";
import { wallSideToEdgeKey } from "./wall-helpers";
import type { SavedMap } from "./map-storage";

// ── Core types ──

export type MapCategory = "dungeon" | "outdoor" | "city" | "cave" | "custom";

export interface WallSaveData {
  type: string;
  style: string;
}

export interface MapObjectSaveData {
  id: string;
  x: number;
  y: number;
  type: string;
  rotation: number;
}

export interface QuestBoardMap {
  id: string;
  version: 1;
  name: string;
  description: string;
  tags: string[];
  category: MapCategory;
  thumbnail: string | null;
  width: number;
  height: number;
  cellSizeFt: number;
  terrain: Record<string, string>;
  walls: Record<string, WallSaveData>;
  objects: MapObjectSaveData[];
  backgroundImage: string | null;
  backgroundOpacity: number;
  createdAt: number;
  updatedAt: number;
  stats: {
    terrainCount: number;
    wallCount: number;
    objectCount: number;
  };
}

// ── Conversion helpers ──

export function terrainCellsToRecord(cells: TerrainCell[]): Record<string, string> {
  const record: Record<string, string> = {};
  for (const c of cells) {
    record[`${c.x},${c.y}`] = c.type;
  }
  return record;
}

export function terrainRecordToCells(record: Record<string, string>): TerrainCell[] {
  return Object.entries(record).map(([key, type]) => {
    const [x, y] = key.split(",").map(Number);
    return { x, y, type } as TerrainCell;
  });
}

export function wallEdgesToSaveData(
  edges: Record<string, WallData>,
): Record<string, WallSaveData> {
  const result: Record<string, WallSaveData> = {};
  for (const [key, data] of Object.entries(edges)) {
    result[key] = { type: data.type, style: data.style };
  }
  return result;
}

export function saveDataToWallEdges(
  data: Record<string, WallSaveData>,
): Record<string, WallData> {
  const result: Record<string, WallData> = {};
  for (const [key, d] of Object.entries(data)) {
    result[key] = { type: d.type, style: d.style } as WallData;
  }
  return result;
}

export function objectCellsToSaveData(cells: MapObjectCell[]): MapObjectSaveData[] {
  return cells.map((c) => ({
    id: c.id,
    x: c.x,
    y: c.y,
    type: c.type,
    rotation: c.rotation,
  }));
}

export function saveDataToObjectCells(data: MapObjectSaveData[]): MapObjectCell[] {
  return data.map((d) => ({
    id: d.id,
    x: d.x,
    y: d.y,
    type: d.type,
    rotation: d.rotation,
  })) as MapObjectCell[];
}

/** Convert editor state fields into QuestBoardMap data (without id/timestamps/thumbnail). */
export function editorStateToMapData(state: {
  mapName: string;
  gridCols: number;
  gridRows: number;
  terrainCells: TerrainCell[];
  wallEdges: Record<string, WallData>;
  mapObjects: MapObjectCell[];
  backgroundImage: string | null;
  backgroundOpacity: number;
}): Omit<QuestBoardMap, "id" | "createdAt" | "updatedAt" | "thumbnail"> {
  const terrain = terrainCellsToRecord(state.terrainCells);
  const walls = wallEdgesToSaveData(state.wallEdges);
  const objects = objectCellsToSaveData(state.mapObjects);

  return {
    version: 1,
    name: state.mapName,
    description: "",
    tags: [],
    category: "custom",
    width: state.gridCols,
    height: state.gridRows,
    cellSizeFt: 5,
    terrain,
    walls,
    objects,
    backgroundImage: state.backgroundImage,
    backgroundOpacity: state.backgroundOpacity,
    stats: {
      terrainCount: Object.keys(terrain).length,
      wallCount: Object.keys(walls).length,
      objectCount: objects.length,
    },
  };
}

/** Convert a QuestBoardMap into fields compatible with the editor's setState. */
export function mapToEditorState(map: QuestBoardMap): {
  mapName: string;
  gridCols: number;
  gridRows: number;
  terrainCells: TerrainCell[];
  wallEdges: Record<string, WallData>;
  mapObjects: MapObjectCell[];
  backgroundImage: string | null;
  backgroundOpacity: number;
} {
  return {
    mapName: map.name,
    gridCols: map.width,
    gridRows: map.height,
    terrainCells: terrainRecordToCells(map.terrain),
    wallEdges: saveDataToWallEdges(map.walls),
    mapObjects: saveDataToObjectCells(map.objects),
    backgroundImage: map.backgroundImage,
    backgroundOpacity: map.backgroundOpacity,
  };
}

/** Migrate an old SavedMap to QuestBoardMap format. */
export function migrateSavedMap(old: SavedMap): QuestBoardMap {
  const terrain = terrainCellsToRecord(old.terrainCells);

  // Convert walls: prefer wallEdges, fallback to legacy WallSegment[]
  let walls: Record<string, WallSaveData> = {};
  if (old.wallEdges && Object.keys(old.wallEdges).length > 0) {
    walls = wallEdgesToSaveData(old.wallEdges);
  } else if (old.walls && old.walls.length > 0) {
    for (const w of old.walls) {
      const key = wallSideToEdgeKey(w.x, w.y, w.side);
      let wallType = "wall";
      if (w.isDoor) {
        wallType =
          w.doorState === "open"
            ? "door-open"
            : w.doorState === "locked"
              ? "door-locked"
              : w.doorState === "secret"
                ? "secret"
                : "door-closed";
      }
      const styleMap: Record<string, WallStyle> = {
        stone: "stone",
        wood: "wood",
        iron: "metal",
        magic: "magic",
      };
      walls[key] = {
        type: wallType,
        style: styleMap[w.wallType ?? "stone"] ?? "stone",
      };
    }
  }

  const objects = objectCellsToSaveData(old.mapObjects);

  return {
    id: old.id,
    version: 1,
    name: old.name,
    description: "",
    tags: [],
    category: "custom",
    thumbnail: null,
    width: old.gridCols,
    height: old.gridRows,
    cellSizeFt: 5,
    terrain,
    walls,
    objects,
    backgroundImage: null,
    backgroundOpacity: 0.5,
    createdAt: old.savedAt,
    updatedAt: old.savedAt,
    stats: {
      terrainCount: Object.keys(terrain).length,
      wallCount: Object.keys(walls).length,
      objectCount: objects.length,
    },
  };
}
