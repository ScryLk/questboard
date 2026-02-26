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

// ═══════════════════════════════════════════════════════════════════════
// Room-based proximity system for in-game experience
// ═══════════════════════════════════════════════════════════════════════

export type AwarenessLevel = "visible" | "audible" | "unaware";

export interface TokenPosition {
  id: string;
  userId?: string;
  x: number;
  y: number;
  visionRadius: number;
  isVisible: boolean;
}

/**
 * Flood-fill from a starting cell to find all reachable cells (a "room")
 * bounded by movement-blocking walls.
 */
export function floodFillRoom(
  startX: number,
  startY: number,
  walls: WallSegment[],
  maxCells: number = 2000
): Set<string> {
  const room = new Set<string>();
  const queue: Array<{ x: number; y: number }> = [{ x: Math.floor(startX), y: Math.floor(startY) }];
  const startKey = `${Math.floor(startX)},${Math.floor(startY)}`;
  room.add(startKey);

  const movementWalls = walls.filter(
    (w) => w.blocksMovement && !(w.isDoor && w.doorState === "OPEN")
  );

  while (queue.length > 0 && room.size < maxCells) {
    const { x, y } = queue.shift()!;

    const neighbors = [
      { nx: x + 1, ny: y },
      { nx: x - 1, ny: y },
      { nx: x, ny: y + 1 },
      { nx: x, ny: y - 1 },
    ];

    for (const { nx, ny } of neighbors) {
      const key = `${nx},${ny}`;
      if (room.has(key)) continue;

      // Check if a wall blocks crossing from (x,y) to (nx,ny)
      const cx = x + 0.5;
      const cy = y + 0.5;
      const ncx = nx + 0.5;
      const ncy = ny + 0.5;

      let blocked = false;
      for (const wall of movementWalls) {
        if (segmentsIntersect(cx, cy, ncx, ncy, wall.x1, wall.y1, wall.x2, wall.y2)) {
          blocked = true;
          break;
        }
      }

      if (!blocked) {
        room.add(key);
        queue.push({ x: nx, y: ny });
      }
    }
  }

  return room;
}

/**
 * Get all tokens occupying the same room as a given token.
 */
export function getRoomOccupants(
  token: TokenPosition,
  allTokens: TokenPosition[],
  walls: WallSegment[]
): TokenPosition[] {
  const room = floodFillRoom(token.x, token.y, walls);
  return allTokens.filter((t) => {
    if (t.id === token.id) return false;
    const key = `${Math.floor(t.x)},${Math.floor(t.y)}`;
    return room.has(key);
  });
}

/**
 * Check if two tokens are in the same room (reachable without crossing walls).
 */
export function areInSameRoom(
  tokenA: TokenPosition,
  tokenB: TokenPosition,
  walls: WallSegment[]
): boolean {
  const room = floodFillRoom(tokenA.x, tokenA.y, walls);
  const key = `${Math.floor(tokenB.x)},${Math.floor(tokenB.y)}`;
  return room.has(key);
}

/**
 * Get all tokens within a given grid radius of a target token.
 */
export function getAdjacentTokens(
  token: TokenPosition,
  allTokens: TokenPosition[],
  radius: number
): TokenPosition[] {
  return allTokens.filter((t) => {
    if (t.id === token.id) return false;
    const dist = Math.sqrt((t.x - token.x) ** 2 + (t.y - token.y) ** 2);
    return dist <= radius;
  });
}

/**
 * Determine the awareness level between two tokens.
 * - "visible": observer can see the target (LoS + in vision range)
 * - "audible": same room but no LoS (e.g. around a corner)
 * - "unaware": different room or too far
 */
export function getAwareness(
  observer: TokenPosition,
  target: TokenPosition,
  walls: WallSegment[],
  audibleRadius: number = 30
): AwarenessLevel {
  if (!target.isVisible) return "unaware";

  const dist = Math.sqrt((observer.x - target.x) ** 2 + (observer.y - target.y) ** 2);

  // Check line of sight
  const visionWalls = walls.filter(
    (w) => w.blocksVision && !(w.isDoor && w.doorState === "OPEN")
  );
  let hasLoS = true;
  if (dist > 0) {
    for (const wall of visionWalls) {
      if (segmentsIntersect(observer.x, observer.y, target.x, target.y, wall.x1, wall.y1, wall.x2, wall.y2)) {
        hasLoS = false;
        break;
      }
    }
  }

  if (hasLoS && dist <= observer.visionRadius) {
    return "visible";
  }

  // Check if same room (audible range)
  if (dist <= audibleRadius && areInSameRoom(observer, target, walls)) {
    return "audible";
  }

  return "unaware";
}

/**
 * Compute full proximity state for all tokens from a given observer's perspective.
 */
export function computeProximityState(
  observer: TokenPosition,
  allTokens: TokenPosition[],
  walls: WallSegment[]
): Array<{ tokenId: string; userId?: string; awareness: AwarenessLevel; distance: number }> {
  return allTokens
    .filter((t) => t.id !== observer.id)
    .map((t) => ({
      tokenId: t.id,
      userId: t.userId,
      awareness: getAwareness(observer, t, walls),
      distance: Math.sqrt((observer.x - t.x) ** 2 + (observer.y - t.y) ** 2),
    }));
}

/**
 * Resolve marching order triggers (traps, ambushes) based on formation positions.
 */
export function resolveFormationTrigger(
  formation: Array<{ userId: string; position: "front" | "middle" | "rear"; slot: number }>,
  triggerType: "trap" | "ambush" | "encounter",
  options?: { affectsPosition?: "front" | "middle" | "rear" }
): { affectedUserIds: string[]; firstContact: string | null } {
  const sorted = [...formation].sort((a, b) => {
    const posOrder = { front: 0, middle: 1, rear: 2 };
    if (posOrder[a.position] !== posOrder[b.position]) {
      return posOrder[a.position] - posOrder[b.position];
    }
    return a.slot - b.slot;
  });

  if (sorted.length === 0) return { affectedUserIds: [], firstContact: null };

  const targetPosition = options?.affectsPosition;

  if (targetPosition) {
    const affected = sorted.filter((m) => m.position === targetPosition);
    return {
      affectedUserIds: affected.map((m) => m.userId),
      firstContact: affected[0]?.userId ?? null,
    };
  }

  switch (triggerType) {
    case "trap":
      // Traps hit the front row
      const frontMembers = sorted.filter((m) => m.position === "front");
      return {
        affectedUserIds: frontMembers.map((m) => m.userId),
        firstContact: frontMembers[0]?.userId ?? sorted[0]?.userId ?? null,
      };
    case "ambush":
      // Ambushes hit the rear
      const rearMembers = sorted.filter((m) => m.position === "rear");
      return {
        affectedUserIds: rearMembers.map((m) => m.userId),
        firstContact: rearMembers[rearMembers.length - 1]?.userId ?? sorted[sorted.length - 1]?.userId ?? null,
      };
    case "encounter":
      // Encounters hit front first
      return {
        affectedUserIds: sorted.map((m) => m.userId),
        firstContact: sorted[0]?.userId ?? null,
      };
  }
}
