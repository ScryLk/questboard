import type { TerrainCell } from "./gameplay-mock-data";
import { TERRAIN_CATALOG } from "./terrain-catalog";

export interface StepCost {
  ftCost: number;
  isDiagonal: boolean;
  isDifficultTerrain: boolean;
  isImpassable: boolean;
  terrainType?: string;
}

/**
 * Get terrain info at a specific cell.
 */
export function getTerrainAt(
  x: number,
  y: number,
  terrainCells: TerrainCell[],
): { movementCost: number; terrainType: string } | null {
  const cell = terrainCells.find((c) => c.x === x && c.y === y);
  if (!cell) return null;
  const info = TERRAIN_CATALOG[cell.type];
  if (!info) return null;
  return { movementCost: info.movementCost, terrainType: cell.type };
}

/**
 * Calculate movement cost for a single step between adjacent cells.
 * Uses Chebyshev: orthogonal and diagonal both cost cellSizeFt (5ft).
 * Difficult terrain (movementCost=2) doubles the cost.
 */
export function calculateStepCost(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  terrainCells: TerrainCell[],
  cellSizeFt: number,
): StepCost {
  const isDiagonal = fromX !== toX && fromY !== toY;
  let ftCost = cellSizeFt; // 5ft standard

  const terrain = getTerrainAt(toX, toY, terrainCells);
  const isDifficultTerrain = terrain !== null && terrain.movementCost === 2;
  const isImpassable = terrain !== null && terrain.movementCost === 0;

  if (isDifficultTerrain) {
    ftCost *= 2; // 10ft per cell in difficult terrain
  }

  return {
    ftCost,
    isDiagonal,
    isDifficultTerrain,
    isImpassable,
    terrainType: terrain?.terrainType,
  };
}

/**
 * Calculate max remaining movement ft considering Dash and already-spent ft.
 */
export function getMaxMovementFt(
  baseSpeed: number,
  isDashing: boolean,
  movementUsedFt: number,
): number {
  const total = isDashing ? baseSpeed * 2 : baseSpeed;
  return Math.max(0, total - movementUsedFt);
}
