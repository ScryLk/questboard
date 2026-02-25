import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@questboard/db";
import { createAuthService } from "./auth.service.js";
import { BadRequestError } from "../../errors/app-error.js";

export async function authRoutes(app: FastifyInstance) {
  const authService = createAuthService(prisma);

  app.post(
    "/webhooks/clerk",
    async (request: FastifyRequest, reply: FastifyReply) => {
      // TODO: In production, verify Clerk webhook signature using CLERK_WEBHOOK_SECRET
      // const svix = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
      // svix.verify(payload, headers);

      const body = request.body as { type: string; data: Record<string, unknown> };

      if (!body?.type || !body?.data) {
        throw new BadRequestError("Invalid webhook payload");
      }

      switch (body.type) {
        case "user.created":
          await authService.handleUserCreated(body.data as Parameters<typeof authService.handleUserCreated>[0]);
          break;
        case "user.updated":
          await authService.handleUserUpdated(body.data as Parameters<typeof authService.handleUserUpdated>[0]);
          break;
        case "user.deleted":
          await authService.handleUserDeleted(body.data as { id: string });
          break;
        default:
          app.log.warn(`Unhandled Clerk webhook event: ${body.type}`);
      }

      return reply.status(200).send({ received: true });
    }
  );
}
