// ── React Hooks for Socket.IO ──

import { useEffect, useRef, useCallback, useState } from "react";
import type { QuestBoardSocket } from "./client";
import type { ServerToClientEvents } from "@questboard/types";

export function useSocketEvent<K extends keyof ServerToClientEvents>(
  socket: QuestBoardSocket | null,
  event: K,
  handler: ServerToClientEvents[K],
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!socket) return;

    const listener = (...args: unknown[]) => {
      (handlerRef.current as (...args: unknown[]) => void)(...args);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on(event as any, listener as any);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.off(event as any, listener as any);
    };
  }, [socket, event]);
}

export function useSocketConnection(socket: QuestBoardSocket | null) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    setIsConnected(socket.connected);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  const connect = useCallback(() => socket?.connect(), [socket]);
  const disconnect = useCallback(() => socket?.disconnect(), [socket]);

  return { isConnected, connect, disconnect };
}
