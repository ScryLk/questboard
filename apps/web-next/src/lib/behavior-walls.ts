import type { WallData, WallType } from "./gameplay-mock-data";
import type { BehaviorType } from "./npc-behavior-types";
import { parseWallKey } from "./wall-helpers";

export interface DoorInfo {
  edgeKey: string;
  wallData: WallData;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function extractDoors(wallEdges: Record<string, WallData>): DoorInfo[] {
  const doors: DoorInfo[] = [];
  for (const [key, data] of Object.entries(wallEdges)) {
    if (
      data.type === "door-closed" ||
      data.type === "door-open" ||
      data.type === "door-locked"
    ) {
      const parsed = parseWallKey(key);
      doors.push({ edgeKey: key, wallData: data, ...parsed });
    }
  }
  return doors;
}

export function buildEffectiveWallSet(
  wallEdges: Record<string, WallData>,
  behaviorType: BehaviorType,
): Set<string> {
  const blocked = new Set<string>();

  for (const [key, data] of Object.entries(wallEdges)) {
    switch (data.type) {
      case "wall":
      case "window":
      case "half-wall":
      case "portcullis":
      case "secret":
        blocked.add(cellKeyFromEdge(key));
        break;

      case "door-closed":
      case "door-locked": {
        const passable = doorPassableForBehavior(data.type, data.style, behaviorType);
        if (!passable) {
          blocked.add(cellKeyFromEdge(key));
        }
        break;
      }

      case "door-open":
      case "illusory":
        break;
    }
  }

  return blocked;
}

function doorPassableForBehavior(
  doorType: WallType,
  style: string,
  behaviorType: BehaviorType,
): boolean {
  const isMagic = style === "magic";

  switch (behaviorType) {
    case "PANIC":
      if (isMagic) return false;
      return doorType === "door-closed";

    case "RIOT":
      if (isMagic) return false;
      return true;

    default:
      return false;
  }
}

function cellKeyFromEdge(edgeKey: string): string {
  const { x1, y1, x2, y2 } = parseWallKey(edgeKey);
  return `${Math.max(x1, x2)},${Math.max(y1, y2)}`;
}

export function buildWallSetFromEdges(wallEdges: Record<string, WallData>): Set<string> {
  const walls = new Set<string>();
  for (const [key, data] of Object.entries(wallEdges)) {
    switch (data.type) {
      case "wall":
      case "door-closed":
      case "door-locked":
      case "window":
      case "half-wall":
      case "portcullis":
      case "secret":
        walls.add(cellKeyFromEdge(key));
        break;
    }
  }
  return walls;
}
