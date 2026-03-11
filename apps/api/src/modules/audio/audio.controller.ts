import type { FastifyRequest, FastifyReply } from "fastify";
import type { AudioService } from "./audio.service.js";
import { createSuccessResponse } from "@questboard/shared";

export function createAudioController(audioService: AudioService) {
  return {
    async getState(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const state = await audioService.getState(request.params.id);
      return reply.send(createSuccessResponse(state));
    },

    async play(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as { track: Record<string, unknown>; volume?: number };
      const state = await audioService.play(request.params.id, request.user.id, body.track, body.volume);
      return reply.send(createSuccessResponse(state));
    },

    async stop(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const state = await audioService.stop(request.params.id, request.user.id);
      return reply.send(createSuccessResponse(state));
    },

    async setVolume(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as { volume: number };
      const state = await audioService.setVolume(request.params.id, request.user.id, body.volume);
      return reply.send(createSuccessResponse(state));
    },

    async getLibrary(_request: FastifyRequest, reply: FastifyReply) {
      const tracks = await audioService.getLibrary();
      return reply.send(createSuccessResponse(tracks));
    },
  };
}
