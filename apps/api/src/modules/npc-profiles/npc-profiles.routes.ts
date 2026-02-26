import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createNpcProfilesService } from "./npc-profiles.service.js";
import {
  createNpcProfileSchema,
  updateNpcProfileSchema,
  setNpcDispositionSchema,
  npcQuerySchema,
} from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function npcProfilesRoutes(app: FastifyInstance) {
  const service = createNpcProfilesService(prisma);

  async function getUserRole(sessionId: string, userId: string): Promise<string> {
    const sp = await prisma.sessionPlayer.findFirst({
      where: { sessionId, userId },
      select: { role: true },
    });
    return sp?.role ?? "PLAYER";
  }

  // ── List NPCs ──

  app.get("/sessions/:sessionId/npcs", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const query = npcQuerySchema.parse(request.query);
    const role = await getUserRole(sessionId, request.user.id);
    const npcs = await service.list(sessionId, role, query);
    return reply.send(createSuccessResponse(npcs));
  });

  // ── Get NPC ──

  app.get("/sessions/:sessionId/npcs/:npcId", async (request, reply) => {
    const { sessionId, npcId } = request.params as { sessionId: string; npcId: string };
    const role = await getUserRole(sessionId, request.user.id);
    const npc = await service.getById(sessionId, npcId, role);
    return reply.send(createSuccessResponse(npc));
  });

  // ── Create NPC ──

  app.post("/sessions/:sessionId/npcs", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const input = createNpcProfileSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const npc = await service.create(sessionId, request.user.id, role, input);
    return reply.status(201).send(createSuccessResponse(npc));
  });

  // ── Update NPC ──

  app.patch("/sessions/:sessionId/npcs/:npcId", async (request, reply) => {
    const { sessionId, npcId } = request.params as { sessionId: string; npcId: string };
    const input = updateNpcProfileSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const npc = await service.update(sessionId, npcId, role, input);
    return reply.send(createSuccessResponse(npc));
  });

  // ── Set Disposition ──

  app.post("/sessions/:sessionId/npcs/:npcId/disposition", async (request, reply) => {
    const { sessionId, npcId } = request.params as { sessionId: string; npcId: string };
    const input = setNpcDispositionSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const npc = await service.setDisposition(sessionId, npcId, role, input);
    return reply.send(createSuccessResponse(npc));
  });

  // ── Delete NPC ──

  app.delete("/sessions/:sessionId/npcs/:npcId", async (request, reply) => {
    const { sessionId, npcId } = request.params as { sessionId: string; npcId: string };
    const role = await getUserRole(sessionId, request.user.id);
    await service.delete(sessionId, npcId, role);
    return reply.send(createSuccessResponse(null));
  });
}
