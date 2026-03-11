import admin from "firebase-admin";
import { env } from "../config/env.js";

let initialized = false;

function initFirebase() {
  if (initialized) return;
  if (!env.FCM_PROJECT_ID || !env.FCM_PRIVATE_KEY || !env.FCM_CLIENT_EMAIL) {
    console.warn("FCM not configured — push notifications disabled");
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FCM_PROJECT_ID,
      privateKey: env.FCM_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: env.FCM_CLIENT_EMAIL,
    }),
  });

  initialized = true;
}

export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  initFirebase();
  if (!initialized || tokens.length === 0) return;

  await admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
    data,
  });
}
