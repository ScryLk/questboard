import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCampaignStore } from "../../lib/campaign-store.js";
import { KPICards } from "../../components/dashboard/kpi-cards.js";
import { SessionList } from "../../components/dashboard/session-list.js";
import { PlayerStatsPanel } from "../../components/dashboard/player-stats-panel.js";
import { ActivityFeed } from "../../components/dashboard/activity-feed.js";
import { NextSessionCard } from "../../components/dashboard/next-session-card.js";

export function CampaignDashboardPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { selectCampaign, campaignDashboard } = useCampaignStore();

  useEffect(() => {
    if (campaignId) selectCampaign(campaignId);
  }, [campaignId, selectCampaign]);

  if (!campaignDashboard) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Campanha não encontrada
      </div>
    );
  }

  const { kpis, sessions, players, recentActivity, nextSession } =
    campaignDashboard;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <KPICards kpis={kpis} />

      {/* Sessions + Players */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SessionList sessions={sessions} />
        </div>
        <div>
          <PlayerStatsPanel players={players} />
        </div>
      </div>

      {/* Activity + Next Session */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed activities={recentActivity} />
        </div>
        <div>
          <NextSessionCard session={nextSession} />
        </div>
      </div>
    </div>
  );
}
