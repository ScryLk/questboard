// ── Socket.IO Client ──

import { io, type Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@questboard/types";

export type QuestBoardSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface SocketConfig {
  url: string;
  getToken?: () => Promise<string | null>;
}

let socket: QuestBoardSocket | null = null;

export function createSocket(config: SocketConfig): QuestBoardSocket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(config.url, {
    autoConnect: false,
    transports: ["websocket"],
    auth: async (cb) => {
      const token = config.getToken ? await config.getToken() : null;
      cb({ token });
    },
  }) as QuestBoardSocket;

  return socket;
}

export function getSocket(): QuestBoardSocket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
