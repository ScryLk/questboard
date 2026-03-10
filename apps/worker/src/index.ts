import "dotenv/config";
import { createMapGenerationWorker } from "./jobs/map-generation.js";
import { createNotificationWorker } from "./jobs/notification.js";
import { createPushWorker } from "./jobs/push.js";
import { createStatsWorker } from "./jobs/stats.js";
import { createSessionCleanupWorker } from "./jobs/session-cleanup.js";

const REDIS_URL = process.env["REDIS_URL"] ?? "redis://localhost:6379";

async function start() {
  console.log("Starting QuestBoard workers...");

  const connection = { url: REDIS_URL };

  const mapGenerationWorker = createMapGenerationWorker(connection);
  const notificationWorker = createNotificationWorker(connection);
  const pushWorker = createPushWorker(connection);
  const statsWorker = createStatsWorker(connection);
  const sessionCleanupWorker = createSessionCleanupWorker(connection);

  console.log("Workers started: map-generation, notification, push, stats, session-cleanup");

  // Graceful shutdown
  const shutdown = async () => {
    console.log("Shutting down workers...");
    await Promise.all([
      mapGenerationWorker.close(),
      notificationWorker.close(),
      pushWorker.close(),
      statsWorker.close(),
      sessionCleanupWorker.close(),
    ]);
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error("Failed to start workers:", error);
  process.exit(1);
});
