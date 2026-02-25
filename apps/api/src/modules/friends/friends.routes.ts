import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createFriendsService } from "./friends.service.js";
import { createFriendsController } from "./friends.controller.js";

export async function friendsRoutes(app: FastifyInstance) {
  const service = createFriendsService(prisma);
  const controller = createFriendsController(service);

  app.get("/friends", controller.list);
  app.get("/friends/requests", controller.listRequests);
  app.post("/friends/request", controller.sendRequest);
  app.post("/friends/:id/accept", controller.accept);
  app.post("/friends/:id/decline", controller.decline);
  app.delete("/friends/:id", controller.remove);
  app.post("/friends/block/:userId", controller.block);
  app.delete("/friends/block/:userId", controller.unblock);
}
