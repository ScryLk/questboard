import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createCharacterService } from "./character.service.js";
import { createCharacterController } from "./character.controller.js";
import { createXpService } from "./xp.service.js";
import { createXpController } from "./xp.controller.js";
import { requireGm } from "../../middleware/require-session-role.js";

export async function characterRoutes(app: FastifyInstance) {
  const service = createCharacterService(prisma);
  const controller = createCharacterController(service);
  const xpService = createXpService(prisma);
  const xpController = createXpController(xpService, prisma);

  app.get("/characters", controller.list);
  app.post("/characters", controller.create);
  app.get("/characters/:id", controller.getById);
  app.patch("/characters/:id", controller.update);
  app.delete("/characters/:id", controller.delete);
  app.patch("/characters/:id/resources", controller.updateResources);

  // XP — ajuste individual + histórico (permissão checada no controller)
  app.post<{ Params: { id: string } }>(
    "/characters/:id/xp",
    xpController.singleAward,
  );
  app.get<{ Params: { id: string }; Querystring: { limit?: string } }>(
    "/characters/:id/xp-history",
    xpController.history,
  );

  // XP bulk — pertence a sessions, mas registrado aqui pra agrupar
  // o módulo. `requireGm` valida que o caller é GM/CO_GM da sessão.
  app.post<{ Params: { id: string } }>(
    "/sessions/:id/xp",
    { preHandler: requireGm },
    xpController.bulkAward,
  );
}
