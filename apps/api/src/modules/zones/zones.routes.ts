import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createZonesService } from "./zones.service.js";
import { createMapZoneSchema, updateMapZoneSchema, batchCreateZonesSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function zonesRoutes(app: FastifyInstance) {
  const service = createZonesService(prisma);

  app.get("/sessions/:id/maps/:mapId/zones", async (request, reply) => {
    const zones = await service.list(request.params.mapId);
    return reply.send(createSuccessResponse(zones));
  });

  app.post("/sessions/:id/maps/:mapId/zones", async (request, reply) => {
    const input = createMapZoneSchema.parse(request.body);
    const zone = await service.create(request.params.id, request.user.id, request.params.mapId, input);
    return reply.status(201).send(createSuccessResponse(zone));
  });

  app.post("/sessions/:id/maps/:mapId/zones/batch", async (request, reply) => {
    const { zones } = batchCreateZonesSchema.parse(request.body);
    const created = await service.batchCreate(request.params.id, request.user.id, request.params.mapId, zones);
    return reply.status(201).send(createSuccessResponse(created));
  });

  app.patch("/sessions/:id/maps/:mapId/zones/:zoneId", async (request, reply) => {
    const input = updateMapZoneSchema.parse(request.body);
    const zone = await service.update(request.params.id, request.user.id, request.params.zoneId, input);
    return reply.send(createSuccessResponse(zone));
  });

  app.delete("/sessions/:id/maps/:mapId/zones/:zoneId", async (request, reply) => {
    await service.delete(request.params.id, request.user.id, request.params.zoneId);
    return reply.status(204).send();
  });
}
