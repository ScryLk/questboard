import type { PrismaClient } from "@questboard/db";
import type { MuteUserInput, ReviewContentInput, SlowModeInput, WarnUserInput, ModerationLogQuery } from "@questboard/shared";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../errors/app-error.js";

export function createModerationService(prisma: PrismaClient) {
  return {
    async muteUser(sessionId: string, performedById: string, role: string, input: MuteUserInput) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem silenciar usuários");
      }

      // Verify target is in session
      const target = await prisma.sessionPlayer.findFirst({
        where: { sessionId, userId: input.userId },
      });
      if (!target) throw new NotFoundError("Jogador na sessão");

      // Cannot mute another GM
      if (["GM", "CO_GM"].includes(target.role)) {
        throw new ForbiddenError("Não é possível silenciar outro GM");
      }

      const expiresAt = input.duration && input.duration > 0
        ? new Date(Date.now() + input.duration * 1000)
        : null;

      const moderation = await prisma.chatModeration.create({
        data: {
          sessionId,
          userId: input.userId,
          action: input.duration ? "TEMP_MUTE" : "MUTE",
          reason: input.reason,
          status: "ACTIVE",
          expiresAt,
          performedById,
        },
      });

      // Mark player as muted in session
      await prisma.sessionPlayer.updateMany({
        where: { sessionId, userId: input.userId },
        data: { isMuted: true },
      });

      return {
        id: moderation.id,
        userId: input.userId,
        action: moderation.action,
        reason: moderation.reason,
        expiresAt: expiresAt?.toISOString() ?? null,
        duration: input.duration ?? null,
      };
    },

    async unmuteUser(sessionId: string, performedById: string, role: string, userId: string) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem remover silenciamento");
      }

      // Revoke active mutes
      await prisma.chatModeration.updateMany({
        where: {
          sessionId,
          userId,
          action: { in: ["MUTE", "TEMP_MUTE"] },
          status: "ACTIVE",
        },
        data: {
          status: "REVOKED",
          resolvedById: performedById,
          resolvedAt: new Date(),
        },
      });

      // Unmark player
      await prisma.sessionPlayer.updateMany({
        where: { sessionId, userId },
        data: { isMuted: false },
      });
    },

    async warnUser(sessionId: string, performedById: string, role: string, input: WarnUserInput) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem avisar usuários");
      }

      const moderation = await prisma.chatModeration.create({
        data: {
          sessionId,
          userId: input.userId,
          action: "WARN",
          reason: input.reason,
          performedById,
        },
      });

      return {
        id: moderation.id,
        userId: input.userId,
        reason: input.reason,
      };
    },

    async deleteMessageModeration(sessionId: string, performedById: string, role: string, messageId: string, reason?: string) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem deletar mensagens via moderação");
      }

      const message = await prisma.chatMessage.findFirst({
        where: { id: messageId, sessionId },
      });
      if (!message) throw new NotFoundError("Mensagem");

      // Soft delete the message
      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { isDeleted: true, content: "[mensagem removida por moderação]" },
      });

      // Log the action
      await prisma.chatModeration.create({
        data: {
          sessionId,
          messageId,
          userId: message.authorId,
          action: "DELETE_MESSAGE",
          reason,
          performedById,
        },
      });
    },

    async reviewFlaggedContent(sessionId: string, userId: string, role: string, input: ReviewContentInput) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem revisar conteúdo sinalizado");
      }

      const moderation = await prisma.chatModeration.findFirst({
        where: { id: input.moderationId, sessionId },
      });
      if (!moderation) throw new NotFoundError("Registro de moderação");

      await prisma.chatModeration.update({
        where: { id: input.moderationId },
        data: {
          status: "REVIEWED",
          resolvedById: userId,
          resolvedAt: new Date(),
        },
      });

      // If not approved and there's a message, delete it
      if (!input.approved && moderation.messageId) {
        await prisma.chatMessage.update({
          where: { id: moderation.messageId },
          data: { isDeleted: true, content: "[mensagem removida por moderação]" },
        });
      }
    },

    async isUserMuted(sessionId: string, userId: string): Promise<boolean> {
      const activeMute = await prisma.chatModeration.findFirst({
        where: {
          sessionId,
          userId,
          action: { in: ["MUTE", "TEMP_MUTE", "BAN_FROM_CHAT"] },
          status: "ACTIVE",
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      });

      if (!activeMute) {
        // Check if temp mute expired — auto-unmute
        const expiredMutes = await prisma.chatModeration.updateMany({
          where: {
            sessionId,
            userId,
            action: "TEMP_MUTE",
            status: "ACTIVE",
            expiresAt: { lte: new Date() },
          },
          data: { status: "EXPIRED" },
        });

        if (expiredMutes.count > 0) {
          await prisma.sessionPlayer.updateMany({
            where: { sessionId, userId },
            data: { isMuted: false },
          });
        }

        return false;
      }

      return true;
    },

    async getModerationLog(sessionId: string, role: string, query: ModerationLogQuery) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem ver o log de moderação");
      }

      const where: any = { sessionId };
      if (query.userId) where.userId = query.userId;
      if (query.action) where.action = query.action;
      if (query.automaticOnly) where.isAutomatic = true;

      const [entries, total] = await Promise.all([
        prisma.chatModeration.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: query.limit ?? 50,
          skip: query.offset ?? 0,
        }),
        prisma.chatModeration.count({ where }),
      ]);

      return {
        entries: entries.map((e) => ({
          id: e.id,
          sessionId: e.sessionId,
          messageId: e.messageId,
          userId: e.userId,
          action: e.action,
          reason: e.reason,
          isAutomatic: e.isAutomatic,
          confidence: e.confidence,
          categories: e.categories,
          status: e.status,
          expiresAt: e.expiresAt?.toISOString() ?? null,
          performedById: e.performedById,
          resolvedById: e.resolvedById,
          resolvedAt: e.resolvedAt?.toISOString() ?? null,
          createdAt: e.createdAt.toISOString(),
        })),
        total,
      };
    },

    async createAutoFlag(sessionId: string, messageId: string, userId: string, categories: string[], confidence: number) {
      return prisma.chatModeration.create({
        data: {
          sessionId,
          messageId,
          userId,
          action: "AUTO_FLAGGED",
          isAutomatic: true,
          confidence,
          categories,
          performedById: "system",
        },
      });
    },
  };
}
