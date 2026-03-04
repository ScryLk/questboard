"use client";

import { Star } from "lucide-react";
import {
  getCRColor,
  CREATURE_TYPE_LABELS,
  CREATURE_SIZE_LABELS,
  type Creature,
} from "@/lib/creature-data";
import { CreatureStatBlock } from "./creature-stat-block";

const SIZE_ABBREVIATIONS: Record<string, string> = {
  Minusculo: "Min",
  Pequeno: "P",
  Medio: "M",
  Grande: "G",
  Enorme: "E",
  Colossal: "C",
};

interface CreatureListItemProps {
  creature: Creature;
  expanded: boolean;
  onToggleExpand: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function CreatureListItem({
  creature,
  expanded,
  onToggleExpand,
  isFavorite,
  onToggleFavorite,
}: CreatureListItemProps) {
  const crColor = getCRColor(creature.cr);
  const typeLabel = CREATURE_TYPE_LABELS[creature.type];
  const sizeLabel = CREATURE_SIZE_LABELS[creature.size];
  const sizeAbbr = SIZE_ABBREVIATIONS[sizeLabel] ?? sizeLabel;

  return (
    <div className="border-b border-brand-border">
      {/* Row */}
      <div
        className="flex cursor-pointer items-center gap-3 px-5 py-2.5 transition-colors hover:bg-white/[0.03]"
        onClick={onToggleExpand}
      >
        {/* Icon */}
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-base">
          {creature.icon}
        </span>

        {/* Name */}
        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-brand-text">
            {creature.name}
          </span>
          <span className="block text-[11px] text-brand-muted">
            {typeLabel}
          </span>
        </div>

        {/* CR badge */}
        <span
          className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums"
          style={{
            color: crColor,
            backgroundColor: crColor + "18",
          }}
        >
          ND {creature.cr}
        </span>

        {/* Size abbreviation */}
        <span className="w-7 shrink-0 text-center text-[11px] font-medium text-brand-muted">
          {sizeAbbr}
        </span>

        {/* HP */}
        <span className="w-10 shrink-0 text-center text-xs tabular-nums text-brand-muted">
          {creature.hp} HP
        </span>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-white/[0.06]"
        >
          <Star
            className={`h-3.5 w-3.5 ${
              isFavorite
                ? "fill-yellow-400 text-yellow-400"
                : "text-brand-muted"
            }`}
          />
        </button>
      </div>

      {/* Expanded stat block */}
      {expanded && (
        <div className="border-t border-brand-border/50 px-5 py-4">
          <CreatureStatBlock creature={creature} />
        </div>
      )}
    </div>
  );
}
