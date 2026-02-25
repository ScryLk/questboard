import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createSessionPlayersService } from "./session-players.service.js";
import { joinSessionSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function sessionPlayersRoutes(app: FastifyInstance) {
  const service = createSessionPlayersService(prisma);

  app.post("/sessions/:id/join", async (request, reply) => {
    const input = joinSessionSchema.parse(request.body);
    const player = await service.join(request.user.id, {
      sessionId: request.params.id,
      ...input,
    });
    return reply.status(201).send(createSuccessResponse(player));
  });

  app.post("/sessions/:id/leave", async (request, reply) => {
    await service.leave(request.params.id, request.user.id);
    return reply.status(204).send();
  });

  app.get("/sessions/:id/players", async (request, reply) => {
    const players = await service.listPlayers(request.params.id);
    return reply.send(createSuccessResponse(players));
  });

  app.patch("/sessions/:id/players/:userId/role", async (request, reply) => {
    const { role } = request.body as { role: string };
    await service.changeRole(request.params.id, request.user.id, request.params.userId, role as any);
    return reply.send(createSuccessResponse({ updated: true }));
  });

  app.post("/sessions/:id/players/:userId/kick", async (request, reply) => {
    const { reason } = (request.body || {}) as { reason?: string };
    await service.kick(request.params.id, request.user.id, request.params.userId, reason);
    return reply.send(createSuccessResponse({ kicked: true }));
  });

  app.post("/sessions/:id/players/:userId/ban", async (request, reply) => {
    await service.ban(request.params.id, request.user.id, request.params.userId);
    return reply.send(createSuccessResponse({ banned: true }));
  });

  app.post("/sessions/:id/players/:userId/unban", async (request, reply) => {
    await service.unban(request.params.id, request.user.id, request.params.userId);
    return reply.send(createSuccessResponse({ unbanned: true }));
  });

  app.patch("/sessions/:id/players/me/character", async (request, reply) => {
    const { characterId } = request.body as { characterId: string | null };
    await service.linkCharacter(request.params.id, request.user.id, characterId);
    return reply.send(createSuccessResponse({ updated: true }));
  });
}
