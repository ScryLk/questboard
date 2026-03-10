import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createCombatService } from "./combat.service.js";
import { createCombatController } from "./combat.controller.js";

export async function combatRoutes(app: FastifyInstance) {
  const service = createCombatService(prisma);
  const controller = createCombatController(service);

  app.post("/sessions/:id/combat/start", controller.start);
  app.post("/sessions/:id/combat/end", controller.end);
  app.post("/sessions/:id/combat/next-turn", controller.nextTurn);
  app.patch("/sessions/:id/combat/participants/:pId", controller.updateParticipant);
  app.post("/sessions/:id/combat/participants/:pId/damage", controller.damage);
  app.post("/sessions/:id/combat/participants/:pId/heal", controller.heal);
}
