"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Swords, QrCode, ArrowRight } from "lucide-react";

export default function PlayJoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleJoin = () => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      setError("Digite o codigo da sessao");
      return;
    }
    if (!name.trim()) {
      setError("Digite seu nome");
      return;
    }
    setError("");
    router.push(`/play/${trimmedCode}?name=${encodeURIComponent(name.trim())}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-primary p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-accent-muted">
            <Swords className="h-8 w-8 text-brand-accent" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-brand-text">QuestBoard</h1>
          <p className="mt-1 text-sm text-brand-muted">Entrar na Sessao</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-6">
          {/* Session code */}
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-brand-muted">
              Codigo da Sessao
            </span>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="Ex: B7M2X4"
              maxLength={6}
              className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-primary px-4 py-3 text-center text-xl font-bold uppercase tracking-[0.3em] text-brand-text outline-none placeholder:text-brand-muted/30 placeholder:tracking-normal placeholder:text-base placeholder:font-normal focus:border-brand-accent/50"
              autoFocus
            />
          </label>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-brand-border" />
            <span className="text-[10px] uppercase tracking-wider text-brand-muted">ou</span>
            <div className="h-px flex-1 bg-brand-border" />
          </div>

          {/* QR Code button (placeholder) */}
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-border py-2.5 text-sm text-brand-muted transition-colors hover:bg-white/[0.03] hover:text-brand-text"
            onClick={() => {/* QR scanner - future */}}
          >
            <QrCode className="h-4 w-4" />
            Escanear QR Code
          </button>

          {/* Player name */}
          <label className="mt-5 block">
            <span className="text-xs font-medium uppercase tracking-wider text-brand-muted">
              Seu Nome
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="Como voce quer ser chamado?"
              className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-primary px-4 py-3 text-sm text-brand-text outline-none placeholder:text-brand-muted/30 focus:border-brand-accent/50"
            />
          </label>

          {/* Error */}
          {error && (
            <p className="mt-3 text-center text-xs text-brand-danger">{error}</p>
          )}

          {/* Join button */}
          <button
            onClick={handleJoin}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent-hover"
          >
            Entrar
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-brand-muted">
          Peca o codigo ao seu Mestre de Jogo
        </p>
      </div>
    </div>
  );
}
