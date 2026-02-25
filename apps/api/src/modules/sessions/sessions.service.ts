import type { PrismaClient, Prisma } from "@questboard/db";
import type { CreateSessionInput, UpdateSessionInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from "../../errors/app-error.js";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function createSessionsService(prisma: PrismaClient) {
  async function findOrFail(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId, deletedAt: null },
      include: {
        owner: { select: { id: true, displayName: true, avatarUrl: true, plan: true } },
        combatState: true,
      },
    });
    if (!session) throw new NotFoundError("Sessão");
    return session;
  }

  function assertOwner(session: { ownerId: string }, userId: string) {
    if (session.ownerId !== userId) {
      throw new ForbiddenError("Apenas o GM pode executar esta ação");
    }
  }

  async function assertOwnerOrCoGm(sessionId: string, userId: string) {
    const player = await prisma.sessionPlayer.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    if (!player || !["GM", "CO_GM"].includes(player.role)) {
      throw new ForbiddenError("Apenas GM ou Co-GM pode executar esta ação");
    }
    return player;
  }

  async function generateUniqueSlug(name: string): Promise<string | null> {
    const base = slugify(name);
    if (!base) return null;
    let slug = base;
    let attempt = 0;
    while (await prisma.session.findUnique({ where: { slug } })) {
      attempt++;
      slug = `${base}-${attempt}`;
    }
    return slug;
  }

  return {
    findOrFail,
    assertOwnerOrCoGm,

    async list(userId: string) {
      return prisma.session.findMany({
        where: {
          deletedAt: null,
          OR: [
            { ownerId: userId },
            { players: { some: { userId, isBanned: false } } },
          ],
        },
        include: {
          owner: { select: { id: true, displayName: true, avatarUrl: true, plan: true } },
          _count: { select: { players: { where: { isBanned: false } } } },
        },
        orderBy: { updatedAt: "desc" },
      });
    },

    async getById(sessionId: string) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId, deletedAt: null },
        include: {
          owner: { select: { id: true, displayName: true, avatarUrl: true, plan: true } },
          players: {
            where: { isBanned: false },
            include: {
              user: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
              character: { select: { id: true, name: true } },
            },
          },
          combatState: true,
          _count: { select: { players: { where: { isBanned: false } } } },
        },
      });
      if (!session) throw new NotFoundError("Sessão");
      return session;
    },

    async create(userId: string, input: CreateSessionInput) {
      const slug = await generateUniqueSlug(input.name);

      return prisma.$transaction(async (tx) => {
        const session = await tx.session.create({
          data: {
            ...input,
            slug,
            ownerId: userId,
            maxPlayers: Math.min(input.maxPlayers ?? 5, 20),
          },
        });

        await tx.sessionPlayer.create({
          data: {
            userId,
            sessionId: session.id,
            role: "GM",
            rsvpStatus: "CONFIRMED",
          },
        });

        await tx.sessionLog.create({
          data: { sessionId: session.id, event: "session.created", actorId: userId },
        });

        return session;
      });
    },

    async update(sessionId: string, userId: string, input: UpdateSessionInput) {
      await assertOwnerOrCoGm(sessionId, userId);

      const updated = await prisma.session.update({
        where: { id: sessionId },
        data: input,
      });

      await prisma.sessionLog.create({
        data: {
          sessionId,
          event: "settings.updated",
          actorId: userId,
          data: { changes: input } as Prisma.InputJsonValue,
        },
      });

      return updated;
    },

    async delete(sessionId: string, userId: string) {
      const session = await findOrFail(sessionId);
      assertOwner(session, userId);

      await prisma.session.update({
        where: { id: sessionId },
        data: { deletedAt: new Date() },
      });

      await prisma.sessionLog.create({
        data: { sessionId, event: "session.deleted", actorId: userId },
      });
    },

    async start(sessionId: string, userId: string) {
      const session = await findOrFail(sessionId);
      assertOwner(session, userId);

      if (!["IDLE", "PAUSED"].includes(session.status)) {
        throw new ConflictError("Sessão não pode ser iniciada neste estado");
      }

      await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: "LIVE",
          lastPlayedAt: new Date(),
          startedAt: session.startedAt ?? new Date(),
        },
      });

      await prisma.sessionLog.create({
        data: { sessionId, event: "session.started", actorId: userId },
      });
    },

    async pause(sessionId: string, userId: string | null) {
      const session = await findOrFail(sessionId);
      if (userId) assertOwner(session, userId);

      if (session.status !== "LIVE") {
        throw new ConflictError("Sessão não está ao vivo");
      }

      const playTimeMinutes = session.lastPlayedAt
        ? Math.round((Date.now() - session.lastPlayedAt.getTime()) / 60000)
        : 0;

      await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: "PAUSED",
          totalPlaytime: { increment: playTimeMinutes },
        },
      });

      await prisma.sessionLog.create({
        data: {
          sessionId,
          event: "session.paused",
          actorId: userId,
          data: { playTimeMinutes } as Prisma.InputJsonValue,
        },
      });
    },

    async resume(sessionId: string, userId: string) {
      const session = await findOrFail(sessionId);
      assertOwner(session, userId);

      if (session.status !== "PAUSED") {
        throw new ConflictError("Sessão não está pausada");
      }

      await prisma.session.update({
        where: { id: sessionId },
        data: { status: "LIVE", lastPlayedAt: new Date() },
      });

      await prisma.sessionLog.create({
        data: { sessionId, event: "session.resumed", actorId: userId },
      });
    },

    async end(sessionId: string, userId: string) {
      const session = await findOrFail(sessionId);
      assertOwner(session, userId);

      if (!["LIVE", "PAUSED"].includes(session.status)) {
        throw new ConflictError("Sessão não pode ser encerrada neste estado");
      }

      const playTimeMinutes = session.status === "LIVE" && session.lastPlayedAt
        ? Math.round((Date.now() - session.lastPlayedAt.getTime()) / 60000)
        : 0;

      await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: "ENDED",
          endedAt: new Date(),
          totalPlaytime: { increment: playTimeMinutes },
          sessionNumber: { increment: 1 },
        },
      });

      if (session.combatState?.isActive) {
        await prisma.combatState.update({
          where: { sessionId },
          data: { isActive: false },
        });
      }

      await prisma.sessionLog.create({
        data: {
          sessionId,
          event: "session.ended",
          actorId: userId,
          data: { duration: playTimeMinutes, sessionNumber: session.sessionNumber } as Prisma.InputJsonValue,
        },
      });

      return prisma.sessionPlayer.findMany({
        where: { sessionId },
        select: { userId: true, role: true, totalMinutesPlayed: true, totalDiceRolled: true, totalMessages: true },
      });
    },

    async transferOwnership(sessionId: string, currentOwnerId: string, newOwnerId: string) {
      const session = await findOrFail(sessionId);
      assertOwner(session, currentOwnerId);

      const newOwnerPlayer = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: newOwnerId, sessionId } },
      });
      if (!newOwnerPlayer || newOwnerPlayer.isBanned) {
        throw new BadRequestError("Novo dono deve ser um jogador ativo na sessão");
      }

      await prisma.$transaction([
        prisma.session.update({ where: { id: sessionId }, data: { ownerId: newOwnerId } }),
        prisma.sessionPlayer.update({
          where: { userId_sessionId: { userId: currentOwnerId, sessionId } },
          data: { role: "PLAYER" },
        }),
        prisma.sessionPlayer.update({
          where: { userId_sessionId: { userId: newOwnerId, sessionId } },
          data: { role: "GM" },
        }),
      ]);

      await prisma.sessionLog.create({
        data: { sessionId, event: "session.ownership_transferred", actorId: currentOwnerId, targetId: newOwnerId },
      });
    },

    async getLog(sessionId: string, page: number = 1, pageSize: number = 50) {
      const [logs, total] = await Promise.all([
        prisma.sessionLog.findMany({
          where: { sessionId },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.sessionLog.count({ where: { sessionId } }),
      ]);
      return { logs, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
    },

    async handlePlanDowngrade(userId: string, maxActiveSessions: number) {
      const activeSessions = await prisma.session.findMany({
        where: { ownerId: userId, status: { in: ["IDLE", "LIVE", "PAUSED"] }, deletedAt: null },
        orderBy: { lastPlayedAt: "desc" },
      });

      if (activeSessions.length <= maxActiveSessions) return [];

      const toArchive = activeSessions.slice(maxActiveSessions);
      for (const session of toArchive) {
        if (session.status === "LIVE") {
          await prisma.session.update({
            where: { id: session.id },
            data: { status: "ENDED", endedAt: new Date() },
          });
        }
        await prisma.session.update({
          where: { id: session.id },
          data: { status: "ARCHIVED" },
        });
        await prisma.sessionLog.create({
          data: { sessionId: session.id, event: "session.archived", data: { reason: "plan_downgrade" } as Prisma.InputJsonValue },
        });
      }
      return toArchive;
    },
  };
}

export type SessionsService = ReturnType<typeof createSessionsService>;
