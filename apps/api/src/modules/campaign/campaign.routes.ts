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

  // Sessão mais "ativa" da campanha pra views globais (ex: /chat).
  // Prioridade: LIVE > PAUSED > LOBBY > IDLE > ENDED > CANCELLED.
  // 404 se a campanha não tem nenhuma sessão.
  app.get<{ Params: { id: string } }>(
    "/campaigns/:id/recent-session",
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      // Permission check inline: precisa ser owner ou member.
      const campaign = await prisma.campaign.findFirst({
        where: { id: req.params.id, deletedAt: null },
        select: { id: true, ownerId: true },
      });
      if (!campaign) {
        return reply.status(404).send({ error: { message: "Campaign not found" } });
      }
      if (campaign.ownerId !== req.user.id) {
        const member = await prisma.campaignMember.findFirst({
          where: { campaignId: req.params.id, userId: req.user.id, leftAt: null },
          select: { id: true },
        });
        if (!member) {
          return reply.status(403).send({ error: { message: "Not a member" } });
        }
      }

      const STATUS_PRIORITY: Record<string, number> = {
        LIVE: 5,
        PAUSED: 4,
        LOBBY: 3,
        IDLE: 2,
        ENDED: 1,
        CANCELLED: 0,
      };
      const sessions = await prisma.session.findMany({
        where: { campaignId: req.params.id, deletedAt: null },
        select: { id: true, name: true, status: true, scheduledAt: true, startedAt: true, endedAt: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 20,
      });
      if (sessions.length === 0) {
        return reply.status(404).send({ error: { message: "No sessions yet" } });
      }
      const sorted = [...sessions].sort((a, b) => {
        const pa = STATUS_PRIORITY[a.status] ?? 0;
        const pb = STATUS_PRIORITY[b.status] ?? 0;
        if (pa !== pb) return pb - pa;
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });
      const top = sorted[0]!;
      return reply.send(createSuccessResponse({
        id: top.id,
        name: top.name,
        status: top.status,
        scheduledAt: top.scheduledAt?.toISOString() ?? null,
        startedAt: top.startedAt?.toISOString() ?? null,
        endedAt: top.endedAt?.toISOString() ?? null,
      }));
    },
  );
}
