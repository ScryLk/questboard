import "dotenv/config";
import { Queue } from "bullmq";
import { createMapGenerationWorker } from "./jobs/map-generation.js";
import { createSchedulingCheckerWorker } from "./jobs/scheduling-checker.js";
import { createAutoPauseWorker } from "./jobs/auto-pause.js";
import { createRecurrenceGeneratorWorker } from "./jobs/recurrence-generator.js";
import { createInviteExpirationWorker } from "./jobs/invite-expiration.js";
import { createThumbnailWorker } from "./jobs/thumbnail-generation.js";
import { createTokenPositionFlushWorker } from "./jobs/token-position-flush.js";
import { createWallDetectionWorker } from "./jobs/wall-detection.js";
import { createVisionFlushWorker } from "./jobs/vision-flush.js";
import { createPdfGenerationWorker } from "./jobs/pdf-generation.js";
import { createTemplateMigrationWorker } from "./jobs/template-migration.js";

const REDIS_URL = process.env["REDIS_URL"] ?? "redis://localhost:6379";

async function setupRepeatingJobs(connection: { url: string }) {
  // Scheduling checker — every 1 minute
  const schedulingQueue = new Queue("scheduling-checker", { connection });
  await schedulingQueue.upsertJobScheduler("scheduling-checker-repeat", {
    every: 60_000,
  });

  // Auto-pause — every 2 minutes
  const autoPauseQueue = new Queue("auto-pause", { connection });
  await autoPauseQueue.upsertJobScheduler("auto-pause-repeat", {
    every: 120_000,
  });

  // Recurrence generator — daily at 03:00 UTC
  const recurrenceQueue = new Queue("recurrence-generator", { connection });
  await recurrenceQueue.upsertJobScheduler("recurrence-generator-daily", {
    pattern: "0 3 * * *",
  });

  // Invite expiration — every 15 minutes
  const inviteQueue = new Queue("invite-expiration", { connection });
  await inviteQueue.upsertJobScheduler("invite-expiration-repeat", {
    every: 900_000,
  });

  // Token position flush — every 30 seconds
  const tokenFlushQueue = new Queue("token-position-flush", { connection });
  await tokenFlushQueue.upsertJobScheduler("token-position-flush-repeat", {
    every: 30_000,
  });

  // Vision flush — every 60 seconds
  const visionFlushQueue = new Queue("vision-flush", { connection });
  await visionFlushQueue.upsertJobScheduler("vision-flush-repeat", {
    every: 60_000,
  });
}

async function start() {
  console.log("Starting QuestBoard workers...");

  const connection = { url: REDIS_URL };

  // Create all workers
  const mapGenerationWorker = createMapGenerationWorker(connection);
  const schedulingCheckerWorker = createSchedulingCheckerWorker(connection);
  const autoPauseWorker = createAutoPauseWorker(connection);
  const recurrenceGeneratorWorker = createRecurrenceGeneratorWorker(connection);
  const inviteExpirationWorker = createInviteExpirationWorker(connection);
  const thumbnailWorker = createThumbnailWorker(connection);
  const tokenPositionFlushWorker = createTokenPositionFlushWorker(connection);
  const wallDetectionWorker = createWallDetectionWorker(connection);
  const visionFlushWorker = createVisionFlushWorker(connection);
  const pdfGenerationWorker = createPdfGenerationWorker(connection);
  const templateMigrationWorker = createTemplateMigrationWorker(connection);

  // Set up repeating jobs
  await setupRepeatingJobs(connection);

  console.log("Workers started successfully");
  console.log("  - map-generation (on demand)");
  console.log("  - scheduling-checker (every 1min)");
  console.log("  - auto-pause (every 2min)");
  console.log("  - recurrence-generator (daily at 03:00 UTC)");
  console.log("  - invite-expiration (every 15min)");
  console.log("  - thumbnail-generation (on demand)");
  console.log("  - token-position-flush (every 30s)");
  console.log("  - wall-detection (on demand)");
  console.log("  - vision-flush (every 60s)");
  console.log("  - pdf-generation (on demand)");
  console.log("  - template-migration (on demand)");

  // Graceful shutdown
  const shutdown = async () => {
    console.log("Shutting down workers...");
    await Promise.all([
      mapGenerationWorker.close(),
      schedulingCheckerWorker.close(),
      autoPauseWorker.close(),
      recurrenceGeneratorWorker.close(),
      inviteExpirationWorker.close(),
      thumbnailWorker.close(),
      tokenPositionFlushWorker.close(),
      wallDetectionWorker.close(),
      visionFlushWorker.close(),
      pdfGenerationWorker.close(),
      templateMigrationWorker.close(),
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
