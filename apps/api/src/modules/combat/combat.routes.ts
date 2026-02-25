import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createCombatService } from "./combat.service.js";
import { startCombatSchema, updateHpSchema, setConditionSchema, initiativeEntrySchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function combatRoutes(app: FastifyInstance) {
  const service = createCombatService(prisma);

  app.get("/sessions/:id/combat", async (request, reply) => {
    const state = await service.getState(request.params.id);
    return reply.send(createSuccessResponse(state));
  });

  app.post("/sessions/:id/combat/start", async (request, reply) => {
    const { entries } = startCombatSchema.parse(request.body);
    const state = await service.start(request.params.id, request.user.id, entries as any);
    return reply.status(201).send(createSuccessResponse(state));
  });

  app.post("/sessions/:id/combat/end", async (request, reply) => {
    const result = await service.end(request.params.id, request.user.id);
    return reply.send(createSuccessResponse(result));
  });

  app.post("/sessions/:id/combat/next-turn", async (request, reply) => {
    const result = await service.nextTurn(request.params.id, request.user.id);
    return reply.send(createSuccessResponse(result));
  });

  app.post("/sessions/:id/combat/prev-turn", async (request, reply) => {
    const result = await service.prevTurn(request.params.id, request.user.id);
    return reply.send(createSuccessResponse(result));
  });

  app.patch("/sessions/:id/combat/initiative", async (request, reply) => {
    const { entryId, delta } = updateHpSchema.parse(request.body);
    const result = await service.updateHp(request.params.id, request.user.id, entryId, delta);
    return reply.send(createSuccessResponse(result));
  });

  app.post("/sessions/:id/combat/add-entry", async (request, reply) => {
    const entry = initiativeEntrySchema.parse(request.body);
    const order = await service.addEntry(request.params.id, request.user.id, entry as any);
    return reply.send(createSuccessResponse(order));
  });

  app.delete("/sessions/:id/combat/entries/:entryId", async (request, reply) => {
    const order = await service.removeEntry(request.params.id, request.user.id, request.params.entryId);
    return reply.send(createSuccessResponse(order));
  });

  app.patch("/sessions/:id/combat/entries/:entryId/conditions", async (request, reply) => {
    const { conditions } = setConditionSchema.parse(request.body);
    const result = await service.setConditions(request.params.id, request.user.id, request.params.entryId, conditions);
    return reply.send(createSuccessResponse(result));
  });
}
