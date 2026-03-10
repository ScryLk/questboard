import { Worker, type Job, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";

interface NotificationJob {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export function createNotificationWorker(connection: ConnectionOptions) {
  const worker = new Worker<NotificationJob>(
    "notification",
    async (job: Job<NotificationJob>) => {
      const { userId, type, title, body, data } = job.data;

      await prisma.notification.create({
        data: {
          userId,
          type: type as "SESSION_INVITE" | "SESSION_STARTING" | "SESSION_LIVE" | "CAMPAIGN_INVITE" | "CHARACTER_REQUEST" | "SYSTEM_ANNOUNCEMENT" | "BILLING_UPDATED",
          title,
          body,
          data: data ?? {},
        },
      });
    },
    { connection, concurrency: 10 },
  );

  worker.on("completed", (job) => {
    console.log(`Notification job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Notification job ${job?.id} failed:`, error);
  });

  return worker;
}
