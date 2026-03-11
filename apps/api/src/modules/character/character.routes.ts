import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createCharacterService } from "./character.service.js";
import { createCharacterController } from "./character.controller.js";

export async function characterRoutes(app: FastifyInstance) {
  const service = createCharacterService(prisma);
  const controller = createCharacterController(service);

  app.get("/characters", controller.list);
  app.post("/characters", controller.create);
  app.get("/characters/:id", controller.getById);
  app.patch("/characters/:id", controller.update);
  app.delete("/characters/:id", controller.delete);
  app.patch("/characters/:id/resources", controller.updateResources);
}
