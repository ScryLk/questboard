import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createExplorationService } from "./exploration.service.js";
import { updateExplorationSettingsSchema, mapTransitionSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function explorationRoutes(app: FastifyInstance) {
  const service = createExplorationService(prisma);

  app.get("/sessions/:id/exploration-settings", async (request, reply) => {
    const settings = await service.getSettings(request.params.id);
    return reply.send(createSuccessResponse(settings));
  });

  app.patch("/sessions/:id/exploration-settings", async (request, reply) => {
    const input = updateExplorationSettingsSchema.parse(request.body);
    const settings = await service.updateSettings(request.params.id, request.user.id, input);
    return reply.send(createSuccessResponse(settings));
  });

  app.post("/sessions/:id/maps/:mapId/transition", async (request, reply) => {
    const input = mapTransitionSchema.parse(request.body);
    const result = await service.initiateTransition(request.params.id, request.user.id, input);
    return reply.send(createSuccessResponse(result));
  });

  app.get("/sessions/:id/maps/:mapId/spawn-points", async (request, reply) => {
    const points = await service.getSpawnPoints(request.params.mapId);
    return reply.send(createSuccessResponse(points));
  });
}
