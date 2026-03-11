import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createChatService } from "./chat.service.js";
import { createChatController } from "./chat.controller.js";

export async function chatRoutes(app: FastifyInstance) {
  const service = createChatService(prisma);
  const controller = createChatController(service);

  app.get("/sessions/:id/messages", controller.listMessages);
  app.post("/sessions/:id/messages", controller.sendMessage);
  app.delete("/sessions/:id/messages/:msgId", controller.deleteMessage);
  app.post("/sessions/:id/dice/roll", controller.rollDice);
  app.post("/sessions/:id/dice/request", controller.requestDiceRoll);
}
