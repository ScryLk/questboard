"use client";

import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ModalShell } from "./modal-shell";

interface EndSessionModalProps {
  onClose: () => void;
}

export function EndSessionModal({ onClose }: EndSessionModalProps) {
  const router = useRouter();

  return (
    <ModalShell title="Encerrar Sessao" maxWidth={400} onClose={onClose}>
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-danger/15">
          <AlertTriangle className="h-6 w-6 text-brand-danger" />
        </div>
        <p className="mb-1 text-sm font-medium text-brand-text">
          Tem certeza que deseja encerrar?
        </p>
        <p className="text-xs text-brand-muted">
          Todos os jogadores serao desconectados e o progresso da sessao sera
          salvo automaticamente.
        </p>
      </div>

      {/* Options */}
      <div className="mb-5 space-y-2">
        <label className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-primary p-3 text-xs text-brand-text">
          <input
            type="checkbox"
            defaultChecked
            className="accent-brand-accent"
          />
          Salvar notas da sessao
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-primary p-3 text-xs text-brand-text">
          <input
            type="checkbox"
            defaultChecked
            className="accent-brand-accent"
          />
          Manter posicao dos tokens
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="h-9 rounded-lg border border-brand-border px-4 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            onClose();
            router.push("/dashboard");
          }}
          className="h-9 rounded-lg bg-brand-danger px-4 text-xs font-medium text-white transition-colors hover:bg-brand-danger/90"
        >
          Encerrar Sessao
        </button>
      </div>
    </ModalShell>
  );
}
