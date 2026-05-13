import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@questboard/db";
import { createSuccessResponse } from "@questboard/shared";
import { createCampaignService } from "./campaign.service.js";
import { createCampaignController } from "./campaign.controller.js";
import { createDashboardService } from "./dashboard.service.js";

export async function campaignRoutes(app: FastifyInstance) {
  const service = createCampaignService(prisma);
  const controller = createCampaignController(service);
  const dashboard = createDashboardService(prisma);

  app.get("/campaigns", controller.list);
  app.post("/campaigns", controller.create);
  app.get("/campaigns/:id", controller.getById);
  app.patch("/campaigns/:id", controller.update);
  app.delete("/campaigns/:id", controller.delete);
  app.post("/campaigns/join", controller.join);
  app.delete("/campaigns/:id/members/:userId", controller.removeMember);
  app.patch("/campaigns/:id/members/:userId", controller.updateMemberRole);

  app.get<{ Params: { id: string } }>(
    "/campaigns/:id/dashboard",
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const dto = await dashboard.get(req.params.id, req.user.id);
      return reply.send(createSuccessResponse(dto));
    },
  );
}
