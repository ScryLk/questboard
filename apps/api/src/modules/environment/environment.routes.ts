import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createEnvironmentService } from "./environment.service.js";
import { updateEnvironmentSchema, setTimeFlowSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function environmentRoutes(app: FastifyInstance) {
  const service = createEnvironmentService(prisma);

  async function getUserRole(sessionId: string, userId: string): Promise<string> {
    const sp = await prisma.sessionPlayer.findFirst({
      where: { sessionId, userId },
      select: { role: true },
    });
    return sp?.role ?? "PLAYER";
  }

  // ── Get Environment State ──

  app.get("/sessions/:sessionId/environment", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const state = await service.getState(sessionId);
    return reply.send(createSuccessResponse(state));
  });

  // ── Update Environment ──

  app.patch("/sessions/:sessionId/environment", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const input = updateEnvironmentSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const state = await service.update(sessionId, role, input);
    return reply.send(createSuccessResponse(state));
  });

  // ── Set Time Flow ──

  app.post("/sessions/:sessionId/environment/time-flow", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const input = setTimeFlowSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const state = await service.setTimeFlow(sessionId, role, input);
    return reply.send(createSuccessResponse(state));
  });
}
