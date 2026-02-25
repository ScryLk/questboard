import { Worker, type Job, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";
import type { Prisma } from "@questboard/db";
import Redis from "ioredis";

const REDIS_URL = process.env["REDIS_URL"] ?? "redis://localhost:6379";

interface VisionFlushJob {
  sessionId?: string;
}

export function createVisionFlushWorker(connection: ConnectionOptions) {
  const redis = new Redis(REDIS_URL);

  const worker = new Worker<VisionFlushJob>(
    "vision-flush",
    async (_job: Job<VisionFlushJob>) => {
      try {
        // Scan for all explored cells keys in Redis
        // Pattern: session:{sessionId}:user:{userId}:map:{mapId}:explored
        const keys: string[] = [];
        let cursor = "0";

        do {
          const [nextCursor, foundKeys] = await redis.scan(
            cursor,
            "MATCH",
            "session:*:user:*:map:*:explored",
            "COUNT",
            100
          );
          cursor = nextCursor;
          keys.push(...foundKeys);
        } while (cursor !== "0");

        let flushed = 0;

        for (const key of keys) {
          // Parse session/user/map IDs from key
          const parts = key.split(":");
          // session:{sessionId}:user:{userId}:map:{mapId}:explored
          const sessionId = parts[1];
          const userId = parts[3];
          const mapId = parts[5];

          if (!sessionId || !userId || !mapId) continue;

          try {
            // Get all explored cells from Redis set
            const cells = await redis.smembers(key);
            if (cells.length === 0) continue;

            // Get current explored cells from DB
            const existing = await prisma.playerViewState.findUnique({
              where: { sessionId_userId_mapId: { sessionId, userId, mapId } },
            });

            const existingCells = existing?.exploredCells
              ? (Array.isArray(existing.exploredCells) ? existing.exploredCells as string[] : [])
              : [];

            // Merge Redis cells with DB cells
            const merged = [...new Set([...existingCells, ...cells])];

            // Upsert to DB
            await prisma.playerViewState.upsert({
              where: { sessionId_userId_mapId: { sessionId, userId, mapId } },
              create: {
                sessionId,
                userId,
                mapId,
                exploredCells: merged as Prisma.InputJsonValue,
              },
              update: {
                exploredCells: merged as Prisma.InputJsonValue,
              },
            });

            flushed++;
          } catch {
            // May fail if session/user/map deleted
          }
        }

        // Also flush vision state keys
        // Pattern: session:{sessionId}:user:{userId}:map:{mapId}:vision
        const visionKeys: string[] = [];
        cursor = "0";

        do {
          const [nextCursor, foundKeys] = await redis.scan(
            cursor,
            "MATCH",
            "session:*:user:*:map:*:vision",
            "COUNT",
            100
          );
          cursor = nextCursor;
          visionKeys.push(...foundKeys);
        } while (cursor !== "0");

        for (const key of visionKeys) {
          const parts = key.split(":");
          const sessionId = parts[1];
          const userId = parts[3];
          const mapId = parts[5];

          if (!sessionId || !userId || !mapId) continue;

          try {
            const visionData = await redis.get(key);
            if (!visionData) continue;

            const vision = JSON.parse(visionData) as {
              visibleCells: string[];
              lastTokenX: number;
              lastTokenY: number;
            };

            await prisma.playerViewState.upsert({
              where: { sessionId_userId_mapId: { sessionId, userId, mapId } },
              create: {
                sessionId,
                userId,
                mapId,
                lastTokenX: vision.lastTokenX,
                lastTokenY: vision.lastTokenY,
              },
              update: {
                lastTokenX: vision.lastTokenX,
                lastTokenY: vision.lastTokenY,
              },
            });
          } catch {
            // May fail
          }
        }

        if (flushed > 0) {
          console.log(`Flushed ${flushed} vision states to Postgres`);
        }
      } catch (error) {
        console.error("Vision flush failed:", error);
        throw error;
      }
    },
    {
      connection,
      concurrency: 1,
    }
  );

  worker.on("completed", (job) => {
    if (job.returnvalue) {
      console.log(`Vision flush job ${job.id} completed`);
    }
  });

  worker.on("failed", (job, error) => {
    console.error(`Vision flush job ${job?.id} failed:`, error);
  });

  return worker;
}
