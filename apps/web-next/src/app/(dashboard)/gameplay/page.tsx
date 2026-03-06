"use client";

import Link from "next/link";
import { Gamepad2, Play, Clock, Users } from "lucide-react";

const MOCK_RECENT_SESSIONS = [
  {
    id: "sess_s04",
    number: 13,
    name: "A Torre de Ravenloft",
    campaign: "A Maldicao de Strahd",
    players: 4,
    lastPlayed: "Hoje, 19:30",
    status: "live" as const,
  },
  {
    id: "sess_s03",
    number: 12,
    name: "Travessia pelo Vale",
    campaign: "A Maldicao de Strahd",
    players: 4,
    lastPlayed: "28 Fev, 20:00",
    status: "ended" as const,
  },
];

export default function GameplayPage() {
  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-brand-text">Mesa Virtual (VTT)</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Gerencie e acesse suas sessoes de jogo
        </p>
      </div>

      {/* Active session banner */}
      {MOCK_RECENT_SESSIONS.some((s) => s.status === "live") && (
        <Link
          href={`/gameplay/${MOCK_RECENT_SESSIONS.find((s) => s.status === "live")!.id}`}
          className="mb-6 flex items-center gap-4 rounded-xl border border-brand-success/30 bg-brand-success/5 p-4 transition-colors hover:bg-brand-success/10"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-success/15">
            <Play className="h-5 w-5 text-brand-success" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-brand-text">
                Sessao ao Vivo
              </span>
              <span className="flex items-center gap-1 rounded-md bg-brand-success/15 px-2 py-0.5 text-[10px] font-medium text-brand-success">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-success" />
                AO VIVO
              </span>
            </div>
            <p className="mt-0.5 text-xs text-brand-muted">
              Sessao #13 — A Torre de Ravenloft
            </p>
          </div>
          <span className="text-xs font-medium text-brand-success">
            Entrar na Sessao →
          </span>
        </Link>
      )}

      {/* Sessions list */}
      <div className="space-y-2">
        {MOCK_RECENT_SESSIONS.map((session) => {
          const isLive = session.status === "live";
          return (
            <Link
              key={session.id}
              href={`/gameplay/${session.id}`}
              className="flex items-center gap-4 rounded-xl border border-brand-border bg-brand-surface p-4 transition-colors hover:border-brand-accent/30"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isLive ? "bg-brand-success/15" : "bg-brand-accent/15"
                }`}
              >
                <Gamepad2
                  className={`h-5 w-5 ${isLive ? "text-brand-success" : "text-brand-accent"}`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-brand-text">
                  Sessao #{session.number} — {session.name}
                </p>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-brand-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.lastPlayed}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {session.players} jogadores
                  </span>
                </div>
              </div>
              {isLive && (
                <span className="flex items-center gap-1 rounded-md bg-brand-success/15 px-2 py-1 text-[10px] font-medium text-brand-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-success" />
                  AO VIVO
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* New session button → goes to lobby */}
      <Link
        href="/lobby/sess_new"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-border py-4 text-sm font-medium text-brand-muted transition-colors hover:border-brand-accent/30 hover:text-brand-text"
      >
        <Play className="h-4 w-4" />
        Iniciar Nova Sessao
      </Link>
    </div>
  );
}
