"use client";

import { useEffect } from "react";

/**
 * Escuta Cmd+K (Mac) e Ctrl+K (Win/Linux). Ignora se foco está em um input,
 * textarea ou elemento contentEditable — exceto se já estamos dentro do dialog
 * da própria busca (identificado pelo data-attribute).
 */
export function useGlobalSearchShortcut(onOpen: () => void): void {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const isK = e.key === "k" || e.key === "K";
      if (!isK) return;
      if (!(e.metaKey || e.ctrlKey)) return;

      const target = e.target as HTMLElement | null;
      if (target) {
        const insideSearch = target.closest("[data-global-search]");
        const isEditable =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;
        if (isEditable && !insideSearch) return;
      }

      e.preventDefault();
      onOpen();
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpen]);
}
