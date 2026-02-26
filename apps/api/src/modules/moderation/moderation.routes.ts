import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createModerationService } from "./moderation.service.js";
import {
  muteUserSchema,
  reviewContentSchema,
  warnUserSchema,
  moderationLogQuerySchema,
} from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function moderationRoutes(app: FastifyInstance) {
  const service = createModerationService(prisma);

  async function getUserRole(sessionId: string, userId: string): Promise<string> {
    const sp = await prisma.sessionPlayer.findFirst({
      where: { sessionId, userId },
      select: { role: true },
    });
    return sp?.role ?? "PLAYER";
  }

  // ── Mute User ──

  app.post("/sessions/:sessionId/moderation/mute", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const input = muteUserSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const result = await service.muteUser(sessionId, request.user.id, role, input);
    return reply.send(createSuccessResponse(result));
  });

  // ── Unmute User ──

  app.post("/sessions/:sessionId/moderation/unmute", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const body = request.body as { userId: string };
    const role = await getUserRole(sessionId, request.user.id);
    await service.unmuteUser(sessionId, request.user.id, role, body.userId);
    return reply.send(createSuccessResponse(null));
  });

  // ── Warn User ──

  app.post("/sessions/:sessionId/moderation/warn", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const input = warnUserSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const result = await service.warnUser(sessionId, request.user.id, role, input);
    return reply.send(createSuccessResponse(result));
  });

  // ── Delete Message (moderation) ──

  app.delete("/sessions/:sessionId/moderation/messages/:messageId", async (request, reply) => {
    const { sessionId, messageId } = request.params as { sessionId: string; messageId: string };
    const body = request.body as { reason?: string } | undefined;
    const role = await getUserRole(sessionId, request.user.id);
    await service.deleteMessageModeration(sessionId, request.user.id, role, messageId, body?.reason);
    return reply.send(createSuccessResponse(null));
  });

  // ── Review Flagged Content ──

  app.post("/sessions/:sessionId/moderation/review", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const input = reviewContentSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    await service.reviewFlaggedContent(sessionId, request.user.id, role, input);
    return reply.send(createSuccessResponse(null));
  });

  // ── Moderation Log ──

  app.get("/sessions/:sessionId/moderation/log", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const query = moderationLogQuerySchema.parse(request.query);
    const role = await getUserRole(sessionId, request.user.id);
    const result = await service.getModerationLog(sessionId, role, query);
    return reply.send(createSuccessResponse(result));
  });

  // ── Check Mute Status ──

  app.get("/sessions/:sessionId/moderation/mute-status/:userId", async (request, reply) => {
    const { sessionId, userId } = request.params as { sessionId: string; userId: string };
    const isMuted = await service.isUserMuted(sessionId, userId);
    return reply.send(createSuccessResponse({ isMuted }));
  });
}
