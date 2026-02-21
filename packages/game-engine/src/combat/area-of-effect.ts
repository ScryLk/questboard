import type { GridPosition } from "../grid/grid.js";

export type AoEShape = "circle" | "cone" | "cube" | "line" | "cylinder";

export interface AoEParams {
  shape: AoEShape;
  origin: GridPosition;
  size: number; // radius for circle/cylinder/cone, side for cube, length for line
  direction?: number; // angle in degrees, required for cone and line
}

/**
 * Get all grid cells affected by an area of effect.
 */
export function getAffectedCells(params: AoEParams): GridPosition[] {
  switch (params.shape) {
    case "circle":
    case "cylinder":
      return getCircleCells(params.origin, params.size);
    case "cube":
      return getCubeCells(params.origin, params.size);
    case "cone":
      return getConeCells(params.origin, params.size, params.direction ?? 0);
    case "line":
      return getLineCells(params.origin, params.size, params.direction ?? 0);
  }
}

function getCircleCells(origin: GridPosition, radius: number): GridPosition[] {
  const cells: GridPosition[] = [];
  for (let x = origin.x - radius; x <= origin.x + radius; x++) {
    for (let y = origin.y - radius; y <= origin.y + radius; y++) {
      const dist = Math.sqrt((x - origin.x) ** 2 + (y - origin.y) ** 2);
      if (dist <= radius) {
        cells.push({ x, y });
      }
    }
  }
  return cells;
}

function getCubeCells(origin: GridPosition, size: number): GridPosition[] {
  const cells: GridPosition[] = [];
  const half = Math.floor(size / 2);
  for (let x = origin.x - half; x <= origin.x + half; x++) {
    for (let y = origin.y - half; y <= origin.y + half; y++) {
      cells.push({ x, y });
    }
  }
  return cells;
}

function getConeCells(
  origin: GridPosition,
  length: number,
  directionDeg: number
): GridPosition[] {
  const cells: GridPosition[] = [];
  const dirRad = (directionDeg * Math.PI) / 180;
  const halfAngle = Math.PI / 6; // 30 degree half-angle (60 degree cone)

  for (let x = origin.x - length; x <= origin.x + length; x++) {
    for (let y = origin.y - length; y <= origin.y + length; y++) {
      const dx = x - origin.x;
      const dy = y - origin.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > length || dist === 0) continue;

      const angle = Math.atan2(dy, dx);
      let angleDiff = Math.abs(angle - dirRad);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

      if (angleDiff <= halfAngle) {
        cells.push({ x, y });
      }
    }
  }

  return cells;
}

function getLineCells(
  origin: GridPosition,
  length: number,
  directionDeg: number
): GridPosition[] {
  const cells: GridPosition[] = [];
  const dirRad = (directionDeg * Math.PI) / 180;

  for (let i = 1; i <= length; i++) {
    const x = Math.round(origin.x + Math.cos(dirRad) * i);
    const y = Math.round(origin.y + Math.sin(dirRad) * i);
    cells.push({ x, y });
  }

  return cells;
}
