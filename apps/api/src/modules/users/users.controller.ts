import type { FastifyRequest, FastifyReply } from "fastify";
import type { UsersService } from "./users.service.js";
import { updateProfileSchema, updatePreferencesSchema, searchUsersSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export function createUsersController(usersService: UsersService) {
  return {
    async getMe(request: FastifyRequest, reply: FastifyReply) {
      const user = await usersService.getMe(request.user.id);
      return reply.send(createSuccessResponse(user));
    },

    async updateProfile(request: FastifyRequest, reply: FastifyReply) {
      const input = updateProfileSchema.parse(request.body);
      const user = await usersService.updateProfile(request.user.id, input);
      return reply.send(createSuccessResponse(user));
    },

    async updatePreferences(request: FastifyRequest, reply: FastifyReply) {
      const input = updatePreferencesSchema.parse(request.body);
      const user = await usersService.updatePreferences(request.user.id, input);
      return reply.send(createSuccessResponse(user));
    },

    async getById(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
      const user = await usersService.getById(request.params.id);
      return reply.send(createSuccessResponse(user));
    },

    async search(request: FastifyRequest, reply: FastifyReply) {
      const { q } = searchUsersSchema.parse(request.query);
      const users = await usersService.search(q, request.user.id);
      return reply.send(createSuccessResponse(users));
    },
  };
}
