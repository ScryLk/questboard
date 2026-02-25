import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createFogService } from "./fog.service.js";
import { createFogAreaSchema, batchRevealFogSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function fogRoutes(app: FastifyInstance) {
  const service = createFogService(prisma);

  app.get("/sessions/:id/maps/:mapId/fog", async (request, reply) => {
    const areas = await service.list(request.params.mapId);
    return reply.send(createSuccessResponse(areas));
  });

  app.post("/sessions/:id/maps/:mapId/fog", async (request, reply) => {
    const input = createFogAreaSchema.parse(request.body);
    const area = await service.create(request.params.id, request.user.id, request.params.mapId, input);
    return reply.status(201).send(createSuccessResponse(area));
  });

  app.patch("/sessions/:id/maps/:mapId/fog/:fogId/reveal", async (request, reply) => {
    const area = await service.reveal(request.params.id, request.user.id, request.params.fogId);
    return reply.send(createSuccessResponse(area));
  });

  app.patch("/sessions/:id/maps/:mapId/fog/:fogId/hide", async (request, reply) => {
    const area = await service.hide(request.params.id, request.user.id, request.params.fogId);
    return reply.send(createSuccessResponse(area));
  });

  app.post("/sessions/:id/maps/:mapId/fog/batch-reveal", async (request, reply) => {
    const { fogAreaIds } = batchRevealFogSchema.parse(request.body);
    const result = await service.batchReveal(request.params.id, request.user.id, fogAreaIds);
    return reply.send(createSuccessResponse(result));
  });

  app.post("/sessions/:id/maps/:mapId/fog/reveal-all", async (request, reply) => {
    const result = await service.revealAll(request.params.id, request.user.id, request.params.mapId);
    return reply.send(createSuccessResponse(result));
  });

  app.post("/sessions/:id/maps/:mapId/fog/hide-all", async (request, reply) => {
    const result = await service.hideAll(request.params.id, request.user.id, request.params.mapId);
    return reply.send(createSuccessResponse(result));
  });

  app.post("/sessions/:id/maps/:mapId/fog/reset", async (request, reply) => {
    const result = await service.reset(request.params.id, request.user.id, request.params.mapId);
    return reply.send(createSuccessResponse(result));
  });

  app.delete("/sessions/:id/maps/:mapId/fog/:fogId", async (request, reply) => {
    await service.delete(request.params.id, request.user.id, request.params.fogId);
    return reply.status(204).send();
  });
}
