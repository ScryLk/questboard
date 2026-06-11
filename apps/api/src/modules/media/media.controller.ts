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

    async upload(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const file = await request.file().catch(() => null);
      if (!file) {
        return reply.status(400).send({
          success: false,
          error: { message: "Arquivo de vídeo é obrigatório (campo 'file')." },
        });
      }
      const buffer = await file.toBuffer();
      const titleField = file.fields.title;
      const title =
        titleField && typeof titleField === "object" && "value" in titleField
          ? String((titleField as { value: unknown }).value ?? "").trim() ||
            undefined
          : undefined;

      const media = await service.upload(
        request.params.id,
        request.user.id,
        {
          buffer,
          contentType: file.mimetype,
          size: buffer.byteLength,
        },
        { title },
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
