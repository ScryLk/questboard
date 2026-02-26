import type { PrismaClient, Prisma } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";
import {
  canInteract,
  processInteraction,
  type InteractionEffect,
} from "@questboard/game-engine";

export function registerExplorationInteractionHandlers(
  io: TypedIO,
  socket: TypedSocket,
  prisma: PrismaClient
) {
  async function getPlayerAndToken(sessionId: string, userId: string) {
    const player = await prisma.sessionPlayer.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    if (!player) return null;

    // Find the player's primary token on the active map
    const activeMap = await prisma.map.findFirst({
      where: { sessionId, isActive: true, deletedAt: null },
    });
    if (!activeMap) return null;

    const token = await prisma.token.findFirst({
      where: { mapId: activeMap.id, ownerId: userId, type: "PC" },
    });

    return { player, token, mapId: activeMap.id };
  }

  socket.on("exploration:interact", async (data) => {
    if (!socket.ctx.sessionId) return;
    const sessionId = socket.ctx.sessionId;

    try {
      const ctx = await getPlayerAndToken(sessionId, socket.ctx.userId);
      if (!ctx || !ctx.token) return;

      const obj = await prisma.interactiveObject.findUnique({
        where: { id: data.objectId },
      });
      if (!obj || !obj.isActive) {
        socket.emit("exploration:interaction-failed", {
          objectId: data.objectId,
          reason: "Object not found or inactive",
        });
        return;
      }

      // Get associated token position for the object
      const objToken = await prisma.token.findUnique({
        where: { id: obj.tokenId },
      });
      if (!objToken) return;

      // Get walls for LoS check
      const walls = await prisma.wall.findMany({
        where: { mapId: ctx.mapId },
      });

      const wallSegments = walls.map((w) => ({
        x1: w.x1, y1: w.y1, x2: w.x2, y2: w.y2,
        blocksMovement: w.blocksMovement,
        blocksVision: w.blocksVision,
        isDoor: w.isDoor,
        doorState: w.doorState ?? "CLOSED",
      }));

      const objectData = {
        id: obj.id,
        tokenId: obj.tokenId,
        interactionType: obj.interactionType,
        interactionRange: obj.interactionRange,
        requiresLineOfSight: obj.requiresLineOfSight,
        requiredRole: obj.requiredRole as string[],
        requiredCheck: obj.requiredCheck as Record<string, unknown> | null,
        onInteract: obj.onInteract as Record<string, unknown>,
        isActive: obj.isActive,
        isHidden: obj.isHidden,
        hasBeenUsed: obj.hasBeenUsed,
        x: objToken.x,
        y: objToken.y,
      };

      // Check if can interact
      const check = canInteract(
        { x: ctx.token.x, y: ctx.token.y, ownerId: socket.ctx.userId },
        objectData,
        wallSegments,
        ctx.player.role
      );

      if (!check.canInteract) {
        // If requires a check (dice roll, item), emit check-required
        if (obj.requiredCheck) {
          socket.emit("exploration:check-required", {
            objectId: obj.id,
            check: obj.requiredCheck as {
              type: string;
              ability?: string;
              skill?: string;
              dc?: number;
              itemName?: string;
            },
          });
          return;
        }

        socket.emit("exploration:interaction-failed", {
          objectId: data.objectId,
          reason: check.reason ?? "Cannot interact",
        });
        return;
      }

      // Check if dice check is required and not yet provided
      if (obj.requiredCheck && !data.context?.diceResult && !data.context?.hasItem) {
        socket.emit("exploration:check-required", {
          objectId: obj.id,
          check: obj.requiredCheck as {
            type: string;
            ability?: string;
            skill?: string;
            dc?: number;
            itemName?: string;
          },
        });
        return;
      }

      // Process the interaction
      const result = processInteraction(
        { id: ctx.token.id, x: ctx.token.x, y: ctx.token.y, ownerId: socket.ctx.userId },
        objectData,
        data.context
      );

      // Mark one-time objects as used
      const onInteract = obj.onInteract as Record<string, unknown>;
      if (result.success && onInteract.oneTimeOnly) {
        await prisma.interactiveObject.update({
          where: { id: obj.id },
          data: { hasBeenUsed: true, usedById: socket.ctx.userId, usedAt: new Date() },
        });
      }

      // Apply effects server-side
      await applyEffects(prisma, io, sessionId, ctx.mapId, result.effects);

      // Broadcast interaction result
      io.to(sessionId).emit("exploration:interaction-result", {
        objectId: data.objectId,
        userId: socket.ctx.userId,
        success: result.success,
        message: result.message,
        sound: result.sound,
        effects: result.effects.map((e) => ({ type: e.type })),
      });

      // Play sound if applicable
      if (result.sound) {
        io.to(sessionId).emit("audio:play-effect", {
          soundId: result.sound,
          volume: 0.8,
        });
      }

      // Log exploration event
      await prisma.explorationLog.create({
        data: {
          sessionId,
          mapId: ctx.mapId,
          actorId: socket.ctx.userId,
          event: "OBJECT_INTERACTION",
          data: {
            objectId: obj.id,
            interactionType: obj.interactionType,
            success: result.success,
            effects: result.effects.map((e) => e.type),
          } as Prisma.InputJsonValue,
        },
      });
    } catch {
      socket.emit("exploration:interaction-failed", {
        objectId: data.objectId,
        reason: "Server error",
      });
    }
  });
}

