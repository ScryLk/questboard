import type { FastifyRequest, FastifyReply } from "fastify";
import { createSuccessResponse } from "@questboard/shared";
import { mediaShowSchema } from "@questboard/validators";
import type { MediaService } from "./media.service.js";

export function createMediaController(service: MediaService) {
  return {
    async getActive(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const media = await service.getActive(request.params.id);
      return reply.send(createSuccessResponse(media));
    },

    async show(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const input = mediaShowSchema.parse(request.body);
      const media = await service.show(
        request.params.id,
        request.user.id,
        input,
      );
      return reply.status(201).send(createSuccessResponse(media));
    },

    async hide(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      await service.hide(request.params.id, request.user.id);
      return reply.status(204).send();
    },
  };
}
