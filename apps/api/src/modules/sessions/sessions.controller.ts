import type { FastifyRequest, FastifyReply } from "fastify";
import type { SessionsService } from "./sessions.service.js";
import { createSessionSchema, updateSessionSchema, transferOwnershipSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export function createSessionsController(sessionsService: SessionsService) {
  return {
    async list(request: FastifyRequest, reply: FastifyReply) {
      const sessions = await sessionsService.list(request.user.id);
      return reply.send(createSuccessResponse(sessions));
    },

    async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const session = await sessionsService.getById(request.params.id);
      return reply.send(createSuccessResponse(session));
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
      const input = createSessionSchema.parse(request.body);
      const session = await sessionsService.create(request.user.id, input);
      return reply.status(201).send(createSuccessResponse(session));
    },

    async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const input = updateSessionSchema.parse(request.body);
      const session = await sessionsService.update(request.params.id, request.user.id, input);
      return reply.send(createSuccessResponse(session));
    },

    async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      await sessionsService.delete(request.params.id, request.user.id);
      return reply.status(204).send();
    },

    async start(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      await sessionsService.start(request.params.id, request.user.id);
      return reply.send(createSuccessResponse({ status: "LIVE" }));
    },

    async pause(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      await sessionsService.pause(request.params.id, request.user.id);
      return reply.send(createSuccessResponse({ status: "PAUSED" }));
    },

    async resume(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      await sessionsService.resume(request.params.id, request.user.id);
      return reply.send(createSuccessResponse({ status: "LIVE" }));
    },

    async end(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const players = await sessionsService.end(request.params.id, request.user.id);
      return reply.send(createSuccessResponse({ status: "ENDED", players }));
    },

    async transfer(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const { newOwnerId } = transferOwnershipSchema.parse(request.body);
      await sessionsService.transferOwnership(request.params.id, request.user.id, newOwnerId);
      return reply.send(createSuccessResponse({ transferred: true }));
    },

    async getLog(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const query = request.query as { page?: string; pageSize?: string };
      const page = Math.max(1, parseInt(query.page ?? "1", 10));
      const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize ?? "50", 10)));
      const result = await sessionsService.getLog(request.params.id, page, pageSize);
      return reply.send({ success: true, data: result.logs, pagination: result.pagination });
    },
  };
}
