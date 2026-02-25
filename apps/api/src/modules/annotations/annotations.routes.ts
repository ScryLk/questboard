import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createAnnotationsService } from "./annotations.service.js";
import { createAnnotationSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function annotationsRoutes(app: FastifyInstance) {
  const service = createAnnotationsService(prisma);

  app.get("/sessions/:id/maps/:mapId/annotations", async (request, reply) => {
    const annotations = await service.list(request.params.mapId, request.user.id, request.params.id);
    return reply.send(createSuccessResponse(annotations));
  });

  app.post("/sessions/:id/maps/:mapId/annotations", async (request, reply) => {
    const input = createAnnotationSchema.parse(request.body);
    const annotation = await service.create(request.params.id, request.user.id, request.params.mapId, input);
    return reply.status(201).send(createSuccessResponse(annotation));
  });

  app.post("/sessions/:id/maps/:mapId/annotations/clear", async (request, reply) => {
    const result = await service.clearNonPersistent(request.params.id, request.user.id, request.params.mapId);
    return reply.send(createSuccessResponse(result));
  });

  app.post("/sessions/:id/maps/:mapId/annotations/clear-all", async (request, reply) => {
    const result = await service.clearAll(request.params.id, request.user.id, request.params.mapId);
    return reply.send(createSuccessResponse(result));
  });
}
