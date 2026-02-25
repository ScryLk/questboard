import type { PrismaClient, Prisma } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";
import { processExplorationMove, processCombatMove } from "@questboard/game-engine";
import { randomUUID } from "node:crypto";

// In-memory store for pending move requests (GM approval flow)
const pendingMoveRequests = new Map<string, {
  userId: string;
  tokenId: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  path: Array<{ x: number; y: number }>;
  sessionId: string;
  timestamp: number;
}>();

// Clean up old requests every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, req] of pendingMoveRequests) {
    if (now - req.timestamp > 300_000) {
      pendingMoveRequests.delete(id);
    }
  }
}, 300_000);

export function registerExplorationMovementHandlers(
  io: TypedIO,
  socket: TypedSocket,
  prisma: PrismaClient
) {
  async function getMapState(mapId: string) {
    const [walls, zones, objects] = await Promise.all([
      prisma.wall.findMany({ where: { mapId } }),
      prisma.mapZone.findMany({ where: { mapId, isActive: true } }),
      prisma.interactiveObject.findMany({
        where: { mapId, isActive: true },
        include: { token: true },
      }),
    ]);

    const map = await prisma.map.findUnique({ where: { id: mapId } });

    return {
      gridType: map?.gridType ?? "SQUARE",
      cellsWide: map?.cellsWide ?? 40,
      cellsHigh: map?.cellsHigh ?? 30,
      walls: walls.map((w) => ({
        x1: w.x1, y1: w.y1, x2: w.x2, y2: w.y2,
        blocksMovement: w.blocksMovement,
        blocksVision: w.blocksVision,
        isDoor: w.isDoor,
        doorState: w.doorState ?? "CLOSED",
      })),
      zones: zones.map((z) => ({
        id: z.id,
        zoneType: z.zoneType,
        shapeType: z.shapeType,
        geometry: z.geometry as Record<string, unknown>,
        properties: z.properties as Record<string, unknown>,
        isActive: z.isActive,
      })),
      interactiveObjects: objects.map((o) => ({
        id: o.id,
        tokenId: o.tokenId,
        interactionType: o.interactionType,
        interactionRange: o.interactionRange,
        requiresLineOfSight: o.requiresLineOfSight,
        isActive: o.isActive,
        isHidden: o.isHidden,
        hasBeenUsed: o.hasBeenUsed,
        interactionIcon: o.interactionIcon,
        x: o.token?.x ?? 0,
        y: o.token?.y ?? 0,
      })),
    };
  }

  async function getExplorationSettings(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { settings: true },
    });
    const settings = (session?.settings as Record<string, unknown>) ?? {};
    return (settings.exploration as Record<string, unknown>) ?? {
      playerTokenControl: "free",
    };
  }

  socket.on("exploration:request-move", async (data) => {
    if (!socket.ctx.sessionId) return;
    const sessionId = socket.ctx.sessionId;

    try {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: socket.ctx.userId, sessionId } },
      });
      if (!player) return;

      const token = await prisma.token.findUnique({ where: { id: data.tokenId } });
      if (!token) return;

      const isGm = ["GM", "CO_GM"].includes(player.role);
      const isOwner = token.ownerId === socket.ctx.userId;
      if (!isGm && !isOwner) return;

      // Get active map
      const activeMap = await prisma.map.findFirst({
        where: { sessionId, isActive: true, deletedAt: null },
      });
      if (!activeMap || token.mapId !== activeMap.id) return;

      const mapState = await getMapState(activeMap.id);
      const explorationSettings = await getExplorationSettings(sessionId);

      // Check game mode (exploration vs combat)
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { settings: true },
      });
      const sessionSettings = (session?.settings as Record<string, unknown>) ?? {};
      const gameMode = (sessionSettings.gameMode as string) ?? "exploration";

      let moveResult;
      if (gameMode === "combat") {
        // In combat mode, check speed budget
        const combatBudget = (token as Record<string, unknown>).speed as number ?? 6;
        moveResult = processCombatMove(
          { id: token.id, x: token.x, y: token.y, width: token.width, height: token.height, ownerId: token.ownerId ?? "" },
          { x: data.x, y: data.y },
          combatBudget,
          mapState
        );
      } else {
        moveResult = processExplorationMove(
          { id: token.id, x: token.x, y: token.y, width: token.width, height: token.height, ownerId: token.ownerId ?? "" },
          { x: data.x, y: data.y },
          mapState
        );
      }

      if (!moveResult.valid) {
        socket.emit("token:move-rejected", {
          tokenId: data.tokenId,
          reason: moveResult.blockedReason ?? "invalid",
        });
        return;
      }

      // Check if GM approval is required
      const controlMode = explorationSettings.playerTokenControl as string ?? "free";
      if (!isGm && controlMode === "gm_approval") {
        const requestId = randomUUID();
        pendingMoveRequests.set(requestId, {
          userId: socket.ctx.userId,
          tokenId: data.tokenId,
          from: { x: token.x, y: token.y },
          to: moveResult.finalPosition,
          path: moveResult.path,
          sessionId,
          timestamp: Date.now(),
        });

        // Notify GMs about the move request
        io.to(sessionId).emit("exploration:move-requested", {
          requestId,
          userId: socket.ctx.userId,
          tokenId: data.tokenId,
          from: { x: token.x, y: token.y },
          to: moveResult.finalPosition,
          path: moveResult.path,
        });
        return;
      }

      // Free movement — apply immediately
      await applyMove(prisma, io, sessionId, activeMap.id, socket.ctx.userId, token, moveResult);
    } catch {
      // Silently fail
    }
  });

  socket.on("exploration:approve-move", async (data) => {
    if (!socket.ctx.sessionId) return;
    const sessionId = socket.ctx.sessionId;

    try {
      // Only GM/CO_GM can approve
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: socket.ctx.userId, sessionId } },
      });
      if (!player || !["GM", "CO_GM"].includes(player.role)) return;

      const request = pendingMoveRequests.get(data.requestId);
      if (!request || request.sessionId !== sessionId) return;
      pendingMoveRequests.delete(data.requestId);

      const token = await prisma.token.findUnique({ where: { id: request.tokenId } });
      if (!token) return;

      const activeMap = await prisma.map.findFirst({
        where: { sessionId, isActive: true, deletedAt: null },
      });
      if (!activeMap) return;

      const moveResult = {
        valid: true as const,
        finalPosition: request.to,
        path: request.path,
        distance: Math.sqrt((request.to.x - request.from.x) ** 2 + (request.to.y - request.from.y) ** 2),
        zonesEntered: [] as Array<{ zoneId: string; zoneType: string; effect: Record<string, unknown> }>,
        zonesExited: [] as string[],
        trapsTriggered: [] as Array<{ objectId: string; trapData: Record<string, unknown> }>,
        nearbyInteractions: [] as Array<{ objectId: string; tokenId: string; interactionType: string; distance: number; icon: string }>,
      };

      await applyMove(prisma, io, sessionId, activeMap.id, request.userId, token, moveResult);

      io.to(sessionId).emit("exploration:move-approved", {
        requestId: data.requestId,
        tokenId: request.tokenId,
        path: request.path,
      });
    } catch {
      // Silently fail
    }
  });

  socket.on("exploration:deny-move", async (data) => {
    if (!socket.ctx.sessionId) return;
    const sessionId = socket.ctx.sessionId;

    try {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: socket.ctx.userId, sessionId } },
      });
      if (!player || !["GM", "CO_GM"].includes(player.role)) return;

      const request = pendingMoveRequests.get(data.requestId);
      if (!request || request.sessionId !== sessionId) return;
      pendingMoveRequests.delete(data.requestId);

      io.to(sessionId).emit("exploration:move-denied", {
        requestId: data.requestId,
        reason: data.reason,
      });
    } catch {
      // Silently fail
    }
  });

  socket.on("exploration:examine-area", async (data) => {
    if (!socket.ctx.sessionId) return;
    const sessionId = socket.ctx.sessionId;

    try {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: socket.ctx.userId, sessionId } },
      });
      if (!player) return;

      const activeMap = await prisma.map.findFirst({
        where: { sessionId, isActive: true, deletedAt: null },
      });
      if (!activeMap) return;

      // Find interactive objects near the examined area
      const objects = await prisma.interactiveObject.findMany({
        where: { mapId: activeMap.id, isActive: true, isHidden: false },
        include: { token: true },
      });

      const EXAMINE_RANGE = 3;
      const nearby = objects.filter((o) => {
        if (!o.token) return false;
        const dist = Math.sqrt((data.x - o.token.x) ** 2 + (data.y - o.token.y) ** 2);
        return dist <= EXAMINE_RANGE;
      });

      if (nearby.length > 0) {
        socket.emit("exploration:interaction-available", {
          objects: nearby.map((o) => ({
            objectId: o.id,
            tokenId: o.tokenId,
            interactionType: o.interactionType as any,
            icon: o.interactionIcon ?? "eye",
            position: { x: o.token!.x, y: o.token!.y },
            distance: Math.sqrt((data.x - o.token!.x) ** 2 + (data.y - o.token!.y) ** 2),
          })),
        });
      }

      // Check zones at the examined area
      const zones = await prisma.mapZone.findMany({
        where: { mapId: activeMap.id, isActive: true, zoneType: "NARRATIVE" },
      });

      for (const zone of zones) {
        const geom = zone.geometry as Record<string, unknown>;
        const inZone = isPointInGeometry(data, zone.shapeType, geom);
        if (inZone && zone.name) {
          socket.emit("exploration:narrative", {
            message: zone.description ?? zone.name,
            channel: "examine",
            causedBy: socket.ctx.userId,
          });
          break;
        }
      }

      // Log examine event
      await prisma.explorationLog.create({
        data: {
          sessionId,
          mapId: activeMap.id,
          userId: socket.ctx.userId,
          event: "OBJECT_INTERACTION",
          data: {
            action: "examine_area",
            x: data.x,
            y: data.y,
            foundObjects: nearby.length,
          } as Prisma.InputJsonValue,
        },
      });
    } catch {
      // Silently fail
    }
  });

  socket.on("exploration:ping-location", async (data) => {
    if (!socket.ctx.sessionId) return;

    // Broadcast ping to all players in session
    io.to(socket.ctx.sessionId).emit("exploration:narrative", {
      message: `📍 ${data.type}`,
      channel: "ping",
      causedBy: socket.ctx.userId,
    });
  });
}

