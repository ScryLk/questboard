import type { Namespace, Socket } from "socket.io";
import { redis } from "../../lib/redis.js";
import { prisma } from "@questboard/db";

async function isGM(socket: Socket, sessionId: string): Promise<boolean> {
  const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true } });
  return session?.ownerId === socket.data.user.id;
}

export function registerCombatHandler(nsp: Namespace, socket: Socket): void {
  socket.on("combat:started", async (data: { combatState: unknown }) => {
    try {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      if (!(await isGM(socket, sessionId))) return;

      await redis.set(`session:${sessionId}:combat`, JSON.stringify(data.combatState));
      nsp.to(`session:${sessionId}`).emit("combat:started", data);
    } catch (err) {
      console.error("[combat:started] Error:", err);
    }
  });

  socket.on("combat:turn-changed", async (data: { activeIndex: number; round: number }) => {
    try {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      if (!(await isGM(socket, sessionId))) return;

      nsp.to(`session:${sessionId}`).emit("combat:turn-changed", data);
    } catch (err) {
      console.error("[combat:turn-changed] Error:", err);
    }
  });

  socket.on("combat:participant-updated", async (data: { participantId: string; changes: Record<string, unknown> }) => {
    try {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      nsp.to(`session:${sessionId}`).emit("combat:participant-updated", data);
    } catch (err) {
      console.error("[combat:participant-updated] Error:", err);
    }
  });

  socket.on("combat:ended", async () => {
    try {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      if (!(await isGM(socket, sessionId))) return;

      await redis.del(`session:${sessionId}:combat`);
      nsp.to(`session:${sessionId}`).emit("combat:ended", {});
    } catch (err) {
      console.error("[combat:ended] Error:", err);
    }
  });
}
