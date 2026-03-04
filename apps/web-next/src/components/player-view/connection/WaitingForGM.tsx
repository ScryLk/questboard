"use client";

import { Swords, Loader2 } from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";

export function WaitingForGM() {
  const playerName = usePlayerViewStore((s) => s.playerName);
  const sessionCode = usePlayerViewStore((s) => s.sessionCode);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-primary p-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-accent-muted">
          <Swords className="h-8 w-8 text-brand-accent" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-brand-text">
            Aguardando o GM...
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            Conectado como <span className="font-medium text-brand-text">{playerName || "Jogador"}</span>
          </p>
          <p className="mt-1 text-xs text-brand-muted">
            Sessao: <span className="font-mono font-medium text-brand-accent">{sessionCode}</span>
          </p>
        </div>

        {/* Spinner */}
        <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />

        <p className="max-w-xs text-xs text-brand-muted">
          O GM precisa atribuir um personagem a voce antes de entrar no mapa.
          Aguarde um momento...
        </p>
      </div>
    </div>
  );
}
