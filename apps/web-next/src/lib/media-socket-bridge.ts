"use client";

// ── Bridge: Socket.IO `media:*` → useMediaBroadcastStore ──
//
// Liga `media:show` e `media:hide` à store enquanto o componente
// estiver montado. Player view e dashboard montam essa ponte pra
// receber broadcasts em tempo real do GM.

import { useEffect } from "react";
import { useMediaBroadcastStore } from "./media-broadcast-store";
import { joinSession, subscribe } from "./session-socket";
import type { ActiveMediaDto } from "./media-api";

export function useMediaSocketBridge(sessionId: string | null): void {
  const applyServerEvent = useMediaBroadcastStore((s) => s.applyServerEvent);

  useEffect(() => {
    if (!sessionId) return;

    let cleanedUp = false;
    const cleanups: Array<() => void> = [];

    (async () => {
      try {
        await joinSession(sessionId);
        if (cleanedUp) return;

        cleanups.push(
          subscribe<ActiveMediaDto & { sessionId: string }>(
            "media:show",
            (payload) => {
              if (payload.sessionId !== sessionId) return;
              applyServerEvent(payload);
            },
          ),
        );

        cleanups.push(
          subscribe<{ sessionId: string }>("media:hide", (payload) => {
            if (payload.sessionId !== sessionId) return;
            applyServerEvent(null);
          }),
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[media-socket-bridge] join falhou:", err);
      }
    })();

    return () => {
      cleanedUp = true;
      cleanups.forEach((fn) => fn());
    };
  }, [sessionId, applyServerEvent]);
}
