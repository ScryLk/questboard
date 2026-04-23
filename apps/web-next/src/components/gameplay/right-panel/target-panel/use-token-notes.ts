"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "qb.target-panel.gm-notes";

/**
 * Notas privadas do GM por token, persistidas em localStorage.
 *
 * Escopo temporário: quando existir backend, migrar pro model
 * `TokenNote` (ver prompt do menu contextual, seção 5.1). A interface do
 * hook fica estável pra facilitar esse swap.
 *
 * Autosave com debounce de 600ms pra não escrever a cada tecla.
 */
export function useTokenNotes(tokenId: string | null) {
  const [text, setText] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hidrata ao trocar de token.
  useEffect(() => {
    if (!tokenId || typeof window === "undefined") {
      setText("");
      return;
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
      setText(map[tokenId] ?? "");
    } catch {
      setText("");
    }
  }, [tokenId]);

  // Limpa timer pendente ao desmontar pra evitar write após unmount.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const update = useCallback(
    (next: string) => {
      setText(next);
      if (!tokenId || typeof window === "undefined") return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
          if (next.trim() === "") {
            delete map[tokenId];
          } else {
            map[tokenId] = next;
          }
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
        } catch {
          // ignore
        }
      }, 600);
    },
    [tokenId],
  );

  return { text, update };
}
