import type { FastifyRequest, FastifyReply } from "fastify";
import type { AdminService } from "./admin.service.js";
import { createSuccessResponse } from "@questboard/shared";

export function createAdminController(adminService: AdminService) {
  return {
    async getDashboard(_request: FastifyRequest, reply: FastifyReply) {
      const dashboard = await adminService.getDashboard();
      return reply.send(createSuccessResponse(dashboard));
    },

    async listUsers(request: FastifyRequest, reply: FastifyReply) {
      const query = request.query as {
        search?: string;
        role?: string;
        plan?: string;
        isBanned?: string;
        page?: string;
        limit?: string;
      };
      const result = await adminService.listUsers({
        search: query.search,
        role: query.role,
        plan: query.plan,
        isBanned: query.isBanned !== undefined ? query.isBanned === "true" : undefined,
        page: query.page ? parseInt(query.page, 10) : undefined,
        limit: query.limit ? parseInt(query.limit, 10) : undefined,
      });
      return reply.send(createSuccessResponse(result));
    },

    async getUserDetail(request: FastifyRequest, reply: FastifyReply) {
      const { id } = request.params as { id: string };
      const user = await adminService.getUserDetail(id);
      return reply.send(createSuccessResponse(user));
    },

    async changeRole(request: FastifyRequest, reply: FastifyReply) {
      const { id } = request.params as { id: string };
      const body = request.body as { role: string };
      const result = await adminService.changeRole(id, body.role, request.user.role);
      return reply.send(createSuccessResponse(result));
    },

    async banUser(request: FastifyRequest, reply: FastifyReply) {
      const { id } = request.params as { id: string };
      const body = request.body as { reason: string };
      const result = await adminService.banUser(id, body.reason);
      return reply.send(createSuccessResponse(result));
    },

    async unbanUser(request: FastifyRequest, reply: FastifyReply) {
      const { id } = request.params as { id: string };
      const result = await adminService.unbanUser(id);
      return reply.send(createSuccessResponse(result));
    },

    async listCampaigns(request: FastifyRequest, reply: FastifyReply) {
      const query = request.query as { search?: string; page?: string; limit?: string };
      const result = await adminService.listCampaigns({
        search: query.search,
        page: query.page ? parseInt(query.page, 10) : undefined,
        limit: query.limit ? parseInt(query.limit, 10) : undefined,
      });
      return reply.send(createSuccessResponse(result));
    },

    async listSessions(request: FastifyRequest, reply: FastifyReply) {
      const query = request.query as { status?: string; page?: string; limit?: string };
      const result = await adminService.listSessions({
        status: query.status,
        page: query.page ? parseInt(query.page, 10) : undefined,
        limit: query.limit ? parseInt(query.limit, 10) : undefined,
      });
      return reply.send(createSuccessResponse(result));
    },
  };
}
