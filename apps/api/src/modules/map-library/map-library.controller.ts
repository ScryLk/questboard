import type { FastifyRequest, FastifyReply } from "fastify";
import { createSuccessResponse } from "@questboard/shared";
import type {
  CreateMapCollectionInput,
  CreateMapTemplateInput,
  MapLibraryService,
  UpdateMapCollectionInput,
  UpdateMapTemplateInput,
} from "./map-library.service.js";

export function createMapLibraryController(service: MapLibraryService) {
  return {
    async listMaps(
      request: FastifyRequest<{ Params: { campaignId: string } }>,
      reply: FastifyReply,
    ) {
      const maps = await service.listMaps(request.params.campaignId);
      return reply.send(createSuccessResponse(maps));
    },

    async createMap(
      request: FastifyRequest<{ Params: { campaignId: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as CreateMapTemplateInput;
      const created = await service.createMap(request.params.campaignId, body);
      return reply.status(201).send(createSuccessResponse(created));
    },

    async getMap(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const map = await service.getMap(request.params.id);
      return reply.send(createSuccessResponse(map));
    },

    async updateMap(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as UpdateMapTemplateInput;
      const map = await service.updateMap(request.params.id, body);
      return reply.send(createSuccessResponse(map));
    },

    async deleteMap(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      await service.deleteMap(request.params.id);
      return reply.status(204).send();
    },

    // Collections
    async listCollections(
      request: FastifyRequest<{ Params: { campaignId: string } }>,
      reply: FastifyReply,
    ) {
      const cols = await service.listCollections(request.params.campaignId);
      return reply.send(createSuccessResponse(cols));
    },

    async createCollection(
      request: FastifyRequest<{ Params: { campaignId: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as CreateMapCollectionInput;
      const col = await service.createCollection(
        request.params.campaignId,
        body,
      );
      return reply.status(201).send(createSuccessResponse(col));
    },

    async updateCollection(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as UpdateMapCollectionInput;
      const col = await service.updateCollection(request.params.id, body);
      return reply.send(createSuccessResponse(col));
    },

    async deleteCollection(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      await service.deleteCollection(request.params.id);
      return reply.status(204).send();
    },
  };
}
