import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createQuestsService } from "./quests.service.js";
import { createQuestSchema, updateQuestSchema, questQuerySchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function questsRoutes(app: FastifyInstance) {
  const service = createQuestsService(prisma);

  async function getUserRole(sessionId: string, userId: string): Promise<string> {
    const sp = await prisma.sessionPlayer.findFirst({
      where: { sessionId, userId },
      select: { role: true },
    });
    return sp?.role ?? "PLAYER";
  }

  // ── List Quests ──

  app.get("/sessions/:sessionId/quests", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const query = questQuerySchema.parse(request.query);
    const role = await getUserRole(sessionId, request.user.id);
    const quests = await service.list(sessionId, request.user.id, role, query);
    return reply.send(createSuccessResponse(quests));
  });

  // ── Get Quest ──

  app.get("/sessions/:sessionId/quests/:questId", async (request, reply) => {
    const { sessionId, questId } = request.params as { sessionId: string; questId: string };
    const role = await getUserRole(sessionId, request.user.id);
    const quest = await service.getById(sessionId, questId, request.user.id, role);
    return reply.send(createSuccessResponse(quest));
  });

  // ── Create Quest ──

  app.post("/sessions/:sessionId/quests", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const input = createQuestSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const quest = await service.create(sessionId, request.user.id, role, input);
    return reply.status(201).send(createSuccessResponse(quest));
  });

  // ── Update Quest ──

  app.patch("/sessions/:sessionId/quests/:questId", async (request, reply) => {
    const { sessionId, questId } = request.params as { sessionId: string; questId: string };
    const input = updateQuestSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const quest = await service.update(sessionId, questId, request.user.id, role, input);
    return reply.send(createSuccessResponse(quest));
  });

  // ── Update Objective ──

  app.post("/sessions/:sessionId/quests/:questId/objectives/:objectiveId/complete", async (request, reply) => {
    const { sessionId, questId, objectiveId } = request.params as {
      sessionId: string; questId: string; objectiveId: string;
    };
    const { completed } = request.body as { completed?: boolean };
    const role = await getUserRole(sessionId, request.user.id);
    const result = await service.updateObjective(sessionId, questId, objectiveId, completed ?? true, role);
    return reply.send(createSuccessResponse(result));
  });

  // ── Delete Quest ──

  app.delete("/sessions/:sessionId/quests/:questId", async (request, reply) => {
    const { sessionId, questId } = request.params as { sessionId: string; questId: string };
    const role = await getUserRole(sessionId, request.user.id);
    await service.delete(sessionId, questId, role);
    return reply.send(createSuccessResponse(null));
  });
}
