import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createSceneCardsService } from "./scene-cards.service.js";
import { createSceneCardSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function sceneCardsRoutes(app: FastifyInstance) {
  const service = createSceneCardsService(prisma);

  async function getUserRole(sessionId: string, userId: string): Promise<string> {
    const sp = await prisma.sessionPlayer.findFirst({
      where: { sessionId, userId },
      select: { role: true },
    });
    return sp?.role ?? "PLAYER";
  }

  // ── List Scene Cards ──

  app.get("/sessions/:sessionId/scene-cards", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const { limit, offset } = request.query as { limit?: string; offset?: string };
    const cards = await service.list(sessionId, Number(limit) || 20, Number(offset) || 0);
    return reply.send(createSuccessResponse(cards));
  });

  // ── Get Scene Card ──

  app.get("/sessions/:sessionId/scene-cards/:cardId", async (request, reply) => {
    const { sessionId, cardId } = request.params as { sessionId: string; cardId: string };
    const card = await service.getById(sessionId, cardId);
    return reply.send(createSuccessResponse(card));
  });

  // ── Show Scene Card (create + emit) ──

  app.post("/sessions/:sessionId/scene-cards", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const input = createSceneCardSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const card = await service.create(sessionId, request.user.id, role, input);
    return reply.status(201).send(createSuccessResponse(card));
  });

  // ── Delete Scene Card ──

  app.delete("/sessions/:sessionId/scene-cards/:cardId", async (request, reply) => {
    const { sessionId, cardId } = request.params as { sessionId: string; cardId: string };
    const role = await getUserRole(sessionId, request.user.id);
    await service.delete(sessionId, cardId, role);
    return reply.send(createSuccessResponse(null));
  });
}
