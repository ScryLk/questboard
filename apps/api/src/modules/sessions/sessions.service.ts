import type { PrismaClient } from "@questboard/db";
import type { CreateSessionInput, UpdateSessionInput } from "./sessions.schema.js";
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from "../../errors/app-error.js";
import { redis } from "../../lib/redis.js";

function generateShortCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function createSessionsService(prisma: PrismaClient) {
  return {
    async list(userId: string) {
      const sessions = await prisma.session.findMany({
        where: {
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
        where: { id: sessionId },
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
      if (!session) throw new NotFoundError("Session");
      return session;
    },

    async create(userId: string, input: CreateSessionInput) {
      return prisma.session.create({
        data: {
          ...input,
          ownerId: userId,
          gmId: userId,
          inviteCode: generateShortCode(),
          players: {
            create: {
              userId,
              role: "GM",
            },
          },
        },
      });
    },

    async findByCode(inviteCode: string) {
      const session = await prisma.session.findUnique({
        where: { inviteCode },
        include: {
          owner: { select: { id: true, displayName: true, avatarUrl: true } },
          _count: { select: { players: true } },
        },
      });
      if (!session) throw new NotFoundError("Session");
      return session;
    },

    async update(sessionId: string, userId: string, input: UpdateSessionInput) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { ownerId: true },
      });
      if (!session) throw new NotFoundError("Session");
      if (session.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode editar a sessão");

      return prisma.session.update({
        where: { id: sessionId },
        data: input,
      });
    },

    async delete(sessionId: string, userId: string) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { ownerId: true },
      });
      if (!session) throw new NotFoundError("Session");
      if (session.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode deletar a sessão");

      return prisma.session.delete({ where: { id: sessionId } });
    },

    async join(inviteCode: string, userId: string) {
      const session = await prisma.session.findUnique({
        where: { inviteCode },
        select: { id: true, maxPlayers: true, _count: { select: { players: true } } },
      });
      if (!session) throw new NotFoundError("Session");

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
        where: { id: sessionId },
        select: { ownerId: true },
      });
      if (!session) throw new NotFoundError("Session");
      if (session.ownerId === userId) {
        throw new BadRequestError("O GM não pode sair da própria sessão");
      }

      return prisma.sessionPlayer.delete({
        where: { userId_sessionId: { userId, sessionId } },
      });
    },

    // ─── State Transitions ────────────────────────────
    async start(sessionId: string, userId: string) {
      const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true, status: true } });
      if (!session) throw new NotFoundError("Session");
      if (session.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode iniciar a sessão");
      if (session.status !== "IDLE" && session.status !== "PAUSED") throw new BadRequestError(`Não pode iniciar sessão com status ${session.status}`);

      const updated = await prisma.session.update({
        where: { id: sessionId },
        data: { status: "LIVE", startedAt: new Date() },
      });

      await redis.hset(`session:${sessionId}:state`, { status: "LIVE", startedAt: Date.now().toString() });
      await this.logAudit(sessionId, userId, "session:started", {});

      return updated;
    },

    async end(sessionId: string, userId: string) {
      const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true, status: true } });
      if (!session) throw new NotFoundError("Session");
      if (session.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode encerrar a sessão");
      if (session.status !== "LIVE" && session.status !== "PAUSED") throw new BadRequestError(`Não pode encerrar sessão com status ${session.status}`);

      const updated = await prisma.session.update({
        where: { id: sessionId },
        data: { status: "ENDED", endedAt: new Date() },
      });

      // Cleanup Redis state
      const keys = await redis.keys(`session:${sessionId}:*`);
      if (keys.length > 0) await redis.del(...keys);

      await this.logAudit(sessionId, userId, "session:ended", {});
      return updated;
    },

    async pause(sessionId: string, userId: string) {
      const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true, status: true } });
      if (!session) throw new NotFoundError("Session");
      if (session.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode pausar");
      if (session.status !== "LIVE") throw new BadRequestError("Sessão não está LIVE");

      const updated = await prisma.session.update({ where: { id: sessionId }, data: { status: "PAUSED" } });
      await redis.hset(`session:${sessionId}:state`, "status", "PAUSED");
      await this.logAudit(sessionId, userId, "session:paused", {});
      return updated;
    },

    async resume(sessionId: string, userId: string) {
      const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true, status: true } });
      if (!session) throw new NotFoundError("Session");
      if (session.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode retomar");
      if (session.status !== "PAUSED") throw new BadRequestError("Sessão não está pausada");

      const updated = await prisma.session.update({ where: { id: sessionId }, data: { status: "LIVE" } });
      await redis.hset(`session:${sessionId}:state`, "status", "LIVE");
      await this.logAudit(sessionId, userId, "session:resumed", {});
      return updated;
    },

    // ─── Players ─────────────────────────────────────
    async listPlayers(sessionId: string) {
      return prisma.sessionPlayer.findMany({
        where: { sessionId },
        include: {
          user: { select: { id: true, displayName: true, avatarUrl: true } },
          character: { select: { id: true, name: true, avatarUrl: true } },
        },
      });
    },

    async kick(sessionId: string, userId: string, targetUserId: string) {
      const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true } });
      if (!session) throw new NotFoundError("Session");
      if (session.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode expulsar");
      if (session.ownerId === targetUserId) throw new BadRequestError("O GM não pode se expulsar");

      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: targetUserId, sessionId } },
      });
      if (!player) throw new NotFoundError("SessionPlayer");

      await prisma.sessionPlayer.update({ where: { id: player.id }, data: { leftAt: new Date() } });
      await this.logAudit(sessionId, userId, "player:kicked", { targetUserId });
    },

    async updatePlayerRole(sessionId: string, userId: string, targetUserId: string, role: string) {
      const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true } });
      if (!session) throw new NotFoundError("Session");
      if (session.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode alterar roles");

      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: targetUserId, sessionId } },
      });
      if (!player) throw new NotFoundError("SessionPlayer");

      return prisma.sessionPlayer.update({
        where: { id: player.id },
        data: { role: role as "GM" | "CO_GM" | "PLAYER" | "SPECTATOR" },
      });
    },

    // ─── Audit Log ───────────────────────────────────
    async logAudit(sessionId: string, actorId: string | null, event: string, data: Record<string, unknown>) {
      return prisma.sessionAuditLog.create({ data: { sessionId, actorId, event, data } });
    },

    async getAuditLog(sessionId: string, userId: string, limit = 50) {
      const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true } });
      if (!session) throw new NotFoundError("Session");
      if (session.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode ver audit log");

      return prisma.sessionAuditLog.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    },

    // ─── Phases ──────────────────────────────────────
    async listPhases(sessionId: string) {
      return prisma.phaseEvent.findMany({
        where: { sessionId },
        orderBy: { startedAt: "desc" },
      });
    },

    async createPhase(sessionId: string, userId: string, input: { type: string; label: string; notes?: string }) {
      const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true } });
      if (!session) throw new NotFoundError("Session");
      if (session.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode criar fases");

      // End current active phase
      const activePhase = await prisma.phaseEvent.findFirst({
        where: { sessionId, endedAt: null },
        orderBy: { startedAt: "desc" },
      });
      if (activePhase) {
        const duration = Math.round((Date.now() - activePhase.startedAt.getTime()) / 60000);
        await prisma.phaseEvent.update({
          where: { id: activePhase.id },
          data: { endedAt: new Date(), durationMin: duration },
        });
      }

      return prisma.phaseEvent.create({
        data: {
          sessionId,
          type: input.type as "EXPLORATION" | "COMBAT" | "ROLEPLAY" | "INVESTIGATION" | "TRAVEL" | "REST_SHORT" | "REST_LONG" | "NARRATION",
          label: input.label,
          notes: input.notes,
          startedAt: new Date(),
        },
      });
    },

    async listPublic(page: number, pageSize: number) {
      const [sessions, total] = await Promise.all([
        prisma.session.findMany({
          where: { isPublic: true, status: { in: ["IDLE", "LIVE"] } },
          include: {
            owner: { select: { id: true, displayName: true, avatarUrl: true } },
            _count: { select: { players: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.session.count({
          where: { isPublic: true, status: { in: ["IDLE", "LIVE"] } },
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
