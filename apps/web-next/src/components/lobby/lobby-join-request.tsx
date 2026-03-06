"use client";

import { UserPlus, Check, X, Clock } from "lucide-react";
import { useLobbyStore } from "@/lib/lobby-store";
import { broadcastSend } from "@/lib/broadcast-sync";

/** GM-side: floating popup for pending join requests */
export function LobbyJoinRequests() {
  const pendingRequests = useLobbyStore((s) => s.pendingRequests);
  const acceptPlayer = useLobbyStore((s) => s.acceptPlayer);
  const rejectPlayer = useLobbyStore((s) => s.rejectPlayer);

  if (pendingRequests.length === 0) return null;

  function handleAccept(playerId: string) {
    acceptPlayer(playerId);
    broadcastSend("lobby:player-accepted", { playerId });
  }

  function handleReject(playerId: string) {
    rejectPlayer(playerId);
    broadcastSend("lobby:player-rejected", { playerId });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <UserPlus className="h-3.5 w-3.5 text-brand-accent" />
        <span className="text-xs font-semibold text-brand-text">
          Pedidos de Entrada ({pendingRequests.length})
        </span>
      </div>

      {pendingRequests.map((req) => {
        const initials = req.playerName
          .split(" ")
          .slice(0, 2)
          .map((w) => w[0])
          .join("")
          .toUpperCase();

        const elapsed = Math.floor(
          (Date.now() - new Date(req.requestedAt).getTime()) / 1000,
        );
        const elapsedStr =
          elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed / 60)}m`;

        return (
          <div
            key={req.playerId}
            className="flex items-center gap-3 rounded-lg border border-brand-accent/20 bg-brand-accent/5 px-3 py-2.5 animate-in slide-in-from-top-2"
          >
            {/* Avatar */}
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
              <span className="text-xs font-bold text-brand-muted">
                {initials}
              </span>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-brand-text">
                {req.playerName}
              </p>
              <p className="flex items-center gap-1 text-[10px] text-brand-muted">
                <Clock className="h-2.5 w-2.5" />
                Aguardando há {elapsedStr}
                {req.previousCharacter && ` · Era: ${req.previousCharacter}`}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-1.5">
              <button
                onClick={() => handleAccept(req.playerId)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 text-green-400 transition-colors hover:bg-green-500/30"
                title="Aceitar"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleReject(req.playerId)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400 transition-colors hover:bg-red-500/30"
                title="Recusar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Player-side: waiting screen after requesting to join */
export function PlayerJoinWaiting({
  playerName,
  onCancel,
}: {
  playerName: string;
  onCancel: () => void;
}) {
  const status = useLobbyStore((s) => s.joinRequestStatus);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F]">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-brand-border bg-brand-panel p-6 text-center">
        {status === "pending" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent/15">
              <Clock className="h-7 w-7 animate-pulse text-brand-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-text">
                Aguardando o GM...
              </h2>
              <p className="mt-1 text-sm text-brand-muted">
                Olá, <span className="font-medium text-brand-text">{playerName}</span>!
                Seu pedido foi enviado.
              </p>
              <p className="mt-2 text-xs text-brand-muted">
                O GM precisa aprovar sua entrada na sessão.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="w-full rounded-lg border border-brand-border px-4 py-2 text-sm text-brand-muted transition-colors hover:bg-white/[0.04]"
            >
              Cancelar
            </button>
          </>
        )}

        {status === "rejected" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
              <X className="h-7 w-7 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-text">
                Entrada Recusada
              </h2>
              <p className="mt-1 text-sm text-brand-muted">
                O GM recusou seu pedido de entrada.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="w-full rounded-lg border border-brand-border px-4 py-2 text-sm text-brand-muted transition-colors hover:bg-white/[0.04]"
            >
              Voltar
            </button>
          </>
        )}

        {status === "timeout" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/15">
              <Clock className="h-7 w-7 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-text">
                Tempo Esgotado
              </h2>
              <p className="mt-1 text-sm text-brand-muted">
                O GM não respondeu ao seu pedido.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="w-full rounded-lg border border-brand-border px-4 py-2 text-sm text-brand-muted transition-colors hover:bg-white/[0.04]"
            >
              Tentar novamente
            </button>
          </>
        )}
      </div>
    </div>
  );
}
