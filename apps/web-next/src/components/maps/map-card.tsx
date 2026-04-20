"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Download, Folder, FolderInput, Map, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { QuestBoardMap } from "@/lib/map-types";
import { useMapCollectionsStore } from "@/lib/map-collections-store";

interface MapCardProps {
  map: QuestBoardMap;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
  onMoveToCollection?: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  dungeon: "Dungeon",
  outdoor: "Natureza",
  city: "Urbano",
  cave: "Caverna",
  custom: "Custom",
};

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d atrás`;
  return new Date(ts).toLocaleDateString("pt-BR");
}

export function MapCard({
  map,
  onEdit,
  onDuplicate,
  onDelete,
  onExport,
  onMoveToCollection,
}: MapCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const collection = useMapCollectionsStore((s) =>
    map.collectionId ? s.collections[map.collectionId] : null,
  );

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

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-brand-surface transition-all hover:border-brand-accent/40">
      <div
        className="relative aspect-video w-full cursor-pointer bg-brand-primary"
        onClick={() => onEdit(map.id)}
      >
        {map.thumbnail ? (
          <img
            src={map.thumbnail}
            alt={map.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Map className="h-10 w-10 text-brand-muted/30" />
          </div>
        )}

        <div className="absolute inset-0 flex items-end justify-center gap-1 bg-black/0 p-2 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(map.id); }}
            title="Editar"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-brand-accent"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(map.id); }}
            title="Duplicar"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-brand-accent"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onExport(map.id); }}
            title="Exportar"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-brand-accent"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(map.id); }}
            title="Excluir"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-brand-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {onMoveToCollection && (
          <div ref={menuRef} className="absolute right-2 top-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/60 group-hover:opacity-100"
              aria-label="Mais ações"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 w-44 overflow-hidden rounded-md border border-brand-border bg-[#111116] shadow-xl">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onMoveToCollection(map.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-brand-text hover:bg-white/5"
                >
                  <FolderInput className="h-3 w-3" />
                  {map.collectionId ? "Mover para outra coleção" : "Mover para coleção"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-white group-hover:text-brand-accent">
          {map.name}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-brand-muted">
            {map.width}x{map.height}
          </span>
          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-brand-muted">
            {CATEGORY_LABELS[map.category] ?? map.category}
          </span>
          {collection && (
            <span className="flex items-center gap-1 rounded bg-brand-accent/10 px-1.5 py-0.5 text-[10px] text-brand-accent">
              <Folder className="h-2.5 w-2.5" />
              {collection.name}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-[10px] text-brand-muted">
          Editado {relativeTime(map.updatedAt)}
        </p>
      </div>
    </div>
  );
}
