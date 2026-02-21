import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createSessionsService } from "./sessions.service.js";
import { createSessionsController } from "./sessions.controller.js";

export async function sessionsRoutes(app: FastifyInstance) {
  const service = createSessionsService(prisma);
  const controller = createSessionsController(service);

  app.get("/sessions", controller.list);
  app.post("/sessions", controller.create);
  app.get("/sessions/public", controller.listPublic);
  app.get("/sessions/:id", controller.getById);
  app.patch("/sessions/:id", controller.update);
  app.delete("/sessions/:id", controller.delete);
  app.post("/sessions/:id/join", controller.join);
  app.post("/sessions/:id/leave", controller.leave);
}
