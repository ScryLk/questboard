import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createMapService } from "./map.service.js";
import { createMapController } from "./map.controller.js";

export async function mapRoutes(app: FastifyInstance) {
  const service = createMapService(prisma);
  const controller = createMapController(service);

  // Maps CRUD
  app.get("/sessions/:id/maps", controller.list);
  app.post("/sessions/:id/maps", controller.create);
  app.patch("/sessions/:id/maps/:mapId", controller.update);
  app.delete("/sessions/:id/maps/:mapId", controller.delete);
  app.post("/sessions/:id/maps/:mapId/activate", controller.activate);

  // Tokens
  app.get("/sessions/:id/maps/:mapId/tokens", controller.listTokens);
  app.post("/sessions/:id/maps/:mapId/tokens", controller.createToken);
  app.patch("/sessions/:id/maps/:mapId/tokens/:tokenId", controller.updateToken);
  app.delete("/sessions/:id/maps/:mapId/tokens/:tokenId", controller.deleteToken);

  // Fog
  app.get("/sessions/:id/maps/:mapId/fog", controller.listFog);
  app.put("/sessions/:id/maps/:mapId/fog", controller.updateFog);

  // Walls
  app.get("/sessions/:id/maps/:mapId/walls", controller.listWalls);
  app.put("/sessions/:id/maps/:mapId/walls", controller.setWalls);

  // Lights
  app.get("/sessions/:id/maps/:mapId/lights", controller.listLights);
  app.put("/sessions/:id/maps/:mapId/lights", controller.setLights);
}
