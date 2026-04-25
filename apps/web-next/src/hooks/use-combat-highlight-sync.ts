"use client";

// Observa combat store + gameplay store e atualiza o CombatHighlight
// (singleton) com a posição do token do turno atual. Rodar uma vez no
// topo de um componente que só existe durante gameplay.

import { useEffect } from "react";
import { getCombatHighlight } from "@/lib/combat-highlight";
import { useCombatStore } from "@/lib/combat-store";
import { useGameplayStore } from "@/lib/gameplay-store";

export function useCombatHighlightSync(): void {
  useEffect(() => {
    function update(): void {
      const highlight = getCombatHighlight();
      if (!highlight) return;

      const combat = useCombatStore.getState().combat;
      if (!combat?.isActive) {
        highlight.setTarget(null);
        return;
      }

      const current = combat.participants[combat.currentIndex];
      if (!current) {
        highlight.setTarget(null);
        return;
      }

      const token = useGameplayStore
        .getState()
        .tokens.find((t) => t.id === current.tokenId);

      highlight.setTarget(
        token && token.onMap
          ? { x: token.x, y: token.y, size: token.size }
          : null,
      );
    }

    // Primeira sincronização + subscribe a mudanças relevantes.
    update();
    const unsubCombat = useCombatStore.subscribe(update);
    const unsubGameplay = useGameplayStore.subscribe(update);

    return () => {
      unsubCombat();
      unsubGameplay();
      getCombatHighlight()?.setTarget(null);
    };
  }, []);
}
