"use client";

import { Skull, UserCheck, UserMinus } from "lucide-react";
import type { ProfileCharacter, CharacterStatus } from "@/types/profile";
import { CHARACTER_STATUS_LABELS } from "@/types/profile";

const STATUS_CONFIG: Record<CharacterStatus, { color: string; icon: React.ElementType }> = {
  active: { color: "#10B981", icon: UserCheck },
  retired: { color: "#9090A0", icon: UserMinus },
  deceased: { color: "#EF4444", icon: Skull },
};

interface CharacterShowcaseCardProps {
  character: ProfileCharacter;
}

export function CharacterShowcaseCard({ character }: CharacterShowcaseCardProps) {
  const config = STATUS_CONFIG[character.status];
  const StatusIcon = config.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-brand-border bg-brand-surface p-4 transition-colors hover:border-brand-border/80 ${
        character.status === "deceased" ? "opacity-80" : ""
      }`}
    >
      {/* Deceased vignette */}
      {character.status === "deceased" && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      )}

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-accent/20 text-lg font-bold text-brand-accent">
          {character.name.charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-brand-text">
            {character.name}
          </h3>
          <p className="text-[11px] text-brand-muted">
            {character.class} Nv. {character.level} · {character.race}
          </p>
          <p className="mt-1 text-[11px] text-brand-muted">
            {character.campaignName}
          </p>
        </div>
      </div>

      {/* Status badge */}
      <div className="mt-3 flex items-center gap-1.5">
        <StatusIcon className="h-3 w-3" style={{ color: config.color }} />
        <span className="text-[10px] font-medium" style={{ color: config.color }}>
          {CHARACTER_STATUS_LABELS[character.status]}
        </span>
      </div>
    </div>
  );
}
