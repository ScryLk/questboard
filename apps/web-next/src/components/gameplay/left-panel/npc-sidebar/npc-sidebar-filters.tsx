"use client";

import { Search } from "lucide-react";
import type { NPCFilter, NPCType } from "@/lib/npc-types";

interface NPCSidebarFiltersProps {
  filter: NPCFilter;
  onFilterChange: (filter: NPCFilter) => void;
}

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "in_scene", label: "Na Cena" },
  { value: "ally", label: "Aliados" },
  { value: "hostile", label: "Hostis" },
  { value: "neutral", label: "Neutros" },
  { value: "merchant", label: "Comerciantes" },
  { value: "ai", label: "Com IA" },
  { value: "favorite", label: "Favoritos" },
];

export function NPCSidebarFilters({
  filter,
  onFilterChange,
}: NPCSidebarFiltersProps) {
  const activeFilter = filter.favorite
    ? "favorite"
    : filter.hasAI
      ? "ai"
      : filter.inScene
        ? "in_scene"
        : filter.type ?? "all";

  function handleFilterSelect(value: string) {
    const next: NPCFilter = { search: filter.search };
    if (value === "favorite") next.favorite = true;
    else if (value === "ai") next.hasAI = true;
    else if (value === "in_scene") next.inScene = true;
    else if (["ally", "hostile", "neutral", "merchant"].includes(value))
      next.type = value as NPCType;
    onFilterChange(next);
  }

  return (
    <div className="space-y-1.5 px-2 pb-1.5">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-brand-muted/50" />
        <input
          type="text"
          value={filter.search ?? ""}
          onChange={(e) =>
            onFilterChange({ ...filter, search: e.target.value || undefined })
          }
          placeholder="Buscar NPC..."
          className="h-7 w-full rounded-md border border-brand-border bg-brand-primary pl-7 pr-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/50 focus:border-brand-accent/40"
        />
      </div>

      <select
        value={activeFilter}
        onChange={(e) => handleFilterSelect(e.target.value)}
        className="h-6 w-full rounded-md border border-brand-border bg-brand-primary px-1.5 text-[10px] text-brand-muted outline-none focus:border-brand-accent/40"
      >
        {FILTER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
