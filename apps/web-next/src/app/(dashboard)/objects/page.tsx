"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Star } from "lucide-react";
import { useObjectStore, createDefaultObject } from "@/stores/objectStore";
import { useGameplayStore } from "@/lib/gameplay-store";
import { ObjectCard } from "@/components/objects/object-card";
import { ObjectEditorModal } from "@/components/gameplay/modals/object-editor/object-editor-modal";
import type { ObjectCategory } from "@/types/object";
import { CATEGORY_CONFIG } from "@/types/object";

type CategoryFilter = ObjectCategory | "all";

export default function ObjectsPage() {
  const objects = useObjectStore((s) => s.objects);
  const deleteObject = useObjectStore((s) => s.deleteObject);
  const duplicateObject = useObjectStore((s) => s.duplicateObject);
  const toggleFavorite = useObjectStore((s) => s.toggleFavorite);

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const setObjectEditorTarget = useGameplayStore(
    (s) => s.setObjectEditorTarget,
  );

  function openEditor(id: string | null) {
    setObjectEditorTarget(id);
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setObjectEditorTarget(null);
  }

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

  const sceneryCount = objects.filter((o) => o.category === "scenery").length;
  const itemCount = objects.filter((o) => o.category === "item").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">
            Objetos da Campanha
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {objects.length} objetos · {sceneryCount} cenário · {itemCount}{" "}
            itens
          </p>
        </div>
        <button
          onClick={() => openEditor(null)}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-accent/80"
        >
          <Plus className="h-4 w-4" />
          Novo Objeto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-brand-border p-0.5">
          {(
            [
              { key: "all", label: "Todos" },
              { key: "scenery", label: CATEGORY_CONFIG.scenery.label },
              { key: "item", label: CATEGORY_CONFIG.item.label },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                categoryFilter === key
                  ? "bg-brand-accent/15 text-brand-accent"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar objetos..."
            className="h-9 w-full max-w-xs rounded-lg border border-brand-border bg-brand-primary pl-9 pr-3 text-sm text-brand-text placeholder:text-brand-muted/60 focus:border-brand-accent focus:outline-none"
          />
        </div>

        <button
          onClick={() => setFavoritesOnly((v) => !v)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            favoritesOnly
              ? "border-[#FDCB6E]/30 bg-[#FDCB6E]/10 text-[#FDCB6E]"
              : "border-brand-border text-brand-muted hover:text-brand-text"
          }`}
        >
          <Star
            className={`h-3 w-3 ${favoritesOnly ? "fill-[#FDCB6E]" : ""}`}
          />
          Favoritos
        </button>
      </div>

      {/* Grid */}
      {filteredObjects.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {filteredObjects.map((obj) => (
            <ObjectCard
              key={obj.id}
              object={obj}
              onEdit={(id) => openEditor(id)}
              onDuplicate={duplicateObject}
              onDelete={deleteObject}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-brand-border">
          <p className="text-sm text-brand-muted">
            {search.trim()
              ? "Nenhum objeto encontrado"
              : "Nenhum objeto criado ainda"}
          </p>
        </div>
      )}

      {/* Editor Modal */}
      {editorOpen && <ObjectEditorModal onClose={closeEditor} />}
    </div>
  );
}
