import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { env } from "../config/env.js";

let io: SocketIOServer | null = null;

export function createSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN.split(","),
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}
