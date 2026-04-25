"use client";

import { useEffect } from "react";

interface CombatShortcutHandlers {
  onNextTurn: () => void;
  onPreviousTurn: () => void;
  onRollAllInitiative: () => void;
  onEndCombat: () => void;
}

/** Escuta atalhos globais do GM quando combate está ativo.
 *  Desabilita automaticamente se o foco está em input/textarea/contenteditable. */
export function useCombatShortcuts(
  active: boolean,
  handlers: CombatShortcutHandlers,
) {
  useEffect(() => {
    if (!active) return;

    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target) {
        const isEditable =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;
        if (isEditable) return;
      }

      if (e.key === " " && e.shiftKey) {
        e.preventDefault();
        handlers.onPreviousTurn();
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        handlers.onNextTurn();
        return;
      }
      if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        handlers.onRollAllInitiative();
        return;
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handlers.onEndCombat();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, handlers]);
}
