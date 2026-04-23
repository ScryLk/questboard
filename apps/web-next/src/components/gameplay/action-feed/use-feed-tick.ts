"use client";

import { useEffect } from "react";
import { useActionFeedStore } from "@/lib/action-feed-store";

/**
 * Tick de 1s que força re-render do painel de ações — os countdowns e
 * o estado "consolidada" (após 30s) são derivados de `Date.now()`, não
 * precisam setter próprio; só precisamos que o React re-renderize.
 *
 * Monta 1x no painel. Se não houver entries ativas, o tick ainda roda
 * mas é overhead mínimo (1 setState/s).
 */
export function useFeedTick() {
  const tickNow = useActionFeedStore((s) => s.tickNow);
  useEffect(() => {
    const id = setInterval(() => tickNow(), 1000);
    return () => clearInterval(id);
  }, [tickNow]);
}
