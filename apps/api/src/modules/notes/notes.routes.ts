import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createNotesService } from "./notes.service.js";
import { createNotesController } from "./notes.controller.js";
import {
  requireCampaignGm,
  requireCampaignMember,
  requireCampaignRoleViaResource,
} from "../../middleware/require-campaign-role.js";

type CampaignParams = { Params: { campaignId: string } };
type NoteParams = { Params: { id: string } };

/** Lookup pra middleware via /notes/:id — resolve campaignId. */
async function lookupNoteCampaign(noteId: string): Promise<string | null> {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { campaignId: true },
  });
  return note?.campaignId ?? null;
}

const requireGmViaNote = requireCampaignRoleViaResource(
  "id",
  lookupNoteCampaign,
  ["OWNER", "CO_GM"],
);

const requireMemberViaNote = requireCampaignRoleViaResource(
  "id",
  lookupNoteCampaign,
  ["OWNER", "CO_GM", "PLAYER", "SPECTATOR"],
);

export async function notesRoutes(app: FastifyInstance) {
  const service = createNotesService(prisma);
  const controller = createNotesController(service);

  // ── Escopadas pela campanha ──────────────────────
  // Membros leem (filtragem de GM_ONLY no controller); GM/CO_GM cria.
  app.get<CampaignParams>(
    "/campaigns/:campaignId/notes",
    { preHandler: requireCampaignMember },
    controller.list,
  );
  app.post<CampaignParams>(
    "/campaigns/:campaignId/notes",
    { preHandler: requireCampaignGm },
    controller.create,
  );

  // ── Por nota individual ──────────────────────────
  app.get<NoteParams>(
    "/notes/:id",
    { preHandler: requireMemberViaNote },
    controller.getById,
  );
  app.patch<NoteParams>(
    "/notes/:id",
    { preHandler: requireGmViaNote },
    controller.update,
  );
  app.delete<NoteParams>(
    "/notes/:id",
    { preHandler: requireGmViaNote },
    controller.delete,
  );
}
