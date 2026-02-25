import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createAchievementsService } from "./achievements.service.js";
import { createAchievementsController } from "./achievements.controller.js";

export async function achievementsRoutes(app: FastifyInstance) {
  const service = createAchievementsService(prisma);
  const controller = createAchievementsController(service);

  app.get("/achievements", controller.listAll);
  app.get("/achievements/mine", controller.listMine);
  app.get("/achievements/:userId", controller.listForUser);
}
