import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createExplorationLogService } from "./exploration-log.service.js";
import { createSuccessResponse } from "@questboard/shared";

export async function explorationLogRoutes(app: FastifyInstance) {
  const service = createExplorationLogService(prisma);

  app.get("/sessions/:id/exploration-log", async (request, reply) => {
    const query = request.query as { mapId?: string; event?: string; limit?: string; cursor?: string };
    const logs = await service.list(request.params.id, request.user.id, {
      mapId: query.mapId,
      event: query.event,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
      cursor: query.cursor,
    });
    return reply.send(createSuccessResponse(logs));
  });

  app.get("/sessions/:id/exploration-log/summary", async (request, reply) => {
    const summary = await service.getSummary(request.params.id, request.user.id);
    return reply.send(createSuccessResponse(summary));
  });
}
