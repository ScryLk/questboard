import type { FastifyRequest, FastifyReply } from "fastify";
import { createSuccessResponse } from "@questboard/shared";
import {
  conversationGmOverrideSchema,
  conversationMessageInputSchema,
  conversationOpenSchema,
  dialogueBranchCreateSchema,
  dialogueBranchReorderSchema,
  dialogueBranchUpdateSchema,
} from "@questboard/validators";
import type { NpcService } from "./npc.service.js";

export function createNpcController(service: NpcService) {
  return {
    // ── Branches ─────────────────────────────────────

    async listBranches(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const branches = await service.listBranches(request.params.id);
      return reply.send(createSuccessResponse(branches));
    },

    async createBranch(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const input = dialogueBranchCreateSchema.parse(request.body);
      const branch = await service.createBranch(
        request.params.id,
        request.user.id,
        input,
      );
      return reply.status(201).send(createSuccessResponse(branch));
    },

    async updateBranch(
      request: FastifyRequest<{
        Params: { id: string; branchId: string };
      }>,
      reply: FastifyReply,
    ) {
      const input = dialogueBranchUpdateSchema.parse(request.body);
      const branch = await service.updateBranch(
        request.params.id,
        request.params.branchId,
        request.user.id,
        input,
      );
      return reply.send(createSuccessResponse(branch));
    },

    async deleteBranch(
      request: FastifyRequest<{
        Params: { id: string; branchId: string };
      }>,
      reply: FastifyReply,
    ) {
      await service.deleteBranch(
        request.params.id,
        request.params.branchId,
        request.user.id,
      );
      return reply.status(204).send();
    },

    async reorderBranches(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const input = dialogueBranchReorderSchema.parse(request.body);
      await service.reorderBranches(
        request.params.id,
        request.user.id,
        input,
      );
      return reply.status(204).send();
    },

    // ── Conversas ────────────────────────────────────

    async listConversations(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const conversations = await service.listConversations(request.params.id);
      return reply.send(createSuccessResponse(conversations));
    },

    async openConversation(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const input = conversationOpenSchema.parse(request.body);
      const conversation = await service.openConversation(
        request.params.id,
        request.user.id,
        input,
      );
      return reply.status(201).send(createSuccessResponse(conversation));
    },

    async getConversation(
      request: FastifyRequest<{ Params: { cId: string } }>,
      reply: FastifyReply,
    ) {
      const conversation = await service.getConversation(request.params.cId);
      return reply.send(createSuccessResponse(conversation));
    },

    async sendMessage(
      request: FastifyRequest<{ Params: { cId: string } }>,
      reply: FastifyReply,
    ) {
      const input = conversationMessageInputSchema.parse(request.body);
      const result = await service.sendMessage(
        request.params.cId,
        request.user.id,
        input,
      );
      return reply.send(createSuccessResponse(result));
    },

    async gmOverride(
      request: FastifyRequest<{ Params: { cId: string } }>,
      reply: FastifyReply,
    ) {
      const input = conversationGmOverrideSchema.parse(request.body);
      const message = await service.gmOverride(
        request.params.cId,
        request.user.id,
        input,
      );
      return reply.send(createSuccessResponse(message));
    },

    async finishConversation(
      request: FastifyRequest<{ Params: { cId: string } }>,
      reply: FastifyReply,
    ) {
      const conversation = await service.finishConversation(
        request.params.cId,
        request.user.id,
        "finished",
      );
      return reply.send(createSuccessResponse(conversation));
    },
  };
}
