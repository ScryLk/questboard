import type { PrismaClient } from "@questboard/db";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createChatService(prisma: PrismaClient) {
  return {
    async listMessages(sessionId: string, opts: { channel?: string; cursor?: string; limit?: number }) {
      const limit = Math.min(opts.limit ?? 50, 100);
      const messages = await prisma.message.findMany({
        where: {
          sessionId,
          isDeleted: false,
          ...(opts.channel ? { channel: opts.channel as "GENERAL" | "IN_CHARACTER" | "WHISPER" | "GM_ONLY" | "GROUP" } : {}),
          ...(opts.cursor ? { createdAt: { lt: new Date(opts.cursor) } } : {}),
        },
        include: {
          user: { select: { id: true, displayName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
      });

      const hasMore = messages.length > limit;
      if (hasMore) messages.pop();

      return {
        messages: messages.reverse(),
        nextCursor: hasMore ? messages[0]!.createdAt.toISOString() : null,
      };
    },

    async sendMessage(sessionId: string, userId: string, input: {
      content: string; channel?: string; characterId?: string;
      characterName?: string; characterAvatar?: string; recipientIds?: string[];
      contentType?: string; diceRequest?: Record<string, unknown>;
      diceResult?: Record<string, unknown>;
    }) {
      return prisma.message.create({
        data: {
          sessionId,
          userId,
          content: input.content,
          channel: (input.channel as "GENERAL" | "IN_CHARACTER" | "WHISPER" | "GM_ONLY" | "GROUP") ?? "GENERAL",
          contentType: (input.contentType as "TEXT" | "DICE_ROLL" | "SYSTEM" | "MEDIA" | "NARRATIVE" | "HANDOUT" | "DICE_REQUEST") ?? "TEXT",
          characterId: input.characterId,
          characterName: input.characterName,
          characterAvatar: input.characterAvatar,
          recipientIds: input.recipientIds ?? [],
          diceRequest: input.diceRequest ?? undefined,
          diceResult: input.diceResult ?? undefined,
        },
        include: {
          user: { select: { id: true, displayName: true, avatarUrl: true } },
        },
      });
    },

    async deleteMessage(sessionId: string, userId: string, messageId: string) {
      const message = await prisma.message.findFirst({ where: { id: messageId, sessionId } });
      if (!message) throw new NotFoundError("Message");

      // Author or GM can delete
      const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true } });
      if (message.userId !== userId && session?.ownerId !== userId) {
        throw new ForbiddenError("Sem permissão para deletar mensagem");
      }

      return prisma.message.update({
        where: { id: messageId },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    },

    async rollDice(sessionId: string, userId: string, input: {
      formula: string; label?: string; context?: string;
      characterId?: string; isSecret?: boolean;
    }) {
      // Parse dice formula (e.g., "2d20+5")
      const match = input.formula.match(/^(\d+)d(\d+)([+-]\d+)?$/);
      if (!match) {
        // Just store as-is with total 0 for complex formulas
        return prisma.diceRoll.create({
          data: { sessionId, userId, formula: input.formula, results: [], total: 0, label: input.label, context: input.context, characterId: input.characterId, isSecret: input.isSecret ?? false },
        });
      }

      const count = parseInt(match[1]!, 10);
      const sides = parseInt(match[2]!, 10);
      const modifier = match[3] ? parseInt(match[3], 10) : 0;

      const results: number[] = [];
      for (let i = 0; i < count; i++) {
        results.push(Math.floor(Math.random() * sides) + 1);
      }
      const total = results.reduce((sum, r) => sum + r, 0) + modifier;
      const isNat20 = sides === 20 && count === 1 && results[0] === 20;
      const isNat1 = sides === 20 && count === 1 && results[0] === 1;

      return prisma.diceRoll.create({
        data: {
          sessionId,
          userId,
          formula: input.formula,
          results,
          modifier,
          total,
          label: input.label,
          context: input.context,
          characterId: input.characterId,
          isSecret: input.isSecret ?? false,
          isNat20,
          isNat1,
        },
      });
    },

    async requestDiceRoll(sessionId: string, userId: string, input: {
      targetUserIds: string[]; diceFormula: string; label: string; reason?: string;
    }) {
      // GM creates a dice request message
      const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true } });
      if (session?.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode solicitar testes");

      return prisma.message.create({
        data: {
          sessionId,
          userId,
          content: `Teste solicitado: ${input.label}`,
          contentType: "DICE_REQUEST",
          channel: "GENERAL",
          diceRequest: {
            formula: input.diceFormula,
            label: input.label,
            reason: input.reason,
            targetUserIds: input.targetUserIds,
          },
        },
        include: {
          user: { select: { id: true, displayName: true, avatarUrl: true } },
        },
      });
    },
  };
}

export type ChatService = ReturnType<typeof createChatService>;
