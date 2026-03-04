import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCampaignStore } from "../../lib/campaign-store.js";
import { SessionOverview } from "../../components/dashboard/session-overview.js";
import { ScheduledSessionView } from "../../components/dashboard/scheduled-session-view.js";
import { LiveSessionView } from "../../components/dashboard/live-session-view.js";

export function SessionDashboardPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const {
    selectSession,
    sessionDashboard,
    scheduledSessionData,
    dashboardView,
  } = useCampaignStore();

  useEffect(() => {
    if (sessionId) selectSession(sessionId);
  }, [sessionId, selectSession]);

  if (!sessionDashboard) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Sessão não encontrada
      </div>
    );
  }

  if (dashboardView === "scheduled" && scheduledSessionData) {
    return <ScheduledSessionView data={scheduledSessionData} />;
  }

  if (dashboardView === "live") {
    return <LiveSessionView data={sessionDashboard} />;
  }

  return <SessionOverview data={sessionDashboard} />;
}
