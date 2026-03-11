"use client";

import { Users, Calendar } from "lucide-react";
import type { ProfileCampaign } from "@/types/profile";
import { CAMPAIGN_STATUS_LABELS } from "@/types/profile";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-brand-success/10 text-brand-success",
  completed: "bg-emerald-500/10 text-emerald-400",
  paused: "bg-brand-warning/10 text-brand-warning",
  abandoned: "bg-brand-danger/10 text-brand-danger",
};

interface CampaignCardProps {
  campaign: ProfileCampaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface">
      {/* Cover */}
      <div
        className="h-20 w-full"
        style={{ background: campaign.coverGradient }}
      />

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-brand-text">
              {campaign.name}
            </h3>
            <p className="mt-0.5 text-[11px] text-brand-muted">{campaign.system}</p>
          </div>
          <span
            className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[campaign.status] ?? ""}`}
          >
            {CAMPAIGN_STATUS_LABELS[campaign.status]}
          </span>
        </div>

        {/* Meta */}
        <div className="mt-3 flex items-center gap-4 text-[11px] text-brand-muted">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {campaign.playerCount} jogadores
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {campaign.sessionCount} sessões
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] text-brand-muted">Progresso</span>
            <span className="text-[10px] font-medium tabular-nums text-brand-text">
              {campaign.progress}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-brand-accent transition-all"
              style={{ width: `${campaign.progress}%` }}
            />
          </div>
        </div>

        {/* Role badge */}
        <div className="mt-3">
          <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-brand-muted">
            {campaign.role === "gm" ? "Mestre" : "Jogador"}
          </span>
        </div>
      </div>
    </div>
  );
}
