"use client";

import { useCombatStore } from "@/lib/combat-store";
import type { CombatParticipant } from "@questboard/types";

/** Participante cujo turno está ativo, ou null. */
export function useCurrentTurn(): CombatParticipant | null {
  return useCombatStore((s) => {
    if (!s.combat) return null;
    return s.combat.participants[s.combat.currentIndex] ?? null;
  });
}

export function useCurrentTurnTokenId(): string | null {
  return useCombatStore((s) => {
    if (!s.combat) return null;
    return s.combat.participants[s.combat.currentIndex]?.tokenId ?? null;
  });
}
