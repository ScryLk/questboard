import type { FastifyRequest, FastifyReply } from "fastify";
import type { FriendsService } from "./friends.service.js";
import { sendFriendRequestSchema, blockUserSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export function createFriendsController(friendsService: FriendsService) {
  return {
    async list(request: FastifyRequest, reply: FastifyReply) {
      const friends = await friendsService.listFriends(request.user.id);
      return reply.send(createSuccessResponse(friends));
    },

    async listRequests(request: FastifyRequest, reply: FastifyReply) {
      const requests = await friendsService.listRequests(request.user.id);
      return reply.send(createSuccessResponse(requests));
    },

    async sendRequest(request: FastifyRequest, reply: FastifyReply) {
      const input = sendFriendRequestSchema.parse(request.body);
      const friendship = await friendsService.sendRequest(request.user.id, input);
      return reply.status(201).send(createSuccessResponse(friendship));
    },

    async accept(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
      const friendship = await friendsService.acceptRequest(request.user.id, request.params.id);
      return reply.send(createSuccessResponse(friendship));
    },

    async decline(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
      const friendship = await friendsService.declineRequest(request.user.id, request.params.id);
      return reply.send(createSuccessResponse(friendship));
    },

    async remove(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
      await friendsService.removeFriend(request.user.id, request.params.id);
      return reply.status(204).send();
    },

    async block(
      request: FastifyRequest<{ Params: { userId: string } }>,
      reply: FastifyReply
    ) {
      const input = blockUserSchema.parse(request.body ?? {});
      const block = await friendsService.blockUser(request.user.id, request.params.userId, input);
      return reply.status(201).send(createSuccessResponse(block));
    },

    async unblock(
      request: FastifyRequest<{ Params: { userId: string } }>,
      reply: FastifyReply
    ) {
      await friendsService.unblockUser(request.user.id, request.params.userId);
      return reply.status(204).send();
    },
  };
}
