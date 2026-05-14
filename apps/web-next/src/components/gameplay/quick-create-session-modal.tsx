"use client";

// Modal minimalista pra criar sessão e ir direto pra mesa virtual.
// Substitui o fluxo `/lobby/sess_new` (lobby quebrado: nunca carregava
// sessionInfo do backend). Quando o lobby real for implementado, isso
// pode virar a "porta de entrada" alternativa.

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play, X } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Campanha ativa — passa pra vincular a sessão. */
  campaignId: string;
  campaignName: string;
}

interface CreatedSessionDto {
  id: string;
  name: string;
  inviteCode: string;
}

export function QuickCreateSessionModal({
  open,
  onClose,
  campaignId,
  campaignName,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [system, setSystem] = useState("dnd5e");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    if (!name.trim()) {
      setError("Dê um nome pra sessão.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const created = await apiRequest<CreatedSessionDto>("/sessions", {
        method: "POST",
        body: {
          name: name.trim(),
          system,
          campaignId,
          maxPlayers: 5,
          isPublic: false,
        },
      });
      onClose();
      router.push(`/gameplay/${created.id}`);
    } catch (err) {
      setError(
        (err as { message?: string }).message ?? "Falha ao criar sessão.",
      );
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-brand-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-4 flex items-start justify-between">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
              Nova sessão
            </p>
            <h2 className="font-cinzel text-lg font-bold text-white">
              Iniciar sessão
            </h2>
            <p className="mt-1 text-xs text-brand-muted">
              Em{" "}
              <span className="text-brand-text">{campaignName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="cursor-pointer rounded-md p-1 text-brand-muted hover:bg-white/5 hover:text-white disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              Nome da sessão
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: A Torre de Ravenloft"
              maxLength={100}
              autoFocus
              className="w-full rounded-lg border border-white/10 bg-brand-primary px-3 py-2 text-sm text-white outline-none placeholder:text-brand-muted focus:border-brand-accent"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              Sistema
            </span>
            <select
              value={system}
              onChange={(e) => setSystem(e.target.value)}
              className="w-full cursor-pointer rounded-lg border border-white/10 bg-brand-primary px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
            >
              <option value="dnd5e">D&amp;D 5e</option>
              <option value="cosmic-horror">Cosmic Horror</option>
              <option value="custom">Custom</option>
            </select>
          </label>

          {error && (
            <p className="rounded-md border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-[11px] text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || !name.trim()}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-accent px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Criar e abrir mesa
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
