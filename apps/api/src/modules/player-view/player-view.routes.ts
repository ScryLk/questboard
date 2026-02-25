import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createPlayerViewService } from "./player-view.service.js";
import { saveCameraPositionSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function playerViewRoutes(app: FastifyInstance) {
  const service = createPlayerViewService(prisma);

  app.get("/sessions/:id/maps/:mapId/my-view", async (request, reply) => {
    const view = await service.getMyView(request.params.id, request.user.id, request.params.mapId);
    return reply.send(createSuccessResponse(view));
  });

  app.post("/sessions/:id/maps/:mapId/my-view/camera", async (request, reply) => {
    const input = saveCameraPositionSchema.parse(request.body);
    const view = await service.saveCamera(request.params.id, request.user.id, request.params.mapId, input);
    return reply.send(createSuccessResponse(view));
  });
}
