"use client";

// Lógica de nomeação auto-incrementada para "Duplicar participante" do
// combat tracker.
//
// Regras:
//   - Remove sufixo "(N)" do nome de origem antes de calcular base.
//   - Conta ocorrências do baseName entre os participantes.
//   - Próximo índice = max(N existente, count) + 1.
//
// Cliente computa o nome para evitar corrida em duplicações rápidas.
// Backend pode reconciliar se houver colisão.

import { useCallback } from "react";
import type { CombatParticipant } from "@questboard/types";
import { useCombatStore } from "@/lib/combat-store";
import { useCombatActions } from "./use-combat-actions";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Exposta para teste unitário. */
export function computeDuplicateName(
  sourceName: string,
  participants: readonly CombatParticipant[],
): string {
  const baseName = sourceName.replace(/\s*\(\d+\)\s*$/, "").trim();
  // Match exato do base ou base seguido de "(N)".
  const regex = new RegExp(
    `^${escapeRegex(baseName)}(?:\\s*\\((\\d+)\\))?$`,
  );

  let highestSuffix = 1; // base sem sufixo conta como (1)
  let count = 0;
  for (const p of participants) {
    const m = regex.exec(p.name);
    if (!m) continue;
    count += 1;
    if (m[1]) {
      const n = parseInt(m[1], 10);
      if (Number.isFinite(n) && n > highestSuffix) highestSuffix = n;
    }
  }
  // Próximo livre é max(highest suffix, count) + 1.
  const nextIndex = Math.max(highestSuffix, count) + 1;
  return `${baseName} (${nextIndex})`;
}

export function useDuplicateParticipant() {
  const actions = useCombatActions(
    useCombatStore.getState().combat?.sessionId ?? "mock-session",
  );
  return useCallback(
    (sourceTokenId: string) => {
      const combat = useCombatStore.getState().combat;
      if (!combat) return;
      const source = combat.participants.find(
        (p) => p.tokenId === sourceTokenId,
      );
      if (!source) return;
      const autoName = computeDuplicateName(source.name, combat.participants);
      actions.duplicateParticipant(sourceTokenId, autoName);
    },
    [actions],
  );
}
