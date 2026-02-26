import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createChatService } from "./chat.service.js";
import {
  sendMessageSchema,
  chatHistoryQuerySchema,
  mediaUploadSchema,
} from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function chatRoutes(app: FastifyInstance) {
  const service = createChatService(prisma);

  // ── History ──

  app.get("/sessions/:sessionId/chat", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const query = chatHistoryQuerySchema.parse(request.query);
    const messages = await service.getHistory(sessionId, request.user.id, query);
    return reply.send(createSuccessResponse(messages));
  });

  // ── Pinned Messages ──

  app.get("/sessions/:sessionId/chat/pinned", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const messages = await service.getPinnedMessages(sessionId, request.user.id);
    return reply.send(createSuccessResponse(messages));
  });

  // ── Search Messages ──

  app.get("/sessions/:sessionId/chat/search", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const query = request.query as { q?: string; limit?: string };
    const results = await service.searchMessages(
      sessionId,
      request.user.id,
      query.q ?? "",
      query.limit ? parseInt(query.limit, 10) : 20,
    );
    return reply.send(createSuccessResponse(results));
  });

  // ── Send Message (REST fallback) ──

  app.post("/sessions/:sessionId/chat", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const input = sendMessageSchema.parse(request.body);
    const message = await service.sendMessage(sessionId, request.user.id, input);
    return reply.status(201).send(createSuccessResponse(message));
  });

  // ── Edit Message ──

  app.patch("/sessions/:sessionId/chat/:messageId", async (request, reply) => {
    const { sessionId, messageId } = request.params as { sessionId: string; messageId: string };
    const body = request.body as { content: string };
    const result = await service.editMessage(sessionId, request.user.id, messageId, body.content);
    return reply.send(createSuccessResponse(result));
  });

  // ── Delete Message ──

  app.delete("/sessions/:sessionId/chat/:messageId", async (request, reply) => {
    const { sessionId, messageId } = request.params as { sessionId: string; messageId: string };
    const sp = await prisma.sessionPlayer.findFirst({
      where: { sessionId, userId: request.user.id },
    });
    await service.deleteMessage(sessionId, request.user.id, messageId, sp?.role ?? "PLAYER");
    return reply.send(createSuccessResponse(null));
  });

  // ── Pin / Unpin Message ──

  app.post("/sessions/:sessionId/chat/:messageId/pin", async (request, reply) => {
    const { sessionId, messageId } = request.params as { sessionId: string; messageId: string };
    const body = request.body as { isPinned: boolean };
    const sp = await prisma.sessionPlayer.findFirst({
      where: { sessionId, userId: request.user.id },
    });
    await service.pinMessage(sessionId, request.user.id, messageId, body.isPinned, sp?.role ?? "PLAYER");
    return reply.send(createSuccessResponse(null));
  });

  // ── Reactions ──

  app.post("/sessions/:sessionId/chat/:messageId/react", async (request, reply) => {
    const { sessionId, messageId } = request.params as { sessionId: string; messageId: string };
    const body = request.body as { emoji: string };
    await service.addReaction(sessionId, request.user.id, messageId, body.emoji);
    return reply.send(createSuccessResponse(null));
  });

  app.delete("/sessions/:sessionId/chat/:messageId/react/:emoji", async (request, reply) => {
    const { sessionId, messageId, emoji } = request.params as { sessionId: string; messageId: string; emoji: string };
    await service.removeReaction(sessionId, request.user.id, messageId, emoji);
    return reply.send(createSuccessResponse(null));
  });
}
