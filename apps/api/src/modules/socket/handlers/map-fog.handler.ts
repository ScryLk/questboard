import type { PrismaClient, Prisma } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerMapFogHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  async function assertGm(): Promise<boolean> {
    if (!socket.ctx.sessionId) return false;
    const player = await prisma.sessionPlayer.findUnique({
      where: { userId_sessionId: { userId: socket.ctx.userId, sessionId: socket.ctx.sessionId } },
    });
    return !!player && ["GM", "CO_GM"].includes(player.role);
  }

  socket.on("fog:reveal" as any, async (data: { mapId: string; fogAreaId: string }) => {
    if (!await assertGm()) return;

    try {
      const area = await prisma.fogArea.update({
        where: { id: data.fogAreaId },
        data: { isRevealed: true },
      });

      io.to(socket.ctx.sessionId!).emit("fog:area-updated" as any, {
        fogAreaId: area.id,
        mapId: data.mapId,
        isRevealed: true,
      });
    } catch {
      // Area may not exist
    }
  });

  socket.on("fog:hide" as any, async (data: { mapId: string; fogAreaId: string }) => {
    if (!await assertGm()) return;

    try {
      const area = await prisma.fogArea.update({
        where: { id: data.fogAreaId },
        data: { isRevealed: false },
      });

      io.to(socket.ctx.sessionId!).emit("fog:area-updated" as any, {
        fogAreaId: area.id,
        mapId: data.mapId,
        isRevealed: false,
      });
    } catch {
      // Area may not exist
    }
  });

  socket.on("fog:batch-reveal" as any, async (data: { mapId: string; fogAreaIds: string[] }) => {
    if (!await assertGm()) return;

    try {
      await prisma.fogArea.updateMany({
        where: { id: { in: data.fogAreaIds } },
        data: { isRevealed: true },
      });

      io.to(socket.ctx.sessionId!).emit("fog:batch-revealed" as any, {
        mapId: data.mapId,
        fogAreaIds: data.fogAreaIds,
      });
    } catch {
      // Batch may fail
    }
  });

  socket.on("fog:reveal-at" as any, async (data: { mapId: string; x: number; y: number; radius: number }) => {
    if (!await assertGm()) return;

    try {
      // Create a revealed circle fog area at the given position
      const area = await prisma.fogArea.create({
        data: {
          mapId: data.mapId,
          shapeType: "CIRCLE",
          geometry: { cx: data.x, cy: data.y, radius: data.radius } as Prisma.InputJsonValue,
          isRevealed: true,
        },
      });

      io.to(socket.ctx.sessionId!).emit("fog:auto-reveal" as any, {
        mapId: data.mapId,
        x: data.x,
        y: data.y,
        radius: data.radius,
        fogAreaId: area.id,
      });
    } catch {
      // Creation may fail
    }
  });
}
