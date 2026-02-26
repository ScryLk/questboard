import { Worker, type Job, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";

interface AsyncTurnReminderJob {
  // No data needed for repeating job — it checks all async sessions
}

export function createAsyncTurnReminderWorker(connection: ConnectionOptions) {
  const worker = new Worker<AsyncTurnReminderJob>(
    "async-turn-reminder",
    async (_job: Job<AsyncTurnReminderJob>) => {
      try {
        console.log("Checking async sessions for turn reminders...");

        // Find active async sessions
        const asyncSessions = await prisma.session.findMany({
          where: {
            type: "ASYNC",
            status: { in: ["LIVE", "PAUSED"] },
          },
          select: {
            id: true,
            name: true,
            settings: true,
          },
        });

        let reminders = 0;

        for (const session of asyncSessions) {
          const settings = (session.settings as Record<string, unknown>) ?? {};
          const asyncConfig = (settings["async"] as Record<string, unknown>) ?? {};
          const turnTimeoutHours = (asyncConfig["turnTimeoutHours"] as number) ?? 24;

          // Find the latest async post
          const latestPost = await prisma.chatMessage.findFirst({
            where: {
              sessionId: session.id,
              isAsyncPost: true,
              isDeleted: false,
            },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              authorId: true,
              createdAt: true,
              asyncTurnNumber: true,
            },
          });

          if (!latestPost) continue;

          // Check if turn timeout has passed
          const hoursSinceLastPost = (Date.now() - latestPost.createdAt.getTime()) / (1000 * 60 * 60);

          if (hoursSinceLastPost >= turnTimeoutHours) {
            // Get all session players except the last poster
            const players = await prisma.sessionPlayer.findMany({
              where: {
                sessionId: session.id,
                userId: { not: latestPost.authorId ?? undefined },
              },
              select: { userId: true },
            });

            // Create a system message reminder
            await prisma.chatMessage.create({
              data: {
                sessionId: session.id,
                authorType: "SYSTEM",
                channel: "ASYNC",
                content: `Lembrete: já se passaram ${Math.floor(hoursSinceLastPost)} horas desde o último post. É a vez de alguém continuar a narrativa!`,
                contentType: "SYSTEM_EVENT",
                isAsyncPost: false,
              },
            });

            // In production: would also send push notifications to players
            // via a notification service

            reminders++;
            console.log(`Sent async turn reminder for session ${session.id} (${session.name})`);
          }
        }

        console.log(`Async turn reminder check complete: ${reminders} reminders sent, ${asyncSessions.length} sessions checked`);

        return { sessionsChecked: asyncSessions.length, remindersSent: reminders };
      } catch (error) {
        console.error("Async turn reminder check failed:", error);
        throw error;
      }
    },
    {
      connection,
      concurrency: 1,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Async turn reminder job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Async turn reminder job ${job?.id} failed:`, error);
  });

  return worker;
}
