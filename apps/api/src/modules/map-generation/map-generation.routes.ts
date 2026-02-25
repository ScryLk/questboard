import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createMapGenerationService } from "./map-generation.service.js";
import { requestMapGenerationSchema, acceptGenerationSchema, rateGenerationSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function mapGenerationRoutes(app: FastifyInstance) {
  const service = createMapGenerationService(prisma);

  app.post("/sessions/:id/maps/generate", async (request, reply) => {
    const input = requestMapGenerationSchema.parse(request.body);
    const generation = await service.request(request.params.id, request.user.id, input);
    return reply.status(201).send(createSuccessResponse(generation));
  });

  app.get("/sessions/:id/maps/generations", async (request, reply) => {
    const generations = await service.listBySession(request.params.id);
    return reply.send(createSuccessResponse(generations));
  });

  app.get("/sessions/:id/maps/generations/:genId", async (request, reply) => {
    const generation = await service.getStatus(request.params.genId);
    return reply.send(createSuccessResponse(generation));
  });

  app.post("/sessions/:id/maps/generations/:genId/accept", async (request, reply) => {
    const input = acceptGenerationSchema.parse(request.body);
    const result = await service.accept(request.params.id, request.user.id, request.params.genId, input);
    return reply.send(createSuccessResponse(result));
  });

  app.post("/sessions/:id/maps/generations/:genId/reject", async (request, reply) => {
    const result = await service.reject(request.params.id, request.user.id, request.params.genId);
    return reply.send(createSuccessResponse(result));
  });

  app.post("/sessions/:id/maps/generations/:genId/rate", async (request, reply) => {
    const { rating } = rateGenerationSchema.parse(request.body);
    const result = await service.rate(request.params.genId, request.user.id, rating);
    return reply.send(createSuccessResponse(result));
  });

  app.get("/ai/usage", async (request, reply) => {
    const usage = await service.getUsage(request.user.id);
    return reply.send(createSuccessResponse(usage));
  });
}
