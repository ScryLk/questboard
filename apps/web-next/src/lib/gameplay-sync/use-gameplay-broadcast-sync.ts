"use client";

import { useEffect } from "react";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { ChatMessage } from "@/lib/gameplay-mock-data";
import {
  broadcastSend,
  onBroadcastMessage,
  type BroadcastMessage,
} from "@/lib/broadcast-sync";
import {
  WORLD_STATE_KEYS,
  pickWorldState,
  shallowEqualWorldState,
} from "./world-state-keys";
import { getIdentityFromUrl } from "./use-identity-from-url";

const BROADCAST_DEBOUNCE_MS = 150;

/**
 * Sync do gameplayStore via BroadcastChannel entre abas.
 *
 * **GM side** (default / `?as=gm`):
 *  - Subscribe no gameplayStore; quando campos world-state mudam,
 *    emite `gm:state-sync` debounced pra outras abas.
 *  - Responde `gm:state-sync` imediato quando recebe `player:join`
 *    (pra novo player hidratar estado inicial).
 *  - Futuro: aplicar ações `player:*` no store. Hoje só logs.
 *
 * **Player side** (`?as=playerN`):
 *  - Escuta `gm:state-sync`; aplica `setState(snapshot)` no próprio
 *    gameplayStore. O código existente do PlayerCanvas/BroadcastSync
 *    lê o store como fonte de verdade, então isso basta.
 *  - No mount emite `player:join` pra pedir snapshot inicial.
 *
 * Guard contra loop: flag `applyingRemoteSync` evita que aplicar um
 * snapshot recebido dispare novo broadcast de volta.
 */
let applyingRemoteSync = false;

export function useGameplayBroadcastSync() {
  useEffect(() => {
    const { isGM, id: identityId } = getIdentityFromUrl();
    const senderId = isGM ? "gm" : identityId;

    // ── GM: auto-broadcast em mudanças world-state ────────────────
    let broadcastTimer: ReturnType<typeof setTimeout> | null = null;
    let lastSnapshot: ReturnType<typeof pickWorldState> | null = null;

    function scheduleBroadcast() {
      if (!isGM) return;
      if (applyingRemoteSync) return;
      if (broadcastTimer) clearTimeout(broadcastTimer);
      broadcastTimer = setTimeout(() => {
        const snapshot = pickWorldState(useGameplayStore.getState());
        if (lastSnapshot && shallowEqualWorldState(lastSnapshot, snapshot)) {
          return;
        }
        lastSnapshot = snapshot;
        broadcastSend("gm:state-sync", snapshot, senderId);
      }, BROADCAST_DEBOUNCE_MS);
    }

    const unsubStore = isGM
      ? useGameplayStore.subscribe(scheduleBroadcast)
      : () => {};

    // ── Player: aplica snapshots recebidos no próprio store ───────
    // GM: escuta `player:join` e responde com snapshot imediato.
    function handleMessage(msg: BroadcastMessage) {
      if (msg.senderId === senderId) return; // ignora próprias

      if (!isGM && msg.type === "gm:state-sync") {
        applyingRemoteSync = true;
        try {
          // setState com objeto parcial: Zustand faz merge shallow.
          useGameplayStore.setState(
            msg.payload as Partial<ReturnType<typeof pickWorldState>>,
          );
        } finally {
          applyingRemoteSync = false;
        }
        return;
      }

      if (isGM && msg.type === "player:join") {
        // Novo player chegou → envia snapshot imediato (sem debounce).
        const snapshot = pickWorldState(useGameplayStore.getState());
        broadcastSend("gm:state-sync", snapshot, senderId);
        return;
      }

      // ── GM aplica ações do player no próprio store ────────────
      if (isGM && msg.type === "player:move") {
        const payload = msg.payload as {
          tokenId: string;
          x: number;
          y: number;
        };
        // Regra de ouro #3 ainda vale: validação completa só quando
        // houver backend. Por ora confiamos no client emissor.
        applyingRemoteSync = true;
        try {
          useGameplayStore
            .getState()
            .moveToken(payload.tokenId, payload.x, payload.y);
        } finally {
          applyingRemoteSync = false;
        }
        // moveToken muda world-state → agenda rebroadcast pros outros
        // players verem o movimento também.
        scheduleBroadcast();
        return;
      }

      if (isGM && msg.type === "player:chat") {
        applyingRemoteSync = true;
        try {
          useGameplayStore
            .getState()
            .addMessage(msg.payload as ChatMessage);
        } finally {
          applyingRemoteSync = false;
        }
        scheduleBroadcast();
        return;
      }

      // Pedido de movimento com aprovação: vira `pendingPlayerMove`.
      if (isGM && msg.type === "player:move-request") {
        const payload = msg.payload as import("@/lib/gameplay-store").PendingPlayerMove;
        useGameplayStore.getState().setPendingPlayerMove(payload);
        return;
      }
    }

    const unsubMessages = onBroadcastMessage(
      `gameplay-sync-${senderId}`,
      handleMessage,
    );

    // Player: anuncia chegada pra receber snapshot inicial.
    if (!isGM) {
      broadcastSend("player:join", { playerId: senderId }, senderId);
    }

    return () => {
      if (broadcastTimer) clearTimeout(broadcastTimer);
      unsubStore();
      unsubMessages();
    };
    // Só liga uma vez no mount — identidade vem da URL e não muda em runtime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Re-export pra quem quiser emitir ações `player:*` manualmente (ex:
 * quando jogador move o próprio token). Nesses casos, chame este helper
 * e o GM vai receber — por enquanto o handler é só log/stub, será
 * implementado quando as ações do player virarem features.
 */
export function emitPlayerAction(
  type:
    | "player:move"
    | "player:chat"
    | "player:roll"
    | "player:end-turn",
  payload: unknown,
) {
  const { id } = getIdentityFromUrl();
  broadcastSend(type, payload, id);
}

// Exporta as keys pra debugging/tests.
export { WORLD_STATE_KEYS };
