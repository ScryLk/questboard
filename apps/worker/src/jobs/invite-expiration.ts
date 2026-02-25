import { Worker, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";

/**
 * Invite expiration worker.
 * Runs every 15 minutes to mark expired invites.
 */
export function createInviteExpirationWorker(connection: ConnectionOptions) {
  const worker = new Worker(
    "invite-expiration",
    async () => {
      const now = new Date();

      // Find pending invites that have expired
      const result = await prisma.sessionInvite.updateMany({
        where: {
          status: "PENDING",
          expiresAt: { lte: now },
        },
        data: {
          status: "EXPIRED",
        },
      });

      if (result.count > 0) {
        console.log(`Expired ${result.count} invites`);
      }
    },
    {
      connection,
      concurrency: 1,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Invite expiration job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Invite expiration job ${job?.id} failed:`, error);
  });

  return worker;
}
