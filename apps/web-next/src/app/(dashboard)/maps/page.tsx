"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, Map, Plus, Search, Sparkles, Upload } from "lucide-react";
import { useMapLibraryStore } from "@/lib/map-library-store";
import { useMapCollectionsStore } from "@/lib/map-collections-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { MapCategory } from "@/lib/map-types";
import { MapCard } from "@/components/maps/map-card";
import { MapCollectionCard } from "@/components/maps/map-collection-card";
import { NewMapModal } from "@/components/maps/new-map-modal";
import { ImportMapModal } from "@/components/maps/import-map-modal";
import { ExportMapModal } from "@/components/maps/export-map-modal";
import { CreateCollectionDialog } from "@/components/maps/create-collection-dialog";
import { MoveToCollectionDialog } from "@/components/maps/move-to-collection-dialog";

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
  const addMap = useMapLibraryStore((s) => s.addMap);
  const clearCollectionFromMaps = useMapLibraryStore((s) => s.clearCollectionFromMaps);
  const loadMapFromLibrary = useGameplayStore((s) => s.loadMapFromLibrary);

  const collections = useMapCollectionsStore((s) => s.collections);
  const deleteCollection = useMapCollectionsStore((s) => s.deleteCollection);
  const updateCollection = useMapCollectionsStore((s) => s.updateCollection);

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<MapCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [showNewModal, setShowNewModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [moveMapId, setMoveMapId] = useState<string | null>(null);
  const [exportMapId, setExportMapId] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !_migrated) migrateFromLegacy();
  }, [mounted, _migrated, migrateFromLegacy]);

  const allMaps = useMemo(() => Object.values(maps), [maps]);

  const mapsByCollection = useMemo(() => {
    const grouped: Record<string, typeof allMaps> = {};
    for (const m of allMaps) {
      if (m.collectionId) {
        (grouped[m.collectionId] ||= []).push(m);
      }
    }
    return grouped;
  }, [allMaps]);

  const matchesFilters = (map: (typeof allMaps)[number]) => {
    if (category !== "all" && map.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      const hit =
        map.name.toLowerCase().includes(q) ||
        map.description.toLowerCase().includes(q) ||
        map.tags.some((t) => t.toLowerCase().includes(q));
      if (!hit) return false;
    }
    return true;
  };

  const unassignedMaps = useMemo(() => {
    const result = allMaps.filter((m) => !m.collectionId && matchesFilters(m));
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
  }, [allMaps, category, search, sortBy]);

  const visibleCollections = useMemo(() => {
    const list = Object.values(collections);
    return list
      .filter((c) => {
        const mapsOfCollection = mapsByCollection[c.id] ?? [];
        const anyMatches = mapsOfCollection.some(matchesFilters);
        const searchHitName = search
          ? c.name.toLowerCase().includes(search.toLowerCase())
          : false;
        if (category === "all" && !search) return true;
        return anyMatches || searchHitName;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [collections, mapsByCollection, category, search]);

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

  const handleCreateWithAI = () => {
    setShowAIModal(true);
  };

  const handleAICreated = (
    id: string,
    aiParams?: { description: string; regionMode: boolean },
  ) => {
    const params = new URLSearchParams({ id, ai: "1" });
    if (aiParams?.regionMode) {
      params.set("region", "1");
    } else if (aiParams?.description) {
      params.set("prompt", aiParams.description);
    }
    router.push(`/maps/editor?${params.toString()}`);
  };

  const handlePlay = (id: string) => {
    const result = loadMapFromLibrary(id);
    if ("error" in result) {
      window.alert(result.error);
      return;
    }
    router.push(`/gameplay/local`);
  };

  const handleRenameCollection = (id: string) => {
    const current = collections[id];
    if (!current) return;
    const newName = window.prompt("Novo nome da coleção:", current.name)?.trim();
    if (!newName || newName === current.name) return;
    const result = updateCollection(id, { name: newName });
    if ("error" in result) {
      window.alert(result.error);
    }
  };

  const handleDeleteCollection = (id: string) => {
    const collection = collections[id];
    if (!collection) return;
    const count = (mapsByCollection[id] ?? []).length;
    const msg =
      count === 0
        ? `Deletar coleção "${collection.name}"?`
        : count === 1
          ? `Deletar coleção "${collection.name}"? O mapa volta para a raiz.`
          : `Deletar coleção "${collection.name}"? Os ${count} mapas voltam para a raiz.`;
    if (!window.confirm(msg)) return;
    clearCollectionFromMaps(id);
    deleteCollection(id);
  };

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

  const hasAnyCollection = visibleCollections.length > 0;

  const totalMaps = allMaps.length;
  const totalCollections = Object.keys(collections).length;
  const totalObjects = allMaps.reduce((acc, m) => acc + (m.stats?.objectCount ?? 0), 0);
  const totalWalls = allMaps.reduce((acc, m) => acc + (m.stats?.wallCount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Mapas</h1>
          <p className="mt-1 text-sm text-gray-400">
            Crie e gerencie seus mapas de batalha.
          </p>
          {totalMaps > 0 && (
            <p className="mt-1.5 text-[11px] text-brand-muted">
              {totalMaps} {totalMaps === 1 ? "mapa" : "mapas"}
              {totalCollections > 0 && (
                <>
                  {" · "}
                  {totalCollections} {totalCollections === 1 ? "coleção" : "coleções"}
                </>
              )}
              {" · "}
              {totalWalls} paredes · {totalObjects} objetos
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateCollectionModal(true)}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-brand-border px-4 py-2.5 text-sm text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
          >
            <FolderPlus className="h-4 w-4" />
            Nova Coleção
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-brand-border px-4 py-2.5 text-sm text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
          >
            <Upload className="h-4 w-4" />
            Importar
          </button>
          <button
            onClick={handleCreateWithAI}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-brand-accent/30 bg-brand-accent/10 px-4 py-2.5 text-sm font-medium text-brand-accent transition-colors hover:bg-brand-accent/20"
          >
            <Sparkles className="h-4 w-4" />
            Gerar com IA
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-accent/80"
          >
            <Plus className="h-4 w-4" />
            Novo Mapa
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
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

      {hasAnyCollection && (
        <section className="space-y-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            Coleções
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleCollections.map((c) => (
              <MapCollectionCard
                key={c.id}
                collection={c}
                maps={mapsByCollection[c.id] ?? []}
                onRename={handleRenameCollection}
                onDelete={handleDeleteCollection}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
          Mapas
        </h2>
        {unassignedMaps.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {unassignedMaps.map((map) => (
              <MapCard
                key={map.id}
                map={map}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onExport={(id) => setExportMapId(id)}
                onMoveToCollection={(id) => setMoveMapId(id)}
                onPlay={handlePlay}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 px-6 py-16">
            <div className="max-w-xl text-center">
              <Map className="mx-auto h-12 w-12 text-gray-600" />
              <p className="mt-3 text-gray-400">
                {search || category !== "all"
                  ? "Nenhum mapa encontrado"
                  : hasAnyCollection
                    ? "Nenhum mapa solto — todos estão em coleções."
                    : "Comece sua jornada"}
              </p>
              {!search && category === "all" && !hasAnyCollection && (
                <>
                  <p className="mt-2 text-sm text-brand-muted">
                    Crie seu primeiro mapa do zero, gere com IA a partir de uma descrição, ou importe um JSON exportado.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => setShowNewModal(true)}
                      className="flex cursor-pointer items-center gap-2 rounded-lg bg-brand-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-accent/80"
                    >
                      <Plus className="h-4 w-4" />
                      Criar do zero
                    </button>
                    <button
                      onClick={handleCreateWithAI}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-brand-accent/30 bg-brand-accent/10 px-4 py-2 text-sm font-medium text-brand-accent transition-colors hover:bg-brand-accent/20"
                    >
                      <Sparkles className="h-4 w-4" />
                      Gerar com IA
                    </button>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-brand-border px-4 py-2 text-sm text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
                    >
                      <Upload className="h-4 w-4" />
                      Importar JSON
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {showNewModal && (
        <NewMapModal
          onClose={() => setShowNewModal(false)}
          onCreated={handleCreated}
        />
      )}
      {showAIModal && (
        <NewMapModal
          aiMode
          onClose={() => setShowAIModal(false)}
          onCreated={handleAICreated}
        />
      )}
      {showImportModal && (
        <ImportMapModal
          onClose={() => setShowImportModal(false)}
        />
      )}
      {showCreateCollectionModal && (
        <CreateCollectionDialog
          onClose={() => setShowCreateCollectionModal(false)}
          onCreated={(id) => router.push(`/maps/collections/${id}`)}
        />
      )}
      {moveMapId && (
        <MoveToCollectionDialog
          mapId={moveMapId}
          onClose={() => setMoveMapId(null)}
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
