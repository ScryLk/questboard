export type ExitZoneType = "DOOR" | "ZONE" | "MAP_EDGE";

export interface ExitZone {
  id: string;
  label: string;
  cells: Array<{ x: number; y: number }>;
  type: ExitZoneType;
}

export interface SceneExitConfig {
  useDoors: boolean;
  useZones: boolean;
  useMapEdge: boolean;
}

export const DEFAULT_EXIT_CONFIG: SceneExitConfig = {
  useDoors: true,
  useZones: false,
  useMapEdge: false,
};

export function generateMapEdgeExits(
  gridCols: number,
  gridRows: number,
): ExitZone {
  const cells: Array<{ x: number; y: number }> = [];
  for (let x = 0; x < gridCols; x++) {
    cells.push({ x, y: 0 });
    cells.push({ x, y: gridRows - 1 });
  }
  for (let y = 1; y < gridRows - 1; y++) {
    cells.push({ x: 0, y });
    cells.push({ x: gridCols - 1, y });
  }
  return { id: "map-edge", label: "Borda do Mapa", cells, type: "MAP_EDGE" };
}

export function doorEdgesToExitZones(
  doorEdges: Array<{ key: string; x1: number; y1: number; x2: number; y2: number; isOpen: boolean }>,
): ExitZone[] {
  return doorEdges.map((d, i) => ({
    id: `door-exit-${i}`,
    label: `Porta (${d.x1},${d.y1})`,
    cells: [{ x: d.x2, y: d.y2 }],
    type: "DOOR" as ExitZoneType,
  }));
}
