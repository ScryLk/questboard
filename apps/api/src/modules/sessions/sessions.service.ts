import type { PrismaClient } from "@questboard/db";
import type { CreateSessionInput, UpdateSessionInput } from "./sessions.schema.js";
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from "../../errors/app-error.js";

export function createSessionsService(prisma: PrismaClient) {
  return {
    async list(userId: string) {
      const sessions = await prisma.session.findMany({
        where: {
          deletedAt: null,
          OR: [
            { ownerId: userId },
            { players: { some: { userId } } },
          ],
        },
        include: {
          owner: { select: { id: true, displayName: true, avatarUrl: true } },
          _count: { select: { players: true } },
        },
        orderBy: { updatedAt: "desc" },
      });
      return sessions;
    },

    async getById(sessionId: string) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId, deletedAt: null },
        include: {
          owner: { select: { id: true, displayName: true, avatarUrl: true } },
          players: {
            include: {
              user: { select: { id: true, displayName: true, avatarUrl: true } },
              character: { select: { id: true, name: true } },
            },
          },
        },
      });
      if (!session) throw new NotFoundError("Sessão");
      return session;
    },

    async create(userId: string, input: CreateSessionInput) {
      return prisma.session.create({
        data: {
          ...input,
          ownerId: userId,
          players: {
            create: {
              userId,
              role: "GM",
            },
          },
        },
      });
    },

    async update(sessionId: string, userId: string, input: UpdateSessionInput) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId, deletedAt: null },
        select: { ownerId: true },
      });
      if (!session) throw new NotFoundError("Sessão");
      if (session.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode editar a sessão");

      return prisma.session.update({
        where: { id: sessionId },
        data: input,
      });
    },

    async delete(sessionId: string, userId: string) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId, deletedAt: null },
        select: { ownerId: true },
      });
      if (!session) throw new NotFoundError("Sessão");
      if (session.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode deletar a sessão");

      // Soft delete
      return prisma.session.update({
        where: { id: sessionId },
        data: { deletedAt: new Date() },
      });
    },

    async join(inviteCode: string, userId: string) {
      const session = await prisma.session.findUnique({
        where: { inviteCode, deletedAt: null },
        select: { id: true, maxPlayers: true, _count: { select: { players: true } } },
      });
      if (!session) throw new NotFoundError("Sessão");

      if (session._count.players >= session.maxPlayers) {
        throw new BadRequestError("Sessão cheia");
      }

      const existing = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId: session.id } },
      });
      if (existing) throw new ConflictError("Já está na sessão");

      return prisma.sessionPlayer.create({
        data: {
          userId,
          sessionId: session.id,
          role: "PLAYER",
        },
      });
    },

    async leave(sessionId: string, userId: string) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId, deletedAt: null },
        select: { ownerId: true },
      });
      if (!session) throw new NotFoundError("Sessão");
      if (session.ownerId === userId) {
        throw new BadRequestError("O GM não pode sair da própria sessão");
      }

      return prisma.sessionPlayer.delete({
        where: { userId_sessionId: { userId, sessionId } },
      });
    },

    async listPublic(page: number, pageSize: number) {
      const [sessions, total] = await Promise.all([
        prisma.session.findMany({
          where: { type: "PUBLIC", status: { in: ["IDLE", "LIVE"] }, deletedAt: null },
          include: {
            owner: { select: { id: true, displayName: true, avatarUrl: true } },
            _count: { select: { players: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.session.count({
          where: { type: "PUBLIC", status: { in: ["IDLE", "LIVE"] }, deletedAt: null },
        }),
      ]);

      return {
        sessions,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    },
  };
}

export type SessionsService = ReturnType<typeof createSessionsService>;
