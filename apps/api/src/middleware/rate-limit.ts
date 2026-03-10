import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { env } from "../config/env.js";

export async function registerRateLimit(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    redis: undefined, // uses in-memory; switch to ioredis for multi-instance
    keyGenerator: (request) => {
      return request.user?.id ?? request.ip;
    },
    skipOnError: env.NODE_ENV !== "production",
  });
}
