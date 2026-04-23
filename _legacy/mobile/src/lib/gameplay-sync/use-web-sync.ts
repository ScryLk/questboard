// ─────────────────────────────────────────────────────────────────────
// Hook que sincroniza o mobile store com snapshots emitidos pelo GM
// via BroadcastChannel (mesmo canal usado pelo `web-next`:
// "questboard-session").
//
// Fluxo:
//  1. Mount: abre o canal e emite `player:join` com senderId
//     "mobile-dev" — o GM (web-next) vai responder com snapshot cheio.
//  2. Recebe `gm:state-sync`: traduz payload (shape web-next → mobile)
//     e aplica no store via `setState`.
//  3. Ignora mensagens com próprio senderId pra evitar loop.
//
// **Pré-requisito**: cross-origin. Veja README.md desta pasta.
// ─────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { useGameplayStore } from "../gameplay-store";
import {
  translateSnapshot,
  type WebNextSnapshot,
} from "./translate";

const CHANNEL_NAME = "questboard-session";
const SENDER_ID = "mobile-dev";

// Tipo da mensagem no canal (bate com web-next `BroadcastMessage`).
interface ProtocolMessage {
  type: string;
  payload: unknown;
  timestamp: number;
  senderId: string;
}

export function useWebSync() {
  useEffect(() => {
    // BroadcastChannel é API de browser. Em Expo Web, está disponível.
    // Em native (iOS/Android real via Expo Go) não existe → noop.
    if (typeof BroadcastChannel === "undefined") {
      if (__DEV__) {
        console.log(
          "[useWebSync] BroadcastChannel indisponível (native runtime). Sync ignorado.",
        );
      }
      return;
    }

    const channel = new BroadcastChannel(CHANNEL_NAME);

    function handle(ev: MessageEvent) {
      const msg = ev.data as ProtocolMessage | undefined;
      if (!msg || typeof msg !== "object") return;
      if (msg.senderId === SENDER_ID) return; // ignora próprias

      if (msg.type === "gm:state-sync") {
        const snapshot = msg.payload as WebNextSnapshot;
        const patch = translateSnapshot(snapshot);
        if (Object.keys(patch).length > 0) {
          useGameplayStore.setState(patch as Partial<typeof useGameplayStore.getState>);
        }
      }
    }

    channel.addEventListener("message", handle);

    // Anuncia chegada → GM responde com snapshot inicial sem debounce.
    channel.postMessage({
      type: "player:join",
      payload: { playerId: SENDER_ID },
      timestamp: Date.now(),
      senderId: SENDER_ID,
    } satisfies ProtocolMessage);

    return () => {
      channel.removeEventListener("message", handle);
      channel.close();
    };
  }, []);
}
