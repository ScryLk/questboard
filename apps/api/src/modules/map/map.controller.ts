import type { FastifyRequest, FastifyReply } from "fastify";
import type { MapService } from "./map.service.js";
import { createSuccessResponse } from "@questboard/shared";

export function createMapController(mapService: MapService) {
  return {
    async list(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const maps = await mapService.list(request.params.id);
      return reply.send(createSuccessResponse(maps));
    },

    async create(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const file = await request.file().catch(() => null);
      let imageBuffer: Buffer | undefined;
      let contentType: string | undefined;
      let body: Record<string, string> = {};

      if (file) {
        for (const [key, field] of Object.entries(file.fields)) {
          if (key !== "file" && field && typeof field === "object" && "value" in field) {
            body[key] = (field as { value: string }).value;
          }
        }
        imageBuffer = await file.toBuffer();
        contentType = file.mimetype;
      } else {
        body = request.body as Record<string, string>;
      }

      const map = await mapService.create(
        request.params.id,
        request.user.id,
        {
          name: body.name ?? "Novo Mapa",
          width: parseInt(body.width ?? "1000", 10),
          height: parseInt(body.height ?? "1000", 10),
          gridType: body.gridType,
          gridSize: body.gridSize ? parseInt(body.gridSize, 10) : undefined,
          gridCols: body.gridCols ? parseInt(body.gridCols, 10) : undefined,
          gridRows: body.gridRows ? parseInt(body.gridRows, 10) : undefined,
        },
        imageBuffer,
        contentType,
      );
      return reply.status(201).send(createSuccessResponse(map));
    },

    async update(
      request: FastifyRequest<{ Params: { id: string; mapId: string } }>,
      reply: FastifyReply,
    ) {
      const map = await mapService.update(
        request.params.id,
        request.user.id,
        request.params.mapId,
        request.body as Record<string, unknown>,
      );
      return reply.send(createSuccessResponse(map));
    },

    async delete(
      request: FastifyRequest<{ Params: { id: string; mapId: string } }>,
      reply: FastifyReply,
    ) {
      await mapService.delete(request.params.id, request.user.id, request.params.mapId);
      return reply.status(204).send();
    },

    async activate(
      request: FastifyRequest<{ Params: { id: string; mapId: string } }>,
      reply: FastifyReply,
    ) {
      const map = await mapService.activate(request.params.id, request.user.id, request.params.mapId);
      return reply.send(createSuccessResponse(map));
    },

    // Tokens
    async listTokens(
      request: FastifyRequest<{ Params: { id: string; mapId: string } }>,
      reply: FastifyReply,
    ) {
      const tokens = await mapService.listTokens(request.params.mapId);
      return reply.send(createSuccessResponse(tokens));
    },

    async createToken(
      request: FastifyRequest<{ Params: { id: string; mapId: string } }>,
      reply: FastifyReply,
    ) {
      const token = await mapService.createToken(
        request.params.id,
        request.user.id,
        request.params.mapId,
        request.body as { label?: string; x: number; y: number; size?: number; characterId?: string; imageUrl?: string; color?: string; currentHp?: number; maxHp?: number; ac?: number; isHidden?: boolean },
      );
      return reply.status(201).send(createSuccessResponse(token));
    },

    async updateToken(
      request: FastifyRequest<{ Params: { id: string; mapId: string; tokenId: string } }>,
      reply: FastifyReply,
    ) {
      const token = await mapService.updateToken(
        request.params.id,
        request.user.id,
        request.params.tokenId,
        request.body as Record<string, unknown>,
      );
      return reply.send(createSuccessResponse(token));
    },

    async deleteToken(
      request: FastifyRequest<{ Params: { id: string; mapId: string; tokenId: string } }>,
      reply: FastifyReply,
    ) {
      await mapService.deleteToken(request.params.id, request.user.id, request.params.tokenId);
      return reply.status(204).send();
    },

    // Fog
    async listFog(
      request: FastifyRequest<{ Params: { id: string; mapId: string } }>,
      reply: FastifyReply,
    ) {
      const fog = await mapService.listFog(request.params.mapId);
      return reply.send(createSuccessResponse(fog));
    },

    async updateFog(
      request: FastifyRequest<{ Params: { id: string; mapId: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as { areas: { type: string; cells: unknown }[] };
      const fog = await mapService.updateFog(request.params.id, request.user.id, request.params.mapId, body.areas);
      return reply.send(createSuccessResponse(fog));
    },

    // Walls
    async listWalls(
      request: FastifyRequest<{ Params: { id: string; mapId: string } }>,
      reply: FastifyReply,
    ) {
      const walls = await mapService.listWalls(request.params.mapId);
      return reply.send(createSuccessResponse(walls));
    },

    async setWalls(
      request: FastifyRequest<{ Params: { id: string; mapId: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as { walls: { x1: number; y1: number; x2: number; y2: number; type?: string }[] };
      const walls = await mapService.setWalls(request.params.id, request.user.id, request.params.mapId, body.walls);
      return reply.send(createSuccessResponse(walls));
    },

    // Lights
    async listLights(
      request: FastifyRequest<{ Params: { id: string; mapId: string } }>,
      reply: FastifyReply,
    ) {
      const lights = await mapService.listLights(request.params.mapId);
      return reply.send(createSuccessResponse(lights));
    },

    async setLights(
      request: FastifyRequest<{ Params: { id: string; mapId: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as { lights: { col: number; row: number; radius?: number; dimRadius?: number; color?: string; intensity?: number }[] };
      const lights = await mapService.setLights(request.params.id, request.user.id, request.params.mapId, body.lights);
      return reply.send(createSuccessResponse(lights));
    },
  };
}
