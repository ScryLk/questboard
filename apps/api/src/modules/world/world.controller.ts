import type { FastifyRequest, FastifyReply } from "fastify";
import { createSuccessResponse } from "@questboard/shared";
import {
  worldEntityCreateSchema,
  worldEntityListQuerySchema,
  worldEntityUpdateSchema,
} from "@questboard/validators";
import type { WorldService } from "./world.service.js";

export function createWorldController(service: WorldService) {
  return {
    async list(
      request: FastifyRequest<{
        Params: { campaignId: string };
        Querystring: { kind?: string };
      }>,
      reply: FastifyReply,
    ) {
      const query = worldEntityListQuerySchema.parse(request.query ?? {});
      const entities = await service.list(request.params.campaignId, query);
      // Ocultar `notes` (privado do GM) pra não-GMs.
      const role = request.campaignRole;
      const isGm = role === "OWNER" || role === "CO_GM";
      const sanitized = isGm
        ? entities
        : entities.map(({ notes: _notes, ...rest }) => rest);
      return reply.send(createSuccessResponse(sanitized));
    },

    async getById(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const entity = await service.getById(request.params.id);
      const role = request.campaignRole;
      const isGm = role === "OWNER" || role === "CO_GM";
      const sanitized = isGm
        ? entity
        : (() => {
            const { notes: _notes, ...rest } = entity;
            return rest;
          })();
      return reply.send(createSuccessResponse(sanitized));
    },

    async create(
      request: FastifyRequest<{ Params: { campaignId: string } }>,
      reply: FastifyReply,
    ) {
      const input = worldEntityCreateSchema.parse(request.body);
      const entity = await service.create(
        request.params.campaignId,
        request.user.id,
        input,
      );
      return reply.status(201).send(createSuccessResponse(entity));
    },

    async update(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const input = worldEntityUpdateSchema.parse(request.body);
      const entity = await service.update(request.params.id, input);
      return reply.send(createSuccessResponse(entity));
    },

    async delete(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      await service.delete(request.params.id);
      return reply.status(204).send();
    },

    async linkCharacter(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const body = (request.body ?? {}) as { characterId?: string | null };
      const entity = await service.linkCharacter(
        request.params.id,
        body.characterId ?? null,
      );
      return reply.send(createSuccessResponse(entity));
    },
  };
}
