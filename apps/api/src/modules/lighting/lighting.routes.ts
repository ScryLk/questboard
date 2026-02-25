import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createLightingService } from "./lighting.service.js";
import { createLightSourceSchema, updateLightSourceSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function lightingRoutes(app: FastifyInstance) {
  const service = createLightingService(prisma);

  app.get("/sessions/:id/maps/:mapId/lights", async (request, reply) => {
    const lights = await service.list(request.params.mapId);
    return reply.send(createSuccessResponse(lights));
  });

  app.post("/sessions/:id/maps/:mapId/lights", async (request, reply) => {
    const input = createLightSourceSchema.parse(request.body);
    const light = await service.create(request.params.id, request.user.id, request.params.mapId, input);
    return reply.status(201).send(createSuccessResponse(light));
  });

  app.patch("/sessions/:id/maps/:mapId/lights/:lightId", async (request, reply) => {
    const input = updateLightSourceSchema.parse(request.body);
    const light = await service.update(request.params.id, request.user.id, request.params.lightId, input);
    return reply.send(createSuccessResponse(light));
  });

  app.post("/sessions/:id/maps/:mapId/lights/:lightId/toggle", async (request, reply) => {
    const light = await service.toggle(request.params.id, request.user.id, request.params.lightId);
    return reply.send(createSuccessResponse(light));
  });

  app.delete("/sessions/:id/maps/:mapId/lights/:lightId", async (request, reply) => {
    await service.delete(request.params.id, request.user.id, request.params.lightId);
    return reply.status(204).send();
  });

  app.delete("/sessions/:id/maps/:mapId/lights", async (request, reply) => {
    const result = await service.deleteAll(request.params.id, request.user.id, request.params.mapId);
    return reply.send(createSuccessResponse(result));
  });
}
