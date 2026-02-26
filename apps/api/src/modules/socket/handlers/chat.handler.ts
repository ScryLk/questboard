import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";
import type { ChatMessageDTO } from "@questboard/shared";
import { checkPermission } from "@questboard/shared";
import type { PlayerRole, ChatChannel } from "@questboard/shared";

const CHANNEL_PERMISSION_MAP: Record<string, string> = {
  GENERAL: "chat:send-general",
  IN_CHARACTER: "chat:send-in-character",
  NARRATOR: "chat:send-narrator",
  WHISPER: "chat:send-whisper",
  SECRET_NOTE: "chat:send-secret-note",
  GROUP: "chat:send-group",
  GM_ONLY: "chat:send-gm-only",
  ASYNC: "chat:send-async",
  SYSTEM: "chat:send-system",
};

export function registerChatHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  // ── Send Message ──

  socket.on("chat:send", async (data, ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    const permAction = CHANNEL_PERMISSION_MAP[data.channel] ?? "chat:send-general";
    if (!checkPermission(permAction, socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão neste canal" } });
    }

    try {
      // Check if user is muted
      const isMuted = await prisma.chatModeration.findFirst({
        where: {
          sessionId: socket.ctx.sessionId,
          userId: socket.ctx.userId,
          action: { in: ["MUTE", "TEMP_MUTE", "BAN_FROM_CHAT"] },
          status: "ACTIVE",
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });

      if (isMuted) {
        return ack({ success: false, error: { code: "MUTED", message: "Você está silenciado nesta sessão" } });
      }

      const user = await prisma.user.findUnique({
        where: { id: socket.ctx.userId },
        select: { displayName: true, avatarUrl: true },
      });

      // Resolve character info for IC messages
      let characterName: string | null = null;
      let characterAvatar: string | null = null;
      let authorType = "USER";

      if (data.channel === "IN_CHARACTER") {
        // Try to get character from session player
        const sp = await prisma.sessionPlayer.findFirst({
          where: { sessionId: socket.ctx.sessionId, userId: socket.ctx.userId },
          select: { characterId: true },
        });
        if (sp?.characterId) {
          const character = await prisma.character.findUnique({
            where: { id: sp.characterId },
            select: { name: true, avatarUrl: true },
          });
          if (character) {
            characterName = character.name;
            characterAvatar = character.avatarUrl;
            authorType = "CHARACTER";
          }
        }
      }

      // NPC author
      if (data.authorAsNpc && ["GM", "CO_GM"].includes(socket.ctx.role)) {
        authorType = "NPC";
        characterName = data.authorAsNpc.name;
        characterAvatar = data.authorAsNpc.portrait ?? null;
      } else if (data.channel === "NARRATOR") {
        authorType = "NARRATOR";
      } else if (data.channel === "SYSTEM") {
        authorType = "SYSTEM";
      }

      // Persist message
      const message = await prisma.chatMessage.create({
        data: {
          sessionId: socket.ctx.sessionId,
          authorId: socket.ctx.userId,
          authorType: authorType as any,
          channel: data.channel as any,
          content: data.content,
          contentType: "TEXT",
          characterName,
          characterAvatar,
          recipientIds: data.recipientIds ?? [],
          groupName: data.groupName ?? null,
          attachments: data.attachments ?? [],
        },
      });

      const messageDTO: ChatMessageDTO = {
        id: message.id,
        sessionId: message.sessionId,
        authorId: message.authorId,
        authorType: message.authorType as any,
        channel: message.channel as ChatChannel,
        content: message.content,
        contentType: message.contentType as any,
        characterId: message.characterId,
        characterName: message.characterName,
        characterAvatar: message.characterAvatar,
        recipientIds: message.recipientIds,
        groupName: message.groupName,
        attachments: (message.attachments as any[]) ?? [],
        embed: message.embed as Record<string, unknown> | null,
        reactions: (message.reactions as Record<string, string[]>) ?? {},
        isEdited: false,
        editedAt: null,
        isDeleted: false,
        isPinned: false,
        isAsyncPost: message.isAsyncPost,
        asyncTurnNumber: message.asyncTurnNumber,
        displayName: characterName ?? data.authorAsNpc?.name ?? user?.displayName ?? "Unknown",
        avatarUrl: characterAvatar ?? user?.avatarUrl ?? null,
        createdAt: message.createdAt.toISOString(),
      };

      // Route message based on channel
      if (data.channel === "WHISPER" && data.recipientIds && data.recipientIds.length > 0) {
        // Send whisper to sender, recipients, and GMs
        const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
        for (const s of sockets) {
          const ctx = (s as any).ctx;
          if (!ctx) continue;
          if (
            ctx.userId === socket.ctx.userId ||
            data.recipientIds.includes(ctx.userId) ||
            ["GM", "CO_GM"].includes(ctx.role)
          ) {
            s.emit("chat:message", messageDTO);
          }
        }
      } else if (data.channel === "SECRET_NOTE") {
        // Secret notes only to sender and GMs
        const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
        for (const s of sockets) {
          const ctx = (s as any).ctx;
          if (!ctx) continue;
          if (ctx.userId === socket.ctx.userId || ["GM", "CO_GM"].includes(ctx.role)) {
            s.emit("chat:message", messageDTO);
          }
        }
      } else if (data.channel === "GM_ONLY") {
        // GM-only messages
        const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
        for (const s of sockets) {
          const ctx = (s as any).ctx;
          if (ctx && ["GM", "CO_GM"].includes(ctx.role)) {
            s.emit("chat:message", messageDTO);
          }
        }
      } else if (data.channel === "GROUP" && data.groupName) {
        // Group messages to members who have this group name
        // For simplicity, broadcast to session - client filters by group
        io.to(socket.ctx.sessionId).emit("chat:message", messageDTO);
      } else {
        // Broadcast to entire session
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

  // ── Edit Message ──

  socket.on("chat:edit", async (data, ack) => {
    if (!socket.ctx.sessionId) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    try {
      const message = await prisma.chatMessage.findFirst({
        where: { id: data.messageId, sessionId: socket.ctx.sessionId },
      });
      if (!message) return ack({ success: false, error: { code: "NOT_FOUND", message: "Mensagem não encontrada" } });
      if (message.authorId !== socket.ctx.userId) return ack({ success: false, error: { code: "FORBIDDEN", message: "Só pode editar suas mensagens" } });

      const diff = Date.now() - message.createdAt.getTime();
      if (diff > 15 * 60 * 1000) {
        return ack({ success: false, error: { code: "EXPIRED", message: "Janela de edição expirou" } });
      }

      const editedAt = new Date();
      await prisma.chatMessage.update({
        where: { id: data.messageId },
        data: { content: data.content, isEdited: true, editedAt },
      });

      io.to(socket.ctx.sessionId).emit("chat:message-edited", {
        messageId: data.messageId,
        content: data.content,
        editedAt: editedAt.toISOString(),
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao editar mensagem" } });
    }
  });

  // ── Delete Message ──

  socket.on("chat:delete", async (data, ack) => {
    if (!socket.ctx.sessionId) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    try {
      const message = await prisma.chatMessage.findFirst({
        where: { id: data.messageId, sessionId: socket.ctx.sessionId },
      });
      if (!message) return ack({ success: false, error: { code: "NOT_FOUND", message: "Mensagem não encontrada" } });

      if (message.authorId !== socket.ctx.userId && !["GM", "CO_GM"].includes(socket.ctx.role!)) {
        return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
      }

      await prisma.chatMessage.update({
        where: { id: data.messageId },
        data: { isDeleted: true, content: "[mensagem deletada]" },
      });

      io.to(socket.ctx.sessionId).emit("chat:message-deleted", {
        messageId: data.messageId,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao deletar mensagem" } });
    }
  });

  // ── Pin Message ──

  socket.on("chat:pin", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem fixar mensagens" } });
    }

    try {
      await prisma.chatMessage.update({
        where: { id: data.messageId },
        data: { isPinned: data.isPinned },
      });

      io.to(socket.ctx.sessionId).emit("chat:message-pinned", {
        messageId: data.messageId,
        isPinned: data.isPinned,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao fixar mensagem" } });
    }
  });

  // ── Reactions ──

  socket.on("chat:react", async (data) => {
    if (!socket.ctx.sessionId) return;

    try {
      const message = await prisma.chatMessage.findFirst({
        where: { id: data.messageId, sessionId: socket.ctx.sessionId },
      });
      if (!message) return;

      const reactions = (message.reactions as Record<string, string[]>) ?? {};
      if (!reactions[data.emoji]) reactions[data.emoji] = [];
      if (!reactions[data.emoji].includes(socket.ctx.userId)) {
        reactions[data.emoji].push(socket.ctx.userId);
      }

      await prisma.chatMessage.update({
        where: { id: data.messageId },
        data: { reactions },
      });

      io.to(socket.ctx.sessionId).emit("chat:reaction-added", {
        messageId: data.messageId,
        emoji: data.emoji,
        userId: socket.ctx.userId,
      });
    } catch {
      // silent fail for reactions
    }
  });

  socket.on("chat:unreact", async (data) => {
    if (!socket.ctx.sessionId) return;

    try {
      const message = await prisma.chatMessage.findFirst({
        where: { id: data.messageId, sessionId: socket.ctx.sessionId },
      });
      if (!message) return;

      const reactions = (message.reactions as Record<string, string[]>) ?? {};
      if (reactions[data.emoji]) {
        reactions[data.emoji] = reactions[data.emoji].filter((id: string) => id !== socket.ctx.userId);
        if (reactions[data.emoji].length === 0) delete reactions[data.emoji];
      }

      await prisma.chatMessage.update({
        where: { id: data.messageId },
        data: { reactions },
      });

      io.to(socket.ctx.sessionId).emit("chat:reaction-removed", {
        messageId: data.messageId,
        emoji: data.emoji,
        userId: socket.ctx.userId,
      });
    } catch {
      // silent fail for reactions
    }
  });

  // ── Typing Indicator ──

  socket.on("chat:typing", (data) => {
    if (!socket.ctx.sessionId) return;

    socket.to(socket.ctx.sessionId).emit("chat:typing", {
      userId: socket.ctx.userId,
      channel: data.channel as ChatChannel,
    });

    // Auto-stop typing after 5s
    setTimeout(() => {
      if (socket.ctx.sessionId) {
        socket.to(socket.ctx.sessionId).emit("chat:typing-stopped", {
          userId: socket.ctx.userId,
          channel: data.channel as ChatChannel,
        });
      }
    }, 5000);
  });

  // ── Mark Read ──

  socket.on("chat:mark-read", (data) => {
    if (!socket.ctx.sessionId) return;

    // Emit unread reset for this user (client-side tracks)
    socket.emit("chat:unread-updated", {
      channel: data.channel as ChatChannel,
      count: 0,
    });
  });
}
