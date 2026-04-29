"use client";

// ── Bridge: Socket.IO `npc:*` → useNpcConversationStore ──
//
// Hook que liga os eventos do namespace `/session` aos updates da
// store. Monta no NpcConversationModal quando o modo é "backend" —
// mantém o log sincronizado entre múltiplos clientes (player,
// outros players, GM).
//
// Re-emite mensagens via `applyServerMessage` (idempotente). Eventos
// de fechamento marcam `finished=true` na store.

import { useEffect } from "react";
import { useNpcConversationStore } from "./npc-conversation-store";
import {
  joinSession,
  subscribe,
  type SessionSocketConfig,
} from "./session-socket";
import type { ConversationMessageDto } from "./npc-api";

export interface NpcSocketBridgeOptions extends SessionSocketConfig {
  /** Quando true, força reconexão a cada montagem. Default: false. */
  forceConnect?: boolean;
}

/** Liga listeners para a sessão ativa enquanto o componente estiver
 *  montado. Não-op se `mode !== "backend"`. */
export function useNpcSocketBridge(opts: NpcSocketBridgeOptions = {}): void {
  const mode = useNpcConversationStore((s) => s.mode);
  const sessionId = useNpcConversationStore((s) => s.sessionId);
  const conversationId = useNpcConversationStore((s) => s.conversationId);
  const applyServerMessage = useNpcConversationStore(
    (s) => s.applyServerMessage,
  );

  useEffect(() => {
    if (mode !== "backend" || !sessionId) return;

    let cleanedUp = false;
    const cleanups: Array<() => void> = [];

    (async () => {
      try {
        await joinSession(sessionId);
        if (cleanedUp) return;

        // npc:message — trigger + response chegando do servidor.
        cleanups.push(
          subscribe<{
            conversationId: string;
            sessionId: string;
            message: ConversationMessageDto;
            finished: boolean;
          }>("npc:message", (payload) => {
            if (payload.conversationId !== conversationId) return;
            applyServerMessage(payload.message, payload.finished);
          }),
        );

        // npc:conversation-closed — encerrada por finalize ou interrupt.
        cleanups.push(
          subscribe<{
            conversationId: string;
            reason: "finished" | "interrupted";
          }>("npc:conversation-closed", (payload) => {
            if (payload.conversationId !== conversationId) return;
            useNpcConversationStore.setState({ finished: true });
          }),
        );
      } catch (err) {
        // Falha ao conectar — frontend continua funcional em modo
        // optimistic; o store já refletiu via REST.
        // eslint-disable-next-line no-console
        console.warn("[npc-socket-bridge] join falhou:", err);
      }
    })();

    return () => {
      cleanedUp = true;
      cleanups.forEach((fn) => fn());
    };
  }, [mode, sessionId, conversationId, applyServerMessage]);

  void opts;
}
