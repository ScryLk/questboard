"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Link, Loader2, Send, X } from "lucide-react";
import { QRCodeSVG as QRCodeSVGBase } from "qrcode.react";
import { apiRequest } from "@/lib/api-client";

// React 19 types workaround
const QRCodeSVG = QRCodeSVGBase as unknown as React.FC<{
  value: string;
  size?: number;
  level?: string;
}>;
import { ModalShell } from "./modal-shell";

interface InvitePlayersModalProps {
  onClose: () => void;
  /** Sessão ativa. Null = modo dev sem backend; cai num placeholder. */
  sessionId: string | null;
}

interface SessionLite {
  id: string;
  inviteCode: string;
}

export function InvitePlayersModal({
  onClose,
  sessionId,
}: InvitePlayersModalProps) {
  const [usernameInput, setUsernameInput] = useState("");
  const [pendingInvites, setPendingInvites] = useState<string[]>([]);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(sessionId !== null);
  const [error, setError] = useState<string | null>(null);

  // Carrega inviteCode real da sessão.
  useEffect(() => {
    if (!sessionId) {
      setSessionCode(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void apiRequest<SessionLite>(`/sessions/${sessionId}`)
      .then((s) => {
        if (cancelled) return;
        setSessionCode(s.inviteCode);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          (err as { message?: string }).message ??
            "Não foi possível carregar o código.",
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const joinUrl = sessionCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/play/${sessionCode}`
    : "";

  function copyToClipboard(text: string, type: "code" | "link") {
    if (!text) return;
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
    // TODO: call API POST /sessions/:id/invites quando endpoint existir
  }

  function cancelInvite(username: string) {
    setPendingInvites((prev) => prev.filter((u) => u !== username));
  }

  return (
    <ModalShell title="Convidar Jogadores" maxWidth={720} onClose={onClose}>
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-brand-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando código da sessão...
        </div>
      ) : error ? (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-xs text-rose-300">
          {error}
        </div>
      ) : !sessionCode ? (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-300">
          Sessão não disponível no backend. Inicie uma sessão real pra
          convidar jogadores.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
            <div className="space-y-4">
              {/* Session code */}
              <div className="rounded-lg bg-[#0A0A0F] p-4">
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                  Código da Sessão
                </label>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-2xl font-bold tracking-[4px] text-brand-text">
                    {sessionCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(sessionCode, "code")}
                    className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-brand-border px-3 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
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
              <div className="rounded-lg bg-[#0A0A0F] p-4">
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                  Link de Convite
                </label>
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-xs text-brand-text">
                    {joinUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(joinUrl, "link")}
                    className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-brand-border px-3 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
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

              {/* Invite by username */}
              <div>
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
                    type="button"
                    onClick={sendInvite}
                    disabled={!usernameInput.trim()}
                    className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-brand-accent/20 px-4 text-xs font-medium text-brand-accent transition-colors hover:bg-brand-accent/30 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-brand-accent/20"
                  >
                    <Send className="h-3 w-3" />
                    Enviar
                  </button>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-start rounded-lg bg-[#0A0A0F] p-4 md:w-[200px]">
              <label className="mb-3 block text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                QR Code
              </label>
              <div className="rounded-lg bg-white p-3">
                <QRCodeSVG value={joinUrl} size={140} level="M" />
              </div>
              <span className="mt-2 text-center text-[10px] text-brand-muted">
                Escaneie para entrar
              </span>
            </div>
          </div>

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
                      type="button"
                      onClick={() => cancelInvite(username)}
                      className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/10 hover:text-red-400"
                      title="Cancelar convite"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </ModalShell>
  );
}
