import type { PrismaClient } from "@questboard/db";

interface GateResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
  used?: number;
  remaining?: number;
  requiredPlan?: string;
}

interface SessionFeatures {
  fogOfWar: boolean;
  dynamicLighting: boolean;
  lineOfSight: boolean;
  whisper: boolean;
  secretNotes: boolean;
  soundtrack: boolean;
  initiativeTracker: boolean;
  npcAssistant: boolean;
  progressiveReveal: boolean;
  maxMapLayers: number;
  maxFileUploadMb: number;
}

// In-memory cache for plan limits (refreshed every 5 minutes)
const limitsCache = new Map<string, { data: Record<string, unknown>; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export function createPlanGateService(prisma: PrismaClient) {
  async function getLimits(plan: string) {
    const cacheKey = `plan_limits:${plan}`;
    const cached = limitsCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const limits = await prisma.planLimit.findUnique({ where: { plan: plan as "FREE" } });
    if (!limits) throw new Error(`Plan limits not found for plan: ${plan}`);

    limitsCache.set(cacheKey, { data: limits as unknown as Record<string, unknown>, expiresAt: Date.now() + CACHE_TTL_MS });
    return limits;
  }

  return {
    async canCreateSession(userId: string): Promise<GateResult> {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      });
      if (!user) return { allowed: false, reason: "USER_NOT_FOUND" };

      const limits = await getLimits(user.plan);
      if (limits.maxActiveSessions === 0) {
        return { allowed: false, reason: "FEATURE_NOT_AVAILABLE", requiredPlan: "ADVENTURER" };
      }

      const activeSessions = await prisma.session.count({
        where: { ownerId: userId, status: { in: ["IDLE", "LIVE", "PAUSED"] }, deletedAt: null },
      });

      if (activeSessions >= limits.maxActiveSessions) {
        return { allowed: false, reason: "MAX_SESSIONS_REACHED", limit: limits.maxActiveSessions };
      }
      return { allowed: true, remaining: limits.maxActiveSessions - activeSessions };
    },

    async canJoinSession(sessionId: string): Promise<GateResult> {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          owner: { select: { plan: true } },
          _count: { select: { players: true } },
        },
      });
      if (!session) return { allowed: false, reason: "SESSION_NOT_FOUND" };

      const gmLimits = await getLimits(session.owner.plan);
      if (session._count.players >= gmLimits.maxPlayersPerSession) {
        return { allowed: false, reason: "SESSION_FULL", limit: gmLimits.maxPlayersPerSession };
      }
      return { allowed: true };
    },

    async canGenerateAiMap(userId: string): Promise<GateResult> {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      });
      if (!user) return { allowed: false, reason: "USER_NOT_FOUND" };

      const limits = await getLimits(user.plan);
      if (limits.maxAiMapsPerMonth === 0) {
        return { allowed: false, reason: "FEATURE_NOT_AVAILABLE", requiredPlan: "ADVENTURER" };
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyUsage = await prisma.map.count({
        where: {
          session: { ownerId: userId },
          aiGenerated: true,
          createdAt: { gte: startOfMonth },
        },
      });

      if (monthlyUsage >= limits.maxAiMapsPerMonth) {
        return { allowed: false, reason: "MONTHLY_LIMIT_REACHED", limit: limits.maxAiMapsPerMonth, used: monthlyUsage };
      }
      return { allowed: true, remaining: limits.maxAiMapsPerMonth - monthlyUsage };
    },

    async canAddFriend(userId: string): Promise<GateResult> {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      });
      if (!user) return { allowed: false, reason: "USER_NOT_FOUND" };

      const limits = await getLimits(user.plan);
      const friendCount = await prisma.friendship.count({
        where: {
          OR: [
            { senderId: userId, status: "ACCEPTED" },
            { receiverId: userId, status: "ACCEPTED" },
          ],
        },
      });

      if (friendCount >= limits.maxFriends) {
        return { allowed: false, reason: "MAX_FRIENDS_REACHED", limit: limits.maxFriends };
      }
      return { allowed: true, remaining: limits.maxFriends - friendCount };
    },

    async getSessionFeatures(sessionId: string): Promise<SessionFeatures> {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { owner: { select: { plan: true } } },
      });
      if (!session) throw new Error("Session not found");

      const gmLimits = await getLimits(session.owner.plan);
      return {
        fogOfWar: gmLimits.allowFogOfWar,
        dynamicLighting: gmLimits.allowDynamicLighting,
        lineOfSight: gmLimits.allowLineOfSight,
        whisper: gmLimits.allowWhisper,
        secretNotes: gmLimits.allowSecretNotes,
        soundtrack: gmLimits.allowSoundtrack,
        initiativeTracker: gmLimits.allowInitiativeTracker,
        npcAssistant: gmLimits.allowNpcAssistant,
        progressiveReveal: gmLimits.allowProgressiveReveal,
        maxMapLayers: gmLimits.maxMapLayers,
        maxFileUploadMb: gmLimits.maxFileUploadMb,
      };
    },

    async getLimitsForUser(userId: string) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      });
      if (!user) throw new Error("User not found");
      return getLimits(user.plan);
    },

    async getUsage(userId: string) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      });
      if (!user) throw new Error("User not found");

      const limits = await getLimits(user.plan);

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [activeSessions, aiMapsThisMonth, friendCount, characterCount] = await Promise.all([
        prisma.session.count({
          where: { ownerId: userId, status: { in: ["IDLE", "LIVE", "PAUSED"] }, deletedAt: null },
        }),
        prisma.map.count({
          where: { session: { ownerId: userId }, aiGenerated: true, createdAt: { gte: startOfMonth } },
        }),
        prisma.friendship.count({
          where: {
            OR: [
              { senderId: userId, status: "ACCEPTED" },
              { receiverId: userId, status: "ACCEPTED" },
            ],
          },
        }),
        prisma.character.count({
          where: { userId, deletedAt: null },
        }),
      ]);

      return {
        activeSessions: { used: activeSessions, limit: limits.maxActiveSessions },
        aiMapsThisMonth: { used: aiMapsThisMonth, limit: limits.maxAiMapsPerMonth },
        storageMb: { used: 0, limit: limits.maxStorageMb }, // TODO: Calculate actual storage usage
        friends: { used: friendCount, limit: limits.maxFriends },
        characters: { used: characterCount, limit: limits.maxCharactersPerPlayer },
      };
    },

    clearCache() {
      limitsCache.clear();
    },
  };
}

export type PlanGateService = ReturnType<typeof createPlanGateService>;
