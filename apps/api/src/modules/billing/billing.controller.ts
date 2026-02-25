import type { FastifyRequest, FastifyReply } from "fastify";
import type { BillingService } from "./billing.service.js";
import { subscribeSchema, changePlanSchema, cancelSubscriptionSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export function createBillingController(billingService: BillingService) {
  return {
    async listPlans(_request: FastifyRequest, reply: FastifyReply) {
      const plans = await billingService.listPlans();
      return reply.send(createSuccessResponse(plans));
    },

    async getSubscription(request: FastifyRequest, reply: FastifyReply) {
      const subscription = await billingService.getSubscription(request.user.id);
      return reply.send(createSuccessResponse(subscription));
    },

    async subscribe(request: FastifyRequest, reply: FastifyReply) {
      const input = subscribeSchema.parse(request.body);
      const subscription = await billingService.subscribe(request.user.id, input);
      return reply.status(201).send(createSuccessResponse(subscription));
    },

    async cancel(request: FastifyRequest, reply: FastifyReply) {
      const input = cancelSubscriptionSchema.parse(request.body);
      const subscription = await billingService.cancelSubscription(request.user.id, input);
      return reply.send(createSuccessResponse(subscription));
    },

    async changePlan(request: FastifyRequest, reply: FastifyReply) {
      const input = changePlanSchema.parse(request.body);
      const subscription = await billingService.changePlan(request.user.id, input);
      return reply.send(createSuccessResponse(subscription));
    },

    async listPayments(request: FastifyRequest, reply: FastifyReply) {
      const query = request.query as { page?: string; pageSize?: string };
      const page = Math.max(1, parseInt(query.page ?? "1", 10));
      const pageSize = Math.min(50, Math.max(1, parseInt(query.pageSize ?? "20", 10)));

      const result = await billingService.listPayments(request.user.id, page, pageSize);
      return reply.send({
        success: true,
        data: result.payments,
        pagination: result.pagination,
      });
    },

    async webhook(request: FastifyRequest, reply: FastifyReply) {
      const body = request.body as { action: string; data: { id: string } };
      await billingService.handleMpWebhook(body);
      return reply.status(200).send({ received: true });
    },
  };
}
