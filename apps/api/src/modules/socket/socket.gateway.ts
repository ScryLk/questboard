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
import { registerMapTokenHandlers } from "./handlers/map-token.handler.js";
import { registerMapFogHandlers } from "./handlers/map-fog.handler.js";
import { registerMapWallHandlers } from "./handlers/map-wall.handler.js";
import { registerMapLightHandlers } from "./handlers/map-light.handler.js";
import { registerMapAnnotationHandlers } from "./handlers/map-annotation.handler.js";
import { registerMapStateHandlers } from "./handlers/map-state.handler.js";
import { registerExplorationInteractionHandlers } from "./handlers/exploration-interaction.handler.js";
import { registerExplorationMovementHandlers } from "./handlers/exploration-movement.handler.js";
import { registerCharacterHandlers } from "./handlers/character.handler.js";
import { registerHandoutHandlers } from "./handlers/handout.handler.js";
import { registerSoundtrackHandlers } from "./handlers/soundtrack.handler.js";
import { registerModerationHandlers } from "./handlers/moderation.handler.js";

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

    // Map event handlers
    registerMapTokenHandlers(io, socket, prisma);
    registerMapFogHandlers(io, socket, prisma);
    registerMapWallHandlers(io, socket, prisma);
    registerMapLightHandlers(io, socket, prisma);
    registerMapAnnotationHandlers(io, socket, prisma);
    registerMapStateHandlers(io, socket, prisma);

    // Exploration event handlers
    registerExplorationInteractionHandlers(io, socket, prisma);
    registerExplorationMovementHandlers(io, socket, prisma);

    // Character event handlers
    registerCharacterHandlers(io, socket, prisma);

    // Communication event handlers
    registerHandoutHandlers(io, socket, prisma);
    registerSoundtrackHandlers(io, socket, prisma);
    registerModerationHandlers(io, socket, prisma);

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
