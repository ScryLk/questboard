import { useNavigate } from "react-router-dom";
import { useCampaignStore } from "../../lib/campaign-store.js";
import { SYSTEM_LABELS, type SupportedSystem } from "@questboard/shared";

export function DashboardHeader() {
  const navigate = useNavigate();
  const activeCampaign = useCampaignStore((s) => s.activeCampaign);
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const sessionDashboard = useCampaignStore((s) => s.sessionDashboard);
  const dashboardView = useCampaignStore((s) => s.dashboardView);
  const openCreateSession = useCampaignStore((s) => s.openCreateSession);
  const goToCampaignOverview = useCampaignStore(
    (s) => s.goToCampaignOverview,
  );

  const handleCopyCode = () => {
    if (activeCampaign?.code) {
      navigator.clipboard.writeText(activeCampaign.code);
    }
  };

  const handleBackToCampaign = () => {
    goToCampaignOverview();
    navigate(`/campaign/${activeCampaignId}`);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0F0F1A]/80 px-6 py-3 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          {dashboardView !== "campaign" && (
            <button
              onClick={handleBackToCampaign}
              className="text-gray-400 transition-colors hover:text-white"
            >
              ←
            </button>
          )}
          <button
            onClick={handleBackToCampaign}
            className={`font-medium transition-colors ${
              dashboardView === "campaign"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {activeCampaign?.name ?? "Campanha"}
          </button>
          {activeCampaign && (
            <span className="text-xs text-gray-600">
              {SYSTEM_LABELS[activeCampaign.system as SupportedSystem] ??
                activeCampaign.system}
            </span>
          )}
          {sessionDashboard && dashboardView !== "campaign" && (
            <>
              <span className="text-gray-600">/</span>
              <span className="text-white">
                #{sessionDashboard.session.order}{" "}
                {sessionDashboard.session.name}
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {activeCampaign && (
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-400 transition-colors hover:border-white/20 hover:text-white"
              title="Copiar código da campanha"
            >
              <span className="font-mono">{activeCampaign.code}</span>
              <span>⎘</span>
            </button>
          )}
          <button
            onClick={openCreateSession}
            className="rounded-lg bg-brand-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-500"
          >
            + Nova Sessão
          </button>
        </div>
      </div>
    </header>
  );
}
