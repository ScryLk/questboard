import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createBillingService } from "./billing.service.js";
import { createBillingController } from "./billing.controller.js";

export async function billingRoutes(app: FastifyInstance) {
  const service = createBillingService(prisma);
  const controller = createBillingController(service);

  app.get("/billing/plans", controller.getPlans);
  app.get("/billing/subscription", controller.getSubscription);
  app.post("/billing/subscribe", controller.subscribe);
  app.post("/billing/cancel", controller.cancel);
}

export async function billingWebhookRoutes(app: FastifyInstance) {
  const service = createBillingService(prisma);
  const controller = createBillingController(service);

  app.post("/mercadopago", controller.webhook);
}
