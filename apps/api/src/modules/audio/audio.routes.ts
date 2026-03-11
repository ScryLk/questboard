import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createAudioService } from "./audio.service.js";
import { createAudioController } from "./audio.controller.js";

export async function audioRoutes(app: FastifyInstance) {
  const service = createAudioService(prisma);
  const controller = createAudioController(service);

  app.get("/sessions/:id/audio", controller.getState);
  app.post("/sessions/:id/audio/play", controller.play);
  app.post("/sessions/:id/audio/stop", controller.stop);
  app.patch("/sessions/:id/audio/volume", controller.setVolume);
  app.get("/audio/library", controller.getLibrary);
}
