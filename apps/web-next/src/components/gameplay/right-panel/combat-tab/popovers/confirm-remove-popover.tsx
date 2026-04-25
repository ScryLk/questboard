"use client";

// Confirmação destrutiva — Remover do combate.
// Reusa PopoverShell para visual consistente.

import { useEffect, useRef } from "react";
import { PopoverShell } from "./popover-shell";

interface Props {
  participantName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmRemovePopover({
  participantName,
  onConfirm,
  onClose,
}: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    btnRef.current?.focus();
  }, []);

  return (
    <PopoverShell title="Remover do combate" onClose={onClose}>
      <p className="text-xs text-brand-text">
        Remover <span className="font-semibold">{participantName}</span> do
        combate?
      </p>
      <p className="mt-1 text-[10px] text-brand-muted">
        Esta ação pode ser desfeita no histórico de ações.
      </p>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-md border border-brand-border px-3 py-1.5 text-xs font-medium text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
        >
          Cancelar
        </button>
        <button
          ref={btnRef}
          onClick={() => {
            onConfirm();
            onClose();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onConfirm();
              onClose();
            }
          }}
          className="rounded-md bg-brand-danger/20 px-3 py-1.5 text-xs font-semibold text-brand-danger transition-colors hover:bg-brand-danger/30"
        >
          Remover
        </button>
      </div>
    </PopoverShell>
  );
}
