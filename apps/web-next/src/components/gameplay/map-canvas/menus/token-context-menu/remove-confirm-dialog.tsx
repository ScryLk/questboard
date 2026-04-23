"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

interface RemoveConfirmDialogProps {
  tokenName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmação destrutiva pra "Remover do Mapa" — padrão do prompt
 * (seção 5.12). Portalado pro document.body pra escapar do z-index
 * do menu contextual e receber cliques/teclas globais.
 *
 * O texto menciona "desfazer com Ctrl+Z por 60 segundos" — isso é PR #2
 * (soft delete + undo). Hoje a remoção é hard.
 */
export function RemoveConfirmDialog({
  tokenName,
  onConfirm,
  onCancel,
}: RemoveConfirmDialogProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, onConfirm]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-sm flex-col overflow-y-auto rounded-xl border border-brand-border bg-[#16161D] shadow-2xl">
        <div className="flex items-start gap-3 px-4 pb-2 pt-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-danger/15">
            <AlertTriangle className="h-4 w-4 text-brand-danger" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-brand-text">
              Remover &ldquo;{tokenName}&rdquo; do mapa?
            </h2>
            <p className="mt-1 text-xs text-brand-muted">
              O token será retirado da cena atual. Você pode re-adicionar
              pela biblioteca de tokens depois.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-brand-border bg-[#111116] px-4 py-3">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-lg px-3 py-1.5 text-xs text-brand-muted transition-colors hover:bg-white/[0.05] hover:text-brand-text"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer rounded-lg bg-brand-danger px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-danger/90"
          >
            Remover
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
