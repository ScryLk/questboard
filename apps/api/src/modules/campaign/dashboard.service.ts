// ── Dashboard service ──
//
// Agrega 5 fontes em UMA chamada:
//   1. Totais (count sessions, sum durations, avg level)
//   2. Próxima sessão (futuro mais próximo)
//   3. Progresso de história (NarrativeNode count by status)
//   4. Sessões recentes (top 5 ENDED/CANCELLED)
//   5. Card condicional ao role (userCharacter vs gmPanel)
//
// Cache 60s por (campaignId, userId) — o response varia com o role.

import type { PrismaClient } from "@questboard/db";
import {
  type DashboardDto,
  dashboardDtoSchema,
} from "@questboard/validators";
import {
  levelForXp,
  nextRewardLevel,
  titleForLevel,
  xpToNextLevel,
  MAX_LEVEL,
} from "@questboard/game-engine";
import {
  NotFoundError,
  ForbiddenError,
} from "../../errors/app-error.js";
import { getOrSet, invalidate } from "../../lib/cache.js";

const CACHE_TTL_SECONDS = 60;

function cacheKey(campaignId: string, userId: string): string {
  return `dashboard:campaign:${campaignId}:user:${userId}`;
}

/** Apaga cache de todos os viewers de uma campanha. Chamar quando
 *  algo que afeta dashboard mudar (sessão termina, XP muda, etc). */
export function invalidateCampaignDashboardCache(
  campaignId: string,
): Promise<void> {
  return invalidate(`dashboard:campaign:${campaignId}:user:*`);
}

export function createDashboardService(prisma: PrismaClient) {
  return {
    async get(campaignId: string, userId: string): Promise<DashboardDto> {
      return getOrSet(cacheKey(campaignId, userId), CACHE_TTL_SECONDS, () =>
        buildDashboard(prisma, campaignId, userId),
      );
    },
  };
}

