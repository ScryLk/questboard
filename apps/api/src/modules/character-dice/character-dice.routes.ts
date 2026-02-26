import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createCharacterDiceService } from "./character-dice.service.js";
import { contextualDiceRollSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function characterDiceRoutes(app: FastifyInstance) {
  const service = createCharacterDiceService(prisma);

  // Roll contextual dice in a session
  app.post("/sessions/:id/dice/roll", async (request, reply) => {
    const input = contextualDiceRollSchema.parse(request.body);
    const result = await service.rollContextual(
      (request.params as any).id,
      request.user.id,
      input
    );
    return reply.status(201).send(createSuccessResponse(result));
  });

  // Get session dice roll history
  app.get("/sessions/:id/dice/history", async (request, reply) => {
    const query = request.query as Record<string, string>;
    const result = await service.getSessionRolls((request.params as any).id, {
      characterId: query["characterId"],
      rollType: query["rollType"],
      limit: query["limit"] ? parseInt(query["limit"], 10) : 50,
      offset: query["offset"] ? parseInt(query["offset"], 10) : 0,
    });
    return reply.send(createSuccessResponse(result));
  });
}
