import { Link, useNavigate } from "react-router-dom";
import { useCampaignStore } from "../../lib/campaign-store.js";
import type { CampaignSession, SessionStatusExtended } from "@questboard/types";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "⊞", path: "" },
  { label: "Mapas", icon: "🗺", path: "/maps" },
  { label: "História", icon: "📖", path: "/historia" },
  { label: "Jogadores", icon: "👥", path: "/jogadores" },
  { label: "Encontros", icon: "⚔", path: "/encontros" },
  { label: "Mundo", icon: "🌍", path: "/mundo" },
] as const;

const SESSION_NAV = [
  { label: "Gameplay", icon: "🎮", path: "/gameplay" },
  { label: "Chat", icon: "💬", path: "/chat" },
  { label: "Notas", icon: "📝", path: "/notas" },
] as const;

function statusColor(status: SessionStatusExtended): string {
  switch (status) {
    case "LIVE":
      return "bg-green-500";
    case "SCHEDULED":
      return "bg-blue-500";
    case "COMPLETED":
      return "bg-gray-500";
    case "DRAFT":
      return "bg-yellow-500";
    case "PAUSED":
      return "bg-orange-500";
    default:
      return "bg-gray-600";
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
    default:
      return status;
  }
}

function SessionBadge({ session }: { session: CampaignSession }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${statusColor(session.status)}/20 text-${statusColor(session.status).replace("bg-", "")}/80`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${statusColor(session.status)}`} />
      {statusLabel(session.status)}
    </span>
  );
}

export function Sidebar() {
  const navigate = useNavigate();
  const {
    campaigns,
    activeCampaignId,
    sidebarCollapsed,
    toggleSidebar,
    selectCampaign,
    campaignDashboard,
    activeSessionId,
    dashboardView,
  } = useCampaignStore();

  const recentSessions = (campaignDashboard?.sessions ?? [])
    .filter((s) => s.status !== "DRAFT")
    .slice(0, 4);

  const liveSession = campaignDashboard?.sessions.find(
    (s) => s.status === "LIVE",
  );

  if (sidebarCollapsed) {
    return (
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-16 flex-col border-r border-white/10 bg-[#0F0F1A]">
        <button
          onClick={toggleSidebar}
          className="flex h-14 items-center justify-center text-xl text-brand-accent"
        >
          Q
        </button>
        <div className="flex flex-1 flex-col items-center gap-2 pt-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-white/10 bg-[#0F0F1A]">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
        <Link to="/" className="font-heading text-lg font-bold text-brand-accent">
          QuestBoard
        </Link>
        <button
          onClick={toggleSidebar}
          className="rounded p-1 text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
        >
          ◀
        </button>
      </div>

      {/* Live Session Card */}
      {liveSession && (
        <div className="mx-3 mt-3 rounded-lg border border-brand-accent/30 bg-brand-accent/5 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-accent">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
            SESSÃO AO VIVO
          </div>
          <p className="mt-1 text-sm font-medium text-white">
            #{liveSession.order} {liveSession.name}
          </p>
          <p className="text-xs text-gray-400">
            {liveSession.playerCount} jogadores
          </p>
          <button
            onClick={() =>
              navigate(
                `/campaign/${activeCampaignId}/session/${liveSession.id}`,
              )
            }
            className="mt-2 w-full rounded-md bg-brand-accent/20 py-1.5 text-xs font-medium text-brand-accent transition-colors hover:bg-brand-accent/30"
          >
            Abrir Gameplay
          </button>
        </div>
      )}

      {/* Campaign Navigation */}
      <div className="mt-4 px-3">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
          Campanha
        </p>
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === "" && dashboardView === "campaign" && !activeSessionId;
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.path === "") {
                    useCampaignStore.getState().goToCampaignOverview();
                    navigate(`/campaign/${activeCampaignId}`);
                  }
                }}
                className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-brand-accent/10 font-medium text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="w-5 text-center">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Session Navigation */}
      {activeSessionId && (
        <div className="mt-4 px-3">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
            Sessão Ativa
          </p>
          <nav className="flex flex-col gap-0.5">
            {SESSION_NAV.map((item) => (
              <button
                key={item.label}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <span className="w-5 text-center">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="mt-4 px-3">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
          Sessões
        </p>
        <div className="flex flex-col gap-0.5">
          {recentSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => {
                useCampaignStore.getState().selectSession(session.id);
                navigate(
                  `/campaign/${activeCampaignId}/session/${session.id}`,
                );
              }}
              className={`flex items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                activeSessionId === session.id
                  ? "bg-brand-accent/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="truncate">
                #{session.order} {session.name}
              </span>
              <SessionBadge session={session} />
            </button>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Campaign Selector */}
      <div className="border-t border-white/10 p-3">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
          Campanhas
        </p>
        <div className="flex flex-col gap-0.5">
          {campaigns.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                selectCampaign(c.id);
                navigate(`/campaign/${c.id}`);
              }}
              className={`flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                activeCampaignId === c.id
                  ? "bg-white/10 font-medium text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  c.status === "active" ? "bg-green-500" : "bg-gray-500"
                }`}
              />
              <span className="truncate">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
