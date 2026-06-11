"use client";

// Bridge: tokens do backend → usePlayerViewStore (myToken + visibleTokens).
// O canvas do player (PlayerCanvas) lê do store; aqui populamos com
// dados reais e mantemos sincronizado via socket.

import { useEffect } from "react";
import { usePlayerViewStore, type PlayerToken } from "@/lib/player-view-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useMe } from "./use-me";
import { useSessionTokens } from "./use-session-tokens";
import type { TokenDto } from "@/lib/session-tokens-api";

function toPlayerToken(dto: TokenDto, isMe: boolean): PlayerToken {
  return {
    id: dto.id,
    x: dto.x,
    y: dto.y,
    size: dto.size ?? 1,
    name: dto.label ?? "Token",
    type: isMe ? "ally" : "neutral",
    icon: dto.imageUrl ?? undefined,
    isMe,
    hp: dto.currentHp ?? undefined,
    maxHp: dto.maxHp ?? undefined,
    conditions: [],
    isInvisibleDetected: false,
  };
}

export function usePlayerTokensBridge(sessionId: string | null): void {
  const me = useMe();
  const { tokens, map } = useSessionTokens(sessionId);

  useEffect(() => {
    if (!sessionId || !me) return;

    const myTokenDto = tokens.find((t) => t.ownerId === me.id) ?? null;
    const myToken = myTokenDto ? toPlayerToken(myTokenDto, true) : null;
    const visibleTokens = tokens.map((t) =>
      toPlayerToken(t, t.ownerId === me.id),
    );

    // Mapa ativo vem junto do mesmo endpoint que lista os tokens
    // (GET /sessions/:id/maps → primeiro com isActive). Sem propagar
    // aqui o PlayerCanvas fica eterno em "Sem mapa ativo" mesmo com o
    // GM tendo cena ativa no backend.
    usePlayerViewStore.setState({
      myToken,
      visibleTokens,
      activeMapId: map?.id ?? null,
      activeMapName: map?.name ?? null,
    });

    // Estruturas visuais do mapa — PlayerCanvas lê do gameplay-store
    // (mesmo store que o GM usa). Sem isso o player fica com grid vazio
    // mesmo com o GM tendo imagem de fundo no backend.
    useGameplayStore.setState({
      mapBackgroundImage: map?.imageUrl ?? map?.backgroundImage ?? null,
      mapGridOffsetX: map?.gridOffsetX ?? 0,
      mapGridOffsetY: map?.gridOffsetY ?? 0,
    });
  }, [sessionId, me, tokens, map]);
}
