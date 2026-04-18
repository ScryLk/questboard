import { Worker, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";
import Redis from "ioredis";

export function createSessionCleanupWorker(connection: ConnectionOptions) {
  const redisUrl = (connection as { url?: string }).url ?? "redis://localhost:6379";
  const redis = new Redis(redisUrl);

  const worker = new Worker(
    "session-cleanup",
    async () => {
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

      const staleSessions = await prisma.session.findMany({
        where: {
          status: "LIVE",
          updatedAt: { lt: thirtyMinAgo },
        },
        select: { id: true },
      });

      for (const session of staleSessions) {
        try {
          const presenceCount = await redis.hlen(`session:${session.id}:presence`);
          if (presenceCount > 0) {
            await prisma.session.update({
              where: { id: session.id },
              data: { updatedAt: new Date() },
            });
            continue;
          }

          await prisma.session.updateMany({
            where: { id: session.id, status: "LIVE" },
            data: { status: "PAUSED" },
          });

          const keys = await redis.keys(`session:${session.id}:*`);
          if (keys.length > 0) await redis.del(...keys);

          await prisma.sessionPlayer.updateMany({
            where: { sessionId: session.id },
            data: { isOnline: false },
          });
        } catch (err) {
          console.error(`[session-cleanup] Error cleaning session ${session.id}:`, err);
        }
      }
    },
    {
      connection,
      concurrency: 1,
    },
  );

  worker.on("failed", (job, error) => {
    console.error(`Session cleanup job ${job?.id} failed:`, error);
  });

  return worker;
}
