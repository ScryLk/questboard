import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createWallsService } from "./walls.service.js";
import { createWallSchema, batchCreateWallsSchema, toggleDoorSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function wallsRoutes(app: FastifyInstance) {
  const service = createWallsService(prisma);

  app.get("/sessions/:id/maps/:mapId/walls", async (request, reply) => {
    const walls = await service.list(request.params.mapId);
    return reply.send(createSuccessResponse(walls));
  });

  app.post("/sessions/:id/maps/:mapId/walls", async (request, reply) => {
    const input = createWallSchema.parse(request.body);
    const wall = await service.create(request.params.id, request.user.id, request.params.mapId, input);
    return reply.status(201).send(createSuccessResponse(wall));
  });

  app.post("/sessions/:id/maps/:mapId/walls/batch", async (request, reply) => {
    const { walls } = batchCreateWallsSchema.parse(request.body);
    const created = await service.batchCreate(request.params.id, request.user.id, request.params.mapId, walls);
    return reply.status(201).send(createSuccessResponse(created));
  });

  app.patch("/sessions/:id/maps/:mapId/walls/:wallId/door", async (request, reply) => {
    const { doorState } = toggleDoorSchema.parse(request.body);
    const wall = await service.toggleDoor(request.params.id, request.user.id, request.params.wallId, doorState);
    return reply.send(createSuccessResponse(wall));
  });

  app.delete("/sessions/:id/maps/:mapId/walls/:wallId", async (request, reply) => {
    await service.delete(request.params.id, request.user.id, request.params.wallId);
    return reply.status(204).send();
  });

  app.delete("/sessions/:id/maps/:mapId/walls", async (request, reply) => {
    const result = await service.deleteAll(request.params.id, request.user.id, request.params.mapId);
    return reply.send(createSuccessResponse(result));
  });
}
