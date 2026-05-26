import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createMapLibraryService } from "./map-library.service.js";
import { createMapLibraryController } from "./map-library.controller.js";
import {
  requireCampaignGm,
  requireCampaignMember,
  requireCampaignRoleViaResource,
} from "../../middleware/require-campaign-role.js";

type CampaignParams = { Params: { campaignId: string } };
type IdParams = { Params: { id: string } };

async function lookupMapCampaign(mapId: string): Promise<string | null> {
  const map = await prisma.mapTemplate.findUnique({
    where: { id: mapId },
    select: { campaignId: true },
  });
  return map?.campaignId ?? null;
}

async function lookupCollectionCampaign(
  collectionId: string,
): Promise<string | null> {
  const col = await prisma.mapCollection.findUnique({
    where: { id: collectionId },
    select: { campaignId: true },
  });
  return col?.campaignId ?? null;
}

const requireGmViaMap = requireCampaignRoleViaResource(
  "id",
  lookupMapCampaign,
  ["OWNER", "CO_GM"],
);

const requireMemberViaMap = requireCampaignRoleViaResource(
  "id",
  lookupMapCampaign,
  ["OWNER", "CO_GM", "PLAYER", "SPECTATOR"],
);

const requireGmViaCollection = requireCampaignRoleViaResource(
  "id",
  lookupCollectionCampaign,
  ["OWNER", "CO_GM"],
);

export async function mapLibraryRoutes(app: FastifyInstance) {
  const service = createMapLibraryService(prisma);
  const controller = createMapLibraryController(service);

  // ── Maps escopados pela campanha ──
  app.get<CampaignParams>(
    "/campaigns/:campaignId/map-library",
    { preHandler: requireCampaignMember },
    controller.listMaps,
  );
  app.post<CampaignParams>(
    "/campaigns/:campaignId/map-library",
    { preHandler: requireCampaignGm },
    controller.createMap,
  );

  // ── Map individual ──
  app.get<IdParams>(
    "/map-library/:id",
    { preHandler: requireMemberViaMap },
    controller.getMap,
  );
  app.patch<IdParams>(
    "/map-library/:id",
    { preHandler: requireGmViaMap },
    controller.updateMap,
  );
  app.delete<IdParams>(
    "/map-library/:id",
    { preHandler: requireGmViaMap },
    controller.deleteMap,
  );

  // ── Collections escopadas pela campanha ──
  app.get<CampaignParams>(
    "/campaigns/:campaignId/map-collections",
    { preHandler: requireCampaignMember },
    controller.listCollections,
  );
  app.post<CampaignParams>(
    "/campaigns/:campaignId/map-collections",
    { preHandler: requireCampaignGm },
    controller.createCollection,
  );
  app.patch<IdParams>(
    "/map-collections/:id",
    { preHandler: requireGmViaCollection },
    controller.updateCollection,
  );
  app.delete<IdParams>(
    "/map-collections/:id",
    { preHandler: requireGmViaCollection },
    controller.deleteCollection,
  );
}
