"use client";

// Seção "Identidade" — username + tag + reroll. Conversa com o
// backend (REST). Fora do `settings-store` local porque envolve
// validação de cooldown server-side e disponibilidade de handle.

import { useEffect, useState } from "react";
import { Check, Copy, Dices, Loader2 } from "lucide-react";
import {
  getMyHandle,
  rerollTag,
  updateUsername,
  type MyHandleDto,
} from "@/lib/handle-api";
import { SettingsSection } from "../controls";

export function HandleSection() {
  const [data, setData] = useState<MyHandleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await getMyHandle();
      setData(r);
      setInput(r.username);
    } catch (err) {
      setError(
        (err as { message?: string }).message ??
          "Falha ao carregar identidade.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!data || pending) return;
    setError(null);
    setPending(true);
    try {
      const r = await updateUsername(input);
      setData(r);
      setEditing(false);
    } catch (err) {
      setError(
        (err as { message?: string }).message ?? "Não foi possível salvar.",
      );
    } finally {
      setPending(false);
    }
  }

  async function reroll() {
    if (!data || pending) return;
    if (!confirm("Rerolar gera um novo tag. Continuar?")) return;
    setError(null);
    setPending(true);
    try {
      const r = await rerollTag();
      setData(r);
    } catch (err) {
      setError(
        (err as { message?: string }).message ?? "Falha ao rerolar.",
      );
    } finally {
      setPending(false);
    }
  }

  async function copyHandle() {
    if (!data || !navigator.clipboard) return;
    await navigator.clipboard.writeText(data.handle);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) {
    return (
      <SettingsSection title="Identidade">
        <div className="flex items-center gap-2 text-sm text-brand-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </div>
      </SettingsSection>
    );
  }

  if (!data) {
    return (
      <SettingsSection title="Identidade">
        <div className="text-sm text-rose-300">
          {error ?? "Não foi possível carregar."}
        </div>
      </SettingsSection>
    );
  }

  const canRerollNow = new Date(data.canRerollTagAt) <= new Date();
  const canChangeUsernameNow =
    new Date(data.canChangeUsernameAt) <= new Date();

  return (
    <SettingsSection title="Identidade">
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-brand-muted">
          Seu handle
        </p>
        <div className="flex items-center gap-2">
          <code className="rounded-md border border-white/10 bg-[#0D0D12] px-3 py-2 font-mono text-sm">
            <span className="text-white">{data.username}</span>
            <span className="text-brand-muted">#{data.tag}</span>
          </code>
          <button
            type="button"
            onClick={copyHandle}
            className="flex cursor-pointer items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-2 text-xs text-brand-muted hover:bg-white/[0.06] hover:text-white"
            aria-label="Copiar handle"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copiar
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-brand-muted">
          Outros jogadores te encontram por esse handle. O nome pode
          repetir entre usuários — o tag é o que diferencia.
        </p>
      </div>

      {/* Mudar username */}
      <div className="mt-5 border-t border-white/5 pt-5">
        <p className="text-xs uppercase tracking-wider text-brand-muted">
          Mudar nome
        </p>
        {!editing ? (
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-brand-muted">
              {canChangeUsernameNow
                ? "Você pode mudar agora. Trocar o nome gera um tag novo."
                : `Disponível em ${new Date(data.canChangeUsernameAt).toLocaleDateString("pt-BR")}.`}
            </p>
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={!canChangeUsernameNow}
              className="cursor-pointer rounded-md bg-brand-accent/10 px-3 py-1.5 text-sm text-brand-accent hover:bg-brand-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Editar
            </button>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="novo username"
              maxLength={16}
              className="w-full rounded-lg border border-white/10 bg-[#0D0D12] px-3 py-2 text-sm text-white outline-none focus:border-brand-accent/60"
              autoFocus
            />
            <p className="text-[11px] text-brand-muted">
              3-16 caracteres. Letras, números, _ e -.
            </p>
            {error && (
              <p className="text-[11px] text-rose-300">{error}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={save}
                disabled={pending || input === data.username}
                className="flex cursor-pointer items-center gap-1 rounded-md bg-brand-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending && <Loader2 className="h-3 w-3 animate-spin" />}
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setInput(data.username);
                  setError(null);
                }}
                className="cursor-pointer rounded-md bg-white/5 px-3 py-1.5 text-sm text-brand-muted hover:bg-white/10"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rerolar tag */}
      <div className="mt-5 border-t border-white/5 pt-5">
        <p className="text-xs uppercase tracking-wider text-brand-muted">
          Rerolar tag
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-brand-muted">
            {data.freeRerollsLeft > 0
              ? `${data.freeRerollsLeft} reroll grátis disponível.`
              : canRerollNow
                ? "Disponível agora."
                : `Próximo em ${new Date(data.canRerollTagAt).toLocaleDateString("pt-BR")}.`}
          </p>
          <button
            type="button"
            onClick={reroll}
            disabled={pending || (!canRerollNow && data.freeRerollsLeft === 0)}
            className="flex cursor-pointer items-center gap-1 rounded-md bg-brand-accent/10 px-3 py-1.5 text-sm text-brand-accent hover:bg-brand-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Dices className="h-3 w-3" />
            )}
            Rerolar
          </button>
        </div>
      </div>
    </SettingsSection>
  );
}
