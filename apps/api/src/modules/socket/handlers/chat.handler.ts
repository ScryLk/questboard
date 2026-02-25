import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";
import { checkPermission } from "@questboard/shared";
import type { PlayerRole, ChatChannel } from "@questboard/shared";

const CHANNEL_PERMISSION_MAP: Record<string, string> = {
  GENERAL: "chat:send-general",
  IN_CHARACTER: "chat:send-in-character",
  WHISPER: "chat:send-whisper",
  GM_ONLY: "chat:send-gm-only",
  GROUP: "chat:send-narrative",
};

export function registerChatHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  socket.on("chat:send", async (data, ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    const permAction = CHANNEL_PERMISSION_MAP[data.channel] ?? "chat:send-general";
    if (!checkPermission(permAction, socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão neste canal" } });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: socket.ctx.userId },
        select: { displayName: true, avatarUrl: true },
      });

      const messageDTO = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        channel: data.channel as ChatChannel,
        content: data.content,
        type: "TEXT" as const,
        metadata: null,
        userId: socket.ctx.userId,
        displayName: user?.displayName ?? "Unknown",
        avatarUrl: user?.avatarUrl ?? null,
        targetId: data.targetId ?? null,
        createdAt: new Date().toISOString(),
      };

      if (data.channel === "WHISPER" && data.targetId) {
        // Send whisper only to target and sender
        const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
        for (const s of sockets) {
          const ctx = (s as any).ctx;
          if (ctx && (ctx.userId === data.targetId || ctx.userId === socket.ctx.userId)) {
            s.emit("chat:message", messageDTO);
          }
        }
        // Also send to GMs
        for (const s of sockets) {
          const ctx = (s as any).ctx;
          if (ctx && ["GM", "CO_GM"].includes(ctx.role) && ctx.userId !== socket.ctx.userId) {
            s.emit("chat:message", messageDTO);
          }
        }
      } else if (data.channel === "GM_ONLY") {
        // Send only to GMs and CO_GMs
        const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
        for (const s of sockets) {
          const ctx = (s as any).ctx;
          if (ctx && ["GM", "CO_GM"].includes(ctx.role)) {
            s.emit("chat:message", messageDTO);
          }
        }
      } else {
        io.to(socket.ctx.sessionId).emit("chat:message", messageDTO);
      }

      // Update stats
      await prisma.sessionPlayer.updateMany({
        where: { userId: socket.ctx.userId, sessionId: socket.ctx.sessionId },
        data: { totalMessages: { increment: 1 } },
      });

      ack({ success: true, data: messageDTO });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao enviar mensagem" } });
    }
  });

  socket.on("chat:typing", (data) => {
    if (!socket.ctx.sessionId) return;

    socket.to(socket.ctx.sessionId).emit("chat:typing", {
      userId: socket.ctx.userId,
      channel: data.channel as ChatChannel,
    });
  });
}
