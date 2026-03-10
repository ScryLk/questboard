"use client";

import { useState } from "react";
import { Check, Copy, Link, Send, X } from "lucide-react";
import { QRCodeSVG as QRCodeSVGBase } from "qrcode.react";

// React 19 types workaround
const QRCodeSVG = QRCodeSVGBase as unknown as React.FC<{ value: string; size?: number; level?: string }>;
import { ModalShell } from "./modal-shell";

interface InvitePlayersModalProps {
  onClose: () => void;
}

export function InvitePlayersModal({ onClose }: InvitePlayersModalProps) {
  const [usernameInput, setUsernameInput] = useState("");
  const [pendingInvites, setPendingInvites] = useState<string[]>([]);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  // TODO: read from session store when backend is connected
  const sessionCode = "QB-A3F7";
  const joinUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${sessionCode}`;

  function copyToClipboard(text: string, type: "code" | "link") {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  function sendInvite() {
    const username = usernameInput.trim().replace(/^@/, "");
    if (!username) return;
    if (pendingInvites.includes(username)) return;
    setPendingInvites((prev) => [...prev, username]);
    setUsernameInput("");
    // TODO: call API POST /sessions/:id/invites
  }

  function cancelInvite(username: string) {
    setPendingInvites((prev) => prev.filter((u) => u !== username));
    // TODO: call API DELETE /sessions/:id/invites/:username
  }

  return (
    <ModalShell title="Convidar Jogadores" maxWidth={480} onClose={onClose}>
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
            onClick={() => copyToClipboard(sessionCode, "code")}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-brand-border px-3 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            {copied === "code" ? (
              <Check className="h-3 w-3 text-brand-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied === "code" ? "Copiado!" : "Copiar"}
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
            onClick={() => copyToClipboard(joinUrl, "link")}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-brand-border px-3 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            {copied === "link" ? (
              <Check className="h-3 w-3 text-brand-success" />
            ) : (
              <Link className="h-3 w-3" />
            )}
            {copied === "link" ? "Copiado!" : "Copiar Link"}
          </button>
        </div>
      </div>

      {/* QR Code */}
      <div className="mb-4 flex flex-col items-center rounded-lg bg-[#0A0A0F] p-4">
        <label className="mb-3 block text-[10px] font-medium uppercase tracking-wider text-brand-muted">
          QR Code
        </label>
        <div className="rounded-lg bg-white p-3">
          <QRCodeSVG value={joinUrl} size={160} level="M" />
        </div>
        <span className="mt-2 text-[10px] text-brand-muted">
          Escaneie para entrar na sessão
        </span>
      </div>

      {/* Separator */}
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-brand-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#111116] px-3 text-[10px] uppercase tracking-wider text-brand-muted">
            ou
          </span>
        </div>
      </div>

      {/* Invite by username */}
      <div className="mb-4">
        <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-brand-muted">
          Convidar por username
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendInvite();
            }}
            placeholder="@username do jogador..."
            className="h-9 flex-1 rounded-lg border border-brand-border bg-[#0A0A0F] px-3 text-xs text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none"
          />
          <button
            onClick={sendInvite}
            disabled={!usernameInput.trim()}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-brand-accent/20 px-4 text-xs font-medium text-brand-accent transition-colors hover:bg-brand-accent/30 disabled:opacity-30 disabled:hover:bg-brand-accent/20"
          >
            <Send className="h-3 w-3" />
            Enviar
          </button>
        </div>
      </div>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-brand-muted">
            Jogadores pendentes
          </label>
          <div className="space-y-1">
            {pendingInvites.map((username) => (
              <div
                key={username}
                className="flex items-center justify-between rounded-lg bg-[#0A0A0F] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-brand-text">
                    @{username}
                  </span>
                  <span className="text-[10px] text-brand-muted">
                    Aguardando...
                  </span>
                </div>
                <button
                  onClick={() => cancelInvite(username)}
                  className="flex h-5 w-5 items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/10 hover:text-red-400"
                  title="Cancelar convite"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </ModalShell>
  );
}
