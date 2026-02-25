import type { PrismaClient } from "@questboard/db";
import type { RegisterDeviceTokenInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createNotificationsService(prisma: PrismaClient) {
  return {
    async list(userId: string, options: { unread?: boolean; page: number; pageSize: number }) {
      const where: Record<string, unknown> = { userId };
      if (options.unread) where.isRead = false;

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (options.page - 1) * options.pageSize,
          take: options.pageSize,
        }),
        prisma.notification.count({ where }),
      ]);

      return {
        notifications: notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          actionUrl: n.actionUrl,
          imageUrl: n.imageUrl,
          isRead: n.isRead,
          data: n.data as Record<string, unknown>,
          createdAt: n.createdAt.toISOString(),
        })),
        pagination: {
          page: options.page,
          pageSize: options.pageSize,
          total,
          totalPages: Math.ceil(total / options.pageSize),
        },
      };
    },

    async markAsRead(userId: string, notificationId: string) {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        select: { userId: true },
      });
      if (!notification) throw new NotFoundError("Notificação");
      if (notification.userId !== userId) throw new ForbiddenError("Notificação não pertence ao usuário");

      return prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true, readAt: new Date() },
      });
    },

    async markAllAsRead(userId: string) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
      return { success: true };
    },

    async deleteNotification(userId: string, notificationId: string) {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        select: { userId: true },
      });
      if (!notification) throw new NotFoundError("Notificação");
      if (notification.userId !== userId) throw new ForbiddenError("Notificação não pertence ao usuário");

      return prisma.notification.delete({ where: { id: notificationId } });
    },

    async create(data: {
      userId: string;
      type: string;
      title: string;
      body: string;
      sourceType?: string;
      sourceId?: string;
      actionUrl?: string;
      imageUrl?: string;
      groupKey?: string;
      data?: Record<string, unknown>;
    }) {
      return prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type as "FRIEND_REQUEST",
          title: data.title,
          body: data.body,
          sourceType: data.sourceType,
          sourceId: data.sourceId,
          actionUrl: data.actionUrl,
          imageUrl: data.imageUrl,
          groupKey: data.groupKey,
          data: data.data ?? {},
        },
      });
    },

    async registerDeviceToken(userId: string, input: RegisterDeviceTokenInput) {
      return prisma.deviceToken.upsert({
        where: { token: input.token },
        update: {
          userId,
          platform: input.platform,
          deviceName: input.deviceName,
          isActive: true,
          lastUsedAt: new Date(),
        },
        create: {
          userId,
          token: input.token,
          platform: input.platform,
          deviceName: input.deviceName,
        },
      });
    },
  };
}

export type NotificationsService = ReturnType<typeof createNotificationsService>;
