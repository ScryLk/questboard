"use client";

// Hook que mantém a lista de jogadores de uma sessão sincronizada.
// Fetch inicial via REST + atualiza com socket `session:player-joined`.

import { useEffect, useState } from "react";
import {
  listSessionPlayers,
  type SessionPlayerDto,
} from "@/lib/session-players-api";
import { joinSession, subscribe } from "@/lib/session-socket";

interface State {
  players: SessionPlayerDto[];
  loading: boolean;
  error: string | null;
}

export function useSessionPlayers(sessionId: string | null): State & {
  refetch: () => void;
} {
  const [state, setState] = useState<State>({
    players: [],
    loading: sessionId !== null,
    error: null,
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setState({ players: [], loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));

    async function load() {
      try {
        const players = await listSessionPlayers(sessionId!);
        if (cancelled) return;
        setState({ players, loading: false, error: null });
      } catch (err) {
        if (cancelled) return;
        setState({
          players: [],
          loading: false,
          error:
            (err as { message?: string }).message ??
            "Falha ao carregar jogadores.",
        });
      }
    }

    void load();

    // Socket bridge: join session + listen player-joined.
    const cleanups: Array<() => void> = [];
    (async () => {
      try {
        await joinSession(sessionId!);
        if (cancelled) return;
        cleanups.push(
          subscribe<{
            sessionId: string;
            player: SessionPlayerDto;
          }>("session:player-joined", (payload) => {
            if (payload.sessionId !== sessionId) return;
            setState((s) => {
              if (s.players.some((p) => p.userId === payload.player.userId))
                return s;
              return { ...s, players: [...s.players, payload.player] };
            });
          }),
        );
      } catch {
        // Sem socket — REST inicial já carregou. Refetch manual via tick.
      }
    })();

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, tick]);

  return { ...state, refetch: () => setTick((t) => t + 1) };
}
