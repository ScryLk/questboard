import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createSessionRecapsService } from "./session-recaps.service.js";
import { createRecapSchema, updateRecapSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function sessionRecapsRoutes(app: FastifyInstance) {
  const service = createSessionRecapsService(prisma);

  async function getUserRole(sessionId: string, userId: string): Promise<string> {
    const sp = await prisma.sessionPlayer.findFirst({
      where: { sessionId, userId },
      select: { role: true },
    });
    return sp?.role ?? "PLAYER";
  }

  // ── List Recaps ──

  app.get("/sessions/:sessionId/recaps", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const recaps = await service.list(sessionId);
    return reply.send(createSuccessResponse(recaps));
  });

  // ── Get Recap ──

  app.get("/sessions/:sessionId/recaps/:recapId", async (request, reply) => {
    const { sessionId, recapId } = request.params as { sessionId: string; recapId: string };
    const recap = await service.getById(sessionId, recapId);
    return reply.send(createSuccessResponse(recap));
  });

  // ── Create Recap ──

  app.post("/sessions/:sessionId/recaps", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const input = createRecapSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const recap = await service.create(sessionId, request.user.id, role, input);
    return reply.status(201).send(createSuccessResponse(recap));
  });

  // ── Generate AI Recap ──

  app.post("/sessions/:sessionId/recaps/generate-ai", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const role = await getUserRole(sessionId, request.user.id);
    const recap = await service.generateAi(sessionId, request.user.id, role);
    return reply.status(201).send(createSuccessResponse(recap));
  });

  // ── Update Recap ──

  app.patch("/sessions/:sessionId/recaps/:recapId", async (request, reply) => {
    const { sessionId, recapId } = request.params as { sessionId: string; recapId: string };
    const input = updateRecapSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const recap = await service.update(sessionId, recapId, role, input);
    return reply.send(createSuccessResponse(recap));
  });

  // ── Delete Recap ──

  app.delete("/sessions/:sessionId/recaps/:recapId", async (request, reply) => {
    const { sessionId, recapId } = request.params as { sessionId: string; recapId: string };
    const role = await getUserRole(sessionId, request.user.id);
    await service.delete(sessionId, recapId, role);
    return reply.send(createSuccessResponse(null));
  });
}
