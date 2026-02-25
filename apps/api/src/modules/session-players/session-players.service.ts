import type { PrismaClient, Prisma } from "@questboard/db";
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError, GoneError } from "../../errors/app-error.js";
import type { PlayerRole } from "@questboard/shared";

export function createSessionPlayersService(prisma: PrismaClient) {
  return {
    async join(userId: string, input: { sessionId?: string; inviteCode?: string; token?: string; password?: string }) {
      let sessionId: string;
      let invite: Awaited<ReturnType<typeof prisma.sessionInvite.findUnique>> | null = null;

      // Resolve session
      if (input.token) {
        invite = await prisma.sessionInvite.findUnique({ where: { token: input.token } });
        if (!invite || invite.status !== "PENDING") throw new NotFoundError("Convite");
        if (invite.expiresAt && invite.expiresAt < new Date()) throw new GoneError("Convite expirado");
        if (invite.maxUses && invite.usedCount >= invite.maxUses) throw new GoneError("Convite atingiu o limite de usos");
        sessionId = invite.sessionId;
      } else if (input.inviteCode) {
        const session = await prisma.session.findUnique({ where: { inviteCode: input.inviteCode } });
        if (!session) throw new NotFoundError("Sessão");
        sessionId = session.id;
      } else if (input.sessionId) {
        sessionId = input.sessionId;
      } else {
        throw new BadRequestError("sessionId, inviteCode ou token é obrigatório");
      }

      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: {
          id: true, ownerId: true, type: true, status: true, password: true, maxPlayers: true, deletedAt: true,
          _count: { select: { players: { where: { isBanned: false } } } },
        },
      });
      if (!session || session.deletedAt) throw new NotFoundError("Sessão");
      if (session.status === "ARCHIVED") throw new ForbiddenError("Sessão está arquivada");

      // Check block
      const isBlocked = await prisma.userBlock.findUnique({
        where: { blockerId_blockedId: { blockerId: session.ownerId, blockedId: userId } },
      });
      if (isBlocked) throw new ForbiddenError("Bloqueado pelo GM");

      // Already in session?
      const existing = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId } },
      });
      if (existing && !existing.isBanned) return existing;
      if (existing?.isBanned) throw new ForbiddenError("Banido desta sessão");

      // Private session without invite?
      if (session.type === "PRIVATE" && !invite && !input.inviteCode) {
        throw new ForbiddenError("Sessão privada — convite necessário");
      }

      // Password check
      if (session.password) {
        if (!input.password) throw new ForbiddenError("Senha necessária");
        // Simple comparison — in production use bcrypt
        if (input.password !== session.password) throw new ForbiddenError("Senha incorreta");
      }

      // Capacity check
      if (session._count.players >= session.maxPlayers) {
        throw new ForbiddenError("Sessão cheia");
      }

      // Create player
      const player = await prisma.sessionPlayer.create({
        data: {
          userId,
          sessionId,
          role: (invite?.role as PlayerRole) || "PLAYER",
        },
      });

      // Update invite if used
      if (invite) {
        await prisma.sessionInvite.update({
          where: { id: invite.id },
          data: {
            status: invite.invitedUserId ? "ACCEPTED" : undefined,
            usedCount: { increment: 1 },
            respondedAt: new Date(),
          },
        });
      }

      await prisma.sessionLog.create({
        data: { sessionId, event: "player.joined", actorId: userId },
      });

      return player;
    },

    async leave(sessionId: string, userId: string) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId, deletedAt: null },
        select: { ownerId: true },
      });
      if (!session) throw new NotFoundError("Sessão");
      if (session.ownerId === userId) throw new BadRequestError("O GM não pode sair da própria sessão");

      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId } },
      });
      if (!player) throw new NotFoundError("Jogador");

      await prisma.sessionPlayer.update({
        where: { id: player.id },
        data: { leftAt: new Date() },
      });

      await prisma.sessionLog.create({
        data: { sessionId, event: "player.left", actorId: userId },
      });
    },

    async listPlayers(sessionId: string) {
      return prisma.sessionPlayer.findMany({
        where: { sessionId, isBanned: false },
        include: {
          user: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
          character: { select: { id: true, name: true } },
        },
        orderBy: { joinedAt: "asc" },
      });
    },

    async changeRole(sessionId: string, gmUserId: string, targetUserId: string, newRole: PlayerRole) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId, deletedAt: null },
        select: { ownerId: true },
      });
      if (!session) throw new NotFoundError("Sessão");
      if (session.ownerId !== gmUserId) throw new ForbiddenError("Apenas o GM pode alterar roles");
      if (targetUserId === gmUserId) throw new BadRequestError("Não é possível alterar o próprio role");

      await prisma.sessionPlayer.update({
        where: { userId_sessionId: { userId: targetUserId, sessionId } },
        data: { role: newRole },
      });

      await prisma.sessionLog.create({
        data: {
          sessionId,
          event: "player.role_changed",
          actorId: gmUserId,
          targetId: targetUserId,
          data: { newRole } as Prisma.InputJsonValue,
        },
      });
    },

    async kick(sessionId: string, gmUserId: string, targetUserId: string, reason?: string) {
      const gmPlayer = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: gmUserId, sessionId } },
      });
      if (!gmPlayer || !["GM", "CO_GM"].includes(gmPlayer.role)) {
        throw new ForbiddenError("Sem permissão para kickar");
      }

      await prisma.sessionPlayer.update({
        where: { userId_sessionId: { userId: targetUserId, sessionId } },
        data: { kickedAt: new Date(), kickReason: reason },
      });

      await prisma.sessionLog.create({
        data: {
          sessionId,
          event: "player.kicked",
          actorId: gmUserId,
          targetId: targetUserId,
          data: { reason } as Prisma.InputJsonValue,
        },
      });
    },

    async ban(sessionId: string, gmUserId: string, targetUserId: string) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId, deletedAt: null },
        select: { ownerId: true },
      });
      if (!session || session.ownerId !== gmUserId) {
        throw new ForbiddenError("Apenas o GM pode banir");
      }

      await prisma.sessionPlayer.update({
        where: { userId_sessionId: { userId: targetUserId, sessionId } },
        data: { isBanned: true },
      });

      await prisma.sessionLog.create({
        data: { sessionId, event: "player.banned", actorId: gmUserId, targetId: targetUserId },
      });
    },

    async unban(sessionId: string, gmUserId: string, targetUserId: string) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId, deletedAt: null },
        select: { ownerId: true },
      });
      if (!session || session.ownerId !== gmUserId) {
        throw new ForbiddenError("Apenas o GM pode desbanir");
      }

      await prisma.sessionPlayer.update({
        where: { userId_sessionId: { userId: targetUserId, sessionId } },
        data: { isBanned: false },
      });
    },

    async linkCharacter(sessionId: string, userId: string, characterId: string | null) {
      await prisma.sessionPlayer.update({
        where: { userId_sessionId: { userId, sessionId } },
        data: { characterId },
      });
    },
  };
}

export type SessionPlayersService = ReturnType<typeof createSessionPlayersService>;
