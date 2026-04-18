import type { Namespace, Socket } from "socket.io";
import { redis } from "../../lib/redis.js";
import { prisma } from "@questboard/db";

const DISCONNECT_GRACE_MS = 15_000;
const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function registerSessionHandler(nsp: Namespace, socket: Socket): void {
  const user = socket.data.user;

  socket.on("session:join", async (sessionId: string) => {
    try {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: user.id, sessionId } },
      });
      if (!player) {
        socket.emit("error", { message: "Não pertence a esta sessão" });
        return;
      }

      socket.data.sessionId = sessionId;
      await socket.join(`session:${sessionId}`);

      const timerKey = `${sessionId}:${user.id}`;
      const pendingTimer = disconnectTimers.get(timerKey);
      if (pendingTimer) {
        clearTimeout(pendingTimer);
        disconnectTimers.delete(timerKey);
      }

      await redis.hset(`session:${sessionId}:presence`, user.id, JSON.stringify({
        socketId: socket.id,
        isOnline: true,
        displayName: user.displayName,
        joinedAt: Date.now(),
      }));

      await prisma.sessionPlayer.update({
        where: { id: player.id },
        data: { isOnline: true, lastSeenAt: new Date() },
      });

      nsp.to(`session:${sessionId}`).emit("presence:joined", {
        userId: user.id,
        displayName: user.displayName,
      });
    } catch (err) {
      console.error("[session:join] Error:", err);
    }
  });

  socket.on("session:leave", async () => {
    try {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      await handleDisconnect(nsp, socket, sessionId);
    } catch (err) {
      console.error("[session:leave] Error:", err);
    }
  });

  socket.on("disconnect", () => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    const timerKey = `${sessionId}:${user.id}`;

    if (disconnectTimers.has(timerKey)) return;

    disconnectTimers.set(timerKey, setTimeout(async () => {
      disconnectTimers.delete(timerKey);
      try {
        await handleDisconnect(nsp, socket, sessionId);
      } catch (err) {
        console.error("[disconnect:grace] Error:", err);
      }
    }, DISCONNECT_GRACE_MS));
  });

  socket.on("presence:update", async (data: { status?: string }) => {
    try {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      nsp.to(`session:${sessionId}`).emit("presence:updated", {
        userId: user.id,
        status: data.status,
      });
    } catch (err) {
      console.error("[presence:update] Error:", err);
    }
  });
}

async function handleDisconnect(nsp: Namespace, socket: Socket, sessionId: string): Promise<void> {
  const user = socket.data.user;

  await redis.hdel(`session:${sessionId}:presence`, user.id);
  await socket.leave(`session:${sessionId}`);

  await prisma.sessionPlayer.updateMany({
    where: { sessionId, userId: user.id },
    data: { isOnline: false, lastSeenAt: new Date() },
  });

  nsp.to(`session:${sessionId}`).emit("presence:left", {
    userId: user.id,
    displayName: user.displayName,
  });
}
