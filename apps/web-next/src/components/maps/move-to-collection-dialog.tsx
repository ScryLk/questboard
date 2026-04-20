"use client";

import { useMemo, useState } from "react";
import { Command } from "cmdk";
import { Folder, FolderPlus, FolderX, X } from "lucide-react";
import { useMapCollectionsStore } from "@/lib/map-collections-store";
import { useMapLibraryStore } from "@/lib/map-library-store";
import { CreateCollectionDialog } from "./create-collection-dialog";

interface Props {
  mapId: string;
  onClose: () => void;
}

export function MoveToCollectionDialog({ mapId, onClose }: Props) {
  const collections = useMapCollectionsStore((s) => s.collections);
  const map = useMapLibraryStore((s) => s.maps[mapId]);
  const setMapCollection = useMapLibraryStore((s) => s.setMapCollection);

  const [search, setSearch] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);

  const collectionList = useMemo(
    () => Object.values(collections).sort((a, b) => a.name.localeCompare(b.name)),
    [collections],
  );

  if (creatingNew) {
    return (
      <CreateCollectionDialog
        onClose={() => setCreatingNew(false)}
        onCreated={(id) => {
          setMapCollection(mapId, id);
          onClose();
        }}
      />
    );
  }

  function handleSelect(collectionId: string | null) {
    setMapCollection(mapId, collectionId);
    onClose();
  }

  if (!map) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 px-4 pt-24"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-brand-border bg-[#111116] shadow-2xl">
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-brand-accent" />
            <h2 className="text-sm font-semibold text-brand-text">Mover para coleção</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Command shouldFilter={true} className="flex flex-col">
          <div className="border-b border-brand-border px-4 py-2">
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Buscar coleção..."
              className="w-full bg-transparent text-sm text-brand-text placeholder:text-brand-muted/50 outline-none"
              autoFocus
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-xs text-brand-muted">
              Nenhuma coleção encontrada.
            </Command.Empty>

            {map.collectionId !== null && (
              <Command.Item
                value="remove-from-collection"
                onSelect={() => handleSelect(null)}
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs text-brand-muted aria-selected:bg-white/[0.06] aria-selected:text-brand-text"
              >
                <FolderX className="h-3.5 w-3.5" />
                Remover de coleção (voltar para raiz)
              </Command.Item>
            )}

            {collectionList.length > 0 && (
              <Command.Group heading="Coleções" className="mt-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-brand-muted">
                {collectionList.map((c) => (
                  <Command.Item
                    key={c.id}
                    value={c.name}
                    onSelect={() => handleSelect(c.id)}
                    disabled={c.id === map.collectionId}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs text-brand-text aria-selected:bg-brand-accent/10 aria-selected:text-brand-accent data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                  >
                    <Folder className="h-3.5 w-3.5" />
                    <span className="flex-1 truncate">{c.name}</span>
                    {c.id === map.collectionId && (
                      <span className="text-[10px] text-brand-muted">atual</span>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Item
              value="__create-new"
              onSelect={() => setCreatingNew(true)}
              className="mt-2 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-brand-border px-3 py-2 text-xs text-brand-accent aria-selected:bg-brand-accent/10"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              Criar nova coleção...
            </Command.Item>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
