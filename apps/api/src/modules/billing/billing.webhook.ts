import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@questboard/db";
import { createBillingService } from "./billing.service.js";

export async function billingWebhookRoutes(app: FastifyInstance) {
  const billingService = createBillingService(prisma);

  app.post(
    "/billing/webhook",
    async (request: FastifyRequest, reply: FastifyReply) => {
      // TODO: Verify Mercado Pago webhook signature
      const body = request.body as { action: string; data: { id: string } };
      await billingService.handleMpWebhook(body);
      return reply.status(200).send({ received: true });
    }
  );
}
