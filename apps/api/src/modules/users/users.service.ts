import type { PrismaClient } from "@questboard/db";
import type { UpdateProfileInput, UpdatePreferencesInput } from "@questboard/shared";
import { NotFoundError, ConflictError } from "../../errors/app-error.js";

const USER_PUBLIC_SELECT = {
  id: true,
  displayName: true,
  username: true,
  avatarUrl: true,
  bannerUrl: true,
  bio: true,
  plan: true,
  isOnline: true,
  lastSeenAt: true,
  createdAt: true,
} as const;

const USER_ME_SELECT = {
  ...USER_PUBLIC_SELECT,
  email: true,
  locale: true,
  timezone: true,
  preferences: true,
  onboardingCompleted: true,
  trialUsed: true,
} as const;

export function createUsersService(prisma: PrismaClient) {
  return {
    async getMe(userId: string) {
      const user = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
        select: USER_ME_SELECT,
      });
      if (!user) throw new NotFoundError("Usuário");
      return user;
    },

    async getById(userId: string) {
      const user = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
        select: USER_PUBLIC_SELECT,
      });
      if (!user) throw new NotFoundError("Usuário");
      return user;
    },

    async updateProfile(userId: string, input: UpdateProfileInput) {
      if (input.username) {
        const existing = await prisma.user.findUnique({
          where: { username: input.username },
          select: { id: true },
        });
        if (existing && existing.id !== userId) {
          throw new ConflictError("Username já em uso");
        }
      }

      return prisma.user.update({
        where: { id: userId },
        data: input,
        select: USER_ME_SELECT,
      });
    },

    async updatePreferences(userId: string, input: UpdatePreferencesInput) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true },
      });
      if (!user) throw new NotFoundError("Usuário");

      const currentPrefs = (user.preferences as Record<string, unknown>) ?? {};
      const merged = deepMerge(currentPrefs, input);

      return prisma.user.update({
        where: { id: userId },
        data: { preferences: merged },
        select: USER_ME_SELECT,
      });
    },

    async search(query: string, currentUserId: string) {
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null,
          id: { not: currentUserId },
          OR: [
            { displayName: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } },
          ],
        },
        select: USER_PUBLIC_SELECT,
        take: 20,
        orderBy: { displayName: "asc" },
      });
      return users;
    },

    async findByClerkId(clerkId: string) {
      return prisma.user.findUnique({
        where: { clerkId },
        select: { ...USER_ME_SELECT, id: true, clerkId: true, deletedAt: true },
      });
    },
  };
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const val = source[key];
    if (val && typeof val === "object" && !Array.isArray(val) && typeof result[key] === "object" && result[key] !== null) {
      result[key] = deepMerge(result[key] as Record<string, unknown>, val as Record<string, unknown>);
    } else {
      result[key] = val;
    }
  }
  return result;
}

export type UsersService = ReturnType<typeof createUsersService>;
