"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";
import { broadcastSend } from "@/lib/broadcast-sync";

interface Props {
  onClose: () => void;
}

/**
 * Confirmação dupla pra sair. Fallback: sem handler de backend, apenas
 * emite broadcast e redireciona. Quando backend existir, chamar
 * `session:leave` antes do router.push.
 */
export function LeaveSessionDialog({ onClose }: Props) {
  const router = useRouter();
  const sessionCode = usePlayerViewStore((s) => s.sessionCode);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleLeave = () => {
    broadcastSend("player:leave", { sessionCode }, "player");
    router.push("/campanhas");
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-brand-border bg-[#0D0D12] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4 text-brand-danger" />
            <h2 className="text-sm font-semibold text-brand-text">
              Sair desta sessão?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-4">
          <p className="text-xs leading-relaxed text-brand-text/80">
            Você pode voltar depois usando o código:
          </p>
          <div className="mt-2 rounded-lg border border-brand-border bg-white/[0.03] px-3 py-2 text-center">
            <span className="text-lg font-bold tabular-nums tracking-widest text-brand-accent">
              {sessionCode || "—"}
            </span>
          </div>
          <p className="mt-3 text-[11px] text-brand-muted">
            Seu personagem e progresso serão preservados.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-brand-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-brand-border px-3 py-1.5 text-xs text-brand-text transition-colors hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleLeave}
            className="flex cursor-pointer items-center gap-1.5 rounded-md bg-brand-danger px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-danger/80"
          >
            <LogOut className="h-3 w-3" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
