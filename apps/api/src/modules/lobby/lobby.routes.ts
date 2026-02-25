import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createLobbyService } from "./lobby.service.js";
import { lobbySearchSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function lobbyRoutes(app: FastifyInstance) {
  const service = createLobbyService(prisma);

  app.get("/lobby/search", async (request, reply) => {
    const input = lobbySearchSchema.parse(request.query);
    const result = await service.search(input);
    return reply.send({ success: true, ...result });
  });

  app.get("/lobby/featured", async (_request, reply) => {
    const sessions = await service.getFeatured();
    return reply.send(createSuccessResponse(sessions));
  });

  app.get("/lobby/live", async (_request, reply) => {
    const sessions = await service.getLiveSessions();
    return reply.send(createSuccessResponse(sessions));
  });

  app.get("/lobby/systems", async (_request, reply) => {
    const systems = await service.getSystems();
    return reply.send(createSuccessResponse(systems));
  });

  app.get("/lobby/tags", async (_request, reply) => {
    const tags = await service.getTags();
    return reply.send(createSuccessResponse(tags));
  });
}
