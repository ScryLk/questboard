import { useNavigate } from "react-router-dom";
import { useCampaignStore } from "../../lib/campaign-store.js";
import type { CampaignSession } from "@questboard/types";

function daysUntil(date: Date): number {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function NextSessionCard({
  session,
}: {
  session: CampaignSession | null;
}) {
  const navigate = useNavigate();
  const { activeCampaignId, selectSession, openCreateSession } =
    useCampaignStore();

  if (!session) {
    return (
      <div className="rounded-xl border border-white/5 bg-surface-light p-4">
        <h3 className="text-sm font-semibold text-white">Próxima Sessão</h3>
        <p className="mt-4 text-center text-sm text-gray-500">
          Nenhuma sessão agendada
        </p>
        <button
          onClick={openCreateSession}
          className="mt-3 w-full rounded-lg bg-brand-accent/10 py-2 text-xs font-medium text-brand-accent transition-colors hover:bg-brand-accent/20"
        >
          Agendar Sessão
        </button>
      </div>
    );
  }

  const days = session.scheduledAt ? daysUntil(session.scheduledAt) : 0;

  const handleViewDetails = () => {
    selectSession(session.id);
    navigate(`/campaign/${activeCampaignId}/session/${session.id}`);
  };

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Próxima Sessão</h3>
        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400">
          em {days} dia{days !== 1 ? "s" : ""}
        </span>
      </div>
      <p className="mt-3 font-heading text-lg font-bold text-white">
        #{session.order} {session.name}
      </p>
      {session.scheduledAt && (
        <p className="mt-1 text-xs text-gray-400">
          {formatDateTime(session.scheduledAt)}
        </p>
      )}
      <div className="mt-2 text-xs text-gray-400">
        Código:{" "}
        <span className="font-mono text-white">{session.sessionCode}</span>
      </div>
      <button
        onClick={handleViewDetails}
        className="mt-3 w-full rounded-lg bg-blue-500/10 py-2 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
      >
        Ver Detalhes
      </button>
    </div>
  );
}
