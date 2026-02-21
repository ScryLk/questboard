import type { GridConfig, GridPosition } from "./grid.js";
import { getNeighbors } from "./grid.js";
import { calculateDistance } from "./distance.js";

interface PathNode {
  position: GridPosition;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

type BlockedCheck = (x: number, y: number) => boolean;

/**
 * A* pathfinding on the grid.
 * Returns the shortest path from start to end, or null if no path exists.
 */
export function findPath(
  start: GridPosition,
  end: GridPosition,
  config: GridConfig,
  isBlocked: BlockedCheck = () => false
): GridPosition[] | null {
  const openSet = new Map<string, PathNode>();
  const closedSet = new Set<string>();

  const key = (p: GridPosition) => `${p.x},${p.y}`;

  const startNode: PathNode = {
    position: start,
    g: 0,
    h: calculateDistance(start.x, start.y, end.x, end.y),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  openSet.set(key(start), startNode);

  while (openSet.size > 0) {
    // Find node with lowest f
    let current: PathNode | null = null;
    for (const node of openSet.values()) {
      if (current === null || node.f < current.f) {
        current = node;
      }
    }

    if (current === null) break;

    // Reached the goal
    if (current.position.x === end.x && current.position.y === end.y) {
      return reconstructPath(current);
    }

    openSet.delete(key(current.position));
    closedSet.add(key(current.position));

    // Explore neighbors
    const neighbors = getNeighbors(
      current.position.x,
      current.position.y,
      config
    );

    for (const neighbor of neighbors) {
      const nKey = key(neighbor);
      if (closedSet.has(nKey) || isBlocked(neighbor.x, neighbor.y)) {
        continue;
      }

      const g = current.g + 1;
      const existing = openSet.get(nKey);

      if (existing === undefined || g < existing.g) {
        const h = calculateDistance(neighbor.x, neighbor.y, end.x, end.y);
        const node: PathNode = {
          position: neighbor,
          g,
          h,
          f: g + h,
          parent: current,
        };
        openSet.set(nKey, node);
      }
    }
  }

  return null;
}

function reconstructPath(node: PathNode): GridPosition[] {
  const path: GridPosition[] = [];
  let current: PathNode | null = node;
  while (current !== null) {
    path.unshift(current.position);
    current = current.parent;
  }
  return path;
}
