import type { FastifyRequest, FastifyReply } from "fastify";
import { createSuccessResponse } from "@questboard/shared";
import { noteCreateSchema, noteUpdateSchema } from "@questboard/validators";
import type { NotesService } from "./notes.service.js";

export function createNotesController(service: NotesService) {
  return {
    async list(
      request: FastifyRequest<{ Params: { campaignId: string } }>,
      reply: FastifyReply,
    ) {
      const role = request.campaignRole;
      const excludeGmOnly =
        role !== "OWNER" && role !== "CO_GM";
      const notes = await service.list(request.params.campaignId, {
        excludeGmOnly,
      });
      return reply.send(createSuccessResponse(notes));
    },

    async getById(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const role = request.campaignRole;
      const excludeGmOnly =
        role !== "OWNER" && role !== "CO_GM";
      const note = await service.getById(request.params.id, { excludeGmOnly });
      return reply.send(createSuccessResponse(note));
    },

    async create(
      request: FastifyRequest<{ Params: { campaignId: string } }>,
      reply: FastifyReply,
    ) {
      const input = noteCreateSchema.parse(request.body);
      const note = await service.create(
        request.params.campaignId,
        request.user.id,
        input,
      );
      return reply.status(201).send(createSuccessResponse(note));
    },

    async update(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const input = noteUpdateSchema.parse(request.body);
      const note = await service.update(
        request.params.id,
        request.user.id,
        input,
      );
      return reply.send(createSuccessResponse(note));
    },

    async delete(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      await service.delete(request.params.id, request.user.id);
      return reply.status(204).send();
    },
  };
}
