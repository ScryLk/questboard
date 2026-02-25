import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerMapWallHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  socket.on("wall:toggle-door" as any, async (data: { wallId: string; doorState: string }) => {
    if (!socket.ctx.sessionId) return;

    try {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: socket.ctx.userId, sessionId: socket.ctx.sessionId } },
      });
      if (!player) return;

      const wall = await prisma.wall.findUnique({ where: { id: data.wallId } });
      if (!wall || !wall.isDoor) return;

      const isGm = ["GM", "CO_GM"].includes(player.role);

      // Only GM can lock/secret doors
      if (!isGm && (data.doorState === "LOCKED" || data.doorState === "SECRET")) return;
      if (!isGm && wall.doorLocked) return;

      const updated = await prisma.wall.update({
        where: { id: data.wallId },
        data: {
          doorState: data.doorState as any,
          doorLocked: data.doorState === "LOCKED",
        },
      });

      io.to(socket.ctx.sessionId).emit("wall:door-toggled" as any, {
        wallId: updated.id,
        mapId: updated.mapId,
        doorState: updated.doorState,
        doorLocked: updated.doorLocked,
      });
    } catch {
      // Wall may not exist
    }
  });
}
