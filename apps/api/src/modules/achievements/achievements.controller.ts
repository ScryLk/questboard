import type { FastifyRequest, FastifyReply } from "fastify";
import type { AchievementsService } from "./achievements.service.js";
import { createSuccessResponse } from "@questboard/shared";

export function createAchievementsController(achievementsService: AchievementsService) {
  return {
    async listAll(request: FastifyRequest, reply: FastifyReply) {
      const achievements = await achievementsService.listAll(request.user.id);
      return reply.send(createSuccessResponse(achievements));
    },

    async listMine(request: FastifyRequest, reply: FastifyReply) {
      const achievements = await achievementsService.listMine(request.user.id);
      return reply.send(createSuccessResponse(achievements));
    },

    async listForUser(
      request: FastifyRequest<{ Params: { userId: string } }>,
      reply: FastifyReply
    ) {
      const achievements = await achievementsService.listForUser(request.params.userId);
      return reply.send(createSuccessResponse(achievements));
    },
  };
}
