import type { FastifyRequest, FastifyReply } from "fastify";
import type { CharacterService } from "./character.service.js";
import { createSuccessResponse } from "@questboard/shared";

export function createCharacterController(characterService: CharacterService) {
  return {
    async list(request: FastifyRequest, reply: FastifyReply) {
      const characters = await characterService.list(request.user.id);
      return reply.send(createSuccessResponse(characters));
    },

    async getById(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const character = await characterService.getById(request.params.id);
      return reply.send(createSuccessResponse(character));
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
      const body = request.body as {
        name: string; system: string; race?: string; class?: string;
        level?: number; avatarUrl?: string; campaignId?: string;
        attributes?: Record<string, unknown>;
      };
      const character = await characterService.create(request.user.id, request.user.plan, body);
      return reply.status(201).send(createSuccessResponse(character));
    },

    async update(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const character = await characterService.update(
        request.params.id,
        request.user.id,
        request.body as Record<string, unknown>,
      );
      return reply.send(createSuccessResponse(character));
    },

    async delete(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      await characterService.delete(request.params.id, request.user.id);
      return reply.status(204).send();
    },

    async updateResources(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as Record<string, unknown>;
      const character = await characterService.updateResources(
        request.params.id,
        request.user.id,
        body,
      );
      return reply.send(createSuccessResponse(character));
    },
  };
}
