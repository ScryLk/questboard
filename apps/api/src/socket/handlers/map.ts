import type { Namespace, Socket } from "socket.io";
import { prisma } from "@questboard/db";

export function registerMapHandler(nsp: Namespace, socket: Socket): void {
  socket.on("map:activated", async (data: { mapId: string }) => {
    try {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true } });
      if (session?.ownerId !== socket.data.user.id) return;

      nsp.to(`session:${sessionId}`).emit("map:activated", {
        mapId: data.mapId,
        activatedBy: socket.data.user.id,
      });
    } catch (err) {
      console.error("[map:activated] Error:", err);
    }
  });
}
