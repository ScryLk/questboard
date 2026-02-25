import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createUsersService } from "./users.service.js";
import { createUsersController } from "./users.controller.js";

export async function usersRoutes(app: FastifyInstance) {
  const service = createUsersService(prisma);
  const controller = createUsersController(service);

  app.get("/users/me", controller.getMe);
  app.patch("/users/me", controller.updateProfile);
  app.patch("/users/me/preferences", controller.updatePreferences);
  app.get("/users/search", controller.search);
  app.get("/users/:id", controller.getById);
}