async function applyEffects(
  prisma: PrismaClient,
  io: TypedIO,
  sessionId: string,
  mapId: string,
  effects: InteractionEffect[]
) {
  for (const effect of effects) {
    switch (effect.type) {
      case "toggle_door": {
        await prisma.wall.update({
          where: { id: effect.wallId },
          data: {
            doorState: effect.newState as any,
            doorLocked: effect.newState === "LOCKED",
          },
        }).catch(() => {});
        io.to(sessionId).emit("wall:door-toggled", {
          wallId: effect.wallId,
          doorState: effect.newState as any,
        });
        break;
      }
      case "reveal_fog": {
        await prisma.fogArea.updateMany({
          where: { id: { in: effect.fogAreaIds } },
          data: { isRevealed: true },
        });
        io.to(sessionId).emit("fog:batch-revealed", {
          fogAreaIds: effect.fogAreaIds,
        });
        break;
      }
      case "teleport_token": {
        if (effect.toMapId && effect.toMapId !== mapId) {
          // Cross-map teleport — trigger map transition
          io.to(sessionId).emit("exploration:map-transition-start", {
            effect: "portal",
            targetMapId: effect.toMapId,
            targetMapName: "",
          });
        }
        await prisma.token.update({
          where: { id: effect.tokenId },
          data: { x: effect.toX, y: effect.toY },
        }).catch(() => {});
        io.to(sessionId).emit("token:moved", {
          tokenId: effect.tokenId,
          x: effect.toX,
          y: effect.toY,
          animate: true,
        });
        break;
      }
      case "move_token": {
        await prisma.token.update({
          where: { id: effect.tokenId },
          data: { x: effect.toX, y: effect.toY },
        }).catch(() => {});
        io.to(sessionId).emit("token:moved", {
          tokenId: effect.tokenId,
          x: effect.toX,
          y: effect.toY,
          animate: true,
        });
        break;
      }
      case "play_sound": {
        io.to(sessionId).emit("audio:play-effect", {
          soundId: effect.soundId,
          volume: effect.volume ?? 0.8,
        });
        break;
      }
      case "broadcast_message": {
        io.to(sessionId).emit("exploration:narrative", {
          message: effect.message,
          channel: effect.channel,
        });
        break;
      }
      case "start_dialogue": {
        io.to(sessionId).emit("exploration:dialogue-started", {
          npcName: effect.npcName,
          portrait: effect.portrait,
          dialogue: effect.dialogue,
        });
        break;
      }
      case "reveal_content":
      case "spawn_token":
      case "remove_token":
      case "apply_damage":
      case "trigger_zone":
      case "update_object_state":
        // These effects need more complex handling — logged for now
        break;
    }
  }
}
