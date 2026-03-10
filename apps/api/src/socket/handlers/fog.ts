import type { Namespace, Socket } from "socket.io";
import { prisma } from "@questboard/db";
import { redis } from "../../lib/redis.js";

export function registerFogHandler(_nsp: Namespace, socket: Socket): void {
  socket.on("fog:updated", async (data: { mapId: string; fogData: unknown }) => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    // Only GM can update fog
    const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true } });
    if (session?.ownerId !== socket.data.user.id) return;

    // Cache in Redis for fast reads
    await redis.set(`session:${sessionId}:fog:${data.mapId}`, JSON.stringify(data.fogData));

    socket.to(`session:${sessionId}`).emit("fog:updated", {
      mapId: data.mapId,
      fogData: data.fogData,
    });
  });
}
