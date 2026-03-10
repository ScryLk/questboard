import { Worker, type Job, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";
import admin from "firebase-admin";

let fcmInitialized = false;

function initFCM() {
  if (fcmInitialized) return;

  const projectId = process.env["FCM_PROJECT_ID"];
  const privateKey = process.env["FCM_PRIVATE_KEY"];
  const clientEmail = process.env["FCM_CLIENT_EMAIL"];

  if (!projectId || !privateKey || !clientEmail) {
    console.warn("FCM not configured in worker — push disabled");
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey: privateKey.replace(/\\n/g, "\n"),
      clientEmail,
    }),
  });

  fcmInitialized = true;
}

interface PushJob {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export function createPushWorker(connection: ConnectionOptions) {
  initFCM();

  const worker = new Worker<PushJob>(
    "push",
    async (job: Job<PushJob>) => {
      if (!fcmInitialized) return;

      const { userId, title, body, data } = job.data;

      const devices = await prisma.deviceToken.findMany({
        where: { userId, isActive: true },
        select: { token: true },
      });

      const tokens = devices.map((d: { token: string }) => d.token);
      if (tokens.length === 0) return;

      const result = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
        data,
      });

      // Deactivate failed tokens
      const failedTokens: string[] = [];
      result.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error?.code === "messaging/registration-token-not-registered") {
          failedTokens.push(tokens[idx]!);
        }
      });

      if (failedTokens.length > 0) {
        await prisma.deviceToken.updateMany({
          where: { token: { in: failedTokens } },
          data: { isActive: false },
        });
      }
    },
    { connection, concurrency: 5 },
  );

  worker.on("completed", (job) => {
    console.log(`Push job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Push job ${job?.id} failed:`, error);
  });

  return worker;
}
