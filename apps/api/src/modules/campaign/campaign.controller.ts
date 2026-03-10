import type { FastifyRequest, FastifyReply } from "fastify";
import type { CampaignService } from "./campaign.service.js";
import { createSuccessResponse } from "@questboard/shared";

export function createCampaignController(campaignService: CampaignService) {
  return {
    async list(request: FastifyRequest, reply: FastifyReply) {
      const campaigns = await campaignService.list(request.user.id);
      return reply.send(createSuccessResponse(campaigns));
    },

    async getById(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const campaign = await campaignService.getById(request.params.id);
      return reply.send(createSuccessResponse(campaign));
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
      const body = request.body as { name: string; description?: string; system: string; isPublic?: boolean; maxPlayers?: number };
      const campaign = await campaignService.create(request.user.id, request.user.plan, body);
      return reply.status(201).send(createSuccessResponse(campaign));
    },

    async update(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as { name?: string; description?: string; isPublic?: boolean; maxPlayers?: number; tags?: string[] };
      const campaign = await campaignService.update(request.params.id, request.user.id, body);
      return reply.send(createSuccessResponse(campaign));
    },

    async delete(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      await campaignService.delete(request.params.id, request.user.id);
      return reply.status(204).send();
    },

    async join(request: FastifyRequest, reply: FastifyReply) {
      const body = request.body as { code: string };
      const member = await campaignService.joinByCode(body.code, request.user.id);
      return reply.status(201).send(createSuccessResponse(member));
    },

    async removeMember(
      request: FastifyRequest<{ Params: { id: string; userId: string } }>,
      reply: FastifyReply,
    ) {
      await campaignService.removeMember(request.params.id, request.user.id, request.params.userId);
      return reply.status(204).send();
    },

    async updateMemberRole(
      request: FastifyRequest<{ Params: { id: string; userId: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as { role: "GM" | "CO_GM" | "PLAYER" | "SPECTATOR" };
      const member = await campaignService.updateMemberRole(
        request.params.id,
        request.user.id,
        request.params.userId,
        body.role,
      );
      return reply.send(createSuccessResponse(member));
    },
  };
}
