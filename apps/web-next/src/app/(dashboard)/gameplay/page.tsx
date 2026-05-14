"use client";

// Mesa Virtual — index global das sessões. Exige campanha ativa
// (sessões pertencem a campanhas). Sem campanha, mostra empty state
// CTA pra escolher uma.

import Link from "next/link";
import { useState } from "react";
import { Gamepad2, Play, Star } from "lucide-react";
import { useCampaignStore } from "@/lib/campaign-store";
import { QuickCreateSessionModal } from "@/components/gameplay/quick-create-session-modal";

// Sessões recentes vêm do backend (apps/api/src/modules/sessions).
// Hoje a lista chega vazia até wiring real do endpoint.
const RECENT_SESSIONS: Array<{
  id: string;
  number: number;
  name: string;
  campaign: string;
  players: number;
  lastPlayed: string;
  status: "live" | "ended" | "scheduled";
}> = [];

export default function GameplayPage() {
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const activeCampaign = useCampaignStore((s) =>
    activeCampaignId ? s.campaigns.find((c) => c.id === activeCampaignId) ?? null : null,
  );
  const [createOpen, setCreateOpen] = useState(false);

  if (!activeCampaignId || !activeCampaign) {
    return <NoActiveCampaign />;
  }

  const liveSession = RECENT_SESSIONS.find((s) => s.status === "live");

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-brand-text">Mesa Virtual (VTT)</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Sessões de <span className="text-brand-text">{activeCampaign.name}</span>
        </p>
      </div>

      {liveSession && (
        <Link
          href={`/gameplay/${liveSession.id}`}
          className="mb-6 flex items-center gap-4 rounded-xl border border-brand-success/30 bg-brand-success/5 p-4 transition-colors hover:bg-brand-success/10"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-success/15">
            <Play className="h-5 w-5 text-brand-success" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-brand-text">
                Sessão ao Vivo
              </span>
              <span className="flex items-center gap-1 rounded-md bg-brand-success/15 px-2 py-0.5 text-[10px] font-medium text-brand-success">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-success" />
                AO VIVO
              </span>
            </div>
            <p className="mt-0.5 text-xs text-brand-muted">
              Sessão #{liveSession.number} — {liveSession.name}
            </p>
          </div>
          <span className="text-xs font-medium text-brand-success">
            Entrar na Sessão →
          </span>
        </Link>
      )}

      {RECENT_SESSIONS.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-border bg-brand-surface/50 p-8 text-center">
          <Gamepad2 className="mx-auto mb-3 h-8 w-8 text-brand-muted" />
          <p className="text-sm font-medium text-brand-text">
            Nenhuma sessão nesta campanha ainda.
          </p>
          <p className="mt-1 text-xs text-brand-muted">
            Crie a primeira sessão pra começar a jogar.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {RECENT_SESSIONS.map((session) => {
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
                    Sessão #{session.number} — {session.name}
                  </p>
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
      )}

      <button
        type="button"
        onClick={() => setCreateOpen(true)}
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-brand-border py-4 text-sm font-medium text-brand-muted transition-colors hover:border-brand-accent/30 hover:text-brand-text"
      >
        <Play className="h-4 w-4" />
        Iniciar Nova Sessão
      </button>

      <QuickCreateSessionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        campaignId={activeCampaignId}
        campaignName={activeCampaign.name}
      />
    </div>
  );
}

function NoActiveCampaign() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-md rounded-xl border border-dashed border-brand-border bg-brand-surface/50 p-8 text-center">
        <Gamepad2 className="mx-auto mb-3 h-8 w-8 text-brand-muted" />
        <p className="text-base font-medium text-brand-text">
          Nenhuma campanha ativa
        </p>
        <p className="mt-2 text-sm text-brand-muted">
          Sessões pertencem a campanhas. Selecione uma campanha pra ver e
          gerenciar suas sessões.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link
            href="/campaigns"
            className="flex cursor-pointer items-center gap-1 rounded-lg bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accent-hover"
          >
            <Star className="h-4 w-4" />
            Ver campanhas
          </Link>
        </div>
      </div>
    </div>
  );
}
