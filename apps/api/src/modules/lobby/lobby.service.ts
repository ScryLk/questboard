import type { PrismaClient, Prisma } from "@questboard/db";
import type { LobbySearchInput } from "@questboard/shared";

export function createLobbyService(prisma: PrismaClient) {
  return {
    async search(input: LobbySearchInput) {
      const where: Prisma.SessionWhereInput = {
        deletedAt: null,
        type: "PUBLIC",
        visibility: "LISTED",
      };

      // Status filter
      const statusFilter: string[] = ["LIVE"];
      if (input.includeIdle) statusFilter.push("IDLE", "PAUSED");
      where.status = { in: statusFilter };

      // Text search
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
        ];
      }

      // System filter
      if (input.system) {
        where.system = { equals: input.system, mode: "insensitive" };
      }

      // Tags filter
      if (input.tags?.length) {
        where.tags = { hasSome: input.tags };
      }

      // Language filter
      if (input.language) {
        where.settings = { path: ["language"], equals: input.language };
      }

      // Open slots filter
      if (input.hasOpenSlots) {
        where.players = { every: { isBanned: false } };
      }

      // Sorting
      let orderBy: Prisma.SessionOrderByWithRelationInput;
      switch (input.sortBy) {
        case "newest":
          orderBy = { createdAt: "desc" };
          break;
        case "starting":
          orderBy = { scheduledAt: "asc" };
          break;
        case "popular":
          orderBy = { totalPlaytime: "desc" };
          break;
        case "live_first":
        default:
          orderBy = { lastPlayedAt: "desc" };
          break;
      }

      const skip = (input.page - 1) * input.pageSize;

      const [sessions, total] = await Promise.all([
        prisma.session.findMany({
          where,
          orderBy,
          skip,
          take: input.pageSize,
          include: {
            owner: { select: { id: true, displayName: true, avatarUrl: true, plan: true } },
            _count: { select: { players: { where: { isBanned: false } } } },
          },
        }),
        prisma.session.count({ where }),
      ]);

      // Filter open slots after query if needed
      const results = sessions.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        bannerUrl: s.bannerUrl,
        system: s.system,
        tags: s.tags,
        type: s.type,
        status: s.status,
        maxPlayers: s.maxPlayers,
        playerCount: s._count.players,
        openSlots: Math.max(0, s.maxPlayers - s._count.players),
        isLive: s.status === "LIVE",
        gmPlan: s.owner.plan,
        owner: { id: s.owner.id, displayName: s.owner.displayName, avatarUrl: s.owner.avatarUrl },
        scheduledAt: s.scheduledAt?.toISOString() ?? null,
        metadata: (s.metadata ?? {}) as Record<string, unknown>,
      }));

      const filtered = input.hasOpenSlots ? results.filter((s) => s.openSlots > 0) : results;

      return {
        data: filtered,
        pagination: {
          page: input.page,
          pageSize: input.pageSize,
          total,
          totalPages: Math.ceil(total / input.pageSize),
        },
      };
    },

    async getFeatured() {
      const sessions = await prisma.session.findMany({
        where: {
          deletedAt: null,
          type: "PUBLIC",
          visibility: "LISTED",
          status: { in: ["LIVE", "IDLE"] },
        },
        orderBy: { totalPlaytime: "desc" },
        take: 10,
        include: {
          owner: { select: { id: true, displayName: true, avatarUrl: true, plan: true } },
          _count: { select: { players: { where: { isBanned: false } } } },
        },
      });

      return sessions.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        bannerUrl: s.bannerUrl,
        system: s.system,
        tags: s.tags,
        type: s.type,
        status: s.status,
        maxPlayers: s.maxPlayers,
        playerCount: s._count.players,
        openSlots: Math.max(0, s.maxPlayers - s._count.players),
        isLive: s.status === "LIVE",
        gmPlan: s.owner.plan,
        owner: { id: s.owner.id, displayName: s.owner.displayName, avatarUrl: s.owner.avatarUrl },
        scheduledAt: s.scheduledAt?.toISOString() ?? null,
        metadata: (s.metadata ?? {}) as Record<string, unknown>,
      }));
    },

    async getLiveSessions() {
      const sessions = await prisma.session.findMany({
        where: {
          deletedAt: null,
          type: "PUBLIC",
          visibility: "LISTED",
          status: "LIVE",
        },
        orderBy: { lastPlayedAt: "desc" },
        take: 20,
        include: {
          owner: { select: { id: true, displayName: true, avatarUrl: true, plan: true } },
          _count: { select: { players: { where: { isBanned: false } } } },
        },
      });

      return sessions.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        system: s.system,
        status: s.status,
        maxPlayers: s.maxPlayers,
        playerCount: s._count.players,
        isLive: true,
        owner: { id: s.owner.id, displayName: s.owner.displayName, avatarUrl: s.owner.avatarUrl },
      }));
    },

    async getSystems() {
      const result = await prisma.session.groupBy({
        by: ["system"],
        where: { deletedAt: null, type: "PUBLIC", visibility: "LISTED" },
        _count: true,
        orderBy: { _count: { system: "desc" } },
        take: 50,
      });

      return result.map((r) => ({ system: r.system, count: r._count }));
    },

    async getTags() {
      // Get sessions with tags and aggregate
      const sessions = await prisma.session.findMany({
        where: { deletedAt: null, type: "PUBLIC", visibility: "LISTED", tags: { isEmpty: false } },
        select: { tags: true },
      });

      const tagCounts = new Map<string, number>();
      for (const s of sessions) {
        for (const tag of s.tags) {
          tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
        }
      }

      return Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50)
        .map(([tag, count]) => ({ tag, count }));
    },
  };
}

export type LobbyService = ReturnType<typeof createLobbyService>;
