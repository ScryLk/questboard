"use client";

// Bridge entre o `mission-context-store` e o backend / socket.
//
// `useMissionContextSync(sessionId)` (montar em GameplayLayout e
// PlayerViewLayout):
//   - Faz GET inicial e popula o store.
//   - Escuta `session:mission-context-updated` no socket /session;
//     atualiza o store quando o evento vem da mesma sessionId.
//
// `useMissionContextAutoSave(canEdit)` (montar SÓ pra GM):
//   - Observa `dirty` no store e dispara um PATCH com debounce 750ms
//     após a última edição. Players nunca devem chamar isso.

import { useEffect, useRef } from "react";
import { useMissionContextStore } from "./mission-context-store";
import {
  getMissionContext,
  setMissionContext,
} from "./mission-context-api";
import { subscribe } from "./session-socket";

interface MissionContextSocketPayload {
  sessionId: string;
  content: string;
  by: string;
  at: string;
}

const DEBOUNCE_MS = 750;

export function useMissionContextSync(sessionId: string | null): void {
  const hydrate = useMissionContextStore((s) => s.hydrate);
  const setLoading = useMissionContextStore((s) => s.setLoading);
  const reset = useMissionContextStore((s) => s.reset);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    setLoading(true);

    // Initial fetch — em paralelo com a subscription do socket pra
    // não perder a primeira atualização entre o GET e o listen.
    void getMissionContext(sessionId)
      .then(({ content }) => {
        if (cancelled) return;
        hydrate(sessionId, content);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[mission-context] hydrate failed", err);
        // Mesmo em erro, deixa o store consistente (sessionId apontado,
        // content vazio). Senão a UI fica "loading..." pra sempre.
        hydrate(sessionId, "");
      });

    const unsub = subscribe<MissionContextSocketPayload>(
      "session:mission-context-updated",
      (payload) => {
        if (cancelled) return;
        if (payload.sessionId !== sessionId) return;
        hydrate(sessionId, payload.content);
      },
    );

    return () => {
      cancelled = true;
      unsub();
      // Reset só se o caller mudou de sessão (sessionId vai pra null
      // antes do próximo render). Mantemos o store entre renders da
      // mesma sessionId pra evitar flash.
    };
  }, [sessionId, hydrate, setLoading]);

  // Reset ao desmontar de vez (componente sai da árvore).
  useEffect(() => {
    return () => {
      // Use store.getState pra evitar dependência reativa.
      const cur = useMissionContextStore.getState();
      if (cur.sessionId) reset();
    };
    // Quer rodar uma vez por mount; deps vazios é proposital.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Auto-save pro GM: dispara PATCH 750ms após a última edição. Sem
 *  reentrância — espera o save anterior terminar antes de outro.
 *  Players NUNCA devem chamar (modal é readOnly), então o `canEdit`
 *  guard cobre o caso de chamada acidental. */
export function useMissionContextAutoSave(canEdit: boolean): void {
  const dirty = useMissionContextStore((s) => s.dirty);
  const content = useMissionContextStore((s) => s.content);
  const sessionId = useMissionContextStore((s) => s.sessionId);
  const setSaving = useMissionContextStore((s) => s.setSaving);
  const markClean = useMissionContextStore((s) => s.markClean);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!canEdit) return;
    if (!dirty) return;
    if (!sessionId) return;
    if (inFlightRef.current) return;

    const handle = setTimeout(async () => {
      inFlightRef.current = true;
      setSaving(true);
      try {
        await setMissionContext(sessionId, content);
        // Backend emite socket → outros clients reidratam. O próprio
        // GM já tem `content` local correto, então só limpa o dirty.
        markClean();
      } catch (err) {
        console.error("[mission-context] save failed", err);
        // Mantém dirty=true; o próximo edit retriga o timer.
      } finally {
        setSaving(false);
        inFlightRef.current = false;
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [canEdit, dirty, content, sessionId, setSaving, markClean]);
}
