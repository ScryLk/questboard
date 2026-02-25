import type { PrismaClient, Prisma } from "@questboard/db";
import { ForbiddenError } from "../../errors/app-error.js";

export function createExplorationLogService(prisma: PrismaClient) {
  async function assertSessionPlayer(sessionId: string, userId: string) {
    const player = await prisma.sessionPlayer.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    if (!player) throw new ForbiddenError("Não é jogador");
    return player;
  }

  return {
    async log(
      sessionId: string,
      mapId: string,
      event: string,
      actorId: string | null,
      tokenId: string | null,
      data: Record<string, unknown>,
      options?: { visibleTo?: string[]; channel?: string }
    ) {
      return prisma.explorationLog.create({
        data: {
          sessionId,
          mapId,
          event: event as any,
          actorId,
          tokenId,
          data: data as Prisma.InputJsonValue,
          visibleTo: options?.visibleTo ?? [],
          channel: options?.channel ?? "exploration",
        },
      });
    },

    async list(sessionId: string, userId: string, options?: {
      mapId?: string;
      event?: string;
      limit?: number;
      cursor?: string;
    }) {
      const player = await assertSessionPlayer(sessionId, userId);
      const isGm = ["GM", "CO_GM"].includes(player.role);

      const where: Prisma.ExplorationLogWhereInput = { sessionId };
      if (options?.mapId) where.mapId = options.mapId;
      if (options?.event) where.event = options.event as any;

      // Non-GM players can only see public logs or ones visible to them
      if (!isGm) {
        where.OR = [
          { visibleTo: { isEmpty: true } },
          { visibleTo: { has: userId } },
        ];
        where.channel = { not: "gm_only" };
      }

      if (options?.cursor) {
        where.id = { lt: options.cursor };
      }

      return prisma.explorationLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: options?.limit ?? 50,
      });
    },

    async getSummary(sessionId: string, userId: string) {
      const player = await assertSessionPlayer(sessionId, userId);

      const counts = await prisma.explorationLog.groupBy({
        by: ["event"],
        where: { sessionId },
        _count: true,
      });

      const total = await prisma.explorationLog.count({ where: { sessionId } });

      return {
        total,
        byEvent: Object.fromEntries(counts.map((c) => [c.event, c._count])),
      };
    },
  };
}

export type ExplorationLogService = ReturnType<typeof createExplorationLogService>;
