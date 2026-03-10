import type { Namespace, Socket } from "socket.io";
import { redis } from "../../lib/redis.js";
import { prisma } from "@questboard/db";

export function registerSessionHandler(nsp: Namespace, socket: Socket): void {
  const user = socket.data.user;

  socket.on("session:join", async (sessionId: string) => {
    // Verify player belongs to session
    const player = await prisma.sessionPlayer.findUnique({
      where: { userId_sessionId: { userId: user.id, sessionId } },
    });
    if (!player) {
      socket.emit("error", { message: "Não pertence a esta sessão" });
      return;
    }

    socket.data.sessionId = sessionId;
    await socket.join(`session:${sessionId}`);

    // Update presence in Redis
    await redis.hset(`session:${sessionId}:presence`, user.id, JSON.stringify({
      socketId: socket.id,
      isOnline: true,
      displayName: user.displayName,
      joinedAt: Date.now(),
    }));

    // Update DB
    await prisma.sessionPlayer.update({
      where: { id: player.id },
      data: { isOnline: true, lastSeenAt: new Date() },
    });

    nsp.to(`session:${sessionId}`).emit("presence:joined", {
      userId: user.id,
      displayName: user.displayName,
    });
  });

  socket.on("session:leave", async () => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    await handleDisconnect(nsp, socket, sessionId);
  });

  socket.on("disconnect", async () => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    await handleDisconnect(nsp, socket, sessionId);
  });

  socket.on("presence:update", async (data: { status?: string }) => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    nsp.to(`session:${sessionId}`).emit("presence:updated", {
      userId: user.id,
      ...data,
    });
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
