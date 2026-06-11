"use client";

// Menu contextual da lista de jogadores. Right-click em um membro
// abre em (x, y) do click. Esc/click-outside fecha.
//
// Hoje só tem "Ressincronizar" — útil quando o jogador trava com
// estado stale ou não consegue acessar a sessão. Backend roda
// `syncPlayerTokenOnConnect` (backfila HP/recria token se sumiu) e
// emite `player:force-resync` na sala; o client do alvo recarrega.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RefreshCw, UserPlus } from "lucide-react";
import { MenuItem } from "../right-panel/combat-tab/context-menu/menu-item";

export type PlayerContextMenuAction =
  | { kind: "resync" }
  | { kind: "assignCharacter" };

interface Props {
  playerName: string;
  /** Coordenadas viewport do click direito. */
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: PlayerContextMenuAction) => void;
}

export function PlayerListContextMenu({
  playerName,
  x,
  y,
  onClose,
  onAction,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number }>({
    left: x,
    top: y,
  });

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const pad = 8;
    let left = x;
    let top = y;
    if (left + rect.width > window.innerWidth - pad) {
      left = Math.max(pad, window.innerWidth - rect.width - pad);
    }
    if (top + rect.height > window.innerHeight - pad) {
      top = Math.max(pad, window.innerHeight - rect.height - pad);
    }
    if (left !== pos.left || top !== pos.top) setPos({ left, top });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={ref}
      role="menu"
      aria-label={`Ações para ${playerName}`}
      className="fixed z-[105] w-56 rounded-md border border-brand-border bg-brand-surface py-1 shadow-2xl"
      style={{ left: pos.left, top: pos.top }}
    >
      <MenuItem
        icon={UserPlus}
        label="Atribuir personagem..."
        onClick={() => onAction({ kind: "assignCharacter" })}
      />
      <MenuItem
        icon={RefreshCw}
        label="Ressincronizar jogador"
        onClick={() => onAction({ kind: "resync" })}
      />
    </div>,
    document.body,
  );
}
