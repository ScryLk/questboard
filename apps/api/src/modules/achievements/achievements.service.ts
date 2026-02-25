import type { PrismaClient } from "@questboard/db";

export function createAchievementsService(prisma: PrismaClient) {
  return {
    async listAll(userId: string) {
      const achievements = await prisma.achievement.findMany({
        where: { isActive: true },
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
        include: {
          userAchievements: {
            where: { userId },
            select: { unlockedAt: true, progress: true },
          },
        },
      });

      return achievements
        .filter((a) => !a.isHidden || a.userAchievements.length > 0)
        .map((a) => {
          const ua = a.userAchievements[0];
          const isUnlocked = ua ? ua.unlockedAt.getTime() > 0 : false;
          return {
            id: a.id,
            key: a.key,
            name: a.name,
            description: a.description,
            iconUrl: a.iconUrl,
            category: a.category,
            rarity: a.rarity,
            sortOrder: a.sortOrder,
            isHidden: a.isHidden,
            unlocked: isUnlocked,
            unlockedAt: isUnlocked ? ua!.unlockedAt.toISOString() : null,
            progress: ua?.progress ?? null,
          };
        });
    },

    async listMine(userId: string) {
      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId, unlockedAt: { gt: new Date(0) } },
        include: {
          achievement: true,
        },
        orderBy: { unlockedAt: "desc" },
      });

      return userAchievements.map((ua) => ({
        id: ua.achievement.id,
        key: ua.achievement.key,
        name: ua.achievement.name,
        description: ua.achievement.description,
        iconUrl: ua.achievement.iconUrl,
        category: ua.achievement.category,
        rarity: ua.achievement.rarity,
        sortOrder: ua.achievement.sortOrder,
        isHidden: ua.achievement.isHidden,
        unlocked: true,
        unlockedAt: ua.unlockedAt.toISOString(),
        progress: null,
      }));
    },

    async listForUser(targetUserId: string) {
      // Public achievements only (unlocked, non-hidden)
      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId: targetUserId, unlockedAt: { gt: new Date(0) } },
        include: {
          achievement: { select: { id: true, key: true, name: true, description: true, iconUrl: true, category: true, rarity: true, sortOrder: true, isHidden: true } },
        },
        orderBy: { unlockedAt: "desc" },
      });

      return userAchievements
        .filter((ua) => !ua.achievement.isHidden)
        .map((ua) => ({
          id: ua.achievement.id,
          key: ua.achievement.key,
          name: ua.achievement.name,
          description: ua.achievement.description,
          iconUrl: ua.achievement.iconUrl,
          category: ua.achievement.category,
          rarity: ua.achievement.rarity,
          sortOrder: ua.achievement.sortOrder,
          isHidden: false,
          unlocked: true,
          unlockedAt: ua.unlockedAt.toISOString(),
          progress: null,
        }));
    },
  };
}

export type AchievementsService = ReturnType<typeof createAchievementsService>;
