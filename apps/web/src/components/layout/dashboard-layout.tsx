import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { Sidebar } from "./sidebar.js";
import { DashboardHeader } from "./dashboard-header.js";
import { useCampaignStore } from "../../lib/campaign-store.js";
import { CreateSessionModal } from "../dashboard/create-session-modal.js";

export function DashboardLayout() {
  const loadCampaigns = useCampaignStore((s) => s.loadCampaigns);
  const sidebarCollapsed = useCampaignStore((s) => s.sidebarCollapsed);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  return (
    <div className="flex h-screen bg-brand-primary">
      <Sidebar />
      <main
        className={`flex-1 overflow-y-auto transition-all ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <DashboardHeader />
        <div className="p-6">
          <Outlet />
        </div>
      </main>
      <CreateSessionModal />
    </div>
  );
}
