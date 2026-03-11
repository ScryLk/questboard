import { Queue } from "bullmq";
import { env } from "../config/env.js";

const connection = { url: env.REDIS_URL };

export const notificationQueue = new Queue("notification", { connection });
export const statsQueue = new Queue("stats", { connection });
export const pushQueue = new Queue("push", { connection });
export const sessionCleanupQueue = new Queue("session-cleanup", { connection });
export const mapGenerationQueue = new Queue("map-generation", { connection });
