"use client";

// Hook que carrega tokens da mapa ativa de uma sessão e mantém
// sincronizado via socket `token:added/moved/removed`.
// O canvas (Pixi) lê via useGameplayStore — esse hook deve ser
// chamado em componente pai que faz o bridge backend→store.

import { useEffect, useState } from "react";
import {
  getActiveMap,
  listMapTokens,
  type MapLite,
  type TokenDto,
} from "@/lib/session-tokens-api";
import { joinSession, subscribe } from "@/lib/session-socket";

interface State {
  map: MapLite | null;
  tokens: TokenDto[];
  loading: boolean;
  error: string | null;
}

export function useSessionTokens(sessionId: string | null): State {
  const [state, setState] = useState<State>({
    map: null,
    tokens: [],
    loading: sessionId !== null,
    error: null,
  });

  useEffect(() => {
    if (!sessionId) {
      setState({ map: null, tokens: [], loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));

    async function load() {
      try {
        const map = await getActiveMap(sessionId!);
        if (cancelled) return;
        if (!map) {
          setState({ map: null, tokens: [], loading: false, error: null });
          return;
        }
        const tokens = await listMapTokens(sessionId!, map.id);
        if (cancelled) return;
        setState({ map, tokens, loading: false, error: null });
      } catch (err) {
        if (cancelled) return;
        setState({
          map: null,
          tokens: [],
          loading: false,
          error:
            (err as { message?: string }).message ??
            "Falha ao carregar tokens.",
        });
      }
    }

    void load();

    // Socket bridge — token lifecycle events.
    const cleanups: Array<() => void> = [];
    (async () => {
      try {
        await joinSession(sessionId!);
        if (cancelled) return;

        cleanups.push(
          subscribe<{ sessionId: string; token: TokenDto }>(
            "token:added",
            (payload) => {
              if (payload.sessionId !== sessionId) return;
              setState((s) => {
                if (s.tokens.some((t) => t.id === payload.token.id)) return s;
                return { ...s, tokens: [...s.tokens, payload.token] };
              });
            },
          ),
        );

        cleanups.push(
          subscribe<{
            sessionId: string;
            tokenId: string;
            x: number;
            y: number;
          }>("token:moved", (payload) => {
            if (payload.sessionId !== sessionId) return;
            setState((s) => ({
              ...s,
              tokens: s.tokens.map((t) =>
                t.id === payload.tokenId
                  ? { ...t, x: payload.x, y: payload.y }
                  : t,
              ),
            }));
          }),
        );

        cleanups.push(
          subscribe<{ sessionId: string; tokenId: string }>(
            "token:removed",
            (payload) => {
              if (payload.sessionId !== sessionId) return;
              setState((s) => ({
                ...s,
                tokens: s.tokens.filter((t) => t.id !== payload.tokenId),
              }));
            },
          ),
        );

        cleanups.push(
          subscribe<{
            sessionId: string;
            tokenId: string;
            changes: Partial<TokenDto>;
          }>("token:updated", (payload) => {
            if (payload.sessionId !== sessionId) return;
            setState((s) => ({
              ...s,
              tokens: s.tokens.map((t) =>
                t.id === payload.tokenId ? { ...t, ...payload.changes } : t,
              ),
            }));
          }),
        );
      } catch {
        // Sem socket — REST inicial já carregou. Sem live updates.
      }
    })();

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [sessionId]);

  return state;
}
