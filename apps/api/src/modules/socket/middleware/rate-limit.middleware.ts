import type { Socket } from "socket.io";
import { SOCKET_RATE_LIMITS } from "@questboard/shared";

const counters = new Map<string, Map<string, { count: number; resetAt: number }>>();

export function createRateLimitMiddleware() {
  return (socket: Socket, next: (err?: Error) => void) => {
    const originalEmit = socket.emit;

    // Intercept client events by wrapping onAny
    socket.onAny((event: string) => {
      const limit = SOCKET_RATE_LIMITS[event];
      if (!limit) return;

      const key = `${socket.id}:${event}`;
      if (!counters.has(key)) {
        counters.set(key, new Map());
      }

      const eventCounters = counters.get(key)!;
      const now = Date.now();
      let entry = eventCounters.get(event);

      if (!entry || now > entry.resetAt) {
        entry = { count: 0, resetAt: now + limit.windowMs };
        eventCounters.set(event, entry);
      }

      entry.count++;

      if (entry.count > limit.max) {
        socket.emit("error", {
          code: "RATE_LIMITED",
          message: `Rate limit exceeded for ${event}`,
        });
      }
    });

    socket.on("disconnect", () => {
      // Clean up rate limit state for this socket
      for (const [key] of counters) {
        if (key.startsWith(socket.id)) {
          counters.delete(key);
        }
      }
    });

    next();
  };
}

export function checkRateLimit(socketId: string, event: string): boolean {
  const limit = SOCKET_RATE_LIMITS[event];
  if (!limit) return true;

  const key = `${socketId}:${event}`;
  const now = Date.now();

  if (!counters.has(key)) {
    counters.set(key, new Map());
  }

  const eventCounters = counters.get(key)!;
  let entry = eventCounters.get(event);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + limit.windowMs };
    eventCounters.set(event, entry);
  }

  entry.count++;
  return entry.count <= limit.max;
}
