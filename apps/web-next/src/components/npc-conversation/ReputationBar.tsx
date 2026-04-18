"use client";

import { getReputationLabel, REPUTATION_LABELS } from "@/lib/npc-conversation-types";

interface ReputationBarProps {
  reputation: number;
}

export function ReputationBar({ reputation }: ReputationBarProps) {
  const { label, color } = getReputationLabel(reputation);
  const normalized = (reputation + 100) / 200;

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-medium text-[#555]">Reputação</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#1a1a25]">
        {/* Gradient background showing the full spectrum */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(to right, ${REPUTATION_LABELS[0].color}, ${REPUTATION_LABELS[1].color}, ${REPUTATION_LABELS[2].color}, ${REPUTATION_LABELS[3].color}, ${REPUTATION_LABELS[4].color})`,
          }}
        />
        {/* Fill indicator */}
        <div
          className="absolute top-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${normalized * 100}%`,
            backgroundColor: color,
          }}
        />
        {/* Center marker */}
        <div className="absolute left-1/2 top-0 h-full w-px bg-[#333]" />
      </div>
      <span
        className="min-w-[80px] text-right text-[10px] font-semibold"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}
