import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createWorldService } from "./world.service.js";
import { createWorldController } from "./world.controller.js";
import {
  requireCampaignGm,
  requireCampaignMember,
  requireCampaignRoleViaResource,
} from "../../middleware/require-campaign-role.js";

type CampaignParams = {
  Params: { campaignId: string };
  Querystring: { kind?: string };
};
type EntityParams = { Params: { id: string } };

async function lookupEntityCampaign(id: string): Promise<string | null> {
  const entity = await prisma.worldEntity.findUnique({
    where: { id },
    select: { campaignId: true },
  });
  return entity?.campaignId ?? null;
}

const requireGmViaEntity = requireCampaignRoleViaResource(
  "id",
  lookupEntityCampaign,
  ["OWNER", "CO_GM"],
);

const requireMemberViaEntity = requireCampaignRoleViaResource(
  "id",
  lookupEntityCampaign,
  ["OWNER", "CO_GM", "PLAYER", "SPECTATOR"],
);

export async function worldRoutes(app: FastifyInstance) {
  const service = createWorldService(prisma);
  const controller = createWorldController(service);

  // ── Escopadas pela campanha ──────────────────────
  app.get<CampaignParams>(
    "/campaigns/:campaignId/world",
    { preHandler: requireCampaignMember },
    controller.list,
  );
  app.post<{ Params: { campaignId: string } }>(
    "/campaigns/:campaignId/world",
    { preHandler: requireCampaignGm },
    controller.create,
  );

  // ── Por entidade individual ──────────────────────
  app.get<EntityParams>(
    "/world/:id",
    { preHandler: requireMemberViaEntity },
    controller.getById,
  );
  app.patch<EntityParams>(
    "/world/:id",
    { preHandler: requireGmViaEntity },
    controller.update,
  );
  app.delete<EntityParams>(
    "/world/:id",
    { preHandler: requireGmViaEntity },
    controller.delete,
  );
  app.post<EntityParams>(
    "/world/:id/link-character",
    { preHandler: requireGmViaEntity },
    controller.linkCharacter,
  );
}
