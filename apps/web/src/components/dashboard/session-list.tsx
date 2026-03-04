import { useNavigate } from "react-router-dom";
import { useCampaignStore } from "../../lib/campaign-store.js";
import type { CampaignSession, SessionStatusExtended } from "@questboard/types";

function statusBadgeClasses(status: SessionStatusExtended): string {
  switch (status) {
    case "LIVE":
      return "bg-green-500/20 text-green-400";
    case "SCHEDULED":
      return "bg-blue-500/20 text-blue-400";
    case "COMPLETED":
      return "bg-gray-500/20 text-gray-400";
    case "DRAFT":
      return "bg-yellow-500/20 text-yellow-400";
    case "PAUSED":
      return "bg-orange-500/20 text-orange-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
}

function statusLabel(status: SessionStatusExtended): string {
  switch (status) {
    case "LIVE":
      return "Ao Vivo";
    case "SCHEDULED":
      return "Agendada";
    case "COMPLETED":
      return "Completa";
    case "DRAFT":
      return "Rascunho";
    case "PAUSED":
      return "Pausada";
    case "IDLE":
      return "Inativa";
    case "LOBBY":
      return "Lobby";
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

function SessionRow({ session }: { session: CampaignSession }) {
  const navigate = useNavigate();
  const { activeCampaignId, selectSession } = useCampaignStore();

  const handleClick = () => {
    selectSession(session.id);
    navigate(`/campaign/${activeCampaignId}/session/${session.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left transition-colors hover:bg-white/5"
    >
      <span className="w-8 text-center text-sm font-mono text-gray-500">
        #{session.order}
      </span>
      <span className="flex-1 truncate text-sm text-white">
        {session.name}
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadgeClasses(session.status)}`}
      >
        {statusLabel(session.status)}
      </span>
      <span className="w-24 text-right text-xs text-gray-500">
        {formatDate(session.startedAt ?? session.scheduledAt)}
      </span>
      <span className="w-12 text-right text-xs text-gray-500">
        {session.playerCount > 0 ? `${session.playerCount}p` : "—"}
      </span>
    </button>
  );
}

export function SessionList({
  sessions,
}: {
  sessions: CampaignSession[];
}) {
  const { openCreateSession } = useCampaignStore();

  const sorted = [...sessions].sort((a, b) => b.order - a.order);

  return (
    <div className="rounded-xl border border-white/5 bg-surface-light">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Sessões</h3>
        <button
          onClick={openCreateSession}
          className="rounded-md bg-brand-accent/10 px-2.5 py-1 text-xs font-medium text-brand-accent transition-colors hover:bg-brand-accent/20"
        >
          + Nova Sessão
        </button>
      </div>
      <div className="divide-y divide-white/5">
        {sorted.map((session) => (
          <SessionRow key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
