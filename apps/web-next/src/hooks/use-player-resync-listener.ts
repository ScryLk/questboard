"use client";

// Player-side: escuta `player:force-resync` na sala da sessão. Quando o
// alvo do evento for o usuário atual, recarrega a página — força
// re-join, re-fetch de tokens e re-conexão do socket. Brute force
// proposital: o evento existe justamente pra destravar player com
// estado quebrado, então um reload limpo é mais robusto que tentar
// reconciliar manualmente.

import { useEffect } from "react";
import { joinSession, subscribe } from "@/lib/session-socket";
import { useMe } from "./use-me";

interface ForceResyncPayload {
  sessionId: string;
  targetUserId: string;
  by: string;
  at: string;
}

export function usePlayerResyncListener(sessionId: string | null): void {
  const me = useMe();
  const myId = me?.id ?? null;

  useEffect(() => {
    if (!sessionId || !myId) return;
    let cancelled = false;
    const cleanups: Array<() => void> = [];

    (async () => {
      try {
        await joinSession(sessionId);
        if (cancelled) return;
        cleanups.push(
          subscribe<ForceResyncPayload>("player:force-resync", (payload) => {
            if (payload.sessionId !== sessionId) return;
            if (payload.targetUserId !== myId) return;
            if (typeof window === "undefined") return;
            window.location.reload();
          }),
        );
      } catch {
        // Sem socket — feature degrada silenciosamente.
      }
    })();

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [sessionId, myId]);
}
