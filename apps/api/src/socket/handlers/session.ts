import type { Namespace, Socket } from "socket.io";
import { redis } from "../../lib/redis.js";
import { prisma } from "@questboard/db";
import {
  emitPlayerConnected,
  emitPlayerDisconnected,
  emitPlayerForceResync,
} from "../../lib/socket-events.js";
import { syncPlayerTokenOnConnect } from "../../modules/sessions/sessions.service.js";

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
    // Evento canônico do CLAUDE.md §8 (frontend novo escuta esse;
    // presence:joined fica como compat até migrar).
    emitPlayerConnected({
      sessionId,
      userId: user.id,
      at: new Date().toISOString(),
    });

    // Backfill defensivo: tokens criados antes do fix de HP têm
    // currentHp/maxHp nulos. Reconnects não passam pelo REST join,
    // então sem isso esses tokens nunca se autocorrigem. Fire-and-
    // forget pra não atrasar a confirmação do join.
    void syncPlayerTokenOnConnect(prisma, sessionId, user.id).catch(
      (err) => {
        console.warn("[session:join] syncPlayerTokenOnConnect falhou:", err);
      },
    );
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

  // GM dispara resync de um jogador travado. Backend regaranta o token
  // (idempotente — backfila HP/recria se sumiu) e avisa a sala; o
  // client cujo userId === targetUserId reage recarregando a página.
  socket.on(
    "session:request-resync",
    async (data: { sessionId?: string; targetUserId?: string }) => {
      const sessionId = data?.sessionId ?? socket.data.sessionId;
      const targetUserId = data?.targetUserId;
      if (!sessionId || !targetUserId) {
        socket.emit("error", { message: "Payload inválido" });
        return;
      }

      const requester = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: user.id, sessionId } },
        select: { role: true },
      });
      if (!requester || (requester.role !== "GM" && requester.role !== "CO_GM")) {
        socket.emit("error", {
          message: "Apenas GM/CO-GM pode ressincronizar jogadores",
        });
        return;
      }

      try {
        await syncPlayerTokenOnConnect(prisma, sessionId, targetUserId);
      } catch (err) {
        console.warn("[session:request-resync] sync falhou:", err);
      }

      emitPlayerForceResync({
        sessionId,
        targetUserId,
        by: user.id,
        at: new Date().toISOString(),
      });
    },
  );
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
  // Evento canônico do CLAUDE.md §8 (`player:disconnected`).
  emitPlayerDisconnected({
    sessionId,
    userId: user.id,
    at: new Date().toISOString(),
  });
}
