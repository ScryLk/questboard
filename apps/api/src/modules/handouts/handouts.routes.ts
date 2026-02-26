import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createHandoutsService } from "./handouts.service.js";
import {
  createHandoutSchema,
  updateHandoutSchema,
  revealSectionSchema,
  handoutQuerySchema,
} from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function handoutsRoutes(app: FastifyInstance) {
  const service = createHandoutsService(prisma);

  async function getUserRole(sessionId: string, userId: string): Promise<string> {
    const sp = await prisma.sessionPlayer.findFirst({
      where: { sessionId, userId },
      select: { role: true },
    });
    return sp?.role ?? "PLAYER";
  }

  // ── List Handouts ──

  app.get("/sessions/:sessionId/handouts", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const query = handoutQuerySchema.parse(request.query);
    const role = await getUserRole(sessionId, request.user.id);
    const handouts = await service.list(sessionId, request.user.id, role, query);
    return reply.send(createSuccessResponse(handouts));
  });

  // ── Get Handout ──

  app.get("/sessions/:sessionId/handouts/:handoutId", async (request, reply) => {
    const { sessionId, handoutId } = request.params as { sessionId: string; handoutId: string };
    const role = await getUserRole(sessionId, request.user.id);
    const handout = await service.getById(sessionId, handoutId, request.user.id, role);
    return reply.send(createSuccessResponse(handout));
  });

  // ── Create Handout ──

  app.post("/sessions/:sessionId/handouts", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const input = createHandoutSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const handout = await service.create(sessionId, request.user.id, role, input);
    return reply.status(201).send(createSuccessResponse(handout));
  });

  // ── Update Handout ──

  app.patch("/sessions/:sessionId/handouts/:handoutId", async (request, reply) => {
    const { sessionId, handoutId } = request.params as { sessionId: string; handoutId: string };
    const input = updateHandoutSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const handout = await service.update(sessionId, handoutId, request.user.id, role, input);
    return reply.send(createSuccessResponse(handout));
  });

  // ── Delete Handout ──

  app.delete("/sessions/:sessionId/handouts/:handoutId", async (request, reply) => {
    const { sessionId, handoutId } = request.params as { sessionId: string; handoutId: string };
    const role = await getUserRole(sessionId, request.user.id);
    await service.delete(sessionId, handoutId, role);
    return reply.send(createSuccessResponse(null));
  });

  // ── Reveal Section ──

  app.post("/sessions/:sessionId/handouts/:handoutId/reveal", async (request, reply) => {
    const { sessionId, handoutId } = request.params as { sessionId: string; handoutId: string };
    const input = revealSectionSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const section = await service.revealSection(
      sessionId,
      handoutId,
      input.sectionId,
      role,
      input.revealTo,
    );
    return reply.send(createSuccessResponse(section));
  });
}
