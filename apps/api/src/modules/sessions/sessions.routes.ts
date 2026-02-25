import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createSessionsService } from "./sessions.service.js";
import { createSessionsController } from "./sessions.controller.js";

export async function sessionsRoutes(app: FastifyInstance) {
  const service = createSessionsService(prisma);
  const controller = createSessionsController(service);

  // CRUD
  app.get("/sessions", controller.list);
  app.post("/sessions", controller.create);
  app.get("/sessions/:id", controller.getById);
  app.patch("/sessions/:id", controller.update);
  app.delete("/sessions/:id", controller.delete);

  // Lifecycle
  app.post("/sessions/:id/start", controller.start);
  app.post("/sessions/:id/pause", controller.pause);
  app.post("/sessions/:id/resume", controller.resume);
  app.post("/sessions/:id/end", controller.end);
  app.post("/sessions/:id/transfer", controller.transfer);

  // Log
  app.get("/sessions/:id/log", controller.getLog);
}
