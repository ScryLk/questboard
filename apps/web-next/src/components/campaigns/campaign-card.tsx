"use client";

import Link from "next/link";
import { Lock, Globe, Hash, Castle, Users, ScrollText } from "lucide-react";
import type { CampaignDetailed, CampaignVisibility } from "@questboard/types";
import { CAMPAIGN_SYSTEMS } from "@questboard/constants";

const SYSTEM_LABELS = Object.fromEntries(
  CAMPAIGN_SYSTEMS.map((s) => [s.value, s.label] as const),
) as Record<string, string>;

const VISIBILITY_ICON: Record<CampaignVisibility, typeof Lock> = {
  PRIVATE: Lock,
  CODE: Hash,
  PUBLIC: Globe,
};

const VISIBILITY_LABEL: Record<CampaignVisibility, string> = {
  PRIVATE: "Privada",
  CODE: "Código",
  PUBLIC: "Pública",
};

interface Props {
  campaign: CampaignDetailed;
}

export function CampaignCard({ campaign: c }: Props) {
  const VisibilityIcon = VISIBILITY_ICON[c.visibility];
  const isArchived = c.status === "archived";

  return (
    <Link
      href={`/campaigns/${c.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-lg border border-brand-border bg-brand-surface transition-colors hover:border-brand-accent/50 ${
        isArchived ? "opacity-60" : ""
      }`}
    >
      {/* Cover */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-brand-accent/20 via-brand-surface-light to-brand-accent-muted">
        {c.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.coverImageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
        {!c.coverImageUrl && (
          <div className="flex h-full w-full items-center justify-center">
            <Castle className="h-10 w-10 text-brand-accent/40" />
          </div>
        )}

        {/* Badges sobre a capa */}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {c.isSoloStory && (
            <span className="rounded-full border border-brand-accent/40 bg-brand-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-accent backdrop-blur-sm">
              Solo
            </span>
          )}
          {isArchived && (
            <span className="rounded-full border border-brand-muted/40 bg-black/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-muted backdrop-blur-sm">
              Arquivada
            </span>
          )}
        </div>

        <span
          className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-brand-border bg-black/40 px-2 py-0.5 text-[9px] font-medium text-brand-text backdrop-blur-sm"
          title={VISIBILITY_LABEL[c.visibility]}
        >
          <VisibilityIcon className="h-2.5 w-2.5" />
          {VISIBILITY_LABEL[c.visibility]}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-1 font-cinzel text-sm font-semibold text-brand-text group-hover:text-brand-accent">
          {c.name}
        </h3>

        <p className="text-[10px] uppercase tracking-wider text-brand-muted">
          {SYSTEM_LABELS[c.system] ?? c.system}
        </p>

        {c.synopsis && (
          <p className="line-clamp-2 text-[11px] text-brand-muted">
            {c.synopsis}
          </p>
        )}

        <div className="mt-auto flex items-center gap-3 pt-1 text-[10px] text-brand-muted">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {c.memberCount}
          </span>
          <span className="flex items-center gap-1">
            <ScrollText className="h-3 w-3" />
            {c.sessionCount}{" "}
            {c.sessionCount === 1 ? "sessão" : "sessões"}
          </span>
          {c.tags.length > 0 && (
            <span className="ml-auto truncate text-brand-muted/70">
              #{c.tags[0]}
              {c.tags.length > 1 && ` +${c.tags.length - 1}`}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
