import type { PrismaClient } from "@questboard/db";

interface TriggerConfig {
  type: "counter" | "event" | "milestone";
  stat?: string;
  threshold?: number;
  event?: string;
  condition?: string;
}

export function createAchievementEngine(prisma: PrismaClient) {
  return {
    async evaluateForUser(userId: string, changedStat: string, newValue: number): Promise<string[]> {
      const candidates = await prisma.achievement.findMany({
        where: {
          isActive: true,
          triggerType: "counter",
          NOT: { userAchievements: { some: { userId } } },
        },
      });

      const unlocked: string[] = [];

      for (const achievement of candidates) {
        const config = achievement.triggerConfig as unknown as TriggerConfig;
        if (config.type === "counter" && config.stat === changedStat && config.threshold !== undefined) {
          if (newValue >= config.threshold) {
            await this.unlock(userId, achievement.id);
            unlocked.push(achievement.key);
          } else {
            // Update progress for counter achievements
            await prisma.userAchievement.upsert({
              where: { userId_achievementId: { userId, achievementId: achievement.id } },
              update: { progress: { current: newValue, target: config.threshold } },
              create: {
                userId,
                achievementId: achievement.id,
                progress: { current: newValue, target: config.threshold },
                unlockedAt: new Date(0), // Not yet unlocked — sentinel value
              },
            });
          }
        }
      }

      return unlocked;
    },

    async evaluateEvent(userId: string, eventName: string): Promise<string[]> {
      const candidates = await prisma.achievement.findMany({
        where: {
          isActive: true,
          triggerType: "event",
          NOT: { userAchievements: { some: { userId } } },
        },
      });

      const unlocked: string[] = [];

      for (const achievement of candidates) {
        const config = achievement.triggerConfig as unknown as TriggerConfig;
        if (config.type === "event" && config.event === eventName) {
          await this.unlock(userId, achievement.id);
          unlocked.push(achievement.key);
        }
      }

      return unlocked;
    },

    async unlock(userId: string, achievementId: string): Promise<void> {
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId } },
        update: { unlockedAt: new Date(), progress: {} },
        create: {
          userId,
          achievementId,
          unlockedAt: new Date(),
        },
      });

      // Create notification
      const achievement = await prisma.achievement.findUnique({
        where: { id: achievementId },
        select: { key: true, name: true, iconUrl: true, rarity: true },
      });

      if (achievement) {
        await prisma.notification.create({
          data: {
            userId,
            type: "ACHIEVEMENT_UNLOCKED",
            title: "Conquista desbloqueada!",
            body: achievement.name,
            imageUrl: achievement.iconUrl,
            actionUrl: "/profile/achievements",
            data: { achievementKey: achievement.key, rarity: achievement.rarity },
          },
        });
      }
    },
  };
}

export type AchievementEngine = ReturnType<typeof createAchievementEngine>;
