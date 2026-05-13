"use client";

// ── Dev cross-tab sync para media-broadcast-store ──
//
// Em produção, `media:show` / `media:hide` chegam via Socket.IO. Em
// dev offline (sem backend), usamos BroadcastChannel pra que a aba
// do player veja o vídeo que o GM exibiu na própria aba.
//
// GM: emite `gm:media-show` / `gm:media-hide` quando `active` muda.
// Player: aplica via `applyServerEvent` (idempotente).

import { useEffect } from "react";
import {
  broadcastSend,
  onBroadcastMessage,
  type BroadcastMessage,
} from "./broadcast-sync";
import { useMediaBroadcastStore } from "./media-broadcast-store";
import { getIdentityFromUrl } from "./gameplay-sync/use-identity-from-url";
import type { ActiveMediaDto } from "./media-api";

let applyingRemote = false;

export function useMediaBroadcastDevSync(): void {
  useEffect(() => {
    const { isGM, id: identityId } = getIdentityFromUrl();
    const senderId = isGM ? "gm" : identityId;

    // GM: re-emite a mídia ativa quando muda.
    let lastActive: ActiveMediaDto | null = null;
    const unsubStore = isGM
      ? useMediaBroadcastStore.subscribe((state) => {
          if (applyingRemote) return;
          const next = state.active;
          if (next === lastActive) return;
          lastActive = next;
          if (next) {
            broadcastSend("gm:media-show", next, senderId);
          } else {
            broadcastSend("gm:media-hide", null, senderId);
          }
        })
      : () => {};

    // Player: aplica eventos do GM.
    function handleMessage(msg: BroadcastMessage) {
      if (msg.senderId === senderId) return;

      if (!isGM && msg.type === "gm:media-show") {
        applyingRemote = true;
        try {
          useMediaBroadcastStore
            .getState()
            .applyServerEvent(msg.payload as ActiveMediaDto);
        } finally {
          applyingRemote = false;
        }
        return;
      }

      if (!isGM && msg.type === "gm:media-hide") {
        applyingRemote = true;
        try {
          useMediaBroadcastStore.getState().applyServerEvent(null);
        } finally {
          applyingRemote = false;
        }
        return;
      }

      // Novo player chegou — GM re-emite estado atual (snapshot).
      if (isGM && msg.type === "player:join") {
        const current = useMediaBroadcastStore.getState().active;
        if (current) {
          broadcastSend("gm:media-show", current, senderId);
        }
        return;
      }
    }

    const unsubMessages = onBroadcastMessage(
      `media-broadcast-${senderId}`,
      handleMessage,
    );

    return () => {
      unsubStore();
      unsubMessages();
    };
  }, []);
}
