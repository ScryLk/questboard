"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "qb.target-panel.collapse";

/**
 * Persiste o estado aberto/fechado de cada bloco do painel Alvo em
 * localStorage, por usuário/dispositivo. Chave é o id do bloco.
 *
 * `defaultOpen` só é usado na primeira vez (quando ainda não há valor
 * salvo) — se o usuário fechou manualmente uma vez, respeitamos a escolha.
 */
export function useBlockCollapse(
  blockId: string,
  defaultOpen = true,
): [boolean, () => void] {
  const [open, setOpen] = useState(defaultOpen);

  // Hidrata do localStorage no mount (SSR-safe).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const map = JSON.parse(raw) as Record<string, boolean>;
      if (blockId in map) setOpen(map[blockId]);
    } catch {
      // JSON inválido — ignora e mantém default.
    }
  }, [blockId]);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          const map = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
          map[blockId] = next;
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
        } catch {
          // Storage cheio / privado — não falha a UI.
        }
      }
      return next;
    });
  }, [blockId]);

  return [open, toggle];
}
