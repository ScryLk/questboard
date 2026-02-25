import type { PrismaClient } from "@questboard/db";
import { NotFoundError } from "../../errors/app-error.js";

export function createStatsService(prisma: PrismaClient) {
  return {
    async getMyStats(userId: string) {
      const stats = await prisma.userStats.findUnique({
        where: { userId },
      });
      if (!stats) {
        // Create default stats if not exists
        return prisma.userStats.create({ data: { userId } });
      }
      return stats;
    },

    async getStatsForUser(userId: string) {
      const user = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
        select: { id: true },
      });
      if (!user) throw new NotFoundError("Usuário");

      const stats = await prisma.userStats.findUnique({
        where: { userId },
      });
      if (!stats) throw new NotFoundError("Estatísticas");
      return stats;
    },

    async getLeaderboard(stat: string, page: number, pageSize: number) {
      const validStats = [
        "totalSessions",
        "totalSessionsAsGm",
        "totalDiceRolled",
        "totalNat20s",
        "totalSessionMinutes",
        "longestWeeklyStreak",
      ];

      const orderField = validStats.includes(stat) ? stat : "totalSessions";

      const [entries, total] = await Promise.all([
        prisma.userStats.findMany({
          orderBy: { [orderField]: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            user: { select: { id: true, displayName: true, avatarUrl: true, deletedAt: true } },
          },
        }),
        prisma.userStats.count(),
      ]);

      const startRank = (page - 1) * pageSize;
      const data = entries
        .filter((e) => !e.user.deletedAt)
        .map((entry, index) => ({
          rank: startRank + index + 1,
          userId: entry.user.id,
          displayName: entry.user.displayName,
          avatarUrl: entry.user.avatarUrl,
          value: (entry as Record<string, unknown>)[orderField] as number,
        }));

      return {
        data,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    },

    async incrementStat(userId: string, stat: string, amount: number = 1) {
      await prisma.userStats.upsert({
        where: { userId },
        update: { [stat]: { increment: amount } },
        create: { userId, [stat]: amount },
      });

      // Return new value for achievement evaluation
      const updated = await prisma.userStats.findUnique({
        where: { userId },
        select: { [stat]: true },
      });
      return (updated as Record<string, unknown>)?.[stat] as number ?? 0;
    },
  };
}

export type StatsService = ReturnType<typeof createStatsService>;
