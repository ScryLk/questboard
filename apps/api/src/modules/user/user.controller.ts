import type { FastifyRequest, FastifyReply } from "fastify";
import type { UserService } from "./user.service.js";
import { createSuccessResponse } from "@questboard/shared";
import { BadRequestError } from "../../errors/app-error.js";

export function createUserController(userService: UserService) {
  return {
    async getProfile(request: FastifyRequest, reply: FastifyReply) {
      const profile = await userService.getProfile(request.user.id);
      return reply.send(createSuccessResponse(profile));
    },

    async updateProfile(request: FastifyRequest, reply: FastifyReply) {
      const body = request.body as { displayName?: string; bio?: string; timezone?: string; locale?: string };
      const updated = await userService.updateProfile(request.user.id, body);
      return reply.send(createSuccessResponse(updated));
    },

    async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
      const file = await request.file();
      if (!file) throw new BadRequestError("Arquivo não enviado");

      const buffer = await file.toBuffer();
      const result = await userService.uploadAvatar(request.user.id, buffer, file.mimetype);
      return reply.send(createSuccessResponse(result));
    },

    async getStats(request: FastifyRequest, reply: FastifyReply) {
      const stats = await userService.getStats(request.user.id);
      return reply.send(createSuccessResponse(stats));
    },

    async listNotifications(request: FastifyRequest, reply: FastifyReply) {
      const query = request.query as { isRead?: string; cursor?: string; limit?: string };
      const result = await userService.listNotifications(request.user.id, {
        isRead: query.isRead !== undefined ? query.isRead === "true" : undefined,
        cursor: query.cursor,
        limit: query.limit ? parseInt(query.limit, 10) : undefined,
      });
      return reply.send(createSuccessResponse(result));
    },

    async markNotificationRead(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const notification = await userService.markNotificationRead(request.user.id, request.params.id);
      return reply.send(createSuccessResponse(notification));
    },

    async registerDevice(request: FastifyRequest, reply: FastifyReply) {
      const body = request.body as { token: string; platform: "IOS" | "ANDROID" | "WEB" };
      const device = await userService.registerDevice(request.user.id, body.token, body.platform);
      return reply.status(201).send(createSuccessResponse(device));
    },

    async removeDevice(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      await userService.removeDevice(request.user.id, request.params.id);
      return reply.status(204).send();
    },

    // ── Handle (Name#TAG) ──────────────────────────────────────

    async getMyHandle(request: FastifyRequest, reply: FastifyReply) {
      const handle = await userService.getMyHandle(request.user.id);
      return reply.send(createSuccessResponse(handle));
    },

    async updateUsername(request: FastifyRequest, reply: FastifyReply) {
      const body = request.body as { username?: string };
      if (typeof body?.username !== "string") {
        throw new BadRequestError("Campo `username` obrigatório.");
      }
      const result = await userService.updateUsername(
        request.user.id,
        body.username,
      );
      return reply.send(createSuccessResponse(result));
    },

    async rerollTag(request: FastifyRequest, reply: FastifyReply) {
      const result = await userService.rerollTag(request.user.id);
      return reply.send(createSuccessResponse(result));
    },

    async searchByHandle(request: FastifyRequest, reply: FastifyReply) {
      const query = request.query as { q?: string; limit?: string };
      const q = (query.q ?? "").toString();
      const limit = query.limit ? parseInt(query.limit, 10) : undefined;
      const results = await userService.searchByHandle(q, limit);
      return reply.send(createSuccessResponse(results));
    },

    async resolveHandle(
      request: FastifyRequest<{
        Params: { username: string; tag: string };
      }>,
      reply: FastifyReply,
    ) {
      const { username, tag } = request.params;
      const result = await userService.resolveHandle(username, tag);
      return reply.send(createSuccessResponse(result));
    },
  };
}
