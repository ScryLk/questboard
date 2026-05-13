// ── XP Service ─────────────────────────────────────────────
//
// Responsabilidades:
//   1. Aplicar delta de XP (positivo ou negativo) num personagem
//   2. Recalcular `level` automaticamente via tabela em @questboard/engine
//   3. Gravar audit trail em XpAward
//   4. Emitir socket `character:xp-changed` (frontend mostra toast)
//   5. Invalidar cache do dashboard da campanha
//
// Permission gating é responsabilidade da rota — o service assume que
// `awardedById` já foi validado como GM/CO_GM da campanha.

import type { PrismaClient } from "@questboard/db";
import type {
  BulkSessionAwardInput,
  SingleCharacterAwardInput,
  XpAwardHistoryItem,
  XpAwardResult,
} from "@questboard/validators";
import { levelForXp } from "@questboard/game-engine";
import {
  BadRequestError,
  NotFoundError,
} from "../../errors/app-error.js";
import { emitCharacterXpChanged } from "../../lib/socket-events.js";
import { invalidateCampaignDashboardCache } from "../campaign/dashboard.service.js";

interface AwardOptions {
  characterId: string;
  delta: number;
  reason?: string;
  awardedById: string;
  sessionId?: string;
}

export function createXpService(prisma: PrismaClient) {
  return {
    /** Aplica `delta` num personagem. Faz tudo numa transação:
     *  update char + insert audit + recálculo de level. */
    async awardSingle(opts: AwardOptions): Promise<XpAwardResult> {
      const { characterId, delta, reason, awardedById, sessionId } = opts;

      if (delta === 0) {
        throw new BadRequestError("Delta não pode ser zero.");
      }
      if (delta < 0 && (!reason || reason.trim().length < 3)) {
        throw new BadRequestError(
          "Subtração de XP exige razão (mínimo 3 caracteres).",
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        const char = await tx.character.findUnique({
          where: { id: characterId },
          select: {
            id: true,
            userId: true,
            campaignId: true,
            level: true,
            currentXp: true,
          },
        });
        if (!char) throw new NotFoundError("Character");

        const newXp = Math.max(0, char.currentXp + delta);
        const newLevel = Math.max(1, levelForXp(newXp));

        await tx.character.update({
          where: { id: characterId },
          data: { currentXp: newXp, level: newLevel },
        });

        await tx.xpAward.create({
          data: {
            characterId,
            awardedById,
            sessionId: sessionId ?? null,
            delta,
            reason: reason?.trim() || null,
          },
        });

        return {
          character: char,
          previousLevel: char.level,
          newLevel,
          previousXp: char.currentXp,
          newXp,
        };
      });

      const leveledUp = result.newLevel > result.previousLevel;

      // Side effects fora da transação (rede pode falhar; não desfazer
      // o DB por causa de socket/cache).
      if (result.character.campaignId) {
        void invalidateCampaignDashboardCache(result.character.campaignId);
      }
      if (sessionId) {
        emitCharacterXpChanged({
          sessionId,
          characterId,
          ownerUserId: result.character.userId,
          delta,
          newXp: result.newXp,
          newLevel: result.newLevel,
          leveledUp,
          by: awardedById,
          at: new Date().toISOString(),
        });
      }

      return {
        characterId,
        previousLevel: result.previousLevel,
        newLevel: result.newLevel,
        previousXp: result.previousXp,
        newXp: result.newXp,
        leveledUp,
      };
    },

    /** Bulk: GM termina sessão e dá X XP pra todos os personagens da
     *  campanha. Bônus individual opcional por personagem. */
    async awardBulkSession(
      sessionId: string,
      awardedById: string,
      input: BulkSessionAwardInput,
    ): Promise<XpAwardResult[]> {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { id: true, campaignId: true },
      });
      if (!session) throw new NotFoundError("Session");
      if (!session.campaignId) {
        throw new BadRequestError("Sessão sem campanha vinculada.");
      }

      // Personagens da campanha pertencentes a PLAYERS (não conta NPCs
      // do GM). Aproximação: Character cujo dono é membro PLAYER.
      const partyMembers = await prisma.campaignMember.findMany({
        where: {
          campaignId: session.campaignId,
          leftAt: null,
          role: "PLAYER",
        },
        select: { userId: true },
      });
      const partyUserIds = partyMembers.map((m) => m.userId);

      const characters = await prisma.character.findMany({
        where: {
          campaignId: session.campaignId,
          userId: { in: partyUserIds },
          deletedAt: null,
        },
        select: { id: true },
      });

      const results: XpAwardResult[] = [];
      for (const char of characters) {
        const bonus = input.perCharacter?.[char.id] ?? 0;
        const total = input.amount + bonus;
        if (total === 0) continue;
        const r = await this.awardSingle({
          characterId: char.id,
          delta: total,
          reason: input.reason ?? "Recompensa de sessão",
          awardedById,
          sessionId,
        });
        results.push(r);
      }
      return results;
    },

    /** Histórico de XP do personagem (mais recente primeiro). */
    async history(
      characterId: string,
      limit = 20,
    ): Promise<XpAwardHistoryItem[]> {
      const awards = await prisma.xpAward.findMany({
        where: { characterId },
        orderBy: { createdAt: "desc" },
        take: Math.min(limit, 100),
        select: {
          id: true,
          delta: true,
          reason: true,
          sessionId: true,
          awardedById: true,
          createdAt: true,
        },
      });
      return awards.map((a) => ({
        id: a.id,
        delta: a.delta,
        reason: a.reason,
        sessionId: a.sessionId,
        awardedById: a.awardedById,
        createdAt: a.createdAt.toISOString(),
      }));
    },

    /** Ajuste manual single (validação leve do schema antes). */
    async awardManual(
      characterId: string,
      awardedById: string,
      input: SingleCharacterAwardInput,
    ): Promise<XpAwardResult> {
      return this.awardSingle({
        characterId,
        delta: input.delta,
        reason: input.reason,
        awardedById,
      });
    },
  };
}

export type XpService = ReturnType<typeof createXpService>;
