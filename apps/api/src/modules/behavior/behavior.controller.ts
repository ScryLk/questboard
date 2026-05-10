import type { FastifyRequest, FastifyReply } from "fastify";
import { createSuccessResponse } from "@questboard/shared";
import {
  behaviorStartSchema,
  behaviorUpdateSchema,
} from "@questboard/validators";
import type { BehaviorService } from "./behavior.service.js";

export function createBehaviorController(service: BehaviorService) {
  return {
    async list(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const list = await service.list(request.params.id);
      return reply.send(createSuccessResponse(list));
    },

    async start(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const input = behaviorStartSchema.parse(request.body);
      const instance = await service.start(
        request.params.id,
        request.user.id,
        input,
      );
      return reply.status(201).send(createSuccessResponse(instance));
    },

    async getById(
      request: FastifyRequest<{ Params: { bId: string } }>,
      reply: FastifyReply,
    ) {
      const instance = await service.getById(request.params.bId);
      return reply.send(createSuccessResponse(instance));
    },

    async update(
      request: FastifyRequest<{ Params: { bId: string } }>,
      reply: FastifyReply,
    ) {
      const input = behaviorUpdateSchema.parse(request.body);
      const instance = await service.update(request.params.bId, input);
      return reply.send(createSuccessResponse(instance));
    },

    async pause(
      request: FastifyRequest<{ Params: { bId: string } }>,
      reply: FastifyReply,
    ) {
      const instance = await service.pause(request.params.bId);
      return reply.send(createSuccessResponse(instance));
    },

    async resume(
      request: FastifyRequest<{ Params: { bId: string } }>,
      reply: FastifyReply,
    ) {
      const instance = await service.resume(request.params.bId);
      return reply.send(createSuccessResponse(instance));
    },

    async delete(
      request: FastifyRequest<{ Params: { bId: string } }>,
      reply: FastifyReply,
    ) {
      await service.delete(request.params.bId);
      return reply.status(204).send();
    },
  };
}
