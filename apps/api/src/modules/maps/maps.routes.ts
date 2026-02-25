import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createMapsService } from "./maps.service.js";
import { createMapSchema, updateMapSchema, reorderMapsSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function mapsRoutes(app: FastifyInstance) {
  const service = createMapsService(prisma);

  app.get("/sessions/:id/maps", async (request, reply) => {
    const maps = await service.list(request.params.id);
    return reply.send(createSuccessResponse(maps));
  });

  app.get("/sessions/:id/maps/:mapId", async (request, reply) => {
    const map = await service.getById(request.params.mapId);
    return reply.send(createSuccessResponse(map));
  });

  app.get("/sessions/:id/maps/:mapId/full-state", async (request, reply) => {
    const state = await service.getFullState(request.params.mapId);
    return reply.send(createSuccessResponse(state));
  });

  app.post("/sessions/:id/maps", async (request, reply) => {
    const input = createMapSchema.parse(request.body);
    const body = request.body as Record<string, unknown>;
    const map = await service.create(request.params.id, request.user.id, {
      ...input,
      imageUrl: body.imageUrl as string,
      imageWidth: body.imageWidth as number,
      imageHeight: body.imageHeight as number,
      fileSizeMb: (body.fileSizeMb as number) ?? 0,
    });
    return reply.status(201).send(createSuccessResponse(map));
  });

  app.patch("/sessions/:id/maps/:mapId", async (request, reply) => {
    const input = updateMapSchema.parse(request.body);
    const map = await service.update(request.params.id, request.user.id, request.params.mapId, input);
    return reply.send(createSuccessResponse(map));
  });

  app.delete("/sessions/:id/maps/:mapId", async (request, reply) => {
    await service.delete(request.params.id, request.user.id, request.params.mapId);
    return reply.status(204).send();
  });

  app.post("/sessions/:id/maps/:mapId/activate", async (request, reply) => {
    const result = await service.setActive(request.params.id, request.user.id, request.params.mapId);
    return reply.send(createSuccessResponse(result));
  });

  app.patch("/sessions/:id/maps/reorder", async (request, reply) => {
    const { mapIds } = reorderMapsSchema.parse(request.body);
    await service.reorder(request.params.id, request.user.id, mapIds);
    return reply.send(createSuccessResponse({ reordered: true }));
  });
}
