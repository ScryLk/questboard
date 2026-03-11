"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Map, Plus, Search, Upload } from "lucide-react";
import { useMapLibraryStore } from "@/lib/map-library-store";
import type { MapCategory, QuestBoardMap } from "@/lib/map-types";
import { MapCard } from "@/components/maps/map-card";
import { NewMapModal } from "@/components/maps/new-map-modal";
import { ImportMapModal } from "@/components/maps/import-map-modal";
import { ExportMapModal } from "@/components/maps/export-map-modal";

type SortBy = "recent" | "name" | "size";

const CATEGORY_FILTERS: { value: MapCategory | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "dungeon", label: "Dungeon" },
  { value: "outdoor", label: "Natureza" },
  { value: "city", label: "Urbano" },
  { value: "cave", label: "Caverna" },
  { value: "custom", label: "Custom" },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "recent", label: "Recentes" },
  { value: "name", label: "Nome" },
  { value: "size", label: "Tamanho" },
];

export default function MapsPage() {
  const router = useRouter();
  const maps = useMapLibraryStore((s) => s.maps);
  const _migrated = useMapLibraryStore((s) => s._migrated);
  const migrateFromLegacy = useMapLibraryStore((s) => s.migrateFromLegacy);
  const deleteMap = useMapLibraryStore((s) => s.deleteMap);
  const duplicateMap = useMapLibraryStore((s) => s.duplicateMap);

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<MapCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [showNewModal, setShowNewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportMapId, setExportMapId] = useState<string | null>(null);

  // Hydration guard
  useEffect(() => setMounted(true), []);

  // Migrate old localStorage maps on first visit
  useEffect(() => {
    if (mounted && !_migrated) migrateFromLegacy();
  }, [mounted, _migrated, migrateFromLegacy]);

  // Filter & sort
  const filteredMaps = useMemo(() => {
    let result = Object.values(maps);
    if (category !== "all") {
      result = result.filter((m) => m.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    switch (sortBy) {
      case "recent":
        result.sort((a, b) => b.updatedAt - a.updatedAt);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "size":
        result.sort((a, b) => b.width * b.height - a.width * a.height);
        break;
    }
    return result;
  }, [maps, category, search, sortBy]);

  const exportMap = exportMapId ? maps[exportMapId] ?? null : null;

  const handleEdit = (id: string) => {
    router.push(`/maps/editor?id=${id}`);
  };

  const handleDelete = (id: string) => {
    const map = maps[id];
    if (!map) return;
    if (window.confirm(`Excluir "${map.name}"? Esta ação não pode ser desfeita.`)) {
      deleteMap(id);
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateMap(id);
  };

  const handleCreated = (id: string) => {
    router.push(`/maps/editor?id=${id}`);
  };

  // Don't render store data until mounted (avoid hydration mismatch)
  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Mapas</h1>
            <p className="mt-1 text-sm text-gray-400">
              Crie e gerencie seus mapas de batalha.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Mapas</h1>
          <p className="mt-1 text-sm text-gray-400">
            Crie e gerencie seus mapas de batalha.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 rounded-lg border border-brand-border px-4 py-2.5 text-sm text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
          >
            <Upload className="h-4 w-4" />
            Importar
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-accent/80"
          >
            <Plus className="h-4 w-4" />
            Novo Mapa
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category pills */}
        <div className="flex items-center gap-1">
          {CATEGORY_FILTERS.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                category === c.value
                  ? "bg-brand-accent text-white"
                  : "text-brand-muted hover:bg-white/5 hover:text-brand-text"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="h-8 w-44 rounded-lg border border-brand-border bg-brand-primary pl-8 pr-3 text-xs text-brand-text placeholder:text-brand-muted/60 focus:border-brand-accent focus:outline-none"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="h-8 rounded-lg border border-brand-border bg-brand-primary px-2 text-xs text-brand-muted focus:border-brand-accent focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map grid or empty state */}
      {filteredMaps.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMaps.map((map) => (
            <MapCard
              key={map.id}
              map={map}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onExport={(id) => setExportMapId(id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-16">
          <div className="text-center">
            <Map className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-3 text-gray-500">
              {search || category !== "all"
                ? "Nenhum mapa encontrado"
                : "Nenhum mapa criado ainda"}
            </p>
            {!search && category === "all" && (
              <button
                onClick={() => setShowNewModal(true)}
                className="mt-3 inline-block rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-400 hover:bg-white/10"
              >
                Criar seu primeiro mapa
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showNewModal && (
        <NewMapModal
          onClose={() => setShowNewModal(false)}
          onCreated={handleCreated}
        />
      )}
      {showImportModal && (
        <ImportMapModal
          onClose={() => setShowImportModal(false)}
        />
      )}
      {exportMap && (
        <ExportMapModal
          map={exportMap}
          onClose={() => setExportMapId(null)}
        />
      )}
    </div>
  );
}
