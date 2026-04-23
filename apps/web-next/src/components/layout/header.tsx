"use client";

import { Bell, Menu, Plus } from "lucide-react";
import { GlobalSearch } from "@/components/search/global-search";
import { useActiveCampaignId } from "@/lib/active-campaign";
import { useMobileSidebar } from "@/lib/mobile-sidebar-store";

interface HeaderProps {
  onCreateSession?: () => void;
}

export function Header({ onCreateSession }: HeaderProps) {
  const { campaignId } = useActiveCampaignId();
  const openSidebar = useMobileSidebar((s) => s.setOpen);

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

      {/* Campaign info — trunca em mobile */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-bold text-brand-text md:text-lg">
          A Maldicao de Strahd
        </h1>
        <p className="hidden text-xs text-brand-muted md:block">
          Campanha ativa - 12 sessoes - 4 jogadores
        </p>
      </div>

      {/* Search + ações — alguns itens escondem em mobile pra caber */}
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <div className="hidden md:block">
          <GlobalSearch campaignId={campaignId} context="dashboard" />
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

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-accent/20 text-xs font-bold text-brand-accent">
          LS
        </div>
      </div>
    </header>
  );
}
