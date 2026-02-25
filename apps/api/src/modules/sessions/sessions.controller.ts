import type { FastifyRequest, FastifyReply } from "fastify";
import type { SessionsService } from "./sessions.service.js";
import { createSessionSchema, updateSessionSchema, joinSessionSchema } from "./sessions.schema.js";
import { createSuccessResponse } from "@questboard/shared";

export function createSessionsController(sessionsService: SessionsService) {
  return {
    async list(request: FastifyRequest, reply: FastifyReply) {
      const sessions = await sessionsService.list(request.user.id);
      return reply.send(createSuccessResponse(sessions));
    },

    async getById(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
      const session = await sessionsService.getById(request.params.id);
      return reply.send(createSuccessResponse(session));
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
      const input = createSessionSchema.parse(request.body);
      const session = await sessionsService.create(request.user.id, input);
      return reply.status(201).send(createSuccessResponse(session));
    },

    async update(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
      const input = updateSessionSchema.parse(request.body);
      const session = await sessionsService.update(
        request.params.id,
        request.user.id,
        input
      );
      return reply.send(createSuccessResponse(session));
    },

    async delete(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
      await sessionsService.delete(request.params.id, request.user.id);
      return reply.status(204).send();
    },

    async join(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
      const input = joinSessionSchema.parse(request.body);
      const player = await sessionsService.join(input.inviteCode, request.user.id);
      return reply.status(201).send(createSuccessResponse(player));
    },

    async leave(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
      await sessionsService.leave(request.params.id, request.user.id);
      return reply.status(204).send();
    },

    async listPublic(request: FastifyRequest, reply: FastifyReply) {
      const query = request.query as { page?: string; pageSize?: string };
      const page = Math.max(1, parseInt(query.page ?? "1", 10));
      const pageSize = Math.min(50, Math.max(1, parseInt(query.pageSize ?? "20", 10)));

      const result = await sessionsService.listPublic(page, pageSize);
      return reply.send({
        success: true,
        data: result.sessions,
        pagination: result.pagination,
      });
    },
  };
}
