import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";
import { checkPermission } from "@questboard/shared";
import type { PlayerRole } from "@questboard/shared";

export function registerSessionHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  socket.on("session:join", async (data, ack) => {
    try {
      const { sessionId, password } = data;

      const session = await prisma.session.findUnique({
        where: { id: sessionId, deletedAt: null },
        include: { combatState: true },
      });

      if (!session) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "Sessão não encontrada" } });
      }

      // Check if user is a player
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: socket.ctx.userId, sessionId } },
        include: {
          user: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
          character: { select: { id: true, name: true } },
        },
      });

      if (!player || player.isBanned) {
        return ack({ success: false, error: { code: "FORBIDDEN", message: "Não é membro desta sessão" } });
      }

      // Check password for private sessions
      if (session.type === "PRIVATE" && session.password && player.role === "PLAYER") {
        if (password !== session.password) {
          return ack({ success: false, error: { code: "FORBIDDEN", message: "Senha incorreta" } });
        }
      }

      // Leave previous session room if any
      if (socket.ctx.sessionId) {
        socket.leave(socket.ctx.sessionId);
        socket.to(socket.ctx.sessionId).emit("player:disconnected", {
          userId: socket.ctx.userId,
        });
      }

      // Join the session room
      socket.join(sessionId);
      socket.ctx.sessionId = sessionId;
      socket.ctx.role = player.role;

      // Mark player as connected
      await prisma.sessionPlayer.update({
        where: { userId_sessionId: { userId: socket.ctx.userId, sessionId } },
        data: { isConnected: true, lastConnectedAt: new Date() },
      });

      // Get all players
      const players = await prisma.sessionPlayer.findMany({
        where: { sessionId, isBanned: false },
        include: {
          user: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
          character: { select: { id: true, name: true } },
        },
      });

      const playerDTOs = players.map((p) => ({
        id: p.id,
        userId: p.user.id,
        displayName: p.user.displayName,
        username: p.user.username,
        avatarUrl: p.user.avatarUrl,
        role: p.role as PlayerRole,
        characterId: p.character?.id ?? null,
        characterName: p.character?.name ?? null,
        isConnected: p.isConnected,
        isMuted: p.isMuted,
        nickname: p.nickname,
        color: p.color,
        rsvpStatus: null,
        joinedAt: p.joinedAt.toISOString(),
      }));

      const currentPlayer = playerDTOs.find((p) => p.userId === socket.ctx.userId)!;

      // Notify others
      socket.to(sessionId).emit("player:connected", { userId: socket.ctx.userId });

      ack({
        success: true,
        data: {
          sessionId,
          player: currentPlayer,
          players: playerDTOs,
          combatState: session.combatState
            ? {
                id: session.combatState.id,
                sessionId: session.combatState.sessionId,
                isActive: session.combatState.isActive,
                round: session.combatState.round,
                turnIndex: session.combatState.turnIndex,
                initiativeOrder: session.combatState.initiativeOrder as any,
                combatLog: session.combatState.combatLog as any,
              }
            : null,
          activeMapId: null,
        },
      });
    } catch (error) {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao entrar na sessão" } });
    }
  });

  socket.on("session:leave", async () => {
    if (!socket.ctx.sessionId) return;

    const sessionId = socket.ctx.sessionId;

    await prisma.sessionPlayer.updateMany({
      where: { userId: socket.ctx.userId, sessionId },
      data: { isConnected: false },
    });

    socket.to(sessionId).emit("player:left", {
      userId: socket.ctx.userId,
      reason: "voluntary",
    });

    socket.leave(sessionId);
    socket.ctx.sessionId = null;
    socket.ctx.role = null;
  });

  socket.on("session:start", async (ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    if (!checkPermission("session:start", socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
    }

    try {
      await prisma.session.update({
        where: { id: socket.ctx.sessionId },
        data: { status: "LIVE", lastPlayedAt: new Date() },
      });

      io.to(socket.ctx.sessionId).emit("session:status-changed", {
        status: "LIVE" as any,
        changedBy: socket.ctx.userId,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao iniciar sessão" } });
    }
  });

  socket.on("session:pause", async (ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    if (!checkPermission("session:pause", socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
    }

    try {
      await prisma.session.update({
        where: { id: socket.ctx.sessionId },
        data: { status: "PAUSED" },
      });

      io.to(socket.ctx.sessionId).emit("session:status-changed", {
        status: "PAUSED" as any,
        changedBy: socket.ctx.userId,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao pausar sessão" } });
    }
  });

  socket.on("session:resume", async (ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    if (!checkPermission("session:resume", socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
    }

    try {
      await prisma.session.update({
        where: { id: socket.ctx.sessionId },
        data: { status: "LIVE", lastPlayedAt: new Date() },
      });

      io.to(socket.ctx.sessionId).emit("session:status-changed", {
        status: "LIVE" as any,
        changedBy: socket.ctx.userId,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao retomar sessão" } });
    }
  });

  socket.on("session:end", async (ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    if (!checkPermission("session:end", socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
    }

    try {
      await prisma.session.update({
        where: { id: socket.ctx.sessionId },
        data: { status: "ENDED", endedAt: new Date() },
      });

      io.to(socket.ctx.sessionId).emit("session:status-changed", {
        status: "ENDED" as any,
        changedBy: socket.ctx.userId,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao encerrar sessão" } });
    }
  });

  socket.on("player:kick", async (data, ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    if (!checkPermission("player:kick", socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
    }

    try {
      await prisma.sessionPlayer.update({
        where: { userId_sessionId: { userId: data.userId, sessionId: socket.ctx.sessionId } },
        data: { kickedAt: new Date(), kickReason: data.reason ?? null, isConnected: false },
      });

      io.to(socket.ctx.sessionId).emit("player:left", {
        userId: data.userId,
        reason: "kick",
      });

      // Disconnect the kicked player's socket
      const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
      for (const s of sockets) {
        if ((s as any).ctx?.userId === data.userId) {
          s.leave(socket.ctx.sessionId);
          (s as any).ctx.sessionId = null;
          (s as any).ctx.role = null;
        }
      }

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao expulsar jogador" } });
    }
  });

  socket.on("player:change-role", async (data, ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    if (!checkPermission("player:change-role", socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
    }

    try {
      await prisma.sessionPlayer.update({
        where: { userId_sessionId: { userId: data.userId, sessionId: socket.ctx.sessionId } },
        data: { role: data.role },
      });

      io.to(socket.ctx.sessionId).emit("player:role-changed", {
        userId: data.userId,
        newRole: data.role,
        changedBy: socket.ctx.userId,
      });

      // Update the target socket's context role
      const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
      for (const s of sockets) {
        if ((s as any).ctx?.userId === data.userId) {
          (s as any).ctx.role = data.role;
        }
      }

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao mudar cargo" } });
    }
  });

  socket.on("player:mute", async (data, ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    if (!checkPermission("player:mute", socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
    }

    try {
      await prisma.sessionPlayer.update({
        where: { userId_sessionId: { userId: data.userId, sessionId: socket.ctx.sessionId } },
        data: { isMuted: data.muted },
      });

      io.to(socket.ctx.sessionId).emit("player:muted", {
        userId: data.userId,
        muted: data.muted,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao mutar jogador" } });
    }
  });
}
