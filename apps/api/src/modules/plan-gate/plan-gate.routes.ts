import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@questboard/db";
import { createPlanGateService } from "./plan-gate.service.js";
import { createSuccessResponse } from "@questboard/shared";

export async function planGateRoutes(app: FastifyInstance) {
  const planGate = createPlanGateService(prisma);

  app.get("/plan/limits", async (request: FastifyRequest, reply: FastifyReply) => {
    const limits = await planGate.getLimitsForUser(request.user.id);
    return reply.send(createSuccessResponse(limits));
  });

  app.get("/plan/usage", async (request: FastifyRequest, reply: FastifyReply) => {
    const usage = await planGate.getUsage(request.user.id);
    return reply.send(createSuccessResponse(usage));
  });

  app.get(
    "/plan/session-features/:sessionId",
    async (request: FastifyRequest<{ Params: { sessionId: string } }>, reply: FastifyReply) => {
      const features = await planGate.getSessionFeatures(request.params.sessionId);
      return reply.send(createSuccessResponse(features));
    }
  );
}