async function applyMove(
  prisma: PrismaClient,
  io: TypedIO,
  sessionId: string,
  mapId: string,
  userId: string,
  token: { id: string; x: number; y: number },
  moveResult: {
    valid: boolean;
    finalPosition: { x: number; y: number };
    path: Array<{ x: number; y: number }>;
    distance: number;
    zonesEntered: Array<{ zoneId: string; zoneType: string; effect: Record<string, unknown> }>;
    zonesExited: string[];
    trapsTriggered: Array<{ objectId: string; trapData: Record<string, unknown> }>;
    nearbyInteractions: Array<{ objectId: string; tokenId: string; interactionType: string; distance: number; icon: string }>;
  }
) {
  // Update token position in DB
  await prisma.token.update({
    where: { id: token.id },
    data: { x: moveResult.finalPosition.x, y: moveResult.finalPosition.y },
  });

  // Broadcast movement
  io.to(sessionId).emit("token:moved", {
    tokenId: token.id,
    x: moveResult.finalPosition.x,
    y: moveResult.finalPosition.y,
    animate: true,
  });

  // Broadcast trail update
  io.to(sessionId).emit("exploration:trail-updated", {
    userId,
    point: moveResult.finalPosition,
  });

  // Handle zone entries
  for (const zone of moveResult.zonesEntered) {
    io.to(sessionId).emit("exploration:zone-entered", {
      zoneId: zone.zoneId,
      zoneName: (zone.effect as Record<string, unknown>).name as string ?? "",
      zoneType: zone.zoneType as any,
      description: (zone.effect as Record<string, unknown>).description as string,
      overlayColor: (zone.effect as Record<string, unknown>).overlayColor as string,
    });

    // Apply zone effects
    if (zone.zoneType === "AMBIENT_SOUND") {
      const soundId = (zone.effect as Record<string, unknown>).soundId as string;
      if (soundId) {
        io.to(sessionId).emit("audio:ambient-zone-entered", {
          soundId,
          volume: (zone.effect as Record<string, unknown>).volume as number ?? 0.5,
          fadeIn: (zone.effect as Record<string, unknown>).fadeIn as number ?? 1000,
        });
      }
    }

    if (zone.zoneType === "NARRATIVE") {
      const message = (zone.effect as Record<string, unknown>).narrativeText as string;
      if (message) {
        io.to(sessionId).emit("exploration:narrative", {
          message,
          channel: "zone",
          causedBy: userId,
        });
      }
    }

    if (zone.zoneType === "HAZARD") {
      io.to(sessionId).emit("exploration:zone-effect", {
        zoneId: zone.zoneId,
        effect: "hazard",
        details: zone.effect,
      });
    }
  }

  // Handle zone exits — ambient sound fade out
  for (const zoneId of moveResult.zonesExited) {
    const zone = await prisma.mapZone.findUnique({ where: { id: zoneId } });
    if (zone?.zoneType === "AMBIENT_SOUND") {
      const props = zone.properties as Record<string, unknown>;
      io.to(sessionId).emit("audio:ambient-zone-exited", {
        soundId: (props.soundId as string) ?? "",
        fadeOut: (props.fadeOut as number) ?? 1000,
      });
    }
  }

  // Handle traps
  for (const trap of moveResult.trapsTriggered) {
    await prisma.interactiveObject.update({
      where: { id: trap.objectId },
      data: { hasBeenUsed: true, usedById: userId, usedAt: new Date() },
    }).catch(() => {});

    io.to(sessionId).emit("exploration:interaction-result", {
      objectId: trap.objectId,
      userId,
      success: true,
      message: "Trap triggered!",
      effects: [{ type: "apply_damage" }],
    });
  }

  // Notify about nearby interactions
  if (moveResult.nearbyInteractions.length > 0) {
    // Send only to the moving player
    const sockets = await io.in(sessionId).fetchSockets();
    const playerSocket = sockets.find((s) => s.ctx?.userId === userId);
    if (playerSocket) {
      playerSocket.emit("exploration:interaction-available", {
        objects: moveResult.nearbyInteractions.map((obj) => ({
          objectId: obj.objectId,
          tokenId: obj.tokenId,
          interactionType: obj.interactionType as any,
          icon: obj.icon,
          position: { x: 0, y: 0 }, // Client can look up from object token
          distance: obj.distance,
        })),
      });
    }
  }

  // Log the movement
  await prisma.explorationLog.create({
    data: {
      sessionId,
      mapId,
      userId,
      event: "TOKEN_MOVE",
      data: {
        tokenId: token.id,
        from: { x: token.x, y: token.y },
        to: moveResult.finalPosition,
        distance: moveResult.distance,
        zonesEntered: moveResult.zonesEntered.map((z) => z.zoneId),
        trapsTriggered: moveResult.trapsTriggered.map((t) => t.objectId),
      } as Prisma.InputJsonValue,
    },
  });
}

function isPointInGeometry(
  point: { x: number; y: number },
  shapeType: string,
  geometry: Record<string, unknown>
): boolean {
  if (shapeType === "rectangle") {
    const x = (geometry.x as number) ?? 0;
    const y = (geometry.y as number) ?? 0;
    const w = (geometry.width as number) ?? 0;
    const h = (geometry.height as number) ?? 0;
    return point.x >= x && point.x < x + w && point.y >= y && point.y < y + h;
  }
  if (shapeType === "circle") {
    const cx = (geometry.centerX as number) ?? 0;
    const cy = (geometry.centerY as number) ?? 0;
    const r = (geometry.radius as number) ?? 0;
    return (point.x - cx) ** 2 + (point.y - cy) ** 2 <= r * r;
  }
  return false;
}
