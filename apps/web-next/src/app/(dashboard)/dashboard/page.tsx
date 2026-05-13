"use client";

// Dashboard global — totais, próxima sessão, story progress, sessões
// recentes e card condicional ao role. Pull do endpoint agregado
// `/campaigns/:id/dashboard` usando a campanha ativa selecionada no
// header. Sem dados? CTA pra escolher/criar campanha.

import Link from "next/link";
import { BookOpen, Calendar, Clock, TrendingUp, Users } from "lucide-react";
import { ProfileWidget } from "@/components/profile/profile-widget";
import { useCampaignStore } from "@/lib/campaign-store";
import { useCampaignDashboard } from "@/hooks/use-campaign-dashboard";
import { CharacterXpCard } from "@/components/dashboard/character-xp-card";
import { GmPanelCard } from "@/components/dashboard/gm-panel-card";
import { NoCharacterCard } from "@/components/dashboard/no-character-card";
import {
  CardSkeleton,
  DashboardErrorBanner,
  StatsCardsSkeleton,
  TableSkeleton,
} from "@/components/dashboard/dashboard-skeletons";
import {
  formatDuration,
  formatHours,
  formatNextSession,
  formatPlayedAt,
  formatSessionStatus,
} from "@/lib/dashboard-format";
import type { DashboardDto } from "@questboard/validators";

export default function DashboardPage() {
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const clearActive = useCampaignStore((s) => s.setActiveCampaignId);
  const { data, isLoading, error, notFound, refetch } =
    useCampaignDashboard(activeCampaignId);

  if (!activeCampaignId) {
    return <NoActiveCampaign />;
  }

  // Campanha local aponta pra ID que não existe mais no backend
  // (ex: DB resetado, ou deletada). Limpa local e mostra empty state.
  if (notFound) {
    return <StaleCampaign onClear={() => clearActive(null)} />;
  }

  if (isLoading && !data) {
    return (
      <div className="space-y-8">
        <StatsCardsSkeleton />
        <CardSkeleton height={120} />
        <CardSkeleton height={140} />
        <TableSkeleton />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-8">
        <DashboardErrorBanner message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <KpiCards totals={data.totals} nextSession={data.nextSession} />

      <ProfileWidget />

      <RoleAwareCard data={data} campaignId={activeCampaignId} />

      <StoryProgress storyProgress={data.storyProgress} />

      <SessionsTable recentSessions={data.recentSessions} />
    </div>
  );
}

// ── Subcomponentes ─────────────────────────────────────────────

function KpiCards({
  totals,
  nextSession,
}: {
  totals: DashboardDto["totals"];
  nextSession: DashboardDto["nextSession"];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        icon={Calendar}
        color="text-brand-accent"
        label="Sessões"
        value={totals.sessions.toString()}
      />
      <KpiCard
        icon={Clock}
        color="text-brand-success"
        label="Horas Jogadas"
        value={formatHours(totals.hoursPlayed)}
      />
      <KpiCard
        icon={TrendingUp}
        color="text-brand-warning"
        label="Nível Médio"
        value={
          totals.averagePlayerLevel !== null
            ? totals.averagePlayerLevel.toFixed(1)
            : "—"
        }
      />
      <KpiCard
        icon={Users}
        color="text-brand-info"
        label="Próxima Sessão"
        value={
          nextSession ? formatNextSession(nextSession.scheduledFor) : "Nenhuma"
        }
        hint={!nextSession ? "Agende uma sessão pra começar" : undefined}
      />
    </div>
  );
}

function KpiCard({
  icon: Icon,
  color,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface p-5">
      <div className="flex items-center justify-between">
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="mt-3 text-2xl font-bold text-brand-text">{value}</p>
      <p className="mt-1 text-sm text-brand-muted">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-brand-muted">{hint}</p>}
    </div>
  );
}

function RoleAwareCard({
  data,
  campaignId,
}: {
  data: DashboardDto;
  campaignId: string;
}) {
  if (data.viewerRole === "GM" || data.viewerRole === "CO_GM") {
    if (!data.gmPanel) return null;
    return <GmPanelCard stats={data.gmPanel} campaignId={campaignId} />;
  }
  if (data.viewerRole === "PLAYER") {
    if (data.userCharacter) {
      return <CharacterXpCard character={data.userCharacter} />;
    }
    return <NoCharacterCard campaignId={campaignId} />;
  }
  // SPECTATOR: nada.
  return null;
}

function StoryProgress({
  storyProgress,
}: {
  storyProgress: DashboardDto["storyProgress"];
}) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-brand-accent" />
          <h2 className="text-sm font-semibold text-brand-text">
            Progressão da História
          </h2>
        </div>
        <Link
          href="/story"
          className="text-xs text-brand-accent hover:underline"
        >
          Ver Roadmap Completo
        </Link>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-brand-text">
          {storyProgress.percentage}%
        </span>
        <span className="text-sm text-brand-muted">
          {storyProgress.completedEvents}/{storyProgress.totalEvents} eventos
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-brand-accent transition-all"
          style={{ width: `${storyProgress.percentage}%` }}
        />
      </div>
    </div>
  );
}

function SessionsTable({
  recentSessions,
}: {
  recentSessions: DashboardDto["recentSessions"];
}) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface">
      <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
        <h2 className="text-lg font-semibold text-brand-text">
          Sessões Recentes
        </h2>
      </div>

      {recentSessions.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-brand-muted">
          Nenhuma sessão concluída ainda. Comece sua primeira aventura.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border text-left text-xs uppercase tracking-wider text-brand-muted">
                <th className="px-6 py-3 font-medium">#</th>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Título</th>
                <th className="px-6 py-3 font-medium">Duração</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((session) => (
                <tr
                  key={session.id}
                  className="border-b border-brand-border/50 transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4 text-sm font-medium text-brand-text">
                    {session.number}
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-muted">
                    {formatPlayedAt(session.playedAt)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-brand-text">
                    {session.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-muted">
                    {formatDuration(session.durationMinutes)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${
                        session.status === "ENDED"
                          ? "bg-brand-muted/15 text-brand-muted"
                          : "bg-brand-danger/15 text-brand-danger"
                      }`}
                    >
                      {formatSessionStatus(session.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StaleCampaign({ onClear }: { onClear: () => void }) {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-8 text-center">
        <p className="text-base font-medium text-amber-300">
          A campanha selecionada não existe mais.
        </p>
        <p className="mt-2 text-sm text-brand-muted">
          Pode ter sido excluída ou o banco foi resetado. Limpe a seleção
          local e escolha outra campanha.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="cursor-pointer rounded-lg bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/25"
          >
            Limpar seleção
          </button>
          <Link
            href="/campaigns"
            className="cursor-pointer rounded-lg bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accent-hover"
          >
            Ver campanhas
          </Link>
        </div>
      </div>
    </div>
  );
}

function NoActiveCampaign() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-dashed border-brand-border bg-brand-surface/50 p-8 text-center">
        <p className="text-base font-medium text-brand-text">
          Nenhuma campanha ativa selecionada.
        </p>
        <p className="mt-2 text-sm text-brand-muted">
          Selecione uma campanha no menu superior pra ver o dashboard,
          ou crie uma nova.
        </p>
        <Link
          href="/campaigns"
          className="mt-4 inline-flex cursor-pointer items-center gap-1 rounded-lg bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accent-hover"
        >
          Ver minhas campanhas
        </Link>
      </div>
    </div>
  );
}
