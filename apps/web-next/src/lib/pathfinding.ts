import { canTokenMove, canMoveDiagonal } from "./wall-helpers";
import { calculateStepCost } from "./movement-cost";
import type { TerrainCell, WallData } from "./gameplay-mock-data";

export interface PathfindingResult {
  path: Array<{ x: number; y: number }>;
  totalCost: number;
  found: boolean;
}

interface AStarNode {
  x: number;
  y: number;
  g: number; // cost from start
  h: number; // heuristic to end
  parentKey: string | null;
}

function heuristic(x1: number, y1: number, x2: number, y2: number, cellSizeFt: number): number {
  return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * cellSizeFt;
}

function nodeKey(x: number, y: number): string {
  return `${x},${y}`;
}

// 8 directions: orthogonal + diagonal
const DIRS = [
  { dx: 0, dy: -1 }, // N
  { dx: 1, dy: -1 }, // NE
  { dx: 1, dy: 0 },  // E
  { dx: 1, dy: 1 },  // SE
  { dx: 0, dy: 1 },  // S
  { dx: -1, dy: 1 }, // SW
  { dx: -1, dy: 0 }, // W
  { dx: -1, dy: -1 }, // NW
];

/**
 * A* pathfinding respecting walls, terrain costs, and map boundaries.
 */
export function findPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  wallEdges: Record<string, WallData>,
  terrainCells: TerrainCell[],
  gridCols: number,
  gridRows: number,
  cellSizeFt: number,
  isGM = false,
): PathfindingResult {
  if (startX === endX && startY === endY) {
    return { path: [], totalCost: 0, found: true };
  }

  const openMap = new Map<string, AStarNode>();
  const closedSet = new Set<string>();
  const startKey = nodeKey(startX, startY);

  openMap.set(startKey, {
    x: startX,
    y: startY,
    g: 0,
    h: heuristic(startX, startY, endX, endY, cellSizeFt),
    parentKey: null,
  });

  const parentMap = new Map<string, string | null>();
  parentMap.set(startKey, null);

  let iterations = 0;
  const MAX_ITERATIONS = 2000;

  while (openMap.size > 0 && iterations < MAX_ITERATIONS) {
    iterations++;

    // Find node with lowest f = g + h
    let bestKey = "";
    let bestF = Infinity;
    for (const [key, node] of openMap) {
      const f = node.g + node.h;
      if (f < bestF) {
        bestF = f;
        bestKey = key;
      }
    }

    const current = openMap.get(bestKey)!;
    openMap.delete(bestKey);
    closedSet.add(bestKey);

    // Found destination
    if (current.x === endX && current.y === endY) {
      return {
        path: reconstructPath(parentMap, nodeKey(endX, endY), startKey),
        totalCost: current.g,
        found: true,
      };
    }

    // Expand neighbors
    for (const dir of DIRS) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;
      const nKey = nodeKey(nx, ny);

      // Bounds check
      if (nx < 0 || ny < 0 || nx >= gridCols || ny >= gridRows) continue;
      if (closedSet.has(nKey)) continue;

      // Wall check
      const isDiag = dir.dx !== 0 && dir.dy !== 0;
      if (isDiag) {
        if (!canMoveDiagonal(current.x, current.y, nx, ny, wallEdges, isGM)) continue;
      } else {
        const check = canTokenMove(current.x, current.y, nx, ny, wallEdges, isGM);
        if (!check.allowed) continue;
      }

      // Movement cost
      const step = calculateStepCost(current.x, current.y, nx, ny, terrainCells, cellSizeFt);
      if (step.isImpassable) continue;

      const tentativeG = current.g + step.ftCost;

      const existing = openMap.get(nKey);
      if (existing && tentativeG >= existing.g) continue;

      openMap.set(nKey, {
        x: nx,
        y: ny,
        g: tentativeG,
        h: heuristic(nx, ny, endX, endY, cellSizeFt),
        parentKey: bestKey,
      });
      parentMap.set(nKey, bestKey);
    }
  }

  // No path found
  return { path: [], totalCost: 0, found: false };
}

function reconstructPath(
  parentMap: Map<string, string | null>,
  endKey: string,
  startKey: string,
): Array<{ x: number; y: number }> {
  const path: Array<{ x: number; y: number }> = [];
  let current: string | null = endKey;

  while (current && current !== startKey) {
    const [x, y] = current.split(",").map(Number);
    path.unshift({ x, y });
    current = parentMap.get(current) ?? null;
  }

  return path;
}

/**
 * Dijkstra flood-fill: find all cells reachable within remainingFt.
 * Returns Map<"x,y", costToReach>.
 */
export function getReachableCells(
  startX: number,
  startY: number,
  remainingFt: number,
  wallEdges: Record<string, WallData>,
  terrainCells: TerrainCell[],
  gridCols: number,
  gridRows: number,
  cellSizeFt: number,
  isGM = false,
): Map<string, number> {
  const costs = new Map<string, number>();
  const startKey = nodeKey(startX, startY);
  costs.set(startKey, 0);

  // Priority queue (simple sorted array for small maps)
  const queue: Array<{ x: number; y: number; cost: number }> = [
    { x: startX, y: startY, cost: 0 },
  ];

  while (queue.length > 0) {
    // Get cheapest
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift()!;
    const currentKey = nodeKey(current.x, current.y);

    // Skip if we already found a cheaper route
    if ((costs.get(currentKey) ?? Infinity) < current.cost) continue;

    for (const dir of DIRS) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;

      if (nx < 0 || ny < 0 || nx >= gridCols || ny >= gridRows) continue;

      // Wall check
      const isDiag = dir.dx !== 0 && dir.dy !== 0;
      if (isDiag) {
        if (!canMoveDiagonal(current.x, current.y, nx, ny, wallEdges, isGM)) continue;
      } else {
        const check = canTokenMove(current.x, current.y, nx, ny, wallEdges, isGM);
        if (!check.allowed) continue;
      }

      const step = calculateStepCost(current.x, current.y, nx, ny, terrainCells, cellSizeFt);
      if (step.isImpassable) continue;

      const newCost = current.cost + step.ftCost;
      if (newCost > remainingFt) continue;

      const nKey = nodeKey(nx, ny);
      const existingCost = costs.get(nKey);
      if (existingCost !== undefined && existingCost <= newCost) continue;

      costs.set(nKey, newCost);
      queue.push({ x: nx, y: ny, cost: newCost });
    }
  }

  return costs;
}
