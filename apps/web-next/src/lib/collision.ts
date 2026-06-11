import type { WallData } from "./gameplay-mock-data";
import { makeWallKey, canTokenMove, canMoveDiagonal } from "./wall-helpers";

export type MoveResult =
  | { allowed: true }
  | { allowed: false; reason: "WALL"; message: string }
  | { allowed: false; reason: "DOOR_CLOSED"; doorKey: string; message: string }
  | { allowed: false; reason: "DOOR_LOCKED"; doorKey: string; message: string }
  | { allowed: false; reason: "OUT_OF_BOUNDS" }
  | { allowed: false; reason: "IMPASSABLE_TERRAIN" };

export function canTokenMoveTo(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  mapWidth: number,
  mapHeight: number,
  wallEdges: Record<string, WallData>,
  isGM = false,
): MoveResult {
  if (toX < 0 || toY < 0 || toX >= mapWidth || toY >= mapHeight) {
    return { allowed: false, reason: "OUT_OF_BOUNDS" };
  }

  const dx = Math.abs(toX - fromX);
  const dy = Math.abs(toY - fromY);
  const isDiagonal = dx === 1 && dy === 1;

  if (isDiagonal) {
    if (!canMoveDiagonal(fromX, fromY, toX, toY, wallEdges, isGM)) {
      return { allowed: false, reason: "WALL", message: "Parede bloqueia passagem diagonal" };
    }
    return { allowed: true };
  }

  const result = canTokenMove(fromX, fromY, toX, toY, wallEdges, isGM);
  if (!result.allowed) {
    const doorKey = makeWallKey(fromX, fromY, toX, toY);
    if (result.reason === "Porta fechada") {
      return { allowed: false, reason: "DOOR_CLOSED", doorKey, message: result.reason };
    }
    if (result.reason === "Porta trancada") {
      return { allowed: false, reason: "DOOR_LOCKED", doorKey, message: result.reason };
    }
    return { allowed: false, reason: "WALL", message: result.reason ?? "Bloqueado" };
  }

  return { allowed: true };
}

export function validatePath(
  waypoints: Array<{ x: number; y: number }>,
  mapWidth: number,
  mapHeight: number,
  wallEdges: Record<string, WallData>,
  isGM = false,
): { valid: boolean; blockedAt?: number; result?: MoveResult } {
  for (let i = 1; i < waypoints.length; i++) {
    const prev = waypoints[i - 1];
    const curr = waypoints[i];
    const result = canTokenMoveTo(
      prev.x, prev.y, curr.x, curr.y,
      mapWidth, mapHeight, wallEdges, isGM,
    );
    if (!result.allowed) {
      return { valid: false, blockedAt: i, result };
    }
  }
  return { valid: true };
}

/** Bresenham line between two cells (inclusive of both endpoints). */
export function straightLineCells(
  x0: number, y0: number, x1: number, y1: number,
): Array<{ x: number; y: number }> {
  const cells: Array<{ x: number; y: number }> = [];
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  for (;;) {
    cells.push({ x, y });
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
  return cells;
}

/**
 * Validates a multi-cell move by walking the straight line between
 * origin and destination, checking every wall edge crossed.
 */
export function canTokenTravel(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  mapWidth: number,
  mapHeight: number,
  wallEdges: Record<string, WallData>,
  isGM = false,
): MoveResult {
  if (toX < 0 || toY < 0 || toX >= mapWidth || toY >= mapHeight) {
    return { allowed: false, reason: "OUT_OF_BOUNDS" };
  }
  if (fromX === toX && fromY === toY) return { allowed: true };

  const line = straightLineCells(fromX, fromY, toX, toY);
  const check = validatePath(line, mapWidth, mapHeight, wallEdges, isGM);
  if (!check.valid) {
    return check.result ?? { allowed: false, reason: "WALL", message: "Bloqueado" };
  }
  return { allowed: true };
}
