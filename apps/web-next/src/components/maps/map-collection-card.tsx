"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Folder, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { MapCollection, QuestBoardMap } from "@/lib/map-types";

interface Props {
  collection: MapCollection;
  maps: QuestBoardMap[];
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
}

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

export function MapCollectionCard({ collection, maps, onRename, onDelete }: Props) {
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

  const ordered = [...maps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const cover = collection.coverMapId
    ? ordered.find((m) => m.id === collection.coverMapId)
    : undefined;
  const thumbs = cover
    ? [cover, ...ordered.filter((m) => m.id !== cover.id)].slice(0, 4)
    : ordered.slice(0, 4);
  const extra = Math.max(0, maps.length - 4);
  const mapCountLabel = maps.length === 1 ? "1 mapa" : `${maps.length} mapas`;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-brand-surface transition-all hover:border-brand-accent/40">
      <Link
        href={`/maps/collections/${collection.id}`}
        className="block"
      >
        <div className="relative aspect-video w-full cursor-pointer bg-brand-primary">
          {thumbs.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Folder className="h-10 w-10 text-brand-muted/30" />
            </div>
          ) : (
            <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5 bg-white/5 p-0.5">
              {thumbs.map((m, i) => {
                const isLast = i === 3 && extra > 0;
                return (
                  <div
                    key={m.id}
                    className="relative overflow-hidden bg-brand-primary"
                  >
                    {m.thumbnail ? (
                      <img src={m.thumbnail} alt={m.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Folder className="h-4 w-4 text-brand-muted/30" />
                      </div>
                    )}
                    {isLast && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-semibold text-white">
                        +{extra}
                      </div>
                    )}
                  </div>
                );
              })}
              {thumbs.length < 4 &&
                Array.from({ length: 4 - thumbs.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-brand-primary" />
                ))}
            </div>
          )}

          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
            <Folder className="h-3 w-3" />
            Coleção
          </div>
        </div>

        <div className="p-3">
          <h3 className="truncate text-sm font-semibold text-white group-hover:text-brand-accent">
            {collection.name}
          </h3>
          <p className="mt-1 text-[10px] text-brand-muted">
            {mapCountLabel} · {relativeTime(collection.updatedAt)}
          </p>
        </div>
      </Link>

      <div ref={menuRef} className="absolute right-2 top-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/60 group-hover:opacity-100"
          aria-label="Ações"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-10 w-44 overflow-hidden rounded-md border border-brand-border bg-[#111116] shadow-xl">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(false);
                onRename(collection.id);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-brand-text hover:bg-white/5"
            >
              <Pencil className="h-3 w-3" />
              Renomear
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(false);
                onDelete(collection.id);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-3 w-3" />
              Deletar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
