import { Worker, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";
import Redis from "ioredis";

export function createSessionCleanupWorker(connection: ConnectionOptions) {
  const redisUrl = (connection as { url?: string }).url ?? "redis://localhost:6379";
  const redis = new Redis(redisUrl);

  const worker = new Worker(
    "session-cleanup",
    async () => {
      // Find LIVE sessions without heartbeat > 30min
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

      const staleSessions = await prisma.session.findMany({
        where: {
          status: "LIVE",
          updatedAt: { lt: thirtyMinAgo },
        },
        select: { id: true },
      });

      for (const session of staleSessions) {
        console.log(`Cleaning up stale session ${session.id}`);

        // Check Redis for recent presence
        const presenceCount = await redis.hlen(`session:${session.id}:presence`);
        if (presenceCount > 0) {
          // Session has active connections, touch it
          await prisma.session.update({
            where: { id: session.id },
            data: { updatedAt: new Date() },
          });
          continue;
        }

        // No presence — mark as PAUSED
        await prisma.session.update({
          where: { id: session.id },
          data: { status: "PAUSED" },
        });

        // Cleanup Redis state
        const keys = await redis.keys(`session:${session.id}:*`);
        if (keys.length > 0) await redis.del(...keys);

        // Mark all players offline
        await prisma.sessionPlayer.updateMany({
          where: { sessionId: session.id },
          data: { isOnline: false },
        });
      }
    },
    {
      connection,
      concurrency: 1,
    },
  );

  worker.on("completed", (job) => {
    console.log(`Session cleanup job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Session cleanup job ${job?.id} failed:`, error);
  });

  return worker;
}
