import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createMediaService } from "./media.service.js";
import { createMediaController } from "./media.controller.js";
import {
  requireAnyParticipant,
  requireGm,
} from "../../middleware/require-session-role.js";

type SessionParams = { Params: { id: string } };

export async function mediaRoutes(app: FastifyInstance) {
  const service = createMediaService(prisma);
  const controller = createMediaController(service);

  // Leitura — qualquer participante (player precisa pra reconnect).
  app.get<SessionParams>(
    "/sessions/:id/media",
    { preHandler: requireAnyParticipant },
    controller.getActive,
  );
  // Mutação — GM ou CO_GM.
  app.post<SessionParams>(
    "/sessions/:id/media",
    { preHandler: requireGm },
    controller.show,
  );
  app.delete<SessionParams>(
    "/sessions/:id/media",
    { preHandler: requireGm },
    controller.hide,
  );
}
