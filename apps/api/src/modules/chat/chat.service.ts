import type { PrismaClient } from "@questboard/db";
import type { SendMessageInput, ChatHistoryQuery } from "@questboard/shared";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../errors/app-error.js";

const BOT_COMMAND_REGEX = /^\/(roll|whisper|initiative|npc|narrate)\s+(.*)$/;

export function createChatService(prisma: PrismaClient) {
  // ── Helpers ──

  async function getSessionMembership(sessionId: string, userId: string) {
    const sp = await prisma.sessionPlayer.findFirst({
      where: { sessionId, userId },
    });
    if (!sp) throw new ForbiddenError("Não é membro desta sessão");
    return sp;
  }

  function parseChannelPermissions(role: string, channel: string): boolean {
    const gmOnly = ["GM_ONLY", "NARRATOR", "SYSTEM"];
    if (gmOnly.includes(channel) && !["GM", "CO_GM"].includes(role)) return false;
    return true;
  }

  function parseBotCommand(content: string) {
    const match = content.match(BOT_COMMAND_REGEX);
    if (!match) return null;
    return { command: match[1] as string, args: match[2] as string };
  }

  // ── Service Methods ──

  return {
    async sendMessage(sessionId: string, userId: string, input: SendMessageInput) {
      const sp = await getSessionMembership(sessionId, userId);

      if (!parseChannelPermissions(sp.role, input.channel)) {
        throw new ForbiddenError("Sem permissão neste canal");
      }

      // Check for whisper recipients
      if (input.channel === "WHISPER" && (!input.recipientIds || input.recipientIds.length === 0)) {
        throw new BadRequestError("Whisper requer pelo menos um destinatário");
      }

      // Check for group name
      if (input.channel === "GROUP" && !input.groupName) {
        throw new BadRequestError("Canal de grupo requer um nome de grupo");
      }

      // Resolve character info for IC messages
      let characterName: string | null = null;
      let characterAvatar: string | null = null;
      if (input.channel === "IN_CHARACTER" && input.characterId) {
        const character = await prisma.character.findUnique({
          where: { id: input.characterId },
          select: { name: true, avatarUrl: true, userId: true },
        });
        if (character && character.userId === userId) {
          characterName = character.name;
          characterAvatar = character.avatarUrl;
        }
      }

      // NPC author
      let authorType = "USER";
      if (input.authorAsNpc) {
        if (!["GM", "CO_GM"].includes(sp.role)) {
          throw new ForbiddenError("Apenas GMs podem postar como NPC");
        }
        authorType = "NPC";
        characterName = input.authorAsNpc.name;
        characterAvatar = input.authorAsNpc.portrait ?? null;
      } else if (input.channel === "NARRATOR") {
        authorType = "NARRATOR";
      } else if (input.channel === "IN_CHARACTER" && input.characterId) {
        authorType = "CHARACTER";
      }

      const message = await prisma.chatMessage.create({
        data: {
          sessionId,
          authorId: userId,
          authorType: authorType as any,
          channel: input.channel as any,
          content: input.content,
          contentType: (input.contentType ?? "TEXT") as any,
          characterId: input.characterId ?? null,
          characterName,
          characterAvatar,
          recipientIds: input.recipientIds ?? [],
          groupName: input.groupName ?? null,
          attachments: input.attachments ?? [],
          embed: input.embed ?? null,
          isAsyncPost: input.isAsyncPost ?? false,
        },
        include: { author: { select: { displayName: true, avatarUrl: true } } },
      });

      // Update message stats
      await prisma.sessionPlayer.updateMany({
        where: { userId, sessionId },
        data: { totalMessages: { increment: 1 } },
      });

      return {
        id: message.id,
        sessionId: message.sessionId,
        authorId: message.authorId,
        authorType: message.authorType,
        channel: message.channel,
        content: message.content,
        contentType: message.contentType,
        characterId: message.characterId,
        characterName: message.characterName,
        characterAvatar: message.characterAvatar,
        recipientIds: message.recipientIds,
        groupName: message.groupName,
        attachments: message.attachments as any[],
        embed: message.embed as Record<string, unknown> | null,
        reactions: message.reactions as Record<string, string[]>,
        isEdited: message.isEdited,
        editedAt: message.editedAt?.toISOString() ?? null,
        isDeleted: message.isDeleted,
        isPinned: message.isPinned,
        isAsyncPost: message.isAsyncPost,
        asyncTurnNumber: message.asyncTurnNumber,
        displayName: input.authorAsNpc?.name ?? characterName ?? message.author?.displayName ?? "Unknown",
        avatarUrl: characterAvatar ?? message.author?.avatarUrl ?? null,
        createdAt: message.createdAt.toISOString(),
      };
    },

    async editMessage(sessionId: string, userId: string, messageId: string, content: string) {
      const message = await prisma.chatMessage.findFirst({
        where: { id: messageId, sessionId },
      });
      if (!message) throw new NotFoundError("Mensagem");
      if (message.authorId !== userId) throw new ForbiddenError("Só pode editar suas próprias mensagens");
      if (message.isDeleted) throw new BadRequestError("Mensagem já foi deletada");

      // 15 minute edit window
      const diff = Date.now() - message.createdAt.getTime();
      if (diff > 15 * 60 * 1000) {
        throw new BadRequestError("Janela de edição expirou (15 minutos)");
      }

      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { content, isEdited: true, editedAt: new Date() },
      });

      return { messageId, content, editedAt: new Date().toISOString() };
    },

    async deleteMessage(sessionId: string, userId: string, messageId: string, role: string) {
      const message = await prisma.chatMessage.findFirst({
        where: { id: messageId, sessionId },
      });
      if (!message) throw new NotFoundError("Mensagem");

      // Author or GM can delete
      if (message.authorId !== userId && !["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Sem permissão para deletar esta mensagem");
      }

      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { isDeleted: true, content: "[mensagem deletada]" },
      });
    },

    async pinMessage(sessionId: string, userId: string, messageId: string, isPinned: boolean, role: string) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem fixar mensagens");
      }

      const message = await prisma.chatMessage.findFirst({
        where: { id: messageId, sessionId },
      });
      if (!message) throw new NotFoundError("Mensagem");

      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { isPinned },
      });
    },

    async addReaction(sessionId: string, userId: string, messageId: string, emoji: string) {
      const message = await prisma.chatMessage.findFirst({
        where: { id: messageId, sessionId },
      });
      if (!message) throw new NotFoundError("Mensagem");

      const reactions = (message.reactions as Record<string, string[]>) ?? {};
      if (!reactions[emoji]) reactions[emoji] = [];
      if (!reactions[emoji].includes(userId)) {
        reactions[emoji].push(userId);
      }

      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { reactions },
      });
    },

    async removeReaction(sessionId: string, userId: string, messageId: string, emoji: string) {
      const message = await prisma.chatMessage.findFirst({
        where: { id: messageId, sessionId },
      });
      if (!message) throw new NotFoundError("Mensagem");

      const reactions = (message.reactions as Record<string, string[]>) ?? {};
      if (reactions[emoji]) {
        reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      }

      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { reactions },
      });
    },

    async getHistory(sessionId: string, userId: string, query: ChatHistoryQuery) {
      const sp = await getSessionMembership(sessionId, userId);
      const isGm = ["GM", "CO_GM"].includes(sp.role);

      const where: any = {
        sessionId,
        isDeleted: false,
      };

      if (query.channel) where.channel = query.channel;
      if (query.authorId) where.authorId = query.authorId;
      if (query.contentType) where.contentType = query.contentType;
      if (query.pinnedOnly) where.isPinned = true;
      if (query.search) {
        where.content = { contains: query.search, mode: "insensitive" };
      }
      if (query.before) where.createdAt = { lt: new Date(query.before) };
      if (query.after) where.createdAt = { ...(where.createdAt || {}), gt: new Date(query.after) };

      // Non-GM users cannot see GM_ONLY messages
      if (!isGm && !query.channel) {
        where.channel = { not: "GM_ONLY" };
      }

      const messages = await prisma.chatMessage.findMany({
        where,
        include: { author: { select: { displayName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: query.limit ?? 50,
      });

      // Filter whispers: only show if user is sender, recipient, or GM
      return messages
        .filter((msg) => {
          if (msg.channel !== "WHISPER") return true;
          if (isGm) return true;
          if (msg.authorId === userId) return true;
          if (msg.recipientIds.includes(userId)) return true;
          return false;
        })
        .map((msg) => ({
          id: msg.id,
          sessionId: msg.sessionId,
          authorId: msg.authorId,
          authorType: msg.authorType,
          channel: msg.channel,
          content: msg.content,
          contentType: msg.contentType,
          characterId: msg.characterId,
          characterName: msg.characterName,
          characterAvatar: msg.characterAvatar,
          recipientIds: msg.recipientIds,
          groupName: msg.groupName,
          attachments: msg.attachments as any[],
          embed: msg.embed as Record<string, unknown> | null,
          reactions: msg.reactions as Record<string, string[]>,
          isEdited: msg.isEdited,
          editedAt: msg.editedAt?.toISOString() ?? null,
          isDeleted: msg.isDeleted,
          isPinned: msg.isPinned,
          isAsyncPost: msg.isAsyncPost,
          asyncTurnNumber: msg.asyncTurnNumber,
          displayName: msg.characterName ?? msg.author?.displayName ?? "Unknown",
          avatarUrl: msg.characterAvatar ?? msg.author?.avatarUrl ?? null,
          createdAt: msg.createdAt.toISOString(),
        }))
        .reverse(); // chronological order
    },

    async getPinnedMessages(sessionId: string, userId: string) {
      await getSessionMembership(sessionId, userId);

      const messages = await prisma.chatMessage.findMany({
        where: { sessionId, isPinned: true, isDeleted: false },
        include: { author: { select: { displayName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return messages.map((msg) => ({
        id: msg.id,
        sessionId: msg.sessionId,
        authorId: msg.authorId,
        authorType: msg.authorType,
        channel: msg.channel,
        content: msg.content,
        contentType: msg.contentType,
        characterName: msg.characterName,
        characterAvatar: msg.characterAvatar,
        attachments: msg.attachments as any[],
        reactions: msg.reactions as Record<string, string[]>,
        isPinned: msg.isPinned,
        displayName: msg.characterName ?? msg.author?.displayName ?? "Unknown",
        avatarUrl: msg.characterAvatar ?? msg.author?.avatarUrl ?? null,
        createdAt: msg.createdAt.toISOString(),
      }));
    },

    async searchMessages(sessionId: string, userId: string, searchTerm: string, limit = 20) {
      await getSessionMembership(sessionId, userId);

      const messages = await prisma.chatMessage.findMany({
        where: {
          sessionId,
          isDeleted: false,
          content: { contains: searchTerm, mode: "insensitive" },
        },
        include: { author: { select: { displayName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      return messages.map((msg) => ({
        id: msg.id,
        channel: msg.channel,
        content: msg.content,
        displayName: msg.characterName ?? msg.author?.displayName ?? "Unknown",
        createdAt: msg.createdAt.toISOString(),
      }));
    },

    parseBotCommand,
  };
}
