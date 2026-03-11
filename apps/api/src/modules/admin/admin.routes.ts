import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { requireAdmin, requireSuperAdmin } from "../../middleware/admin-gate.js";
import { createAdminService } from "./admin.service.js";
import { createAdminController } from "./admin.controller.js";

export async function adminRoutes(app: FastifyInstance) {
  const service = createAdminService(prisma);
  const controller = createAdminController(service);

  // All admin routes require at least ADMIN role
  app.addHook("onRequest", requireAdmin);

  // Dashboard
  app.get("/admin/dashboard", controller.getDashboard);

  // Users
  app.get("/admin/users", controller.listUsers);
  app.get("/admin/users/:id", controller.getUserDetail);
  app.patch("/admin/users/:id/role", { preHandler: [requireSuperAdmin] }, controller.changeRole);
  app.post("/admin/users/:id/ban", controller.banUser);
  app.post("/admin/users/:id/unban", controller.unbanUser);

  // Campaigns
  app.get("/admin/campaigns", controller.listCampaigns);

  // Sessions
  app.get("/admin/sessions", controller.listSessions);
}
