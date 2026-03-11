import type { FastifyRequest, FastifyReply } from "fastify";
import type { ChatService } from "./chat.service.js";
import { createSuccessResponse } from "@questboard/shared";

export function createChatController(chatService: ChatService) {
  return {
    async listMessages(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const query = request.query as { channel?: string; cursor?: string; limit?: string };
      const result = await chatService.listMessages(request.params.id, {
        channel: query.channel,
        cursor: query.cursor,
        limit: query.limit ? parseInt(query.limit, 10) : undefined,
      });
      return reply.send(createSuccessResponse(result));
    },

    async sendMessage(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as {
        content: string; channel?: string; characterId?: string;
        characterName?: string; characterAvatar?: string; recipientIds?: string[];
        contentType?: string;
      };
      const message = await chatService.sendMessage(request.params.id, request.user.id, body);
      return reply.status(201).send(createSuccessResponse(message));
    },

    async deleteMessage(
      request: FastifyRequest<{ Params: { id: string; msgId: string } }>,
      reply: FastifyReply,
    ) {
      await chatService.deleteMessage(request.params.id, request.user.id, request.params.msgId);
      return reply.status(204).send();
    },

    async rollDice(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as {
        formula: string; label?: string; context?: string;
        characterId?: string; isSecret?: boolean;
      };
      const roll = await chatService.rollDice(request.params.id, request.user.id, body);
      return reply.status(201).send(createSuccessResponse(roll));
    },

    async requestDiceRoll(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as {
        targetUserIds: string[]; diceFormula: string; label: string; reason?: string;
      };
      const result = await chatService.requestDiceRoll(request.params.id, request.user.id, body);
      return reply.status(201).send(createSuccessResponse(result));
    },
  };
}
