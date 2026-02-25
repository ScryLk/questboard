import { Worker, type Job, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";
import Redis from "ioredis";

const REDIS_URL = process.env["REDIS_URL"] ?? "redis://localhost:6379";

interface TokenFlushJob {
  sessionId?: string;
}

export function createTokenPositionFlushWorker(connection: ConnectionOptions) {
  const redis = new Redis(REDIS_URL);

  const worker = new Worker<TokenFlushJob>(
    "token-position-flush",
    async (job: Job<TokenFlushJob>) => {
      try {
        // Scan for all token position keys in Redis
        // Pattern: session:{sessionId}:map:{mapId}:tokens
        const keys: string[] = [];
        let cursor = "0";

        do {
          const [nextCursor, foundKeys] = await redis.scan(
            cursor,
            "MATCH",
            "session:*:map:*:tokens",
            "COUNT",
            100
          );
          cursor = nextCursor;
          keys.push(...foundKeys);
        } while (cursor !== "0");

        let flushed = 0;

        for (const key of keys) {
          const positions = await redis.hgetall(key);

          for (const [tokenId, posJson] of Object.entries(positions)) {
            try {
              const pos = JSON.parse(posJson) as { x: number; y: number };
              await prisma.token.update({
                where: { id: tokenId },
                data: { x: pos.x, y: pos.y },
              });
              flushed++;
            } catch {
              // Token may have been deleted
            }
          }

          // Clear the Redis key after flushing
          await redis.del(key);
        }

        if (flushed > 0) {
          console.log(`Flushed ${flushed} token positions to Postgres`);
        }
      } catch (error) {
        console.error("Token position flush failed:", error);
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
      console.log(`Token flush job ${job.id} completed`);
    }
  });

  worker.on("failed", (job, error) => {
    console.error(`Token flush job ${job?.id} failed:`, error);
  });

  return worker;
}
