import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerModerationHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  // ── Mute User ──

  socket.on("moderation:mute", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem silenciar usuários" } });
    }

    try {
      // Check target isn't a GM
      const target = await prisma.sessionPlayer.findFirst({
        where: { sessionId: socket.ctx.sessionId, userId: data.userId },
      });
      if (!target) return ack({ success: false, error: { code: "NOT_FOUND", message: "Jogador não encontrado" } });
      if (["GM", "CO_GM"].includes(target.role)) {
        return ack({ success: false, error: { code: "FORBIDDEN", message: "Não é possível silenciar outro GM" } });
      }

      const expiresAt = data.duration && data.duration > 0
        ? new Date(Date.now() + data.duration * 1000)
        : null;

      await prisma.chatModeration.create({
        data: {
          sessionId: socket.ctx.sessionId,
          userId: data.userId,
          action: data.duration ? "TEMP_MUTE" : "MUTE",
          reason: data.reason,
          status: "ACTIVE",
          expiresAt,
          performedById: socket.ctx.userId,
        },
      });

      await prisma.sessionPlayer.updateMany({
        where: { sessionId: socket.ctx.sessionId, userId: data.userId },
        data: { isMuted: true },
      });

      // Notify the muted user
      const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
      for (const s of sockets) {
        const ctx = (s as any).ctx;
        if (ctx?.userId === data.userId) {
          s.emit("moderation:muted", {
            duration: data.duration,
            reason: data.reason,
          });
        }
      }

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao silenciar usuário" } });
    }
  });

  // ── Unmute User ──

  socket.on("moderation:unmute", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem remover silenciamento" } });
    }

    try {
      await prisma.chatModeration.updateMany({
        where: {
          sessionId: socket.ctx.sessionId,
          userId: data.userId,
          action: { in: ["MUTE", "TEMP_MUTE"] },
          status: "ACTIVE",
        },
        data: {
          status: "REVOKED",
          resolvedById: socket.ctx.userId,
          resolvedAt: new Date(),
        },
      });

      await prisma.sessionPlayer.updateMany({
        where: { sessionId: socket.ctx.sessionId, userId: data.userId },
        data: { isMuted: false },
      });

      // Notify the unmuted user
      const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
      for (const s of sockets) {
        const ctx = (s as any).ctx;
        if (ctx?.userId === data.userId) {
          s.emit("moderation:unmuted");
        }
      }

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao remover silenciamento" } });
    }
  });

  // ── Review Flagged Content ──

  socket.on("moderation:review", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem revisar conteúdo" } });
    }

    try {
      const moderation = await prisma.chatModeration.findFirst({
        where: { id: data.moderationId, sessionId: socket.ctx.sessionId },
      });
      if (!moderation) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "Registro não encontrado" } });
      }

      await prisma.chatModeration.update({
        where: { id: data.moderationId },
        data: {
          status: "REVIEWED",
          resolvedById: socket.ctx.userId,
          resolvedAt: new Date(),
        },
      });

      // If rejected and message exists, delete it
      if (!data.approved && moderation.messageId) {
        await prisma.chatMessage.update({
          where: { id: moderation.messageId },
          data: { isDeleted: true, content: "[mensagem removida por moderação]" },
        });

        io.to(socket.ctx.sessionId).emit("chat:message-deleted", {
          messageId: moderation.messageId,
        });
      }

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao revisar conteúdo" } });
    }
  });

  // ── Slow Mode ──

  socket.on("moderation:slow-mode", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem configurar slow mode" } });
    }

    try {
      // Store slow mode config in session settings
      const session = await prisma.session.findUnique({
        where: { id: socket.ctx.sessionId },
        select: { settings: true },
      });

      const settings = (session?.settings as Record<string, unknown>) ?? {};
      const slowMode = (settings["slowMode"] as Record<string, number>) ?? {};
      slowMode[data.channel] = data.seconds;
      settings["slowMode"] = slowMode;

      await prisma.session.update({
        where: { id: socket.ctx.sessionId },
        data: { settings },
      });

      // Notify all players about slow mode change
      io.to(socket.ctx.sessionId).emit("session:settings-updated", {
        changes: { slowMode },
        changedBy: socket.ctx.userId,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao configurar slow mode" } });
    }
  });
}
