import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { errorHandler } from "./plugins/error-handler.js";
import { sessionsRoutes } from "./modules/sessions/sessions.routes.js";

const PORT = parseInt(process.env["PORT"] ?? "3001", 10);

async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env["NODE_ENV"] === "production" ? "info" : "debug",
    },
  });

  // Plugins
  await app.register(cors, {
    origin: (process.env["CORS_ORIGIN"] ?? "http://localhost:5173").split(","),
    credentials: true,
  });
  await app.register(errorHandler);

  // Health check
  app.get("/health", async () => ({ status: "ok" }));

  // API v1 routes
  await app.register(
    async (v1) => {
      await v1.register(sessionsRoutes);
    },
    { prefix: "/api/v1" }
  );

  return app;
}

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

export { buildApp };
