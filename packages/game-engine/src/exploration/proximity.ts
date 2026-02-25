/**
 * Proximity detection for interactive objects and zone transitions.
 */

import type { WallSegment } from "./vision.js";
import type { MapZoneData, InteractiveObjectData } from "./movement.js";

/**
 * Find all interactive objects within range of a token position.
 */
export function findNearbyInteractions(
  tokenPos: { x: number; y: number },
  objects: InteractiveObjectData[],
  walls: WallSegment[],
  maxRange?: number
): Array<{
  objectId: string;
  tokenId: string;
  distance: number;
  interactionType: string;
  icon: string;
  canInteract: boolean;
}> {
  const results: Array<{
    objectId: string;
    tokenId: string;
    distance: number;
    interactionType: string;
    icon: string;
    canInteract: boolean;
  }> = [];

  const visionWalls = walls.filter((w) => w.blocksVision && !(w.isDoor && w.doorState === "OPEN"));

  for (const obj of objects) {
    if (!obj.isActive || obj.isHidden) continue;

    const dist = Math.sqrt((tokenPos.x - obj.x) ** 2 + (tokenPos.y - obj.y) ** 2);
    const range = maxRange ?? obj.interactionRange + 0.5;

    if (dist > range) continue;

    // LoS check
    let hasLoS = true;
    if (obj.requiresLineOfSight) {
      for (const wall of visionWalls) {
        if (segmentsIntersect(tokenPos.x, tokenPos.y, obj.x, obj.y, wall.x1, wall.y1, wall.x2, wall.y2)) {
          hasLoS = false;
          break;
        }
      }
    }

    const icons: Record<string, string> = {
      DOOR: "door", CHEST: "chest", LEVER: "lever", NPC_TALK: "speech",
      EXAMINE: "eye", TELEPORT: "portal", TRAP: "warning", PICKUP: "hand", CUSTOM: "star",
    };

    results.push({
      objectId: obj.id,
      tokenId: obj.tokenId,
      distance: dist,
      interactionType: obj.interactionType,
      icon: obj.interactionIcon ?? icons[obj.interactionType] ?? "star",
      canInteract: hasLoS && dist <= obj.interactionRange + 0.5,
    });
  }

  return results.sort((a, b) => a.distance - b.distance);
}

/**
 * Check zone transitions when a token moves.
 */
export function checkZoneTransitions(
  tokenId: string,
  previousPos: { x: number; y: number },
  currentPos: { x: number; y: number },
  zones: MapZoneData[]
): {
  entered: Array<{ zoneId: string; zone: MapZoneData }>;
  exited: Array<{ zoneId: string; zone: MapZoneData }>;
  stayed: string[];
} {
  const entered: Array<{ zoneId: string; zone: MapZoneData }> = [];
  const exited: Array<{ zoneId: string; zone: MapZoneData }> = [];
  const stayed: string[] = [];

  for (const zone of zones) {
    if (!zone.isActive) continue;

    const wasIn = isPointInZone(previousPos, zone);
    const isIn = isPointInZone(currentPos, zone);

    if (!wasIn && isIn) {
      entered.push({ zoneId: zone.id, zone });
    } else if (wasIn && !isIn) {
      exited.push({ zoneId: zone.id, zone });
    } else if (wasIn && isIn) {
      stayed.push(zone.id);
    }
  }

  return { entered, exited, stayed };
}

/**
 * Check if one token can see another token.
 */
export function canTokenSeeToken(
  observer: { x: number; y: number; visionRadius: number },
  target: { x: number; y: number; isVisible: boolean },
  walls: WallSegment[]
): boolean {
  if (!target.isVisible) return false;

  const dist = Math.sqrt((observer.x - target.x) ** 2 + (observer.y - target.y) ** 2);
  if (dist > observer.visionRadius) return false;

  const visionWalls = walls.filter((w) => w.blocksVision && !(w.isDoor && w.doorState === "OPEN"));
  for (const wall of visionWalls) {
    if (segmentsIntersect(observer.x, observer.y, target.x, target.y, wall.x1, wall.y1, wall.x2, wall.y2)) {
      return false;
    }
  }

  return true;
}

function isPointInZone(point: { x: number; y: number }, zone: MapZoneData): boolean {
  const g = zone.geometry;
  if (zone.shapeType === "rectangle") {
    const x = (g.x as number) ?? 0;
    const y = (g.y as number) ?? 0;
    const w = (g.width as number) ?? 0;
    const h = (g.height as number) ?? 0;
    return point.x >= x && point.x < x + w && point.y >= y && point.y < y + h;
  }
  if (zone.shapeType === "circle") {
    const cx = (g.centerX as number) ?? 0;
    const cy = (g.centerY as number) ?? 0;
    const r = (g.radius as number) ?? 0;
    return (point.x - cx) ** 2 + (point.y - cy) ** 2 <= r * r;
  }
  return false;
}

function segmentsIntersect(
  ax1: number, ay1: number, ax2: number, ay2: number,
  bx1: number, by1: number, bx2: number, by2: number
): boolean {
  const d1 = (bx2 - bx1) * (ay1 - by1) - (by2 - by1) * (ax1 - bx1);
  const d2 = (bx2 - bx1) * (ay2 - by1) - (by2 - by1) * (ax2 - bx1);
  const d3 = (ax2 - ax1) * (by1 - ay1) - (ay2 - ay1) * (bx1 - ax1);
  const d4 = (ax2 - ax1) * (by2 - ay1) - (ay2 - ay1) * (bx2 - ax1);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }
  return false;
}
