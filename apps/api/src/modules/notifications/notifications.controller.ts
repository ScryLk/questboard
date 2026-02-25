import type { FastifyRequest, FastifyReply } from "fastify";
import type { NotificationsService } from "./notifications.service.js";
import { registerDeviceTokenSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export function createNotificationsController(notificationsService: NotificationsService) {
  return {
    async list(request: FastifyRequest, reply: FastifyReply) {
      const query = request.query as { unread?: string; page?: string; pageSize?: string };
      const unread = query.unread === "true" ? true : undefined;
      const page = Math.max(1, parseInt(query.page ?? "1", 10));
      const pageSize = Math.min(50, Math.max(1, parseInt(query.pageSize ?? "20", 10)));

      const result = await notificationsService.list(request.user.id, { unread, page, pageSize });
      return reply.send({
        success: true,
        data: result.notifications,
        pagination: result.pagination,
      });
    },

    async markAsRead(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
      await notificationsService.markAsRead(request.user.id, request.params.id);
      return reply.send(createSuccessResponse({ success: true }));
    },

    async markAllAsRead(request: FastifyRequest, reply: FastifyReply) {
      await notificationsService.markAllAsRead(request.user.id);
      return reply.send(createSuccessResponse({ success: true }));
    },

    async deleteNotification(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
      await notificationsService.deleteNotification(request.user.id, request.params.id);
      return reply.status(204).send();
    },

    async registerDeviceToken(request: FastifyRequest, reply: FastifyReply) {
      const input = registerDeviceTokenSchema.parse(request.body);
      const token = await notificationsService.registerDeviceToken(request.user.id, input);
      return reply.status(201).send(createSuccessResponse(token));
    },
  };
}
