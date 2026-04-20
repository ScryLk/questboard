"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Folder,
  Map as MapIcon,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useMapCollectionsStore } from "@/lib/map-collections-store";
import { useMapLibraryStore } from "@/lib/map-library-store";
import { SortableMapCard } from "@/components/maps/sortable-map-card";
import { AddMapsToCollectionDialog } from "@/components/maps/add-maps-to-collection-dialog";

export default function CollectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const collection = useMapCollectionsStore((s) => s.collections[id]);
  const updateCollection = useMapCollectionsStore((s) => s.updateCollection);
  const deleteCollection = useMapCollectionsStore((s) => s.deleteCollection);

  const maps = useMapLibraryStore((s) => s.maps);
  const setMapCollection = useMapLibraryStore((s) => s.setMapCollection);
  const reorderMapsInCollection = useMapLibraryStore((s) => s.reorderMapsInCollection);
  const deleteMap = useMapLibraryStore((s) => s.deleteMap);
  const clearCollectionFromMaps = useMapLibraryStore((s) => s.clearCollectionFromMaps);

  const [mounted, setMounted] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  useEffect(() => setMounted(true), []);

  const collectionMaps = useMemo(() => {
    return Object.values(maps)
      .filter((m) => m.collectionId === id)
      .sort((a, b) => {
        const d = (a.order ?? 0) - (b.order ?? 0);
        return d !== 0 ? d : b.updatedAt - a.updatedAt;
      });
  }, [maps, id]);

  useEffect(() => {
    setOrderedIds(collectionMaps.map((m) => m.id));
  }, [collectionMaps]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  if (!mounted) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold text-white">Coleção</h1>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-sm text-brand-muted">
          <Link href="/maps" className="transition-colors hover:text-brand-text">
            Mapas
          </Link>
        </nav>
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-16">
          <div className="text-center">
            <Folder className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-3 text-gray-500">Coleção não encontrada.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleRename = () => {
    const newName = window.prompt("Novo nome da coleção:", collection.name)?.trim();
    if (!newName || newName === collection.name) return;
    const result = updateCollection(id, { name: newName });
    if ("error" in result) window.alert(result.error);
  };

  const handleEditDescription = () => {
    const next = window.prompt(
      "Descrição da coleção:",
      collection.description ?? "",
    );
    if (next === null) return;
    updateCollection(id, { description: next });
  };

  const handleDeleteCollection = () => {
    const count = collectionMaps.length;
    const msg =
      count === 0
        ? `Deletar coleção "${collection.name}"?`
        : count === 1
          ? `Deletar coleção "${collection.name}"? O mapa volta para a raiz.`
          : `Deletar coleção "${collection.name}"? Os ${count} mapas voltam para a raiz.`;
    if (!window.confirm(msg)) return;
    clearCollectionFromMaps(id);
    deleteCollection(id);
    router.push("/maps");
  };

  const handleEdit = (mapId: string) => {
    router.push(`/maps/editor?id=${mapId}`);
  };

  const handleRemoveFromCollection = (mapId: string) => {
    setMapCollection(mapId, null);
  };

  const handleDeleteMap = (mapId: string) => {
    const map = maps[mapId];
    if (!map) return;
    if (window.confirm(`Excluir "${map.name}"? Esta ação não pode ser desfeita.`)) {
      deleteMap(mapId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedIds.indexOf(active.id as string);
    const newIndex = orderedIds.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(orderedIds, oldIndex, newIndex);
    setOrderedIds(next);
    reorderMapsInCollection(id, next);
  };

  const visibleMaps = orderedIds
    .map((mid) => collectionMaps.find((m) => m.id === mid))
    .filter((m): m is (typeof collectionMaps)[number] => Boolean(m));

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/maps"
          className="text-brand-muted transition-colors hover:text-brand-text"
        >
          Mapas
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-brand-muted/60" />
        <span className="text-brand-text">{collection.name}</span>
      </nav>

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-accent/10 ring-1 ring-brand-accent/20">
            <Folder className="h-6 w-6 text-brand-accent" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-heading text-3xl font-bold text-white">
                {collection.name}
              </h1>
              <button
                onClick={handleRename}
                title="Renomear"
                className="cursor-pointer rounded p-1.5 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={handleEditDescription}
              className="mt-1 block max-w-full cursor-pointer truncate text-left text-sm text-brand-muted transition-colors hover:text-brand-text"
              title="Editar descrição"
            >
              {collection.description || (
                <span className="text-brand-muted/60">Sem descrição.</span>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-brand-text transition-colors hover:border-brand-accent/40 hover:bg-white/[0.06]"
          >
            <Plus className="h-4 w-4" />
            Adicionar mapa
          </button>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-brand-muted transition-colors hover:border-brand-accent/40 hover:bg-white/[0.06] hover:text-brand-text"
              aria-label="Mais ações"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 z-20 w-48 overflow-hidden rounded-lg border border-brand-border bg-[#111116] shadow-xl">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleRename();
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs text-brand-text hover:bg-white/5"
                >
                  <Pencil className="h-3 w-3" />
                  Renomear
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleEditDescription();
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs text-brand-text hover:bg-white/5"
                >
                  <Pencil className="h-3 w-3" />
                  Editar descrição
                </button>
                <div className="h-px bg-brand-border" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleDeleteCollection();
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3 w-3" />
                  Deletar coleção
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {visibleMaps.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={orderedIds} strategy={rectSortingStrategy}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleMaps.map((map) => (
                <SortableMapCard
                  key={map.id}
                  map={map}
                  onEdit={handleEdit}
                  onRemoveFromCollection={handleRemoveFromCollection}
                  onDelete={handleDeleteMap}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-20">
          <div className="max-w-sm text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-accent/10 ring-1 ring-brand-accent/20">
              <MapIcon className="h-7 w-7 text-brand-accent" />
            </div>
            <h2 className="mt-5 font-heading text-xl font-bold text-white">
              Comece sua jornada
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              Esta coleção ainda não tem mapas. Adicione o primeiro mapa para começar a construir seu mundo.
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-accent/20 transition-colors hover:bg-brand-accent/90"
            >
              <Plus className="h-4 w-4" />
              Adicionar primeiro mapa
            </button>
          </div>
        </div>
      )}

      {showAdd && (
        <AddMapsToCollectionDialog
          collectionId={id}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