async function buildDashboard(
  prisma: PrismaClient,
  campaignId: string,
  userId: string,
): Promise<DashboardDto> {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, deletedAt: null },
    select: { id: true, name: true, ownerId: true },
  });
  if (!campaign) throw new NotFoundError("Campaign");

  // Owner é GM implícito; demais via CampaignMember (com leftAt null).
  const membership = await prisma.campaignMember.findFirst({
    where: { campaignId, userId, leftAt: null },
    select: { role: true },
  });

  let viewerRole: DashboardDto["viewerRole"];
  if (campaign.ownerId === userId) {
    viewerRole = "GM";
  } else if (membership) {
    viewerRole = membership.role;
  } else {
    throw new ForbiddenError("Não é membro desta campanha");
  }

  const [
    sessionsAggregate,
    nextSession,
    narrativeByStatus,
    recentSessions,
    averageLevelAgg,
  ] = await Promise.all([
    // 1. Totais — sessões ENDED + duração
    prisma.session.findMany({
      where: {
        campaignId,
        deletedAt: null,
        status: { in: ["ENDED"] },
        startedAt: { not: null },
        endedAt: { not: null },
      },
      select: { startedAt: true, endedAt: true },
    }),

    // 2. Próxima sessão — futura agendada (status IDLE/LOBBY com
    //    scheduledAt no futuro). Mais cedo primeiro.
    prisma.session.findFirst({
      where: {
        campaignId,
        deletedAt: null,
        status: { in: ["IDLE", "LOBBY"] },
        scheduledAt: { gt: new Date() },
      },
      orderBy: { scheduledAt: "asc" },
      select: { id: true, name: true, scheduledAt: true },
    }),

    // 3. Story progress — NarrativeNode agrupado por status.
    //    "completed" = status 'active' (já chegou nesse ponto da história).
    //    "pending" = status 'pending'. "discarded"/"hidden" não contam.
    prisma.narrativeNode.groupBy({
      by: ["status"],
      where: { campaignId },
      _count: { id: true },
    }),

    // 4. Sessões recentes — top 5 ENDED/CANCELLED ordenadas por endedAt.
    prisma.session.findMany({
      where: {
        campaignId,
        deletedAt: null,
        status: { in: ["ENDED", "CANCELLED"] },
      },
      orderBy: { endedAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        startedAt: true,
        endedAt: true,
        status: true,
        createdAt: true,
      },
    }),

    // 5. Nível médio — média de Character.level na campanha.
    prisma.character.aggregate({
      where: { campaignId, deletedAt: null },
      _avg: { level: true },
      _count: { id: true },
    }),
  ]);

  // ── Cálculo: horas jogadas
  const totalSecondsPlayed = sessionsAggregate.reduce((acc, s) => {
    if (!s.startedAt || !s.endedAt) return acc;
    return acc + (s.endedAt.getTime() - s.startedAt.getTime()) / 1000;
  }, 0);
  const hoursPlayed = Math.round((totalSecondsPlayed / 3600) * 10) / 10;

  // ── Cálculo: nível médio
  const averagePlayerLevel =
    averageLevelAgg._count.id > 0
      ? Math.round((averageLevelAgg._avg.level ?? 1) * 10) / 10
      : null;

  // ── Story progress
  const statusCounts = new Map<string, number>(
    narrativeByStatus.map((g) => [g.status, g._count.id]),
  );
  const completedEvents = statusCounts.get("active") ?? 0;
  const pendingEvents = statusCounts.get("pending") ?? 0;
  const totalEvents = completedEvents + pendingEvents;
  const percentage =
    totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

  // ── Recent sessions: numeração descendente (mais nova = N, anterior = N-1...)
  const totalSessionsForNumbering = await prisma.session.count({
    where: {
      campaignId,
      deletedAt: null,
      status: { in: ["ENDED", "CANCELLED"] },
    },
  });
  const recentSessionsDto = recentSessions.map((s, idx) => {
    const durationMinutes =
      s.startedAt && s.endedAt
        ? Math.max(
            0,
            Math.round(
              (s.endedAt.getTime() - s.startedAt.getTime()) / 60000,
            ),
          )
        : 0;
    return {
      id: s.id,
      number: totalSessionsForNumbering - idx,
      title: s.name,
      playedAt: (s.endedAt ?? s.createdAt).toISOString(),
      durationMinutes,
      status: s.status as "ENDED" | "CANCELLED",
    };
  });

  // ── Card condicional ao role
  let userCharacter: DashboardDto["userCharacter"] = null;
  let gmPanel: DashboardDto["gmPanel"] = null;

  if (viewerRole === "PLAYER") {
    const char = await prisma.character.findFirst({
      where: { campaignId, userId, deletedAt: null },
      select: { id: true, name: true, level: true, currentXp: true },
      orderBy: { updatedAt: "desc" },
    });
    if (char) {
      const trustedLevel = Math.max(char.level, levelForXp(char.currentXp));
      const next = nextRewardLevel(trustedLevel);
      userCharacter = {
        id: char.id,
        name: char.name,
        level: trustedLevel,
        currentXp: char.currentXp,
        xpToNextLevel: xpToNextLevel(char.currentXp, trustedLevel),
        nextRewardLevel: next,
        nextRewardTitle: next ? titleForLevel(next) : null,
      };
    }
  } else if (viewerRole === "GM" || viewerRole === "CO_GM") {
    // NPCs = Characters da campanha cujo dono não é membro PLAYER (NPCs
    // são criados pelo GM). Aproximação razoável dado o schema atual —
    // se um modelo NpcProfile dedicado for criado, trocar pra ele.
    const [sessionsHosted, mapsUsed, npcsCreated] = await Promise.all([
      prisma.session.count({
        where: {
          campaignId,
          gmId: userId,
          deletedAt: null,
          status: { in: ["ENDED", "CANCELLED"] },
        },
      }),
      prisma.map.count({
        where: { session: { campaignId, deletedAt: null } },
      }),
      // NPCs criados nesta campanha pelo próprio usuário (qualquer Character
      // que o GM/CO_GM criou e pertence a campaign — Character.userId é o
      // dono; pra MVP contamos os de propriedade do GM).
      prisma.character.count({
        where: { campaignId, userId, deletedAt: null },
      }),
    ]);
    gmPanel = { sessionsHosted, npcsCreated, mapsUsed };
  }

  const dto: DashboardDto = {
    campaign: { id: campaign.id, name: campaign.name },
    totals: {
      sessions: sessionsAggregate.length,
      hoursPlayed,
      averagePlayerLevel,
    },
    nextSession: nextSession
      ? {
          id: nextSession.id,
          title: nextSession.name,
          scheduledFor: nextSession.scheduledAt!.toISOString(),
        }
      : null,
    storyProgress: { completedEvents, totalEvents, percentage },
    recentSessions: recentSessionsDto,
    userCharacter,
    gmPanel,
    viewerRole,
  };

  // Falha rápido em dev se algo divergir do contrato.
  return dashboardDtoSchema.parse(dto);
}

// Suprime warning de import não usado quando MAX_LEVEL não é referenciado direto.
void MAX_LEVEL;

export type DashboardService = ReturnType<typeof createDashboardService>;
