import type { PrismaClient } from "@questboard/db";
import { ForbiddenError, NotFoundError, BadRequestError } from "../../errors/app-error.js";

export function createAdminService(prisma: PrismaClient) {
  return {
    async getDashboard() {
      const [totalUsers, activeUsers, totalCampaigns, activeSessions, totalSessions] =
        await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { isActive: true, isBanned: false } }),
          prisma.campaign.count(),
          prisma.session.count({ where: { status: "LIVE" } }),
          prisma.session.count(),
        ]);

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const newUsersThisMonth = await prisma.user.count({
        where: { createdAt: { gte: monthStart } },
      });

      const planDistribution = {
        FREE: await prisma.user.count({ where: { plan: "FREE" } }),
        ADVENTURER: await prisma.user.count({ where: { plan: "ADVENTURER" } }),
        LEGENDARY: await prisma.user.count({ where: { plan: "LEGENDARY" } }),
        PLAYER_PLUS: await prisma.user.count({ where: { plan: "PLAYER_PLUS" } }),
      };

      return {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        totalCampaigns,
        activeSessions,
        totalSessions,
        planDistribution,
      };
    },

    async listUsers(opts: {
      search?: string;
      role?: string;
      plan?: string;
      isBanned?: boolean;
      page?: number;
      limit?: number;
    }) {
      const { search, role, plan, isBanned, page = 1, limit = 20 } = opts;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};
      if (search) {
        where.OR = [
          { email: { contains: search, mode: "insensitive" } },
          { displayName: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
        ];
      }
      if (role) where.role = role;
      if (plan) where.plan = plan;
      if (isBanned !== undefined) where.isBanned = isBanned;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            externalId: true,
            email: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            plan: true,
            isActive: true,
            isBanned: true,
            bannedReason: true,
            createdAt: true,
            _count: { select: { campaigns: true, ownedSessions: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        users: users.map((u: any) => ({
          ...u,
          campaignCount: u._count.campaigns,
          sessionCount: u._count.ownedSessions,
          _count: undefined,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    },

    async getUserDetail(id: string) {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          stats: true,
          subscription: true,
          _count: {
            select: {
              campaigns: true,
              ownedSessions: true,
              characters: true,
              messages: true,
            },
          },
        },
      });

      if (!user) throw new NotFoundError("Usuário");
      return user;
    },

    async changeRole(
      targetId: string,
      newRole: string,
      actorRole: string,
    ) {
      if (!["USER", "ADMIN", "SUPER_ADMIN"].includes(newRole)) {
        throw new BadRequestError("Role inválida");
      }

      const target = await prisma.user.findUnique({
        where: { id: targetId },
        select: { role: true },
      });
      if (!target) throw new NotFoundError("Usuário");

      // ADMIN cannot promote to SUPER_ADMIN or modify other ADMINs/SUPER_ADMINs
      if (actorRole === "ADMIN") {
        if (newRole === "SUPER_ADMIN") {
          throw new ForbiddenError("Apenas super admins podem promover a SUPER_ADMIN");
        }
        if (target.role === "ADMIN" || target.role === "SUPER_ADMIN") {
          throw new ForbiddenError("Admins não podem alterar outros admins");
        }
      }

      return prisma.user.update({
        where: { id: targetId },
        data: { role: newRole as "USER" | "ADMIN" | "SUPER_ADMIN" },
        select: { id: true, role: true, displayName: true },
      });
    },

    async banUser(id: string, reason: string) {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { role: true },
      });
      if (!user) throw new NotFoundError("Usuário");
      if (user.role === "SUPER_ADMIN") {
        throw new ForbiddenError("Não é possível banir um super admin");
      }

      return prisma.user.update({
        where: { id },
        data: { isBanned: true, bannedReason: reason },
        select: { id: true, isBanned: true, bannedReason: true, displayName: true },
      });
    },

    async unbanUser(id: string) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundError("Usuário");

      return prisma.user.update({
        where: { id },
        data: { isBanned: false, bannedReason: null },
        select: { id: true, isBanned: true, displayName: true },
      });
    },

    async listCampaigns(opts: { search?: string; page?: number; limit?: number }) {
      const { search, page = 1, limit = 20 } = opts;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};
      if (search) {
        where.name = { contains: search, mode: "insensitive" };
      }

      const [campaigns, total] = await Promise.all([
        prisma.campaign.findMany({
          where,
          select: {
            id: true,
            name: true,
            system: true,
            isPublic: true,
            createdAt: true,
            owner: { select: { displayName: true, email: true } },
            _count: { select: { members: true, sessions: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.campaign.count({ where }),
      ]);

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        campaigns: campaigns.map((c: any) => ({
          ...c,
          ownerName: c.owner.displayName,
          ownerEmail: c.owner.email,
          memberCount: c._count.members,
          sessionCount: c._count.sessions,
          owner: undefined,
          _count: undefined,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    },

    async listSessions(opts: { status?: string; page?: number; limit?: number }) {
      const { status, page = 1, limit = 20 } = opts;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};
      if (status) where.status = status;

      const [sessions, total] = await Promise.all([
        prisma.session.findMany({
          where,
          select: {
            id: true,
            name: true,
            system: true,
            status: true,
            maxPlayers: true,
            startedAt: true,
            createdAt: true,
            campaign: { select: { name: true } },
            owner: { select: { displayName: true } },
            _count: { select: { players: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.session.count({ where }),
      ]);

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sessions: sessions.map((s: any) => ({
          ...s,
          campaignName: s.campaign?.name ?? null,
          gmName: s.owner.displayName,
          playerCount: s._count.players,
          campaign: undefined,
          owner: undefined,
          _count: undefined,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    },
  };
}

export type AdminService = ReturnType<typeof createAdminService>;
