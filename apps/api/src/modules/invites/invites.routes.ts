import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createInvitesService } from "./invites.service.js";
import { createInviteSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function invitesRoutes(app: FastifyInstance) {
  const service = createInvitesService(prisma);

  app.post("/sessions/:id/invites", async (request, reply) => {
    const input = createInviteSchema.parse(request.body);
    const invite = await service.create(request.params.id, request.user.id, input);
    return reply.status(201).send(createSuccessResponse(invite));
  });

  app.get("/sessions/:id/invites", async (request, reply) => {
    const invites = await service.listBySession(request.params.id);
    return reply.send(createSuccessResponse(invites));
  });

  app.delete("/sessions/:id/invites/:inviteId", async (request, reply) => {
    await service.revoke(request.params.inviteId, request.user.id);
    return reply.status(204).send();
  });

  app.post("/invites/:token/accept", async (request, reply) => {
    const invite = await service.acceptByToken(request.params.token, request.user.id);
    return reply.send(createSuccessResponse(invite));
  });

  app.post("/invites/:token/decline", async (request, reply) => {
    await service.declineByToken(request.params.token, request.user.id);
    return reply.status(204).send();
  });

  app.get("/invites/mine", async (request, reply) => {
    const invites = await service.listMine(request.user.id);
    return reply.send(createSuccessResponse(invites));
  });
}
