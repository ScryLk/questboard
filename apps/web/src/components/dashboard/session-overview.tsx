import type { SessionDashboardData, SessionStatusExtended } from "@questboard/types";
import { SessionTimeline } from "./session-timeline.js";
import { SessionDiceStats } from "./session-dice-stats.js";

function statusLabel(status: SessionStatusExtended): string {
  switch (status) {
    case "COMPLETED":
      return "Completa";
    case "IDLE":
      return "Inativa";
    case "PAUSED":
      return "Pausada";
    default:
      return status;
  }
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function SessionOverview({ data }: { data: SessionDashboardData }) {
  const { session, metrics, diceStats, timeline } = data;

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="rounded-xl border border-white/5 bg-surface-light p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-white">
              #{session.order} {session.name}
            </h2>
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-400">
              <span>{formatDate(session.startedAt)}</span>
              <span>·</span>
              <span>{formatDuration(session.durationMinutes)}</span>
              <span>·</span>
              <span>{session.playerCount} jogadores</span>
            </div>
            {session.mapName && (
              <p className="mt-1 text-xs text-gray-500">
                Mapa: {session.mapName}
              </p>
            )}
          </div>
          <span className="rounded-full bg-gray-500/20 px-2.5 py-1 text-xs font-medium text-gray-400">
            {statusLabel(session.status)}
          </span>
        </div>
        {session.sessionCode && (
          <div className="mt-3 text-xs text-gray-500">
            Código:{" "}
            <span className="font-mono text-gray-400">
              {session.sessionCode}
            </span>
            {session.status === "COMPLETED" && (
              <span className="ml-1 text-gray-600">(expirado)</span>
            )}
          </div>
        )}
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-white/5 bg-surface-light p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {metrics.totalRolls}
          </p>
          <p className="text-xs text-gray-400">Rolagens</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-surface-light p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {metrics.totalMessages}
          </p>
          <p className="text-xs text-gray-400">Mensagens</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-surface-light p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {metrics.combats}
          </p>
          <p className="text-xs text-gray-400">Combates</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-surface-light p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {formatDuration(metrics.playTimeMinutes)}
          </p>
          <p className="text-xs text-gray-400">Tempo de Jogo</p>
        </div>
      </div>

      {/* Timeline + Dice Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SessionTimeline events={timeline} />
        </div>
        <div>
          <SessionDiceStats stats={diceStats} />
        </div>
      </div>
    </div>
  );
}
