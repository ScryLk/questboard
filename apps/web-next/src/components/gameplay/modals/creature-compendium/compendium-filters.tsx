"use client";

import { Search } from "lucide-react";
import {
  CREATURE_TYPE_LABELS,
  CREATURE_SIZE_LABELS,
  CR_FILTER_OPTIONS,
  type CreatureType,
  type CreatureSize,
} from "@/lib/creature-data";
import type { CompendiumFilterState } from "../creature-compendium-modal";

interface CompendiumFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: CompendiumFilterState;
  onFiltersChange: (filters: CompendiumFilterState) => void;
}

const typeEntries = Object.entries(CREATURE_TYPE_LABELS) as [
  CreatureType,
  string,
][];
const sizeEntries = Object.entries(CREATURE_SIZE_LABELS) as [
  CreatureSize,
  string,
][];

export function CompendiumFilters({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
}: CompendiumFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar criatura..."
          className="h-9 w-full rounded-lg border border-brand-border bg-white/[0.04] pl-9 pr-3 text-sm text-brand-text placeholder:text-brand-muted/60 focus:border-brand-accent focus:outline-none"
        />
      </div>

      {/* Filter dropdowns */}
      <div className="flex gap-2">
        {/* CR filter */}
        <select
          value={filters.cr === null ? "" : String(filters.cr)}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              cr: e.target.value === "" ? null : Number(e.target.value),
            })
          }
          className="h-8 flex-1 rounded-lg border border-brand-border bg-white/[0.04] px-2 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
        >
          <option value="">ND: Todos</option>
          {CR_FILTER_OPTIONS.map((opt, idx) => (
            <option key={idx} value={idx}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Type filter */}
        <select
          value={filters.type ?? ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              type: (e.target.value || null) as CreatureType | null,
            })
          }
          className="h-8 flex-1 rounded-lg border border-brand-border bg-white/[0.04] px-2 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
        >
          <option value="">Tipo: Todos</option>
          {typeEntries.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* Size filter */}
        <select
          value={filters.size ?? ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              size: (e.target.value || null) as CreatureSize | null,
            })
          }
          className="h-8 flex-1 rounded-lg border border-brand-border bg-white/[0.04] px-2 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
        >
          <option value="">Tamanho: Todos</option>
          {sizeEntries.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
