import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createTokensService } from "./tokens.service.js";
import { createTokenSchema, updateTokenSchema, updateTokenHpSchema, batchCreateTokensSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function tokensRoutes(app: FastifyInstance) {
  const service = createTokensService(prisma);

  app.get("/sessions/:id/maps/:mapId/tokens", async (request, reply) => {
    const tokens = await service.list(request.params.mapId);
    return reply.send(createSuccessResponse(tokens));
  });

  app.post("/sessions/:id/maps/:mapId/tokens", async (request, reply) => {
    const input = createTokenSchema.parse(request.body);
    const token = await service.create(request.params.id, request.user.id, request.params.mapId, input);
    return reply.status(201).send(createSuccessResponse(token));
  });

  app.post("/sessions/:id/maps/:mapId/tokens/batch", async (request, reply) => {
    const { tokens } = batchCreateTokensSchema.parse(request.body);
    const created = await service.batchCreate(request.params.id, request.user.id, request.params.mapId, tokens);
    return reply.status(201).send(createSuccessResponse(created));
  });

  app.patch("/sessions/:id/maps/:mapId/tokens/:tokenId", async (request, reply) => {
    const input = updateTokenSchema.parse(request.body);
    const token = await service.update(request.params.id, request.user.id, request.params.tokenId, input);
    return reply.send(createSuccessResponse(token));
  });

  app.patch("/sessions/:id/maps/:mapId/tokens/:tokenId/hp", async (request, reply) => {
    const { delta } = updateTokenHpSchema.parse(request.body);
    const result = await service.updateHp(request.params.id, request.user.id, request.params.tokenId, delta);
    return reply.send(createSuccessResponse(result));
  });

  app.delete("/sessions/:id/maps/:mapId/tokens/:tokenId", async (request, reply) => {
    await service.delete(request.params.id, request.user.id, request.params.tokenId);
    return reply.status(204).send();
  });
}
