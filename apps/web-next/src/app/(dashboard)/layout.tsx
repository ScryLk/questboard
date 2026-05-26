"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CreateSessionModal } from "@/components/create-session-modal";
import { CampaignSettingsModal } from "@/components/campaigns/campaign-settings-modal";
import { CampaignQuickModalHost } from "@/components/campaigns/campaign-quick-modal";
import { useCreateSessionModalStore } from "@/lib/create-session-modal-store";
import { useReconcileCampaigns } from "@/hooks/use-reconcile-campaigns";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOpen = useCreateSessionModalStore((s) => s.isOpen);
  const prefilledSystem = useCreateSessionModalStore((s) => s.prefilledSystem);
  const prefilledCampaignId = useCreateSessionModalStore(
    (s) => s.prefilledCampaignId,
  );
  const openModal = useCreateSessionModalStore((s) => s.open);
  const closeModal = useCreateSessionModalStore((s) => s.close);

  // Limpa campanhas fantasma do cache local quando o backend diz que
  // não existem mais (deleção/reset de DB). Sem isso a sidebar mostra
  // campanhas que o servidor já não conhece.
  useReconcileCampaigns();

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
        prefilledCampaignId={prefilledCampaignId}
      />
      <CampaignSettingsModal />
      <CampaignQuickModalHost />
    </div>
  );
}
