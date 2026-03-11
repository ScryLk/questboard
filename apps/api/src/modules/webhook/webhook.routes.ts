import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { Webhook } from "svix";
import { env } from "../../config/env.js";
import { createUserService } from "../user/user.service.js";
import { BadRequestError } from "../../errors/app-error.js";

export async function webhookRoutes(app: FastifyInstance) {
  const userService = createUserService(prisma);

  // Clerk webhook — user.created / user.updated
  app.post("/clerk", {
    config: { rawBody: true },
    handler: async (request, reply) => {
      const svixId = request.headers["svix-id"] as string;
      const svixTimestamp = request.headers["svix-timestamp"] as string;
      const svixSignature = request.headers["svix-signature"] as string;

      if (!svixId || !svixTimestamp || !svixSignature) {
        throw new BadRequestError("Missing Svix headers");
      }

      const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
      let payload: Record<string, unknown>;

      try {
        payload = wh.verify(JSON.stringify(request.body), {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        }) as Record<string, unknown>;
      } catch {
        throw new BadRequestError("Invalid webhook signature");
      }

      const eventType = (payload as { type?: string }).type;
      const data = (payload as { data?: Record<string, unknown> }).data;

      if ((eventType === "user.created" || eventType === "user.updated") && data) {
        await userService.syncFromClerk(data as Parameters<typeof userService.syncFromClerk>[0]);
      }

      return reply.status(200).send({ received: true });
    },
  });
}
