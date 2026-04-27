"use client";

// Tab nav entre as 3 páginas de gestão de uma campanha.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Settings, Users } from "lucide-react";
import { useCampaignModalsStore } from "@/lib/campaign-modals-store";

interface Props {
  campaignId: string;
}

export function CampaignSubNav({ campaignId }: Props) {
  const pathname = usePathname();
  const openSettings = useCampaignModalsStore((s) => s.openSettings);

  const tabs = [
    {
      href: `/campaigns/${campaignId}`,
      label: "Visão geral",
      icon: LayoutGrid,
    },
    {
      href: `/campaigns/${campaignId}/members`,
      label: "Membros",
      icon: Users,
    },
  ];

  return (
    <div className="flex items-center border-b border-brand-border">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
              active
                ? "border-brand-accent text-brand-accent"
                : "border-transparent text-brand-muted hover:text-brand-text"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        );
      })}
      <button
        onClick={() => openSettings(campaignId)}
        className="ml-auto flex items-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-xs font-medium text-brand-muted transition-colors hover:text-brand-text"
        title="Abrir configurações"
      >
        <Settings className="h-3.5 w-3.5" />
        Configurações
      </button>
    </div>
  );
}
