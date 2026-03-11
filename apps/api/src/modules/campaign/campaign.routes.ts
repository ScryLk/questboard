import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createCampaignService } from "./campaign.service.js";
import { createCampaignController } from "./campaign.controller.js";

export async function campaignRoutes(app: FastifyInstance) {
  const service = createCampaignService(prisma);
  const controller = createCampaignController(service);

  app.get("/campaigns", controller.list);
  app.post("/campaigns", controller.create);
  app.get("/campaigns/:id", controller.getById);
  app.patch("/campaigns/:id", controller.update);
  app.delete("/campaigns/:id", controller.delete);
  app.post("/campaigns/join", controller.join);
  app.delete("/campaigns/:id/members/:userId", controller.removeMember);
  app.patch("/campaigns/:id/members/:userId", controller.updateMemberRole);
}
