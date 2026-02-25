import type { FastifyRequest, FastifyReply } from "fastify";
import type { StatsService } from "./stats.service.js";
import { createSuccessResponse } from "@questboard/shared";

export function createStatsController(statsService: StatsService) {
  return {
    async getMyStats(request: FastifyRequest, reply: FastifyReply) {
      const stats = await statsService.getMyStats(request.user.id);
      return reply.send(createSuccessResponse(stats));
    },

    async getStatsForUser(
      request: FastifyRequest<{ Params: { userId: string } }>,
      reply: FastifyReply
    ) {
      const stats = await statsService.getStatsForUser(request.params.userId);
      return reply.send(createSuccessResponse(stats));
    },

    async getLeaderboard(request: FastifyRequest, reply: FastifyReply) {
      const query = request.query as { stat?: string; page?: string; pageSize?: string };
      const stat = query.stat ?? "totalSessions";
      const page = Math.max(1, parseInt(query.page ?? "1", 10));
      const pageSize = Math.min(50, Math.max(1, parseInt(query.pageSize ?? "20", 10)));

      const result = await statsService.getLeaderboard(stat, page, pageSize);
      return reply.send({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    },
  };
}
