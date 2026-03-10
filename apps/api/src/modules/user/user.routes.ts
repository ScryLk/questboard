import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createUserService } from "./user.service.js";
import { createUserController } from "./user.controller.js";

export async function userRoutes(app: FastifyInstance) {
  const service = createUserService(prisma);
  const controller = createUserController(service);

  app.get("/users/me", controller.getProfile);
  app.patch("/users/me", controller.updateProfile);
  app.put("/users/me/avatar", controller.uploadAvatar);
  app.get("/users/me/stats", controller.getStats);
  app.get("/users/me/notifications", controller.listNotifications);
  app.patch("/users/me/notifications/:id", controller.markNotificationRead);
  app.post("/users/me/devices", controller.registerDevice);
  app.delete("/users/me/devices/:id", controller.removeDevice);
}
