import { Worker, type Job, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";

interface StatsJob {
  userId: string;
  event: string;
  value?: number;
}

const FIELD_MAP: Record<string, string> = {
  "session:gm": "sessionsAsGM",
  "session:player": "sessionsAsPlayer",
  "playtime:minutes": "totalPlaytimeMin",
  "dice:roll": "diceRollsTotal",
  "dice:nat20": "nat20sTotal",
  "dice:nat1": "nat1sTotal",
  "campaign:created": "campaignsCreated",
  "character:created": "charactersCreated",
  "message:sent": "messagesTotal",
};

export function createStatsWorker(connection: ConnectionOptions) {
  const worker = new Worker<StatsJob>(
    "stats",
    async (job: Job<StatsJob>) => {
      const { userId, event, value = 1 } = job.data;

      const field = FIELD_MAP[event];
      if (!field) {
        console.warn(`Unknown stats event: ${event}`);
        return;
      }

      // Upsert stats, then increment
      await prisma.userStats.upsert({
        where: { userId },
        create: { userId, [field]: value },
        update: { [field]: { increment: value } },
      });
    },
    { connection, concurrency: 10 },
  );

  worker.on("completed", (job) => {
    console.log(`Stats job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Stats job ${job?.id} failed:`, error);
  });

  return worker;
}
