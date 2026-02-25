import type { PrismaClient } from "@questboard/db";
import type { CreateInviteInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError, GoneError } from "../../errors/app-error.js";

export function createInvitesService(prisma: PrismaClient) {
  return {
    async create(sessionId: string, invitedById: string, input: CreateInviteInput) {
      // Verify inviter is GM/CO_GM
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: invitedById, sessionId } },
      });
      if (!player || !["GM", "CO_GM"].includes(player.role)) {
        throw new ForbiddenError("Sem permissão para convidar");
      }

      const invite = await prisma.sessionInvite.create({
        data: {
          sessionId,
          invitedById,
          invitedUserId: input.invitedUserId,
          invitedEmail: input.invitedEmail,
          role: input.role || "PLAYER",
          message: input.message,
          expiresAt: input.expiresAt,
          maxUses: input.maxUses,
        },
      });

      return invite;
    },

    async listBySession(sessionId: string) {
      return prisma.sessionInvite.findMany({
        where: { sessionId },
        include: {
          invitedBy: { select: { id: true, displayName: true } },
          invitedUser: { select: { id: true, displayName: true } },
          session: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    },

    async revoke(inviteId: string, userId: string) {
      const invite = await prisma.sessionInvite.findUnique({
        where: { id: inviteId },
        include: { session: { select: { ownerId: true } } },
      });
      if (!invite) throw new NotFoundError("Convite");

      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId: invite.sessionId } },
      });
      if (!player || !["GM", "CO_GM"].includes(player.role)) {
        throw new ForbiddenError("Sem permissão para revogar");
      }

      await prisma.sessionInvite.update({
        where: { id: inviteId },
        data: { status: "REVOKED" },
      });
    },

    async acceptByToken(token: string, userId: string) {
      const invite = await prisma.sessionInvite.findUnique({ where: { token } });
      if (!invite || invite.status !== "PENDING") throw new NotFoundError("Convite");
      if (invite.expiresAt && invite.expiresAt < new Date()) throw new GoneError("Convite expirado");
      if (invite.maxUses && invite.usedCount >= invite.maxUses) throw new GoneError("Limite de usos atingido");

      // Check if user-specific invite
      if (invite.invitedUserId && invite.invitedUserId !== userId) {
        throw new ForbiddenError("Convite destinado a outro usuário");
      }

      await prisma.sessionInvite.update({
        where: { id: invite.id },
        data: {
          status: invite.invitedUserId ? "ACCEPTED" : undefined,
          usedCount: { increment: 1 },
          respondedAt: new Date(),
        },
      });

      return invite;
    },

    async declineByToken(token: string, userId: string) {
      const invite = await prisma.sessionInvite.findUnique({ where: { token } });
      if (!invite || invite.status !== "PENDING") throw new NotFoundError("Convite");

      if (invite.invitedUserId && invite.invitedUserId !== userId) {
        throw new ForbiddenError("Convite destinado a outro usuário");
      }

      await prisma.sessionInvite.update({
        where: { id: invite.id },
        data: { status: "DECLINED", respondedAt: new Date() },
      });
    },

    async listMine(userId: string) {
      return prisma.sessionInvite.findMany({
        where: { invitedUserId: userId, status: "PENDING" },
        include: {
          session: { select: { id: true, name: true, system: true } },
          invitedBy: { select: { id: true, displayName: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    },
  };
}

export type InvitesService = ReturnType<typeof createInvitesService>;
