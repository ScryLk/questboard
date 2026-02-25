/**
 * Movement processing for exploration and combat modes.
 */

import type { WallSegment } from "./vision.js";

export interface MapZoneData {
  id: string;
  zoneType: string;
  shapeType: string;
  geometry: Record<string, unknown>;
  properties: Record<string, unknown>;
  isActive: boolean;
}

export interface InteractiveObjectData {
  id: string;
  tokenId: string;
  interactionType: string;
  interactionRange: number;
  requiresLineOfSight: boolean;
  isActive: boolean;
  isHidden: boolean;
  hasBeenUsed: boolean;
  interactionIcon: string | null;
  x: number;
  y: number;
}

export interface ExplorationMoveResult {
  valid: boolean;
  finalPosition: { x: number; y: number };
  path: Array<{ x: number; y: number }>;
  distance: number;
  zonesEntered: Array<{ zoneId: string; zoneType: string; effect: Record<string, unknown> }>;
  zonesExited: string[];
  trapsTriggered: Array<{ objectId: string; trapData: Record<string, unknown> }>;
  nearbyInteractions: Array<{
    objectId: string;
    tokenId: string;
    interactionType: string;
    distance: number;
    icon: string;
  }>;
  blockedReason?: "wall" | "out_of_bounds" | "locked_door";
}

export interface CombatMoveResult extends ExplorationMoveResult {
  movementUsed: number;
  movementRemaining: number;
  opportunityAttacks: Array<{ enemyTokenId: string; position: { x: number; y: number } }>;
}

/**
 * Process an exploration move (free movement, no distance limit).
 */
export function processExplorationMove(
  token: { id: string; x: number; y: number; width: number; height: number; ownerId: string },
  target: { x: number; y: number },
  mapState: {
    gridType: string;
    cellsWide: number;
    cellsHigh: number;
    walls: WallSegment[];
    zones: MapZoneData[];
    interactiveObjects: InteractiveObjectData[];
  }
): ExplorationMoveResult {
  // Bounds check
  if (target.x < 0 || target.y < 0 || target.x >= mapState.cellsWide || target.y >= mapState.cellsHigh) {
    return {
      valid: false,
      finalPosition: { x: token.x, y: token.y },
      path: [],
      distance: 0,
      zonesEntered: [],
      zonesExited: [],
      trapsTriggered: [],
      nearbyInteractions: [],
      blockedReason: "out_of_bounds",
    };
  }

  // Wall collision check (simple line-of-movement)
  const movementWalls = mapState.walls.filter((w) => {
    if (!w.blocksMovement) return false;
    if (w.isDoor && w.doorState === "OPEN") return false;
    return true;
  });

  for (const wall of movementWalls) {
    if (segmentsIntersect(token.x, token.y, target.x, target.y, wall.x1, wall.y1, wall.x2, wall.y2)) {
      if (wall.isDoor && wall.doorState === "LOCKED") {
        return {
          valid: false,
          finalPosition: { x: token.x, y: token.y },
          path: [],
          distance: 0,
          zonesEntered: [],
          zonesExited: [],
          trapsTriggered: [],
          nearbyInteractions: [],
          blockedReason: "locked_door",
        };
      }
      return {
        valid: false,
        finalPosition: { x: token.x, y: token.y },
        path: [],
        distance: 0,
        zonesEntered: [],
        zonesExited: [],
        trapsTriggered: [],
        nearbyInteractions: [],
        blockedReason: "wall",
      };
    }
  }

  // Calculate simple straight-line path
  const dx = target.x - token.x;
  const dy = target.y - token.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const path: Array<{ x: number; y: number }> = [
    { x: token.x, y: token.y },
    { x: target.x, y: target.y },
  ];

  // Check zone transitions
  const previousPos = { x: token.x, y: token.y };
  const zonesEntered: ExplorationMoveResult["zonesEntered"] = [];
  const zonesExited: string[] = [];

  for (const zone of mapState.zones) {
    if (!zone.isActive) continue;
    const wasInZone = isPointInZone(previousPos, zone);
    const isInZone = isPointInZone(target, zone);

    if (!wasInZone && isInZone) {
      zonesEntered.push({
        zoneId: zone.id,
        zoneType: zone.zoneType,
        effect: zone.properties,
      });
    } else if (wasInZone && !isInZone) {
      zonesExited.push(zone.id);
    }
  }

  // Check trap triggers
  const trapsTriggered: ExplorationMoveResult["trapsTriggered"] = [];
  for (const obj of mapState.interactiveObjects) {
    if (!obj.isActive || obj.hasBeenUsed) continue;
    if (obj.interactionType !== "TRAP") continue;

    const dist = Math.sqrt((target.x - obj.x) ** 2 + (target.y - obj.y) ** 2);
    if (dist <= obj.interactionRange) {
      trapsTriggered.push({ objectId: obj.id, trapData: {} });
    }
  }

  // Find nearby interactions at destination
  const nearbyInteractions: ExplorationMoveResult["nearbyInteractions"] = [];
  for (const obj of mapState.interactiveObjects) {
    if (!obj.isActive || obj.isHidden) continue;
    if (obj.interactionType === "TRAP") continue;

    const dist = Math.sqrt((target.x - obj.x) ** 2 + (target.y - obj.y) ** 2);
    if (dist <= obj.interactionRange + 0.5) {
      nearbyInteractions.push({
        objectId: obj.id,
        tokenId: obj.tokenId,
        interactionType: obj.interactionType,
        distance: dist,
        icon: obj.interactionIcon ?? getDefaultIcon(obj.interactionType),
      });
    }
  }

  return {
    valid: true,
    finalPosition: target,
    path,
    distance,
    zonesEntered,
    zonesExited,
    trapsTriggered,
    nearbyInteractions,
  };
}

