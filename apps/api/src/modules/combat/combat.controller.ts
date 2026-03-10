import type { FastifyRequest, FastifyReply } from "fastify";
import type { CombatService } from "./combat.service.js";
import { createSuccessResponse } from "@questboard/shared";

export function createCombatController(combatService: CombatService) {
  return {
    async start(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as { participants: { name: string; initiative: number; isNPC?: boolean; tokenId?: string; hpCurrent: number; hpMax: number; ac?: number; movementMax?: number }[] };
      const combat = await combatService.start(request.params.id, request.user.id, body.participants);
      return reply.status(201).send(createSuccessResponse(combat));
    },

    async end(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const result = await combatService.end(request.params.id, request.user.id);
      return reply.send(createSuccessResponse(result));
    },

    async nextTurn(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const combat = await combatService.nextTurn(request.params.id, request.user.id);
      return reply.send(createSuccessResponse(combat));
    },

    async updateParticipant(
      request: FastifyRequest<{ Params: { id: string; pId: string } }>,
      reply: FastifyReply,
    ) {
      const result = await combatService.updateParticipant(
        request.params.id,
        request.user.id,
        request.params.pId,
        request.body as Record<string, unknown>,
      );
      return reply.send(createSuccessResponse(result));
    },

    async damage(
      request: FastifyRequest<{ Params: { id: string; pId: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as { amount: number };
      const result = await combatService.damage(request.params.id, request.user.id, request.params.pId, body.amount);
      return reply.send(createSuccessResponse(result));
    },

    async heal(
      request: FastifyRequest<{ Params: { id: string; pId: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as { amount: number };
      const result = await combatService.heal(request.params.id, request.user.id, request.params.pId, body.amount);
      return reply.send(createSuccessResponse(result));
    },
  };
}
