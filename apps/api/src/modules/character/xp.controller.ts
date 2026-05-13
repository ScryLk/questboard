// ── Controllers de XP ──────────────────────────────────────
//
// Três handlers: bulk pelo sessionId (usado no encerrar sessão),
// individual pelo characterId, e histórico.
//
// Permission gating:
//   - Bulk (sessionId)  → middleware `requireGm` da rota cobre
//   - Individual (charId) → checa aqui: user precisa ser GM/CO_GM
//                            da campanha que dona o personagem.

import type { FastifyRequest, FastifyReply } from "fastify";
import { createSuccessResponse } from "@questboard/shared";
import {
  bulkSessionAwardSchema,
  singleCharacterAwardSchema,
} from "@questboard/validators";
import {
  ForbiddenError,
  NotFoundError,
} from "../../errors/app-error.js";
import type { PrismaClient } from "@questboard/db";
import type { XpService } from "./xp.service.js";

export function createXpController(
  xpService: XpService,
  prisma: PrismaClient,
) {
  return {
    /** POST /sessions/:id/xp — bulk award no encerrar sessão. */
    async bulkAward(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const parsed = bulkSessionAwardSchema.parse(request.body);
      const results = await xpService.awardBulkSession(
        request.params.id,
        request.user.id,
        parsed,
      );
      return reply.send(createSuccessResponse(results));
    },

    /** POST /characters/:id/xp — ajuste manual. Valida que o caller
     *  é GM/CO_GM da campanha do personagem. */
    async singleAward(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const parsed = singleCharacterAwardSchema.parse(request.body);
      await assertCampaignGm(prisma, request.params.id, request.user.id);
      const result = await xpService.awardManual(
        request.params.id,
        request.user.id,
        parsed,
      );
      return reply.send(createSuccessResponse(result));
    },

    /** GET /characters/:id/xp-history — leitura por qualquer membro da
     *  campanha (transparência) ou pelo dono do personagem. */
    async history(
      request: FastifyRequest<{
        Params: { id: string };
        Querystring: { limit?: string };
      }>,
      reply: FastifyReply,
    ) {
      await assertCanReadCharacter(prisma, request.params.id, request.user.id);
      const limit = request.query.limit
        ? Math.max(1, parseInt(request.query.limit, 10) || 20)
        : 20;
      const items = await xpService.history(request.params.id, limit);
      return reply.send(createSuccessResponse(items));
    },
  };
}

async function assertCampaignGm(
  prisma: PrismaClient,
  characterId: string,
  userId: string,
): Promise<void> {
  const char = await prisma.character.findUnique({
    where: { id: characterId },
    select: { campaignId: true },
  });
  if (!char) throw new NotFoundError("Character");
  if (!char.campaignId) {
    throw new ForbiddenError(
      "Personagem sem campanha — não há GM definido.",
    );
  }
  const campaign = await prisma.campaign.findUnique({
    where: { id: char.campaignId },
    select: { ownerId: true },
  });
  if (campaign?.ownerId === userId) return;
  const member = await prisma.campaignMember.findFirst({
    where: { campaignId: char.campaignId, userId, leftAt: null },
    select: { role: true },
  });
  if (member?.role === "GM" || member?.role === "CO_GM") return;
  throw new ForbiddenError("Apenas GM/CO_GM da campanha pode ajustar XP.");
}

async function assertCanReadCharacter(
  prisma: PrismaClient,
  characterId: string,
  userId: string,
): Promise<void> {
  const char = await prisma.character.findUnique({
    where: { id: characterId },
    select: { userId: true, campaignId: true },
  });
  if (!char) throw new NotFoundError("Character");
  if (char.userId === userId) return;
  if (!char.campaignId) {
    throw new ForbiddenError("Personagem privado.");
  }
  const campaign = await prisma.campaign.findUnique({
    where: { id: char.campaignId },
    select: { ownerId: true },
  });
  if (campaign?.ownerId === userId) return;
  const member = await prisma.campaignMember.findFirst({
    where: { campaignId: char.campaignId, userId, leftAt: null },
    select: { id: true },
  });
  if (member) return;
  throw new ForbiddenError("Não é membro da campanha.");
}
