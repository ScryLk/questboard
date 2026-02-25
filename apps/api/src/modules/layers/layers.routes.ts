import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createLayersService } from "./layers.service.js";
import { createLayerSchema, updateLayerSchema, reorderLayersSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function layersRoutes(app: FastifyInstance) {
  const service = createLayersService(prisma);

  app.get("/sessions/:id/maps/:mapId/layers", async (request, reply) => {
    const layers = await service.list(request.params.mapId);
    return reply.send(createSuccessResponse(layers));
  });

  app.post("/sessions/:id/maps/:mapId/layers", async (request, reply) => {
    const input = createLayerSchema.parse(request.body);
    const layer = await service.create(request.params.id, request.user.id, request.params.mapId, input);
    return reply.status(201).send(createSuccessResponse(layer));
  });

  app.patch("/sessions/:id/maps/:mapId/layers/:layerId", async (request, reply) => {
    const input = updateLayerSchema.parse(request.body);
    const layer = await service.update(request.params.id, request.user.id, request.params.layerId, input);
    return reply.send(createSuccessResponse(layer));
  });

  app.patch("/sessions/:id/maps/:mapId/layers/reorder", async (request, reply) => {
    const { layerIds } = reorderLayersSchema.parse(request.body);
    await service.reorder(request.params.id, request.user.id, layerIds);
    return reply.send(createSuccessResponse({ reordered: true }));
  });

  app.delete("/sessions/:id/maps/:mapId/layers/:layerId", async (request, reply) => {
    await service.delete(request.params.id, request.user.id, request.params.layerId);
    return reply.status(204).send();
  });
}
