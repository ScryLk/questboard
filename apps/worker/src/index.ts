import "dotenv/config";
import { createMapGenerationWorker } from "./jobs/map-generation.js";

const REDIS_URL = process.env["REDIS_URL"] ?? "redis://localhost:6379";

async function start() {
  console.log("Starting QuestBoard workers...");

  const connection = { url: REDIS_URL };

  const mapGenerationWorker = createMapGenerationWorker(connection);

  console.log("Workers started successfully");

  // Graceful shutdown
  const shutdown = async () => {
    console.log("Shutting down workers...");
    await mapGenerationWorker.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error("Failed to start workers:", error);
  process.exit(1);
});
