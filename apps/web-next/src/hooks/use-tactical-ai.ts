"use client";

import { useState, useCallback } from "react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useCustomCreaturesStore } from "@/lib/custom-creatures-store";
import { CREATURE_COMPENDIUM } from "@/lib/creature-data";
import type { TacticalRequest, TacticalResponse } from "@/lib/ai-types";
import type { GameToken } from "@/lib/gameplay-mock-data";

export function useTacticalAI() {
  const [suggestion, setSuggestion] = useState<TacticalResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggest = useCallback(async (npcToken: GameToken, combatRound: number) => {
    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const state = useGameplayStore.getState();
      const customCreatures = useCustomCreaturesStore.getState().creatures;

      // Look up creature data
      const creatureId = state.tokenCreatureMap[npcToken.id];
      let npcCreature = null;
      if (creatureId) {
        npcCreature =
          CREATURE_COMPENDIUM.find((c) => c.id === creatureId) ??
          customCreatures.find((c) => c.id === creatureId) ??
          null;
      }

      const body: TacticalRequest = {
        npcToken: {
          id: npcToken.id,
          name: npcToken.name,
          hp: npcToken.hp,
          maxHp: npcToken.maxHp,
          ac: npcToken.ac,
          x: npcToken.x,
          y: npcToken.y,
          conditions: [...npcToken.conditions],
          speed: npcToken.speed,
        },
        npcCreature,
        allTokens: state.tokens
          .filter((t) => t.onMap && t.id !== npcToken.id)
          .map((t) => ({
            id: t.id,
            name: t.name,
            alignment: t.alignment,
            hp: t.hp,
            maxHp: t.maxHp,
            ac: t.ac,
            x: t.x,
            y: t.y,
            conditions: [...t.conditions],
            size: t.size,
          })),
        combatRound,
        gridCellSizeFt: 5,
      };

      const res = await fetch("/api/ai/tactical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao chamar IA tática");
      }

      const data: TacticalResponse = await res.json();
      setSuggestion(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const dismiss = useCallback(() => {
    setSuggestion(null);
    setError(null);
  }, []);

  return { suggest, isLoading, suggestion, error, dismiss };
}
