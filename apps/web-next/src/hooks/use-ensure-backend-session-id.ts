"use client";

// Garante que `playerViewStore.backendSessionId` está populado. Se o
// player view foi montado após reload (store sem persist) ou se o
// player pulou o JoinScreen via "Iniciar Demo", esse hook resolve o
// id real da sessão pelo `sessionCode` da URL.

import { useEffect } from "react";
import { usePlayerViewStore } from "@/lib/player-view-store";
import { apiRequest } from "@/lib/api-client";
import { useUser } from "@clerk/nextjs";

export function useEnsureBackendSessionId(sessionCode: string | null): void {
  const { isLoaded, isSignedIn } = useUser();
  const backendSessionId = usePlayerViewStore((s) => s.backendSessionId);
  const setBackendSessionId = usePlayerViewStore(
    (s) => s.setBackendSessionId,
  );

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!sessionCode) return;
    if (backendSessionId) return; // já temos
    let cancelled = false;
    void apiRequest<{ id: string }>(
      `/sessions/by-code/${encodeURIComponent(sessionCode)}`,
    )
      .then((s) => {
        if (cancelled) return;
        setBackendSessionId(s.id);
      })
      .catch(() => {
        // 404 → código inválido; o auth gate + JoinScreen tratam erro.
      });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, sessionCode, backendSessionId, setBackendSessionId]);
}
