"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { PlayerDiceTab } from "../tabs/PlayerDiceTab";

interface Props {
  onClose: () => void;
}

/**
 * Popover ancorado na bar que embrulha o `PlayerDiceTab` existente.
 * Fica aberto enquanto o jogador rola (regra 13.2). Fecha no Esc e no
 * clique fora.
 */
export function DicePopover({ onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="flex max-h-[480px] w-[320px] flex-col overflow-hidden rounded-lg border border-brand-border bg-[#0D0D12] shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-brand-border px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-text">
          Rolagem
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          aria-label="Fechar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <PlayerDiceTab />
      </div>
    </div>
  );
}
