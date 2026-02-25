import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "http";
import type { ServerToClientEvents, ClientToServerEvents } from "@questboard/shared";
import { prisma } from "@questboard/db";
import { socketAuthMiddleware } from "./middleware/auth.middleware.js";
import { createRateLimitMiddleware } from "./middleware/rate-limit.middleware.js";
import { registerSessionHandlers } from "./handlers/session.handler.js";
import { registerCombatHandlers } from "./handlers/combat.handler.js";
import { registerDiceHandlers } from "./handlers/dice.handler.js";
import { registerChatHandlers } from "./handlers/chat.handler.js";
import { registerCursorHandlers } from "./handlers/cursor.handler.js";

export type TypedIO = SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
export type TypedSocket = Parameters<Parameters<TypedIO["on"]>[1]>[0];

export interface SocketContext {
  userId: string;
  sessionId: string | null;
  role: string | null;
}

declare module "socket.io" {
  interface Socket {
    ctx: SocketContext;
  }
}

export function createSocketGateway(httpServer: HttpServer, corsOrigin: string[]) {
  const io: TypedIO = new SocketIOServer(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // Auth middleware
  io.use(socketAuthMiddleware(prisma));

  // Rate limit middleware
  io.use(createRateLimitMiddleware());

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.ctx.userId})`);

    // Register all event handlers
    registerSessionHandlers(io, socket, prisma);
    registerCombatHandlers(io, socket, prisma);
    registerDiceHandlers(io, socket, prisma);
    registerChatHandlers(io, socket, prisma);
    registerCursorHandlers(io, socket);

    socket.on("disconnect", async (reason) => {
      console.log(`Socket disconnected: ${socket.id} (reason: ${reason})`);

      if (socket.ctx.sessionId) {
        // Mark player as disconnected
        try {
          await prisma.sessionPlayer.updateMany({
            where: { userId: socket.ctx.userId, sessionId: socket.ctx.sessionId },
            data: { isConnected: false },
          });

          socket.to(socket.ctx.sessionId).emit("player:disconnected", {
            userId: socket.ctx.userId,
          });
        } catch {
          // Player may have been removed
        }
      }
    });
  });

  return io;
}
