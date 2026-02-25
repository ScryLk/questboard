import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createSchedulingService } from "./scheduling.service.js";
import { createScheduleSchema, updateScheduleSchema, rsvpSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function schedulingRoutes(app: FastifyInstance) {
  const service = createSchedulingService(prisma);

  app.post("/sessions/:id/schedules", async (request, reply) => {
    const input = createScheduleSchema.parse(request.body);
    const schedule = await service.create(request.params.id, request.user.id, input);
    return reply.status(201).send(createSuccessResponse(schedule));
  });

  app.get("/sessions/:id/schedules", async (request, reply) => {
    const schedules = await service.listBySession(request.params.id);
    return reply.send(createSuccessResponse(schedules));
  });

  app.patch("/sessions/:id/schedules/:scheduleId", async (request, reply) => {
    const input = updateScheduleSchema.parse(request.body);
    const schedule = await service.update(request.params.scheduleId, request.user.id, input);
    return reply.send(createSuccessResponse(schedule));
  });

  app.delete("/sessions/:id/schedules/:scheduleId", async (request, reply) => {
    const { reason } = (request.body || {}) as { reason?: string };
    await service.cancel(request.params.scheduleId, request.user.id, reason);
    return reply.status(204).send();
  });

  app.post("/sessions/:id/schedules/:scheduleId/rsvp", async (request, reply) => {
    const input = rsvpSchema.parse(request.body);
    await service.rsvp(request.params.scheduleId, request.user.id, input);
    return reply.send(createSuccessResponse({ updated: true }));
  });

  app.get("/schedules/upcoming", async (request, reply) => {
    const schedules = await service.getUpcoming(request.user.id);
    return reply.send(createSuccessResponse(schedules));
  });
}
