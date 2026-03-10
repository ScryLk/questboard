"use client";

import type { LucideIcon } from "lucide-react";

interface StatBarProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
}

export function StatBar({ icon: Icon, label, value, color = "#6C5CE7" }: StatBarProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-brand-border bg-brand-surface p-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: color + "15" }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-brand-muted">{label}</p>
        <p className="text-sm font-semibold text-brand-text">{value}</p>
      </div>
    </div>
  );
}
