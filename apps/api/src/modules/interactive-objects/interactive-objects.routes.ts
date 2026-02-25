import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createInteractiveObjectsService } from "./interactive-objects.service.js";
import { createInteractiveObjectSchema, updateInteractiveObjectSchema, batchCreateInteractiveObjectsSchema, interactWithObjectSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function interactiveObjectsRoutes(app: FastifyInstance) {
  const service = createInteractiveObjectsService(prisma);

  app.get("/sessions/:id/maps/:mapId/objects", async (request, reply) => {
    const objects = await service.list(request.params.mapId);
    return reply.send(createSuccessResponse(objects));
  });

  app.post("/sessions/:id/maps/:mapId/objects", async (request, reply) => {
    const input = createInteractiveObjectSchema.parse(request.body);
    const obj = await service.create(request.params.id, request.user.id, request.params.mapId, input);
    return reply.status(201).send(createSuccessResponse(obj));
  });

  app.post("/sessions/:id/maps/:mapId/objects/batch", async (request, reply) => {
    const { objects } = batchCreateInteractiveObjectsSchema.parse(request.body);
    const created = await service.batchCreate(request.params.id, request.user.id, request.params.mapId, objects);
    return reply.status(201).send(createSuccessResponse(created));
  });

  app.patch("/sessions/:id/maps/:mapId/objects/:objectId", async (request, reply) => {
    const input = updateInteractiveObjectSchema.parse(request.body);
    const obj = await service.update(request.params.id, request.user.id, request.params.objectId, input);
    return reply.send(createSuccessResponse(obj));
  });

  app.delete("/sessions/:id/maps/:mapId/objects/:objectId", async (request, reply) => {
    await service.delete(request.params.id, request.user.id, request.params.objectId);
    return reply.status(204).send();
  });

  app.post("/sessions/:id/maps/:mapId/objects/:objectId/interact", async (request, reply) => {
    const parsed = interactWithObjectSchema.parse(request.body);
    const result = await service.interact(request.params.id, request.user.id, request.params.objectId, parsed.context);
    return reply.send(createSuccessResponse(result));
  });
}
