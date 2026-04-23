"use client";

import { useEffect } from "react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { usePlayerViewStore } from "@/lib/player-view-store";

/**
 * Lê o query param `?as=` e configura identidade em **ambos** os stores:
 *
 *  - `gameplayStore.currentUserId` + `currentUserIsGM` → usados pela
 *    matriz de permissões do menu contextual e target panel.
 *  - `playerViewStore.playerId` → usado pelo `buildPlayerView` pra
 *    filtrar qual token é "meu" (aparece na aba Ficha).
 *
 * Valores aceitos:
 *   gm       → GM (currentUserIsGM=true, currentUserId="gm")
 *   p1/p2/p3 → ids de jogador (bate com `MOCK_PLAYERS`)
 *   qualquer outra string → tratada como playerId livre
 *
 * Sem `?as=` (default): assume GM.
 *
 * Manter os dois stores em sync garante que, ao atribuir um token a
 * `playerId = "p1"` pelo menu contextual do GM, a aba aberta com
 * `?as=p1` imediatamente vê o token na aba Ficha.
 */
export function useIdentityFromUrl() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("as");

    const gmStore = useGameplayStore.getState();
    const playerStore = usePlayerViewStore.getState();

    if (!raw || raw === "gm") {
      gmStore.setCurrentUserIsGM(true);
      gmStore.setCurrentUserId("gm");
      // GM não tem playerId próprio (não é jogador). Não tocar no
      // player view — continua no default (irrelevante pra GM).
      return;
    }

    gmStore.setCurrentUserIsGM(false);
    gmStore.setCurrentUserId(raw);
    // Player view lê `playerId` do mesmo valor, assim o filtro
    // `token.playerId === playerId` funciona nas duas pontas.
    playerStore.setPlayerId?.(raw);
  }, []);
}

/**
 * Lê a identidade atual sem depender do store (pra casos onde precisamos
 * dela antes da hidratação, ex: decidir qual lado do broadcast somos).
 */
export function getIdentityFromUrl(): { id: string; isGM: boolean } {
  if (typeof window === "undefined") return { id: "gm", isGM: true };
  const raw = new URLSearchParams(window.location.search).get("as");
  if (!raw || raw === "gm") return { id: "gm", isGM: true };
  return { id: raw, isGM: false };
}
