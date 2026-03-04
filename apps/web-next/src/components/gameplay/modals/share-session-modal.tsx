"use client";

import { useState } from "react";
import { Check, Copy, Link, Mail } from "lucide-react";
import { ModalShell } from "./modal-shell";

interface ShareSessionModalProps {
  onClose: () => void;
}

export function ShareSessionModal({ onClose }: ShareSessionModalProps) {
  const [copied, setCopied] = useState(false);
  const sessionCode = "RVLT-2847";
  const joinUrl = `questboard.app/join/${sessionCode}`;

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ModalShell title="Compartilhar Sessao" maxWidth={480} onClose={onClose}>
      {/* Session code */}
      <div className="mb-4 rounded-lg bg-[#0A0A0F] p-4">
        <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-brand-muted">
          Codigo da Sessao
        </label>
        <div className="flex items-center justify-between">
          <span className="font-mono text-2xl font-bold tracking-[4px] text-brand-text">
            {sessionCode}
          </span>
          <button
            onClick={() => copyToClipboard(sessionCode)}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-brand-border px-3 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            {copied ? (
              <Check className="h-3 w-3 text-brand-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>

      {/* Join link */}
      <div className="mb-4 rounded-lg bg-[#0A0A0F] p-4">
        <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-brand-muted">
          Link de Convite
        </label>
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-xs text-brand-text">
            {joinUrl}
          </span>
          <button
            onClick={() => copyToClipboard(`https://${joinUrl}`)}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-brand-border px-3 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            <Link className="h-3 w-3" />
            Copiar Link
          </button>
        </div>
      </div>

      {/* QR Code placeholder */}
      <div className="mb-4 flex justify-center">
        <div className="flex h-[148px] w-[148px] items-center justify-center rounded-lg border border-brand-border bg-white">
          <div className="grid grid-cols-5 gap-1 p-4">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 w-4 ${Math.random() > 0.4 ? "bg-black" : "bg-white"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Share buttons */}
      <div className="flex gap-2">
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand-border py-2 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text">
          <Mail className="h-3.5 w-3.5" />
          Email
        </button>
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand-border py-2 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text">
          <Link className="h-3.5 w-3.5" />
          WhatsApp
        </button>
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand-border py-2 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text">
          <Copy className="h-3.5 w-3.5" />
          Discord
        </button>
      </div>
    </ModalShell>
  );
}
