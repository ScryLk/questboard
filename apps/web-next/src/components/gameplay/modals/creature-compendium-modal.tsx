"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Sparkles, X } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useCustomCreaturesStore } from "@/lib/custom-creatures-store";
import {
  CREATURE_COMPENDIUM,
  parseCR,
  CR_FILTER_OPTIONS,
  type Creature,
  type CreatureType,
  type CreatureSize,
} from "@/lib/creature-data";
import { CompendiumFilters } from "./creature-compendium/compendium-filters";
import { CreatureListItem } from "./creature-compendium/creature-list-item";
import { AIGeneratePanel } from "./creature-compendium/ai-generate-panel";

export interface CompendiumFilterState {
  cr: number | null;
  type: CreatureType | null;
  size: CreatureSize | null;
}

interface CreatureCompendiumModalProps {
  onClose: () => void;
}

export function CreatureCompendiumModal({
  onClose,
}: CreatureCompendiumModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<CompendiumFilterState>({
    cr: null,
    type: null,
    size: null,
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const customCreatures = useCustomCreaturesStore((s) => s.creatures);
  const compendiumFavorites = useGameplayStore((s) => s.compendiumFavorites);
  const toggleCompendiumFavorite = useGameplayStore(
    (s) => s.toggleCompendiumFavorite,
  );

  // Escape key handler
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Filter + sort creatures
  const filteredCreatures = useMemo(() => {
    let result: Creature[] = [...CREATURE_COMPENDIUM, ...customCreatures];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.nameEn.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // CR filter
    if (filters.cr !== null) {
      const opt = CR_FILTER_OPTIONS[filters.cr];
      if (opt) {
        result = result.filter((c) => {
          const cr = parseCR(c.cr);
          return cr >= opt.min && cr <= opt.max;
        });
      }
    }

    // Type filter
    if (filters.type) {
      result = result.filter((c) => c.type === filters.type);
    }

    // Size filter
    if (filters.size) {
      result = result.filter((c) => c.size === filters.size);
    }

    // Sort: favorites first, then by CR ascending
    return [...result].sort((a, b) => {
      const aFav = compendiumFavorites.has(a.id) ? 0 : 1;
      const bFav = compendiumFavorites.has(b.id) ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      return parseCR(a.cr) - parseCR(b.cr);
    });
  }, [searchQuery, filters, compendiumFavorites, customCreatures]);

  const favoriteCreatures = useMemo(
    () => filteredCreatures.filter((c) => compendiumFavorites.has(c.id)),
    [filteredCreatures, compendiumFavorites],
  );

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative flex max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-brand-border bg-[#0A0A0F] shadow-2xl"
        style={{ width: "min(800px, calc(100vw - 32px))" }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-brand-border px-5 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-text">
            Compendio de Criaturas
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                showAIPanel
                  ? "bg-brand-accent/30 text-brand-accent"
                  : "bg-brand-accent/10 text-brand-accent/70 hover:bg-brand-accent/20"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Gerar com IA
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* AI Generation Panel */}
        {showAIPanel && <AIGeneratePanel />}

        {/* Filters */}
        <div className="shrink-0 border-b border-brand-border px-5 py-3">
          <CompendiumFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto">
          {filteredCreatures.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-brand-muted">
                Nenhuma criatura encontrada.
              </p>
            </div>
          ) : (
            <>
              {/* Favorites section */}
              {favoriteCreatures.length > 0 && (
                <div>
                  <div className="sticky top-0 z-10 border-b border-brand-border bg-[#0A0A0F]/95 px-5 py-2 backdrop-blur-sm">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
                      Favoritos
                    </span>
                  </div>
                  {favoriteCreatures.map((creature) => (
                    <CreatureListItem
                      key={creature.id}
                      creature={creature}
                      expanded={expandedId === creature.id}
                      onToggleExpand={() => handleToggleExpand(creature.id)}
                      isFavorite={true}
                      onToggleFavorite={() =>
                        toggleCompendiumFavorite(creature.id)
                      }
                    />
                  ))}
                </div>
              )}

              {/* All creatures section */}
              <div>
                <div className="sticky top-0 z-10 border-b border-brand-border bg-[#0A0A0F]/95 px-5 py-2 backdrop-blur-sm">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                    Todas as Criaturas
                  </span>
                  <span className="ml-2 text-[10px] tabular-nums text-brand-muted/60">
                    ({filteredCreatures.length})
                  </span>
                </div>
                {filteredCreatures.map((creature) => (
                  <CreatureListItem
                    key={creature.id}
                    creature={creature}
                    expanded={expandedId === creature.id}
                    onToggleExpand={() => handleToggleExpand(creature.id)}
                    isFavorite={compendiumFavorites.has(creature.id)}
                    onToggleFavorite={() =>
                      toggleCompendiumFavorite(creature.id)
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
