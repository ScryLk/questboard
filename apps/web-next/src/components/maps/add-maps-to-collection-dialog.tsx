"use client";

import { useMemo, useState } from "react";
import { Command } from "cmdk";
import { Folder, Map as MapIcon, X } from "lucide-react";
import { useMapCollectionsStore } from "@/lib/map-collections-store";
import { useMapLibraryStore } from "@/lib/map-library-store";

interface Props {
  collectionId: string;
  onClose: () => void;
}

export function AddMapsToCollectionDialog({ collectionId, onClose }: Props) {
  const collections = useMapCollectionsStore((s) => s.collections);
  const maps = useMapLibraryStore((s) => s.maps);
  const setMapCollection = useMapLibraryStore((s) => s.setMapCollection);

  const [search, setSearch] = useState("");

  const selectableMaps = useMemo(
    () =>
      Object.values(maps)
        .filter((m) => m.collectionId !== collectionId)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [maps, collectionId],
  );

  function handleSelect(mapId: string) {
    setMapCollection(mapId, collectionId);
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 px-4 pt-24"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-brand-border bg-[#111116] shadow-2xl">
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
          <div className="flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-brand-accent" />
            <h2 className="text-sm font-semibold text-brand-text">Adicionar mapas à coleção</h2>
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
              placeholder="Buscar mapa..."
              className="w-full bg-transparent text-sm text-brand-text placeholder:text-brand-muted/50 outline-none"
              autoFocus
            />
          </div>

          <Command.List className="max-h-96 overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-xs text-brand-muted">
              Nenhum mapa disponível.
            </Command.Empty>

            {selectableMaps.map((m) => {
              const currentCollection = m.collectionId
                ? collections[m.collectionId]
                : null;
              return (
                <Command.Item
                  key={m.id}
                  value={m.name}
                  onSelect={() => handleSelect(m.id)}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-xs text-brand-text aria-selected:bg-brand-accent/10 aria-selected:text-brand-accent"
                >
                  <div className="flex h-8 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-brand-primary">
                    {m.thumbnail ? (
                      <img src={m.thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <MapIcon className="h-4 w-4 text-brand-muted/40" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">{m.name}</span>
                    {currentCollection && (
                      <span className="flex items-center gap-1 text-[10px] text-brand-muted">
                        <Folder className="h-2.5 w-2.5" />
                        Em: {currentCollection.name}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-brand-muted">
                    {m.width}x{m.height}
                  </span>
                </Command.Item>
              );
            })}
          </Command.List>
        </Command>

        <div className="border-t border-brand-border px-4 py-2 text-[10px] text-brand-muted">
          Selecione quantos quiser — adicionado imediatamente.
        </div>
      </div>
    </div>
  );
}
