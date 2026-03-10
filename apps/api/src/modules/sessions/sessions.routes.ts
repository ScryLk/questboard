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
  app.get("/sessions/by-code/:code", controller.findByCode);
  app.get("/sessions/:id", controller.getById);
  app.patch("/sessions/:id", controller.update);
  app.delete("/sessions/:id", controller.delete);
  app.post("/sessions/:id/join", controller.join);
  app.post("/sessions/:id/leave", controller.leave);

  // State transitions
  app.post("/sessions/:id/start", controller.start);
  app.post("/sessions/:id/end", controller.end);
  app.post("/sessions/:id/pause", controller.pause);
  app.post("/sessions/:id/resume", controller.resume);

  // Players
  app.get("/sessions/:id/players", controller.listPlayers);
  app.post("/sessions/:id/kick/:userId", controller.kick);
  app.patch("/sessions/:id/players/:userId/role", controller.updatePlayerRole);

  // Audit log & Phases
  app.get("/sessions/:id/audit-log", controller.getAuditLog);
  app.get("/sessions/:id/phases", controller.listPhases);
  app.post("/sessions/:id/phases", controller.createPhase);
}
