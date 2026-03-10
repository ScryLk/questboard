import type { FastifyRequest, FastifyReply } from "fastify";
import type { SessionsService } from "./sessions.service.js";
import { createSessionSchema, updateSessionSchema, joinSessionSchema } from "./sessions.schema.js";
import { createSuccessResponse } from "@questboard/shared";

export function createSessionsController(sessionsService: SessionsService) {
  // Helper: get userId from auth middleware or fallback header
  function getUserId(request: FastifyRequest): string {
    return request.user?.id ?? (request.headers["x-user-id"] as string) ?? "";
  }

  return {
    async list(request: FastifyRequest, reply: FastifyReply) {
      const sessions = await sessionsService.list(getUserId(request));
      return reply.send(createSuccessResponse(sessions));
    },

    async getById(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const session = await sessionsService.getById(request.params.id);
      return reply.send(createSuccessResponse(session));
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
      const input = createSessionSchema.parse(request.body);
      const session = await sessionsService.create(getUserId(request), input);
      return reply.status(201).send(createSuccessResponse(session));
    },

    async findByCode(
      request: FastifyRequest<{ Params: { code: string } }>,
      reply: FastifyReply,
    ) {
      const session = await sessionsService.findByCode(request.params.code);
      return reply.send(createSuccessResponse(session));
    },

    async update(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const input = updateSessionSchema.parse(request.body);
      const session = await sessionsService.update(request.params.id, getUserId(request), input);
      return reply.send(createSuccessResponse(session));
    },

    async delete(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      await sessionsService.delete(request.params.id, getUserId(request));
      return reply.status(204).send();
    },

    async join(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const input = joinSessionSchema.parse(request.body);
      const player = await sessionsService.join(input.inviteCode, getUserId(request));
      return reply.status(201).send(createSuccessResponse(player));
    },

    async leave(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      await sessionsService.leave(request.params.id, getUserId(request));
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

    // ─── State Transitions ────────────────────────────
    async start(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const session = await sessionsService.start(request.params.id, getUserId(request));
      return reply.send(createSuccessResponse(session));
    },

    async end(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const session = await sessionsService.end(request.params.id, getUserId(request));
      return reply.send(createSuccessResponse(session));
    },

    async pause(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const session = await sessionsService.pause(request.params.id, getUserId(request));
      return reply.send(createSuccessResponse(session));
    },

    async resume(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const session = await sessionsService.resume(request.params.id, getUserId(request));
      return reply.send(createSuccessResponse(session));
    },

    // ─── Players ─────────────────────────────────────
    async listPlayers(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const players = await sessionsService.listPlayers(request.params.id);
      return reply.send(createSuccessResponse(players));
    },

    async kick(
      request: FastifyRequest<{ Params: { id: string; userId: string } }>,
      reply: FastifyReply,
    ) {
      await sessionsService.kick(request.params.id, getUserId(request), request.params.userId);
      return reply.status(204).send();
    },

    async updatePlayerRole(
      request: FastifyRequest<{ Params: { id: string; userId: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as { role: string };
      const player = await sessionsService.updatePlayerRole(
        request.params.id,
        getUserId(request),
        request.params.userId,
        body.role,
      );
      return reply.send(createSuccessResponse(player));
    },

    // ─── Audit Log ───────────────────────────────────
    async getAuditLog(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const query = request.query as { limit?: string };
      const log = await sessionsService.getAuditLog(
        request.params.id,
        getUserId(request),
        query.limit ? parseInt(query.limit, 10) : undefined,
      );
      return reply.send(createSuccessResponse(log));
    },

    // ─── Phases ──────────────────────────────────────
    async listPhases(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const phases = await sessionsService.listPhases(request.params.id);
      return reply.send(createSuccessResponse(phases));
    },

    async createPhase(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as { type: string; label: string; notes?: string };
      const phase = await sessionsService.createPhase(request.params.id, getUserId(request), body);
      return reply.status(201).send(createSuccessResponse(phase));
    },
  };
}
