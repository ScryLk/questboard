import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { createServer } from "node:http";
import { env } from "./config/env.js";
import { errorHandler } from "./plugins/error-handler.js";
import { registerRateLimit } from "./middleware/rate-limit.js";
import { verifyAuth } from "./middleware/auth.js";
import { createSocketServer } from "./lib/socket.js";
import { sessionsRoutes } from "./modules/sessions/sessions.routes.js";
import { userRoutes } from "./modules/user/user.routes.js";
import { billingRoutes, billingWebhookRoutes } from "./modules/billing/billing.routes.js";
import { webhookRoutes } from "./modules/webhook/webhook.routes.js";
import { campaignRoutes } from "./modules/campaign/campaign.routes.js";
import { mapRoutes } from "./modules/map/map.routes.js";
import { characterRoutes } from "./modules/character/character.routes.js";
import { registerSocketHandlers } from "./socket/index.js";
import { combatRoutes } from "./modules/combat/combat.routes.js";
import { chatRoutes } from "./modules/chat/chat.routes.js";
import { audioRoutes } from "./modules/audio/audio.routes.js";
import { adminRoutes } from "./modules/admin/admin.routes.js";
import { narrativeRoutes } from "./modules/narrative/narrative.routes.js";

async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
    },
  });

  // Plugins
  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(","),
    credentials: true,
  });
  await app.register(errorHandler);
  await app.register(multipart, { limits: { fileSize: 200 * 1024 * 1024 } });
  await registerRateLimit(app);

  // Health check (no auth)
  app.get("/health", async () => ({ status: "ok" }));

  // Webhook routes (no auth) — registered before auth hook
  await app.register(
    async (wh) => {
      await wh.register(webhookRoutes);
      await wh.register(billingWebhookRoutes);
    },
    { prefix: "/api/v1/webhooks" },
  );

  // API v1 routes (authenticated)
  await app.register(
    async (v1) => {
      v1.addHook("onRequest", verifyAuth);
      await v1.register(sessionsRoutes);
      await v1.register(userRoutes);
      await v1.register(billingRoutes);
      await v1.register(campaignRoutes);
      await v1.register(mapRoutes);
      await v1.register(characterRoutes);
      await v1.register(combatRoutes);
      await v1.register(chatRoutes);
      await v1.register(audioRoutes);
      await v1.register(adminRoutes);
      await v1.register(narrativeRoutes);
    },
    { prefix: "/api/v1" },
  );

  return app;
}

async function start() {
  const app = await buildApp();

  // Create raw HTTP server for Socket.IO
  const httpServer = createServer(app.server);
  const io = createSocketServer(httpServer);
  registerSocketHandlers(io);

  // Store io reference for route handlers
  app.decorate("io", io);

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    app.log.info(`Server listening on port ${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

export { buildApp };
