import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createPartyLootService } from "./party-loot.service.js";
import { addLootSchema, lootQuerySchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function partyLootRoutes(app: FastifyInstance) {
  const service = createPartyLootService(prisma);

  async function getUserRole(sessionId: string, userId: string): Promise<string> {
    const sp = await prisma.sessionPlayer.findFirst({
      where: { sessionId, userId },
      select: { role: true },
    });
    return sp?.role ?? "PLAYER";
  }

  // ── List Loot ──

  app.get("/sessions/:sessionId/loot", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const query = lootQuerySchema.parse(request.query);
    const items = await service.list(sessionId, query);
    return reply.send(createSuccessResponse(items));
  });

  // ── Get Loot Item ──

  app.get("/sessions/:sessionId/loot/:lootId", async (request, reply) => {
    const { sessionId, lootId } = request.params as { sessionId: string; lootId: string };
    const item = await service.getById(sessionId, lootId);
    return reply.send(createSuccessResponse(item));
  });

  // ── Add Loot ──

  app.post("/sessions/:sessionId/loot", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const input = addLootSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const item = await service.add(sessionId, request.user.id, role, input);
    return reply.status(201).send(createSuccessResponse(item));
  });

  // ── Claim Loot ──

  app.post("/sessions/:sessionId/loot/:lootId/claim", async (request, reply) => {
    const { sessionId, lootId } = request.params as { sessionId: string; lootId: string };
    const item = await service.claim(sessionId, lootId, request.user.id);
    return reply.send(createSuccessResponse(item));
  });

  // ── Approve Claim ──

  app.post("/sessions/:sessionId/loot/:lootId/approve", async (request, reply) => {
    const { sessionId, lootId } = request.params as { sessionId: string; lootId: string };
    const role = await getUserRole(sessionId, request.user.id);
    const item = await service.approveClaim(sessionId, lootId, role);
    return reply.send(createSuccessResponse(item));
  });

  // ── Reject Claim ──

  app.post("/sessions/:sessionId/loot/:lootId/reject", async (request, reply) => {
    const { sessionId, lootId } = request.params as { sessionId: string; lootId: string };
    const role = await getUserRole(sessionId, request.user.id);
    const item = await service.rejectClaim(sessionId, lootId, role);
    return reply.send(createSuccessResponse(item));
  });

  // ── Distribute Loot (GM direct) ──

  app.post("/sessions/:sessionId/loot/:lootId/distribute", async (request, reply) => {
    const { sessionId, lootId } = request.params as { sessionId: string; lootId: string };
    const { toUserId } = request.body as { toUserId: string };
    const role = await getUserRole(sessionId, request.user.id);
    const item = await service.distribute(sessionId, lootId, toUserId, role);
    return reply.send(createSuccessResponse(item));
  });

  // ── Delete Loot ──

  app.delete("/sessions/:sessionId/loot/:lootId", async (request, reply) => {
    const { sessionId, lootId } = request.params as { sessionId: string; lootId: string };
    const role = await getUserRole(sessionId, request.user.id);
    await service.delete(sessionId, lootId, role);
    return reply.send(createSuccessResponse(null));
  });
}
