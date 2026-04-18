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
