"use client";

import { useState } from "react";
import { AlertTriangle, Award, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ModalShell } from "./modal-shell";
import { awardSessionXp } from "@/lib/xp-api";

interface EndSessionModalProps {
  onClose: () => void;
  /** UUID da sessão no backend. Null = modo local; pula concessão de XP. */
  sessionId?: string | null;
}

export function EndSessionModal({ onClose, sessionId }: EndSessionModalProps) {
  const router = useRouter();
  const [xpAmount, setXpAmount] = useState<string>("0");
  const [reason, setReason] = useState<string>("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (pending) return;
    const amount = Number.parseInt(xpAmount, 10) || 0;
    setError(null);

    if (amount > 0 && sessionId) {
      setPending(true);
      try {
        await awardSessionXp(sessionId, {
          amount,
          reason: reason.trim() || undefined,
        });
      } catch (err) {
        setError(
          (err as { message?: string }).message ??
            "Não foi possível dar XP. A sessão NÃO foi encerrada.",
        );
        setPending(false);
        return;
      }
    }

    onClose();
    router.push("/dashboard");
  }

  return (
    <ModalShell title="Encerrar Sessão" maxWidth={460} onClose={onClose}>
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-danger/15">
          <AlertTriangle className="h-6 w-6 text-brand-danger" />
        </div>
        <p className="mb-1 text-sm font-medium text-brand-text">
          Tem certeza que deseja encerrar?
        </p>
        <p className="text-xs text-brand-muted">
          Todos os jogadores serão desconectados e o progresso da sessão será
          salvo automaticamente.
        </p>
      </div>

      {/* XP — só quando temos sessionId real */}
      {sessionId && (
        <div className="mb-5 rounded-lg border border-brand-accent/20 bg-brand-accent/5 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Award className="h-4 w-4 text-brand-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-accent">
              Recompensa de XP
            </span>
          </div>
          <p className="mb-3 text-[11px] text-brand-muted">
            Aplica pra todos os personagens dos jogadores. Deixe em 0 pra pular.
          </p>
          <div className="space-y-2">
            <label className="block">
              <span className="mb-1 block text-[11px] text-brand-muted">
                XP por jogador
              </span>
              <input
                type="number"
                min={0}
                max={100000}
                value={xpAmount}
                onChange={(e) => setXpAmount(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-brand-primary px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] text-brand-muted">
                Razão (opcional)
              </span>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                placeholder="Ex: Derrotaram o dragão vermelho"
                className="w-full rounded-md border border-white/10 bg-brand-primary px-3 py-2 text-sm text-white outline-none placeholder:text-brand-muted focus:border-brand-accent"
              />
            </label>
          </div>
        </div>
      )}

      <div className="mb-5 space-y-2">
        <label className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-primary p-3 text-xs text-brand-text">
          <input
            type="checkbox"
            defaultChecked
            className="accent-brand-accent"
          />
          Salvar notas da sessão
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-primary p-3 text-xs text-brand-text">
          <input
            type="checkbox"
            defaultChecked
            className="accent-brand-accent"
          />
          Manter posição dos tokens
        </label>
      </div>

      {error && (
        <p className="mb-3 rounded-md border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-[11px] text-rose-300">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="h-9 cursor-pointer rounded-lg border border-brand-border px-4 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={pending}
          className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-brand-danger px-4 text-xs font-medium text-white transition-colors hover:bg-brand-danger/90 disabled:opacity-50"
        >
          {pending && <Loader2 className="h-3 w-3 animate-spin" />}
          Encerrar Sessão
        </button>
      </div>
    </ModalShell>
  );
}
