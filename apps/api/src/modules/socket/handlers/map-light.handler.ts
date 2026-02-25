import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerMapLightHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  async function assertGm(): Promise<boolean> {
    if (!socket.ctx.sessionId) return false;
    const player = await prisma.sessionPlayer.findUnique({
      where: { userId_sessionId: { userId: socket.ctx.userId, sessionId: socket.ctx.sessionId } },
    });
    return !!player && ["GM", "CO_GM"].includes(player.role);
  }

  // Real-time light toggle
  socket.on("light:toggle" as any, async (data: { lightId: string }) => {
    if (!await assertGm()) return;

    try {
      const light = await prisma.lightSource.findUnique({ where: { id: data.lightId } });
      if (!light) return;

      const updated = await prisma.lightSource.update({
        where: { id: data.lightId },
        data: { isEnabled: !light.isEnabled },
      });

      io.to(socket.ctx.sessionId!).emit("light:updated" as any, {
        lightId: updated.id,
        mapId: updated.mapId,
        isEnabled: updated.isEnabled,
      });
    } catch {
      // Light may not exist
    }
  });
}
