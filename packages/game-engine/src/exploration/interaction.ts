/**
 * Interaction logic for interactive objects.
 */

import type { WallSegment } from "./vision.js";

export interface InteractiveObjectData {
  id: string;
  tokenId: string;
  interactionType: string;
  interactionRange: number;
  requiresLineOfSight: boolean;
  requiredRole: string[];
  requiredCheck: Record<string, unknown> | null;
  onInteract: Record<string, unknown>;
  isActive: boolean;
  isHidden: boolean;
  hasBeenUsed: boolean;
  x: number;
  y: number;
}

export type InteractionEffect =
  | { type: "toggle_door"; wallId: string; newState: string }
  | { type: "reveal_fog"; fogAreaIds: string[] }
  | { type: "reveal_content"; message: string; imageUrl?: string }
  | { type: "play_sound"; soundId: string; volume?: number }
  | { type: "broadcast_message"; message: string; channel: string }
  | { type: "teleport_token"; tokenId: string; toX: number; toY: number; toMapId?: string }
  | { type: "move_token"; tokenId: string; toX: number; toY: number }
  | { type: "spawn_token"; template: Record<string, unknown> }
  | { type: "remove_token"; tokenId: string }
  | { type: "apply_damage"; tokenId: string; formula: string; damageType: string }
  | { type: "start_dialogue"; npcName: string; portrait?: string; dialogue: Array<{ speaker: string; text: string }> }
  | { type: "trigger_zone"; zoneId: string; activate: boolean }
  | { type: "update_object_state"; objectId: string; changes: Record<string, unknown> };

export interface InteractionResult {
  success: boolean;
  effects: InteractionEffect[];
  message?: string;
  sound?: string;
  failureReason?: string;
}

/**
 * Check if a token can interact with an interactive object.
 */
export function canInteract(
  token: { x: number; y: number; ownerId: string },
  object: InteractiveObjectData,
  walls: WallSegment[],
  playerRole: string
): { canInteract: boolean; reason?: string } {
  if (!object.isActive) return { canInteract: false, reason: "Object inactive" };

  // Role check
  if (!object.requiredRole.includes(playerRole)) {
    return { canInteract: false, reason: "Insufficient role" };
  }

  // Range check
  const dist = Math.sqrt((token.x - object.x) ** 2 + (token.y - object.y) ** 2);
  if (dist > object.interactionRange + 0.5) {
    return { canInteract: false, reason: "Out of range" };
  }

  // LoS check
  if (object.requiresLineOfSight) {
    const visionWalls = walls.filter((w) => w.blocksVision && !(w.isDoor && w.doorState === "OPEN"));
    for (const wall of visionWalls) {
      if (segmentsIntersect(token.x, token.y, object.x, object.y, wall.x1, wall.y1, wall.x2, wall.y2)) {
        return { canInteract: false, reason: "No line of sight" };
      }
    }
  }

  return { canInteract: true };
}

/**
 * Process an interaction and return declarative effects.
 */
export function processInteraction(
  token: { id: string; x: number; y: number; ownerId: string },
  object: InteractiveObjectData,
  context?: { diceResult?: number; hasItem?: string }
): InteractionResult {
  const onInteract = object.onInteract;
  const action = (onInteract as Record<string, unknown>).action as string;

  // Check required check
  if (object.requiredCheck) {
    const check = object.requiredCheck;
    const checkType = check.type as string;

    if (checkType === "item_required") {
      if (!context?.hasItem || context.hasItem !== (check.itemName as string)) {
        return { success: false, effects: [], failureReason: `Requires: ${check.itemName}` };
      }
    } else if (checkType === "ability_check" || checkType === "skill_check") {
      const dc = (check.dc as number) ?? 10;
      if (!context?.diceResult) {
        return { success: false, effects: [], failureReason: "Dice roll required" };
      }
      if (context.diceResult < dc) {
        return {
          success: false,
          effects: [],
          failureReason: `DC ${dc} ${check.ability ?? check.skill} — Failed (${context.diceResult})`,
        };
      }
    }
  }

  const effects: InteractionEffect[] = [];
  let message: string | undefined;
  let sound: string | undefined;

  switch (action) {
    case "toggle_door": {
      const wallId = (onInteract as Record<string, unknown>).wallId as string;
      effects.push({ type: "toggle_door", wallId, newState: "OPEN" });
      sound = (onInteract as Record<string, unknown>).openSound as string;
      break;
    }
    case "reveal_content": {
      message = (onInteract as Record<string, unknown>).contentMessage as string;
      sound = (onInteract as Record<string, unknown>).sound as string;
      break;
    }
    case "trigger": {
      const triggerEffects = (onInteract as Record<string, unknown>).effects as Array<Record<string, unknown>> ?? [];
      for (const e of triggerEffects) {
        effects.push(convertTriggerEffect(e));
      }
      sound = (onInteract as Record<string, unknown>).sound as string;
      break;
    }
    case "npc_talk": {
      const npcName = (onInteract as Record<string, unknown>).npcName as string;
      const dialogue = (onInteract as Record<string, unknown>).dialogue as Array<{ speaker: string; text: string }> ?? [];
      const portrait = (onInteract as Record<string, unknown>).portrait as string | undefined;
      effects.push({ type: "start_dialogue", npcName, portrait, dialogue });
      sound = (onInteract as Record<string, unknown>).sound as string;
      break;
    }
    case "examine": {
      message = (onInteract as Record<string, unknown>).description as string;
      sound = (onInteract as Record<string, unknown>).sound as string;
      break;
    }
    case "teleport": {
      const toX = (onInteract as Record<string, unknown>).targetX as number;
      const toY = (onInteract as Record<string, unknown>).targetY as number;
      const toMapId = (onInteract as Record<string, unknown>).targetMapId as string | undefined;
      message = (onInteract as Record<string, unknown>).teleportMessage as string;
      effects.push({ type: "teleport_token", tokenId: token.id, toX, toY, toMapId });
      sound = (onInteract as Record<string, unknown>).sound as string;
      break;
    }
    case "trap": {
      const formula = (onInteract as Record<string, unknown>).damage as string ?? "1d6";
      const damageType = (onInteract as Record<string, unknown>).damageType as string ?? "piercing";
      message = (onInteract as Record<string, unknown>).triggerMessage as string;
      effects.push({ type: "apply_damage", tokenId: token.id, formula, damageType });
      sound = (onInteract as Record<string, unknown>).sound as string;
      break;
    }
    default: {
      // Custom action — just broadcast the onInteract data
      message = (onInteract as Record<string, unknown>).message as string;
      break;
    }
  }

  return { success: true, effects, message, sound };
}

function convertTriggerEffect(e: Record<string, unknown>): InteractionEffect {
  const type = e.type as string;
  switch (type) {
    case "toggle_door":
      return { type: "toggle_door", wallId: e.wallId as string, newState: "OPEN" };
    case "reveal_fog":
      return { type: "reveal_fog", fogAreaIds: e.fogAreaIds as string[] ?? [] };
    case "play_sound":
      return { type: "play_sound", soundId: e.sound as string ?? e.soundId as string, volume: e.volume as number };
    case "move_token":
      return { type: "move_token", tokenId: e.tokenId as string, toX: e.toX as number, toY: e.toY as number };
    case "spawn_token":
      return { type: "spawn_token", template: e.template as Record<string, unknown> ?? {} };
    case "broadcast_message":
      return { type: "broadcast_message", message: e.message as string, channel: e.channel as string ?? "narrator" };
    default:
      return { type: "broadcast_message", message: `Unknown effect: ${type}`, channel: "system" };
  }
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
