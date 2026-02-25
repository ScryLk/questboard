import { Worker, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";

const AUTO_PAUSE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Auto-pause worker.
 * Checks for LIVE sessions where no players are connected for more than 5 minutes.
 * Automatically pauses them to save resources.
 */
export function createAutoPauseWorker(connection: ConnectionOptions) {
  const worker = new Worker(
    "auto-pause",
    async () => {
      const now = new Date();
      const threshold = new Date(now.getTime() - AUTO_PAUSE_TIMEOUT_MS);

      // Find LIVE sessions
      const liveSessions = await prisma.session.findMany({
        where: {
          status: "LIVE",
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          lastPlayedAt: true,
          players: {
            where: { isConnected: true, isBanned: false },
            select: { userId: true },
          },
        },
      });

      for (const session of liveSessions) {
        // Skip if anyone is connected
        if (session.players.length > 0) continue;

        // Check if the session has been idle long enough
        if (session.lastPlayedAt && session.lastPlayedAt > threshold) continue;

        // Auto-pause the session
        const playTimeMinutes = session.lastPlayedAt
          ? Math.round((now.getTime() - session.lastPlayedAt.getTime()) / 60000)
          : 0;

        await prisma.session.update({
          where: { id: session.id },
          data: {
            status: "PAUSED",
            totalPlaytime: { increment: playTimeMinutes },
          },
        });

        await prisma.sessionLog.create({
          data: {
            sessionId: session.id,
            event: "session.auto_paused",
            data: { reason: "no_connected_players", idleMinutes: 5 },
          },
        });

        console.log(`Session "${session.name}" (${session.id}) auto-paused due to inactivity`);
      }
    },
    {
      connection,
      concurrency: 1,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Auto-pause job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Auto-pause job ${job?.id} failed:`, error);
  });

  return worker;
}
