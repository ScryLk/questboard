"use client";

import { Bell, Menu, Plus, Users, ScrollText } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { GlobalSearch } from "@/components/search/global-search";
import { useActiveCampaignId } from "@/lib/active-campaign";
import { useMobileSidebar } from "@/lib/mobile-sidebar-store";
import { useCampaignStore } from "@/lib/campaign-store";
import { useCampaignModalsStore } from "@/lib/campaign-modals-store";
import { ActiveCampaignPill } from "@/components/campaigns/active-campaign-pill";

interface HeaderProps {
  onCreateSession?: () => void;
}

export function Header({ onCreateSession }: HeaderProps) {
  const { campaignId: legacyCampaignId } = useActiveCampaignId();
  const openSidebar = useMobileSidebar((s) => s.setOpen);
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const activeCampaign = useCampaignStore((s) =>
    activeCampaignId ? s.campaigns.find((c) => c.id === activeCampaignId) ?? null : null,
  );
  const openPreview = useCampaignModalsStore((s) => s.openPreview);

  return (
    <header className="flex h-14 items-center gap-2 border-b border-brand-border px-3 md:gap-3 md:px-6">
      {/* Hamburger — só em mobile */}
      <button
        onClick={() => openSidebar(true)}
        className="cursor-pointer rounded-lg p-2 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Campaign info — clica abre o quick modal. Caso sem ativa, mostra CTA. */}
      <div className="min-w-0 flex-1">
        {activeCampaign ? (
          <button
            onClick={() => openPreview(activeCampaign.id)}
            className="block w-full min-w-0 text-left transition-colors hover:opacity-80"
            title="Ver detalhes da campanha ativa"
          >
            <h1 className="truncate text-base font-bold text-brand-text md:text-lg">
              {activeCampaign.name}
            </h1>
            <p className="hidden truncate text-xs text-brand-muted md:flex md:items-center md:gap-2">
              <span>Campanha ativa</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <ScrollText className="h-3 w-3" />
                {activeCampaign.sessionCount}{" "}
                {activeCampaign.sessionCount === 1 ? "sessão" : "sessões"}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {activeCampaign.memberCount}{" "}
                {activeCampaign.memberCount === 1 ? "membro" : "membros"}
              </span>
            </p>
          </button>
        ) : (
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-brand-text md:text-lg">
              QuestBoard
            </h1>
            <p className="hidden text-xs text-brand-muted md:block">
              Nenhuma campanha ativa
            </p>
          </div>
        )}
      </div>

      {/* Search + ações — alguns itens escondem em mobile pra caber */}
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {/* Pílula da campanha ativa — visual destacado pra reforçar contexto */}
        <ActiveCampaignPill />

        <div className="hidden md:block">
          <GlobalSearch campaignId={legacyCampaignId} context="dashboard" />
        </div>

        {onCreateSession && (
          <button
            onClick={onCreateSession}
            className="flex cursor-pointer items-center gap-2 rounded-[10px] bg-brand-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-accent-hover md:px-4"
            aria-label="Nova sessão"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Nova Sessao</span>
          </button>
        )}

        <button className="relative hidden rounded-lg p-2 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text md:block">
          <Bell className="h-4 w-4" />
        </button>

        {/* Avatar + menu de conta (sign-out, perfil). Renderiza
            shell até o Clerk carregar pra evitar CLS. */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </header>
  );
}
