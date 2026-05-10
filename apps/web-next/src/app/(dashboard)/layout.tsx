"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CreateSessionModal } from "@/components/create-session-modal";
import { CampaignSettingsModal } from "@/components/campaigns/campaign-settings-modal";
import { CampaignQuickModalHost } from "@/components/campaigns/campaign-quick-modal";
import { useCreateSessionModalStore } from "@/lib/create-session-modal-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOpen = useCreateSessionModalStore((s) => s.isOpen);
  const prefilledSystem = useCreateSessionModalStore((s) => s.prefilledSystem);
  const openModal = useCreateSessionModalStore((s) => s.open);
  const closeModal = useCreateSessionModalStore((s) => s.close);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-primary">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onCreateSession={() => openModal()} />
        {/* Padding menor em mobile pra conteúdo não ficar espremido. */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
      <CreateSessionModal
        open={isOpen}
        onClose={closeModal}
        prefilledSystem={prefilledSystem}
      />
      <CampaignSettingsModal />
      <CampaignQuickModalHost />
    </div>
  );
}
