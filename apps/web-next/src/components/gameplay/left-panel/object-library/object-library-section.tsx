"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Package,
  Plus,
  Search,
  Star,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useObjectStore } from "@/stores/objectStore";
import { GameTooltip } from "@/components/ui/game-tooltip";
import { ObjectLibraryItem } from "./object-library-item";
import type { ObjectCategory } from "@/types/object";

type CategoryFilter = ObjectCategory | "all";

export function ObjectLibrarySection() {
  const collapsed = useGameplayStore((s) => s.collapsedSections["objects"]);
  const toggleSection = useGameplayStore((s) => s.toggleSection);
  const openModal = useGameplayStore((s) => s.openModal);
  const setObjectEditorTarget = useGameplayStore(
    (s) => s.setObjectEditorTarget,
  );

  const objects = useObjectStore((s) => s.objects);
  const mapInstances = useObjectStore((s) => s.mapInstances);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Determine which objects are on the current map
  const onMapObjectIds = useMemo(() => {
    const ids = new Set(mapInstances.map((i) => i.objectId));
    return ids;
  }, [mapInstances]);

  // Filter & sort
  const filteredObjects = useMemo(() => {
    let list = objects;

    if (categoryFilter !== "all") {
      list = list.filter((o) => o.category === categoryFilter);
    }

    if (favoritesOnly) {
      list = list.filter((o) => o.favorite);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          o.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return [...list].sort((a, b) => {
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, [objects, categoryFilter, search, favoritesOnly]);

  const onSceneObjects = filteredObjects.filter((o) =>
    onMapObjectIds.has(o.id),
  );
  const savedObjects = filteredObjects.filter(
    (o) => !onMapObjectIds.has(o.id),
  );

  const totalOnScene = objects.filter((o) => onMapObjectIds.has(o.id)).length;

  function handleCreate() {
    setObjectEditorTarget(null);
    openModal("objectEditor");
  }

  return (
    <div className="border-b border-brand-border">
      {/* Header */}
      <div className="flex items-center transition-colors hover:bg-white/[0.02]">
        <button
          onClick={() => toggleSection("objects")}
          className="flex flex-1 items-center gap-2 px-3 py-2 text-left"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-brand-muted" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-brand-muted" />
          )}
          <Package className="h-3.5 w-3.5 text-brand-accent" />
          <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-brand-text">
            Objetos
          </span>
          {totalOnScene > 0 && (
            <span className="rounded-full bg-brand-accent/15 px-1.5 py-0.5 text-[9px] tabular-nums text-brand-accent">
              {totalOnScene}
            </span>
          )}
        </button>
        <GameTooltip label="Criar Objeto" side="bottom">
          <button
            onClick={handleCreate}
            className="mr-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg text-brand-muted transition-colors hover:bg-white/10 hover:text-brand-text"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </GameTooltip>
      </div>

      {!collapsed && (
        <div className="pb-2">
          {/* Filters */}
          <div className="space-y-1.5 px-2 pb-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-brand-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="h-6 w-full rounded-md border border-brand-border bg-[#0A0A0F] pl-7 pr-2 text-[10px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
              />
            </div>

            {/* Category + favorites */}
            <div className="flex items-center gap-1">
              {(
                [
                  { key: "all", label: "Todos" },
                  { key: "scenery", label: "Cenário" },
                  { key: "item", label: "Itens" },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setCategoryFilter(key)}
                  className={`rounded px-1.5 py-0.5 text-[9px] font-medium transition-colors ${
                    categoryFilter === key
                      ? "bg-brand-accent/15 text-brand-accent"
                      : "text-brand-muted hover:text-brand-text"
                  }`}
                >
                  {label}
                </button>
              ))}
              <div className="flex-1" />
              <button
                onClick={() => setFavoritesOnly((v) => !v)}
                className="shrink-0"
              >
                <Star
                  className={`h-3 w-3 ${
                    favoritesOnly
                      ? "fill-[#FDCB6E] text-[#FDCB6E]"
                      : "text-brand-muted/30 hover:text-brand-muted"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Object List */}
          {filteredObjects.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-[10px] text-brand-muted">
                {objects.length === 0
                  ? "Nenhum objeto criado ainda."
                  : "Nenhum objeto encontrado."}
              </p>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto px-1">
              {/* On Scene */}
              {onSceneObjects.length > 0 && (
                <div>
                  <div className="px-2 pb-0.5 pt-1.5">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-accent">
                      Na Cena ({onSceneObjects.length})
                    </span>
                  </div>
                  {onSceneObjects.map((obj) => (
                    <ObjectLibraryItem
                      key={obj.id}
                      object={obj}
                      isOnMap={true}
                    />
                  ))}
                </div>
              )}

              {/* Saved */}
              {savedObjects.length > 0 && (
                <div>
                  <div className="px-2 pb-0.5 pt-1.5">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-muted">
                      Salvos ({savedObjects.length})
                    </span>
                  </div>
                  {savedObjects.map((obj) => (
                    <ObjectLibraryItem
                      key={obj.id}
                      object={obj}
                      isOnMap={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
