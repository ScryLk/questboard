"use client";

import type { CombatParticipant } from "@questboard/types";
import { useCombatStore } from "@/lib/combat-store";

/** Leitura pura do estado canônico de combate. */
export function useCombatState() {
  return useCombatStore((s) => s.combat);
}

export function useCombatIsActive() {
  return useCombatStore((s) => s.combat?.isActive ?? false);
}

export function useCombatRound() {
  return useCombatStore((s) => s.combat?.round ?? 0);
}

// Constante estável para o caso sem combate. Derivar `[]` dentro do
// selector quebra o getSnapshot do useSyncExternalStore.
const EMPTY_PARTICIPANTS: readonly CombatParticipant[] = [];
export function useCombatParticipants(): readonly CombatParticipant[] {
  return useCombatStore((s) => s.combat?.participants ?? EMPTY_PARTICIPANTS);
}

export function useCombatConfig() {
  return useCombatStore((s) => s.combat?.config ?? null);
}
