import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { errorHandler } from "./plugins/error-handler.js";
import { authPlugin } from "./plugins/auth.js";

// Route modules
import { authRoutes } from "./modules/auth/auth.routes.js";
import { usersRoutes } from "./modules/users/users.routes.js";
import { sessionsRoutes } from "./modules/sessions/sessions.routes.js";
import { sessionPlayersRoutes } from "./modules/session-players/session-players.routes.js";
import { invitesRoutes } from "./modules/invites/invites.routes.js";
import { schedulingRoutes } from "./modules/scheduling/scheduling.routes.js";
import { combatRoutes } from "./modules/combat/combat.routes.js";
import { lobbyRoutes } from "./modules/lobby/lobby.routes.js";
import { reportsRoutes } from "./modules/reports/reports.routes.js";
import { billingRoutes } from "./modules/billing/billing.routes.js";
import { billingWebhookRoutes } from "./modules/billing/billing.webhook.js";
import { planGateRoutes } from "./modules/plan-gate/plan-gate.routes.js";
import { friendsRoutes } from "./modules/friends/friends.routes.js";
import { achievementsRoutes } from "./modules/achievements/achievements.routes.js";
import { statsRoutes } from "./modules/stats/stats.routes.js";
import { notificationsRoutes } from "./modules/notifications/notifications.routes.js";

// Socket.IO
import { createSocketGateway } from "./modules/socket/socket.gateway.js";

const PORT = parseInt(process.env["PORT"] ?? "3001", 10);

async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env["NODE_ENV"] === "production" ? "info" : "debug",
    },
  });

  const corsOrigin = (process.env["CORS_ORIGIN"] ?? "http://localhost:5173").split(",");

  // Plugins
  await app.register(cors, {
    origin: corsOrigin,
    credentials: true,
  });
  await app.register(errorHandler);

  // Health check (no auth)
  app.get("/health", async () => ({ status: "ok" }));

  // API v1 routes
  await app.register(
    async (v1) => {
      // Public routes (no auth required) — separate encapsulation scope
      await v1.register(authRoutes);
      await v1.register(billingWebhookRoutes);
      await v1.register(lobbyRoutes);

      // Authenticated routes — auth middleware only applies to this scope
      await v1.register(async (authenticated) => {
        await authenticated.register(authPlugin);

        await authenticated.register(usersRoutes);
        await authenticated.register(sessionsRoutes);
        await authenticated.register(sessionPlayersRoutes);
        await authenticated.register(invitesRoutes);
        await authenticated.register(schedulingRoutes);
        await authenticated.register(combatRoutes);
        await authenticated.register(reportsRoutes);
        await authenticated.register(billingRoutes);
        await authenticated.register(planGateRoutes);
        await authenticated.register(friendsRoutes);
        await authenticated.register(achievementsRoutes);
        await authenticated.register(statsRoutes);
        await authenticated.register(notificationsRoutes);
      });
    },
    { prefix: "/api/v1" }
  );

  return app;
}

async function start() {
  const app = await buildApp();

  try {
    const address = await app.listen({ port: PORT, host: "0.0.0.0" });
    app.log.info(`Server listening on ${address}`);

    // Initialize Socket.IO on the underlying HTTP server
    const corsOrigin = (process.env["CORS_ORIGIN"] ?? "http://localhost:5173").split(",");
    const io = createSocketGateway(app.server, corsOrigin);
    app.log.info("Socket.IO gateway initialized");

    // Store io instance for potential cleanup
    app.decorate("io", io);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

export { buildApp };
