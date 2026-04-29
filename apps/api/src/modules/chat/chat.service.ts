import type { PrismaClient } from "@questboard/db";
import { roll as engineRoll } from "@questboard/game-engine";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../errors/app-error.js";
import { emitDiceResult } from "../../lib/socket-events.js";

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
      // Servidor é authoritative pra rolagem — engine usa
      // crypto.getRandomValues. Cliente nunca rola seus próprios
      // resultados (CLAUDE.md regra #4).
      let result;
      try {
        result = engineRoll(input.formula);
      } catch (err) {
        throw new BadRequestError(
          `Notação de dado inválida: "${input.formula}". ` +
            `Aceita formato como "2d20+5", "1d100", "4d6kh3".`,
        );
      }

      // Achata os termos pra um array simples (compatível com schema
      // legado `results: number[]`). Frontend que precisar do detalhe
      // dos termos lê `engineResult` no JSON do diceRequest.
      const flatRolls = result.terms.flatMap((t) => t.rolls);
      const modifier = result.flatBonus;

      // Detecta nat20/nat1 (apenas em rolagem única de d20).
      const firstTerm = result.terms[0];
      const isSingleD20 =
        result.terms.length === 1 &&
        firstTerm?.sides === 20 &&
        firstTerm.count === 1;
      const isNat20 = isSingleD20 && firstTerm.rolls[0] === 20;
      const isNat1 = isSingleD20 && firstTerm.rolls[0] === 1;

      const isSecret = input.isSecret ?? false;

      const persisted = await prisma.diceRoll.create({
        data: {
          sessionId,
          userId,
          formula: input.formula,
          results: flatRolls,
          modifier,
          total: result.total,
          label: input.label,
          context: input.context,
          characterId: input.characterId,
          isSecret,
          isNat20,
          isNat1,
        },
      });

      // Broadcast — público vai pra sala da sessão; secret vai só
      // pra sala do GM (`session:<id>:gm`).
      emitDiceResult(
        {
          sessionId,
          rollId: persisted.id,
          rolledBy: userId,
          formula: persisted.formula,
          rolls: flatRolls,
          modifier,
          total: result.total,
          label: input.label,
          context: input.context,
          visibility: isSecret ? "secret" : "public",
          isNat20,
          isNat1,
          at: persisted.createdAt.toISOString(),
        },
        { gmRoom: `session:${sessionId}:gm` },
      );

      return persisted;
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
