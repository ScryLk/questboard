"use client";

// Bridge: tokens do backend → usePlayerViewStore (myToken + visibleTokens).
// O canvas do player (PlayerCanvas) lê do store; aqui populamos com
// dados reais e mantemos sincronizado via socket.

import { useEffect } from "react";
import { usePlayerViewStore, type PlayerToken } from "@/lib/player-view-store";
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
  const { tokens } = useSessionTokens(sessionId);

  useEffect(() => {
    if (!sessionId || !me) return;

    const myTokenDto = tokens.find((t) => t.ownerId === me.id) ?? null;
    const myToken = myTokenDto ? toPlayerToken(myTokenDto, true) : null;
    const visibleTokens = tokens.map((t) =>
      toPlayerToken(t, t.ownerId === me.id),
    );

    usePlayerViewStore.setState({ myToken, visibleTokens });
  }, [sessionId, me, tokens]);
}
