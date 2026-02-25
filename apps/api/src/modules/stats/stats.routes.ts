import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createStatsService } from "./stats.service.js";
import { createStatsController } from "./stats.controller.js";

export async function statsRoutes(app: FastifyInstance) {
  const service = createStatsService(prisma);
  const controller = createStatsController(service);

  app.get("/stats/me", controller.getMyStats);
  app.get("/stats/leaderboard", controller.getLeaderboard);
  app.get("/stats/:userId", controller.getStatsForUser);
}
