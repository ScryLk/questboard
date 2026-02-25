import type { PrismaClient } from "@questboard/db";
import type { SendFriendRequestInput, BlockUserInput } from "@questboard/shared";
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from "../../errors/app-error.js";

export function createFriendsService(prisma: PrismaClient) {
  return {
    async listFriends(userId: string) {
      const friendships = await prisma.friendship.findMany({
        where: {
          status: "ACCEPTED",
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        include: {
          sender: { select: { id: true, displayName: true, username: true, avatarUrl: true, isOnline: true, lastSeenAt: true } },
          receiver: { select: { id: true, displayName: true, username: true, avatarUrl: true, isOnline: true, lastSeenAt: true } },
        },
        orderBy: { updatedAt: "desc" },
      });

      return friendships.map((f) => {
        const friend = f.senderId === userId ? f.receiver : f.sender;
        return {
          id: f.id,
          userId: friend.id,
          displayName: friend.displayName,
          username: friend.username,
          avatarUrl: friend.avatarUrl,
          isOnline: friend.isOnline,
          lastSeenAt: friend.lastSeenAt.toISOString(),
          friendsSince: f.updatedAt.toISOString(),
        };
      });
    },

    async listRequests(userId: string) {
      const requests = await prisma.friendship.findMany({
        where: { receiverId: userId, status: "PENDING" },
        include: {
          sender: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return requests.map((r) => ({
        id: r.id,
        senderId: r.sender.id,
        senderDisplayName: r.sender.displayName,
        senderUsername: r.sender.username,
        senderAvatarUrl: r.sender.avatarUrl,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      }));
    },

    async sendRequest(userId: string, input: SendFriendRequestInput) {
      if (userId === input.userId) {
        throw new BadRequestError("Não é possível adicionar a si mesmo");
      }

      // Check if target user exists
      const targetUser = await prisma.user.findUnique({
        where: { id: input.userId, deletedAt: null },
        select: { id: true },
      });
      if (!targetUser) throw new NotFoundError("Usuário");

      // Check if blocked
      const blocked = await prisma.userBlock.findFirst({
        where: {
          OR: [
            { blockerId: userId, blockedId: input.userId },
            { blockerId: input.userId, blockedId: userId },
          ],
        },
      });
      if (blocked) throw new ForbiddenError("Não é possível enviar solicitação para este usuário");

      // Check existing friendship in both directions
      const existing = await prisma.friendship.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: input.userId },
            { senderId: input.userId, receiverId: userId },
          ],
        },
      });

      if (existing) {
        if (existing.status === "ACCEPTED") {
          throw new ConflictError("Já são amigos");
        }
        if (existing.status === "PENDING") {
          // If the other person already sent a request, auto-accept
          if (existing.senderId === input.userId) {
            return this.acceptRequest(userId, existing.id);
          }
          throw new ConflictError("Solicitação já enviada");
        }
        if (existing.status === "DECLINED") {
          // Allow re-sending after decline
          return prisma.friendship.update({
            where: { id: existing.id },
            data: {
              senderId: userId,
              receiverId: input.userId,
              status: "PENDING",
              metadata: { source: input.source, note: input.note },
            },
          });
        }
      }

      return prisma.friendship.create({
        data: {
          senderId: userId,
          receiverId: input.userId,
          metadata: { source: input.source, note: input.note },
        },
      });
    },

    async acceptRequest(userId: string, friendshipId: string) {
      const friendship = await prisma.friendship.findUnique({
        where: { id: friendshipId },
      });
      if (!friendship) throw new NotFoundError("Solicitação de amizade");
      if (friendship.receiverId !== userId) throw new ForbiddenError("Apenas o destinatário pode aceitar");
      if (friendship.status !== "PENDING") throw new BadRequestError("Solicitação não está pendente");

      return prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: "ACCEPTED" },
      });
    },

    async declineRequest(userId: string, friendshipId: string) {
      const friendship = await prisma.friendship.findUnique({
        where: { id: friendshipId },
      });
      if (!friendship) throw new NotFoundError("Solicitação de amizade");
      if (friendship.receiverId !== userId) throw new ForbiddenError("Apenas o destinatário pode recusar");
      if (friendship.status !== "PENDING") throw new BadRequestError("Solicitação não está pendente");

      return prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: "DECLINED" },
      });
    },

    async removeFriend(userId: string, friendshipId: string) {
      const friendship = await prisma.friendship.findUnique({
        where: { id: friendshipId },
      });
      if (!friendship) throw new NotFoundError("Amizade");
      if (friendship.senderId !== userId && friendship.receiverId !== userId) {
        throw new ForbiddenError("Não pertence a esta amizade");
      }

      return prisma.friendship.delete({ where: { id: friendshipId } });
    },

    async blockUser(userId: string, blockedUserId: string, input: BlockUserInput) {
      if (userId === blockedUserId) {
        throw new BadRequestError("Não é possível bloquear a si mesmo");
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: blockedUserId, deletedAt: null },
        select: { id: true },
      });
      if (!targetUser) throw new NotFoundError("Usuário");

      // Remove any existing friendship
      await prisma.friendship.deleteMany({
        where: {
          OR: [
            { senderId: userId, receiverId: blockedUserId },
            { senderId: blockedUserId, receiverId: userId },
          ],
        },
      });

      // Create block (upsert to avoid duplicates)
      const existing = await prisma.userBlock.findUnique({
        where: { blockerId_blockedId: { blockerId: userId, blockedId: blockedUserId } },
      });
      if (existing) throw new ConflictError("Usuário já bloqueado");

      return prisma.userBlock.create({
        data: {
          blockerId: userId,
          blockedId: blockedUserId,
          reason: input.reason,
        },
      });
    },

    async unblockUser(userId: string, blockedUserId: string) {
      const block = await prisma.userBlock.findUnique({
        where: { blockerId_blockedId: { blockerId: userId, blockedId: blockedUserId } },
      });
      if (!block) throw new NotFoundError("Bloqueio");

      return prisma.userBlock.delete({
        where: { blockerId_blockedId: { blockerId: userId, blockedId: blockedUserId } },
      });
    },
  };
}

export type FriendsService = ReturnType<typeof createFriendsService>;
