"use client";

// Bridge: tokens do backend (sessions/:id/maps/:mid/tokens + socket)
// → useGameplayStore.tokens. O canvas Pixi e o resto da UI continuam
// lendo do store local; aqui só populamos com dados reais.
//
// Mapeia TokenDto → GameToken. Campos sem equivalente direto recebem
// defaults razoáveis. UI move/edit ainda fala com a store local; a
// sincronização reversa (mutações → backend) fica pra outro PR.

import { useEffect } from "react";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { GameToken } from "@/lib/gameplay-mock-data";
import { useSessionTokens } from "./use-session-tokens";
import type { TokenDto } from "@/lib/session-tokens-api";

function toGameToken(dto: TokenDto): GameToken {
  return {
    id: dto.id,
    name: dto.label ?? "Sem nome",
    alignment: "ally",
    hp: dto.currentHp ?? dto.maxHp ?? 0,
    maxHp: dto.maxHp ?? 0,
    ac: dto.ac ?? 10,
    initiative: 0,
    size: dto.size ?? 1,
    x: dto.x,
    y: dto.y,
    onMap: true,
    conditions: [],
    visibility: "visible",
    speed: 30,
    playerId: dto.ownerId ?? undefined,
    icon: dto.imageUrl ?? undefined,
    label: dto.initials ?? undefined,
  };
}

export function useTokensBridge(sessionId: string | null): void {
  const { tokens } = useSessionTokens(sessionId);

  useEffect(() => {
    if (!sessionId) return;
    // Replace total: numa sessão real, a fonte de verdade são os
    // tokens do backend. Tokens mock locais ficam só no modo offline.
    useGameplayStore.setState(() => ({
      tokens: tokens.map(toGameToken),
    }));
  }, [sessionId, tokens]);
}
