import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createNotificationsService } from "./notifications.service.js";
import { createNotificationsController } from "./notifications.controller.js";

export async function notificationsRoutes(app: FastifyInstance) {
  const service = createNotificationsService(prisma);
  const controller = createNotificationsController(service);

  app.get("/notifications", controller.list);
  app.patch("/notifications/:id/read", controller.markAsRead);
  app.post("/notifications/read-all", controller.markAllAsRead);
  app.delete("/notifications/:id", controller.deleteNotification);
  app.post("/notifications/device-token", controller.registerDeviceToken);
}
