import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createMarchingOrderService } from "./marching-order.service.js";
import { setMarchingOrderSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function marchingOrderRoutes(app: FastifyInstance) {
  const service = createMarchingOrderService(prisma);

  async function getUserRole(sessionId: string, userId: string): Promise<string> {
    const sp = await prisma.sessionPlayer.findFirst({
      where: { sessionId, userId },
      select: { role: true },
    });
    return sp?.role ?? "PLAYER";
  }

  // ── Get Marching Order ──

  app.get("/sessions/:sessionId/marching-order", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const order = await service.get(sessionId);
    return reply.send(createSuccessResponse(order));
  });

  // ── Set Marching Order ──

  app.put("/sessions/:sessionId/marching-order", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const input = setMarchingOrderSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const order = await service.set(sessionId, role, input);
    return reply.send(createSuccessResponse(order));
  });

  // ── Toggle Active ──

  app.post("/sessions/:sessionId/marching-order/toggle", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const { isActive } = request.body as { isActive: boolean };
    const role = await getUserRole(sessionId, request.user.id);
    const order = await service.toggle(sessionId, role, isActive);
    return reply.send(createSuccessResponse(order));
  });
}
