import type { FastifyRequest, FastifyReply } from "fastify";
import type { BillingService } from "./billing.service.js";
import { createSuccessResponse } from "@questboard/shared";

export function createBillingController(billingService: BillingService) {
  return {
    async getPlans(_request: FastifyRequest, reply: FastifyReply) {
      const plans = billingService.getPlans();
      return reply.send(createSuccessResponse(plans));
    },

    async getSubscription(request: FastifyRequest, reply: FastifyReply) {
      const sub = await billingService.getSubscription(request.user.id);
      return reply.send(createSuccessResponse(sub));
    },

    async subscribe(request: FastifyRequest, reply: FastifyReply) {
      const body = request.body as { plan: string; cycle?: "MONTHLY" | "ANNUAL" };
      const result = await billingService.subscribe(
        request.user.id,
        body.plan,
        body.cycle ?? "MONTHLY",
      );
      return reply.send(createSuccessResponse(result));
    },

    async cancel(request: FastifyRequest, reply: FastifyReply) {
      const sub = await billingService.cancel(request.user.id);
      return reply.send(createSuccessResponse(sub));
    },

    async webhook(request: FastifyRequest, reply: FastifyReply) {
      await billingService.handleWebhook(request.body as Record<string, unknown>);
      return reply.status(200).send({ received: true });
    },
  };
}
