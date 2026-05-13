import type { PrismaClient } from "@questboard/db";
import { NotFoundError, BadRequestError } from "../../errors/app-error.js";
import { uploadFile, deleteFile } from "../../lib/r2.js";
import {
  formatHandle,
  isReservedUsername,
  usernameSchema,
} from "@questboard/validators";
import { generateUniqueTag } from "../../lib/handle-generator.js";

/** Cooldowns em milissegundos. */
const USERNAME_CHANGE_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
const TAG_REROLL_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
const FREE_TAG_REROLLS = 1;

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

    // ── Handle (Name#TAG) ──────────────────────────────────────

    /** Retorna o handle do usuário no formato pronto pra UI. */
    async getMyHandle(userId: string) {
      const u = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          tag: true,
          usernameChangedAt: true,
          tagChangedAt: true,
          tagRerollsUsed: true,
        },
      });
      if (!u) throw new NotFoundError("User");
      return {
        username: u.username,
        tag: u.tag,
        handle: formatHandle(u.username, u.tag),
        canChangeUsernameAt: nextAllowedAt(
          u.usernameChangedAt,
          USERNAME_CHANGE_COOLDOWN_MS,
        ),
        canRerollTagAt:
          u.tagRerollsUsed < FREE_TAG_REROLLS
            ? new Date(0).toISOString()
            : nextAllowedAt(u.tagChangedAt, TAG_REROLL_COOLDOWN_MS),
        freeRerollsLeft: Math.max(0, FREE_TAG_REROLLS - u.tagRerollsUsed),
      };
    },

    /** Troca o username. Gera novo tag automaticamente (o usuário
     *  "perde" o tag antigo, mas ganha um novo pareado com o nome novo).
     *  Aplica cooldown de 30 dias. */
    async updateUsername(userId: string, rawUsername: string) {
      const u = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, usernameChangedAt: true },
      });
      if (!u) throw new NotFoundError("User");

      const parsed = usernameSchema.safeParse(rawUsername);
      if (!parsed.success) {
        throw new BadRequestError(
          parsed.error.issues[0]?.message ?? "Username inválido.",
        );
      }
      const username = parsed.data;

      if (isReservedUsername(username)) {
        throw new BadRequestError("Esse nome é reservado.");
      }

      // Cooldown — só vale após a 1ª escolha (que é grátis).
      if (
        u.username.toLowerCase() !== username.toLowerCase() &&
        u.usernameChangedAt &&
        Date.now() - u.usernameChangedAt.getTime() <
          USERNAME_CHANGE_COOLDOWN_MS
      ) {
        const next = new Date(
          u.usernameChangedAt.getTime() + USERNAME_CHANGE_COOLDOWN_MS,
        );
        throw new BadRequestError(
          `Você só pode mudar o nome após ${next.toLocaleDateString("pt-BR")}.`,
        );
      }

      // No-op se username é o mesmo (case-insensitive).
      if (u.username.toLowerCase() === username.toLowerCase()) {
        return this.getMyHandle(userId);
      }

      const tag = await generateUniqueTag({
        username,
        isTaken: (t) => isHandleTaken(prisma, username, t, userId),
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          username,
          tag,
          usernameChangedAt: new Date(),
          // Trocar nome zera contagem de reroll de tag (handle novo).
          tagRerollsUsed: 0,
          tagChangedAt: null,
        },
      });

      return this.getMyHandle(userId);
    },

    /** Reroll do tag (mantém username). 1ª vez é grátis; depois 30 dias. */
    async rerollTag(userId: string) {
      const u = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          tag: true,
          tagChangedAt: true,
          tagRerollsUsed: true,
        },
      });
      if (!u) throw new NotFoundError("User");

      if (
        u.tagRerollsUsed >= FREE_TAG_REROLLS &&
        u.tagChangedAt &&
        Date.now() - u.tagChangedAt.getTime() < TAG_REROLL_COOLDOWN_MS
      ) {
        const next = new Date(
          u.tagChangedAt.getTime() + TAG_REROLL_COOLDOWN_MS,
        );
        throw new BadRequestError(
          `Próximo reroll disponível em ${next.toLocaleDateString("pt-BR")}.`,
        );
      }

      const newTag = await generateUniqueTag({
        username: u.username,
        isTaken: (t) =>
          t.toUpperCase() === u.tag.toUpperCase()
            ? Promise.resolve(true)
            : isHandleTaken(prisma, u.username, t, userId),
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          tag: newTag,
          tagChangedAt: new Date(),
          tagRerollsUsed: { increment: 1 },
        },
      });

      return this.getMyHandle(userId);
    },

    /** Autocomplete de usuários por prefixo de username (case-insens). */
    async searchByHandle(query: string, limit = 10) {
      const q = query.trim().toLowerCase();
      if (q.length < 2) return [];
      const users = await prisma.user.findMany({
        where: {
          username: { startsWith: q, mode: "insensitive" },
          isActive: true,
          deletedAt: null,
        },
        select: {
          id: true,
          username: true,
          tag: true,
          displayName: true,
          avatarUrl: true,
        },
        take: Math.min(limit, 25),
        orderBy: { username: "asc" },
      });
      return users.map((u) => ({
        id: u.id,
        username: u.username,
        tag: u.tag,
        handle: formatHandle(u.username, u.tag),
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
      }));
    },

    /** Resolve "username + tag" pra um userId (case-insensitive). */
    async resolveHandle(username: string, tag: string) {
      const u = await prisma.user.findFirst({
        where: {
          username: { equals: username, mode: "insensitive" },
          tag: { equals: tag.toUpperCase(), mode: "insensitive" },
          isActive: true,
          deletedAt: null,
        },
        select: {
          id: true,
          username: true,
          tag: true,
          displayName: true,
          avatarUrl: true,
        },
      });
      if (!u) throw new NotFoundError("User");
      return {
        ...u,
        handle: formatHandle(u.username, u.tag),
      };
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

      // Gera username candidato (do Clerk se vier, senão do email).
      // Sanitiza pra [a-z0-9_-] e respeita o limite de 16 chars do schema.
      const rawUsername = clerkUser.username ?? email.split("@")[0]!;
      const baseUsername = rawUsername
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "")
        .slice(0, 16) || `player${clerkUser.id.slice(-6).toLowerCase()}`;

      // Se já existe esse externalId, faz update sem mexer no handle.
      const existing = await prisma.user.findUnique({
        where: { externalId: clerkUser.id },
        select: { id: true },
      });

      if (existing) {
        return prisma.user.update({
          where: { externalId: clerkUser.id },
          data: {
            email,
            displayName,
            avatarUrl: clerkUser.image_url ?? undefined,
            emailVerified: true,
          },
        });
      }

      // Novo usuário: gera tag único pareado com `baseUsername`.
      const tag = await generateUniqueTag({
        username: baseUsername,
        isTaken: async (t) => {
          const collide = await prisma.user.findFirst({
            where: {
              username: { equals: baseUsername, mode: "insensitive" },
              tag: { equals: t.toUpperCase(), mode: "insensitive" },
            },
            select: { id: true },
          });
          return collide !== null;
        },
      });

      return prisma.user.create({
        data: {
          externalId: clerkUser.id,
          email,
          displayName,
          avatarUrl: clerkUser.image_url ?? undefined,
          username: baseUsername,
          tag,
          emailVerified: true,
          stats: { create: {} },
        },
      });
    },

    /** Soft delete disparado pelo webhook `user.deleted` do Clerk.
     *  Anonimiza email/displayName/avatar pra cumprir LGPD/GDPR
     *  preservando integridade referencial (sessions, mensagens,
     *  audit log apontam pra esse user). Mantém o registro mas marca
     *  `deletedAt` e `isActive=false`. */
    async softDeleteFromClerk(clerkId: string) {
      const user = await prisma.user.findUnique({
        where: { externalId: clerkId },
        select: { id: true, deletedAt: true },
      });
      if (!user) return null; // idempotente: webhook duplicado é noop
      if (user.deletedAt) return user; // já deletado

      const anonEmail = `deleted+${user.id}@questboard.local`;
      const anonUsername = `deleted-${user.id.slice(0, 8)}`;
      return prisma.user.update({
        where: { id: user.id },
        data: {
          email: anonEmail,
          username: anonUsername,
          displayName: "Usuário removido",
          avatarUrl: null,
          bio: null,
          isActive: false,
          deletedAt: new Date(),
        },
      });
    },
  };
}

export type UserService = ReturnType<typeof createUserService>;

// ── Helpers privados ────────────────────────────────────────────

/** Próxima data permitida pra ação, ou epoch quando nunca foi feita. */
function nextAllowedAt(last: Date | null, cooldownMs: number): string {
  if (!last) return new Date(0).toISOString();
  const next = new Date(last.getTime() + cooldownMs);
  return next.toISOString();
}

/** Verifica se um par (username, tag) já está em uso por outro user.
 *  Case-insensitive nos dois lados. */
async function isHandleTaken(
  prisma: PrismaClient,
  username: string,
  tag: string,
  excludeUserId: string,
): Promise<boolean> {
  const existing = await prisma.user.findFirst({
    where: {
      username: { equals: username, mode: "insensitive" },
      tag: { equals: tag.toUpperCase(), mode: "insensitive" },
      NOT: { id: excludeUserId },
    },
    select: { id: true },
  });
  return existing !== null;
}
