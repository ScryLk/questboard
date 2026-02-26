import type { PrismaClient } from "@questboard/db";
import type { CreateSceneCardInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createSceneCardsService(prisma: PrismaClient) {
  return {
    async create(sessionId: string, userId: string, role: string, input: CreateSceneCardInput) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem criar scene cards");
      }

      const card = await prisma.sceneCard.create({
        data: {
          sessionId,
          title: input.title,
          subtitle: input.subtitle,
          imageUrl: input.imageUrl,
          style: input.style as any,
          duration: input.duration ?? 5,
          animation: input.animation ?? "fade",
          soundEffect: input.soundEffect,
          dimBackground: input.dimBackground ?? true,
          shownAt: new Date(),
          shownById: userId,
        },
      });

      return this.format(card);
    },

    async list(sessionId: string, limit = 20, offset = 0) {
      const cards = await prisma.sceneCard.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });
      return cards.map(this.format);
    },

    async getById(sessionId: string, cardId: string) {
      const card = await prisma.sceneCard.findFirst({
        where: { id: cardId, sessionId },
      });
      if (!card) throw new NotFoundError("Scene card");
      return this.format(card);
    },

    async delete(sessionId: string, cardId: string, role: string) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem deletar scene cards");
      }
      const card = await prisma.sceneCard.findFirst({
        where: { id: cardId, sessionId },
      });
      if (!card) throw new NotFoundError("Scene card");
      await prisma.sceneCard.delete({ where: { id: cardId } });
    },

    format(card: any) {
      return {
        id: card.id,
        sessionId: card.sessionId,
        title: card.title,
        subtitle: card.subtitle,
        imageUrl: card.imageUrl,
        style: card.style,
        duration: card.duration,
        animation: card.animation,
        soundEffect: card.soundEffect,
        dimBackground: card.dimBackground,
        shownById: card.shownById,
        shownAt: card.shownAt?.toISOString() ?? null,
        createdAt: card.createdAt.toISOString(),
      };
    },
  };
}
