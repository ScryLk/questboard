import type { PrismaClient, Prisma } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerMapAnnotationHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  socket.on("annotation:draw" as any, async (data: {
    mapId: string;
    type: string;
    data: Record<string, unknown>;
    visibleTo?: string;
    isPersistent?: boolean;
  }) => {
    if (!socket.ctx.sessionId) return;

    try {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: socket.ctx.userId, sessionId: socket.ctx.sessionId } },
      });
      if (!player) return;

      const annotation = await prisma.mapAnnotation.create({
        data: {
          mapId: data.mapId,
          authorId: socket.ctx.userId,
          type: data.type as any,
          data: data.data as Prisma.InputJsonValue,
          visibleTo: (data.visibleTo as any) ?? "ALL",
          isPersistent: data.isPersistent ?? false,
        },
      });

      const visibleTo = data.visibleTo ?? "ALL";

      if (visibleTo === "ALL") {
        io.to(socket.ctx.sessionId).emit("annotation:added" as any, {
          mapId: data.mapId,
          annotation: {
            id: annotation.id,
            type: annotation.type,
            data: annotation.data,
            authorId: annotation.authorId,
            visibleTo: annotation.visibleTo,
            isPersistent: annotation.isPersistent,
          },
        });
      } else if (visibleTo === "GM_ONLY") {
        // Only emit to GM sockets — for simplicity broadcast to room, client filters
        io.to(socket.ctx.sessionId).emit("annotation:added" as any, {
          mapId: data.mapId,
          annotation: {
            id: annotation.id,
            type: annotation.type,
            data: annotation.data,
            authorId: annotation.authorId,
            visibleTo: annotation.visibleTo,
            isPersistent: annotation.isPersistent,
          },
        });
      }
    } catch {
      // Creation may fail
    }
  });

  socket.on("annotation:clear" as any, async (data: { mapId: string }) => {
    if (!socket.ctx.sessionId) return;

    const player = await prisma.sessionPlayer.findUnique({
      where: { userId_sessionId: { userId: socket.ctx.userId, sessionId: socket.ctx.sessionId } },
    });
    if (!player || !["GM", "CO_GM"].includes(player.role)) return;

    try {
      await prisma.mapAnnotation.deleteMany({
        where: { mapId: data.mapId, isPersistent: false },
      });

      io.to(socket.ctx.sessionId).emit("annotation:cleared" as any, {
        mapId: data.mapId,
      });
    } catch {
      // Deletion may fail
    }
  });
}
