"use client";

// Editor de XP do personagem (GM only). Mostra XP atual + nível,
// input pra delta (positivo ou negativo), campo de razão (obrigatório
// quando subtração), histórico das últimas mudanças.
//
// Não checa permissão no client — o backend rejeita se o caller não
// for GM/CO_GM da campanha. UI apenas esconde o editor pra non-GMs.

import { useEffect, useState } from "react";
import { Award, History, Loader2, Minus, Plus } from "lucide-react";
import {
  awardCharacterXp,
  getCharacterXpHistory,
} from "@/lib/xp-api";
import type {
  XpAwardHistoryItem,
  XpAwardResult,
} from "@questboard/validators";

interface Props {
  characterId: string;
  /** Quando false, esconde inputs e mostra só histórico (read-only). */
  canEdit: boolean;
  /** Callback após sucesso — útil pro pai re-buscar dados do personagem. */
  onXpChanged?: (result: XpAwardResult) => void;
}

export function CharacterXpEditor({
  characterId,
  canEdit,
  onXpChanged,
}: Props) {
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [sign, setSign] = useState<1 | -1>(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<XpAwardHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void getCharacterXpHistory(characterId, 20)
      .then((items) => {
        if (!cancelled) {
          setHistory(items);
          setHistoryLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [characterId]);

  async function submit() {
    const value = Number.parseInt(delta, 10);
    if (!Number.isFinite(value) || value === 0) {
      setError("Digite um valor positivo.");
      return;
    }
    const signedDelta = sign * value;
    if (signedDelta < 0 && reason.trim().length < 3) {
      setError("Subtração exige razão (mín. 3 caracteres).");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const r = await awardCharacterXp(characterId, {
        delta: signedDelta,
        reason: reason.trim() || undefined,
      });
      // Atualiza histórico local sem refetch — adiciona no topo.
      setHistory((prev) => [
        {
          id: `local_${Date.now()}`,
          delta: signedDelta,
          reason: reason.trim() || null,
          sessionId: null,
          awardedById: "me",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setDelta("");
      setReason("");
      setSign(1);
      onXpChanged?.(r);
    } catch (err) {
      setError(
        (err as { message?: string }).message ?? "Falha ao salvar XP.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="rounded-lg border border-brand-accent/20 bg-brand-accent/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Award className="h-4 w-4 text-brand-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-accent">
              Ajustar XP
            </span>
          </div>

          <div className="flex gap-2">
            <div className="flex overflow-hidden rounded-md border border-white/10">
              <button
                type="button"
                onClick={() => setSign(1)}
                className={`cursor-pointer px-2 py-1 text-xs font-semibold transition-colors ${
                  sign === 1
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "text-brand-muted hover:bg-white/5"
                }`}
                aria-label="Adicionar"
              >
                <Plus className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => setSign(-1)}
                className={`cursor-pointer px-2 py-1 text-xs font-semibold transition-colors ${
                  sign === -1
                    ? "bg-rose-500/20 text-rose-300"
                    : "text-brand-muted hover:bg-white/5"
                }`}
                aria-label="Subtrair"
              >
                <Minus className="h-3 w-3" />
              </button>
            </div>
            <input
              type="number"
              min={1}
              max={100000}
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="XP"
              className="w-24 rounded-md border border-white/10 bg-brand-primary px-2 py-1 text-sm text-white outline-none focus:border-brand-accent"
            />
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              placeholder={
                sign === -1
                  ? "Razão (obrigatório)"
                  : "Razão (opcional)"
              }
              className="flex-1 rounded-md border border-white/10 bg-brand-primary px-2 py-1 text-sm text-white outline-none placeholder:text-brand-muted focus:border-brand-accent"
            />
            <button
              type="button"
              onClick={submit}
              disabled={pending || !delta}
              className="flex cursor-pointer items-center gap-1 rounded-md bg-brand-accent px-3 py-1 text-xs font-semibold text-white hover:bg-brand-accent-hover disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Aplicar"
              )}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-[11px] text-rose-300">{error}</p>
          )}
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center gap-2">
          <History className="h-3 w-3 text-brand-muted" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            Histórico
          </span>
        </div>

        {historyLoading ? (
          <p className="text-xs text-brand-muted">Carregando...</p>
        ) : history.length === 0 ? (
          <p className="text-xs text-brand-muted">
            Nenhuma mudança de XP ainda.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {history.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-md border border-white/5 bg-white/[0.02] px-3 py-2 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <span
                    className={`font-mono font-semibold ${
                      item.delta > 0 ? "text-emerald-300" : "text-rose-300"
                    }`}
                  >
                    {item.delta > 0 ? "+" : ""}
                    {item.delta} XP
                  </span>
                  {item.reason && (
                    <span className="ml-2 text-brand-muted">
                      — {item.reason}
                    </span>
                  )}
                </div>
                <span className="ml-2 shrink-0 text-[10px] text-brand-muted">
                  {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
