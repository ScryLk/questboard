import type { ExitZone } from "./exit-zone-types";

interface Cell {
  x: number;
  y: number;
}

interface PathResult {
  waypoints: Cell[];
  blocked: boolean;
  targetExit: ExitZone | null;
}

export function npcAStar(
  from: Cell,
  to: Cell,
  walls: Set<string>,
  mapWidth: number,
  mapHeight: number,
): { waypoints: Cell[]; blocked: boolean } {
  const key = (c: Cell) => `${c.x},${c.y}`;
  const h = (c: Cell) => Math.abs(c.x - to.x) + Math.abs(c.y - to.y);

  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const parent = new Map<string, string | null>();
  const open = new Set<string>();
  const closed = new Set<string>();

  const startKey = key(from);
  gScore.set(startKey, 0);
  fScore.set(startKey, h(from));
  parent.set(startKey, null);
  open.add(startKey);

  const cellFromKey = new Map<string, Cell>();
  cellFromKey.set(startKey, from);

  const MAX_ITERATIONS = 500;

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    if (open.size === 0) return { waypoints: [], blocked: true };

    let bestKey = "";
    let bestF = Infinity;
    for (const k of open) {
      const f = fScore.get(k) ?? Infinity;
      if (f < bestF) {
        bestF = f;
        bestKey = k;
      }
    }

    const currentCell = cellFromKey.get(bestKey)!;
    if (currentCell.x === to.x && currentCell.y === to.y) {
      const waypoints: Cell[] = [];
      let k: string | null = bestKey;
      while (k) {
        waypoints.unshift(cellFromKey.get(k)!);
        k = parent.get(k) ?? null;
      }
      return { waypoints, blocked: false };
    }

    open.delete(bestKey);
    closed.add(bestKey);

    const neighbors: Cell[] = [
      { x: currentCell.x + 1, y: currentCell.y },
      { x: currentCell.x - 1, y: currentCell.y },
      { x: currentCell.x, y: currentCell.y + 1 },
      { x: currentCell.x, y: currentCell.y - 1 },
    ];

    for (const n of neighbors) {
      const nk = key(n);
      if (n.x < 0 || n.y < 0 || n.x >= mapWidth || n.y >= mapHeight) continue;
      if (walls.has(nk) || closed.has(nk)) continue;

      const tentativeG = (gScore.get(bestKey) ?? 0) + 1;
      if (!open.has(nk) || tentativeG < (gScore.get(nk) ?? Infinity)) {
        gScore.set(nk, tentativeG);
        fScore.set(nk, tentativeG + h(n));
        parent.set(nk, bestKey);
        cellFromKey.set(nk, n);
        open.add(nk);
      }
    }
  }

  return { waypoints: [], blocked: true };
}

export function findNearestExit(
  from: Cell,
  exits: ExitZone[],
  walls: Set<string>,
  mapWidth: number,
  mapHeight: number,
): PathResult | null {
  let best: PathResult | null = null;

  for (const exit of exits) {
    for (const cell of exit.cells) {
      if (walls.has(`${cell.x},${cell.y}`)) continue;

      const result = npcAStar(from, cell, walls, mapWidth, mapHeight);
      if (!result.blocked) {
        if (!best || result.waypoints.length < best.waypoints.length) {
          best = {
            waypoints: result.waypoints,
            blocked: false,
            targetExit: exit,
          };
        }
      }
    }
  }

  return best;
}
