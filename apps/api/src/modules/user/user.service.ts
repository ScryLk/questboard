import type { PrismaClient } from "@questboard/db";
import { NotFoundError, BadRequestError } from "../../errors/app-error.js";
import { uploadFile, deleteFile } from "../../lib/r2.js";

export function createUserService(prisma: PrismaClient) {
  return {
    async getProfile(userId: string) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          stats: true,
          subscription: { select: { plan: true, status: true, billingCycle: true, currentPeriodEnd: true } },
          _count: { select: { campaigns: true, characters: true, ownedSessions: true } },
        },
      });
      if (!user) throw new NotFoundError("User");
      return user;
    },

    async updateProfile(userId: string, input: { displayName?: string; bio?: string; timezone?: string; locale?: string }) {
      return prisma.user.update({
        where: { id: userId },
        data: input,
      });
    },

    async uploadAvatar(userId: string, buffer: Buffer, contentType: string) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } });
      if (!user) throw new NotFoundError("User");

      // Delete old avatar if exists
      if (user.avatarUrl) {
        const oldKey = user.avatarUrl.split("/").pop();
        if (oldKey) await deleteFile(`avatars/${oldKey}`).catch(() => {});
      }

      const key = `avatars/${userId}-${Date.now()}.${contentType.split("/")[1] ?? "png"}`;
      const url = await uploadFile(key, buffer, contentType);

      await prisma.user.update({ where: { id: userId }, data: { avatarUrl: url } });
      return { avatarUrl: url };
    },

    async getStats(userId: string) {
      let stats = await prisma.userStats.findUnique({ where: { userId } });
      if (!stats) {
        stats = await prisma.userStats.create({ data: { userId } });
      }
      return stats;
    },

    async listNotifications(userId: string, opts: { isRead?: boolean; cursor?: string; limit?: number }) {
      const limit = Math.min(opts.limit ?? 20, 50);
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          ...(opts.isRead !== undefined ? { isRead: opts.isRead } : {}),
          ...(opts.cursor ? { createdAt: { lt: new Date(opts.cursor) } } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
      });

      const hasMore = notifications.length > limit;
      if (hasMore) notifications.pop();

      return {
        notifications,
        nextCursor: hasMore ? notifications[notifications.length - 1]!.createdAt.toISOString() : null,
      };
    },

    async markNotificationRead(userId: string, notificationId: string) {
      const notification = await prisma.notification.findFirst({
        where: { id: notificationId, userId },
      });
      if (!notification) throw new NotFoundError("Notification");

      return prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true, readAt: new Date() },
      });
    },

    async registerDevice(userId: string, token: string, platform: "IOS" | "ANDROID" | "WEB") {
      return prisma.deviceToken.upsert({
        where: { token },
        create: { userId, token, platform },
        update: { userId, platform, isActive: true, lastSeenAt: new Date() },
      });
    },

    async removeDevice(userId: string, deviceId: string) {
      const device = await prisma.deviceToken.findFirst({ where: { id: deviceId, userId } });
      if (!device) throw new NotFoundError("DeviceToken");

      return prisma.deviceToken.delete({ where: { id: deviceId } });
    },

    // Clerk webhook sync
    async syncFromClerk(clerkUser: {
      id: string;
      email_addresses: { email_address: string; id: string }[];
      first_name?: string | null;
      last_name?: string | null;
      image_url?: string | null;
      username?: string | null;
    }) {
      const email = clerkUser.email_addresses[0]?.email_address;
      if (!email) throw new BadRequestError("Email ausente no payload Clerk");

      const displayName = [clerkUser.first_name, clerkUser.last_name].filter(Boolean).join(" ") || email.split("@")[0]!;

      return prisma.user.upsert({
        where: { externalId: clerkUser.id },
        create: {
          externalId: clerkUser.id,
          email,
          displayName,
          avatarUrl: clerkUser.image_url ?? undefined,
          username: clerkUser.username ?? undefined,
          emailVerified: true,
          stats: { create: {} },
        },
        update: {
          email,
          displayName,
          avatarUrl: clerkUser.image_url ?? undefined,
          emailVerified: true,
        },
      });
    },
  };
}

export type UserService = ReturnType<typeof createUserService>;