/**
 * Process a combat move (limited by speed budget).
 */
export function processCombatMove(
  token: { id: string; x: number; y: number; width: number; height: number; ownerId: string },
  target: { x: number; y: number },
  movementBudget: number,
  mapState: {
    gridType: string;
    cellsWide: number;
    cellsHigh: number;
    walls: WallSegment[];
    zones: MapZoneData[];
    interactiveObjects: InteractiveObjectData[];
  },
  options?: { isDash?: boolean; difficultTerrainMultiplier?: number }
): CombatMoveResult {
  const budget = options?.isDash ? movementBudget * 2 : movementBudget;

  const explResult = processExplorationMove(token, target, mapState);

  if (!explResult.valid) {
    return {
      ...explResult,
      movementUsed: 0,
      movementRemaining: budget,
      opportunityAttacks: [],
    };
  }

  // Apply difficult terrain multiplier
  let effectiveDistance = explResult.distance;
  for (const zone of explResult.zonesEntered) {
    if (zone.zoneType === "DIFFICULT_TERRAIN") {
      const mult = (zone.effect as Record<string, unknown>).movementMultiplier as number ?? 2.0;
      effectiveDistance *= mult;
    }
  }

  if (effectiveDistance > budget) {
    // Clamp to budget
    const ratio = budget / effectiveDistance;
    const clampedX = token.x + (target.x - token.x) * ratio;
    const clampedY = token.y + (target.y - token.y) * ratio;

    return {
      valid: true,
      finalPosition: { x: Math.round(clampedX), y: Math.round(clampedY) },
      path: [{ x: token.x, y: token.y }, { x: Math.round(clampedX), y: Math.round(clampedY) }],
      distance: budget,
      zonesEntered: explResult.zonesEntered,
      zonesExited: explResult.zonesExited,
      trapsTriggered: explResult.trapsTriggered,
      nearbyInteractions: explResult.nearbyInteractions,
      movementUsed: budget,
      movementRemaining: 0,
      opportunityAttacks: [],
    };
  }

  return {
    ...explResult,
    movementUsed: effectiveDistance,
    movementRemaining: budget - effectiveDistance,
    opportunityAttacks: [],
  };
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

function getDefaultIcon(interactionType: string): string {
  const icons: Record<string, string> = {
    DOOR: "door",
    CHEST: "chest",
    LEVER: "lever",
    NPC_TALK: "speech",
    EXAMINE: "eye",
    TELEPORT: "portal",
    TRAP: "warning",
    PICKUP: "hand",
    CUSTOM: "star",
  };
  return icons[interactionType] ?? "star";
}

function segmentsIntersect(
  ax1: number, ay1: number, ax2: number, ay2: number,
  bx1: number, by1: number, bx2: number, by2: number
): boolean {
  const d1 = direction(bx1, by1, bx2, by2, ax1, ay1);
  const d2 = direction(bx1, by1, bx2, by2, ax2, ay2);
  const d3 = direction(ax1, ay1, ax2, ay2, bx1, by1);
  const d4 = direction(ax1, ay1, ax2, ay2, bx2, by2);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }
  return false;
}

function direction(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}
