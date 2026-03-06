"use client";

import { Map, Pencil, RefreshCw } from "lucide-react";
import { useMapSidebarStore } from "@/lib/map-sidebar-store";
import { useGameplayStore } from "@/lib/gameplay-store";

export function ActiveSceneCard() {
  const scenes = useMapSidebarStore((s) => s.scenes);
  const activeSceneId = useMapSidebarStore((s) => s.activeSceneId);
  const openModal = useGameplayStore((s) => s.openModal);
  const tokens = useGameplayStore((s) => s.tokens);
  const fogCells = useGameplayStore((s) => s.fogCells);

  const activeScene = scenes.find((s) => s.id === activeSceneId);

  const onMapTokens = tokens.filter((t) => t.onMap).length;
  const totalCells = 25 * 25; // from MOCK_MAP
  const fogPercent = totalCells > 0 ? Math.round((fogCells.size / totalCells) * 100) : 0;

  if (!activeScene) {
    return (
      <div className="rounded-md border border-dashed border-brand-border p-3 text-center">
        <Map className="mx-auto mb-1.5 h-5 w-5 text-brand-muted/40" />
        <p className="text-[10px] text-brand-muted">Nenhuma cena ativa.</p>
        <button
          onClick={() => openModal("createScene")}
          className="mt-1.5 text-[10px] text-brand-accent hover:underline"
        >
          Adicionar cena
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-brand-border bg-white/[0.02] p-2">
      <div className="flex items-start gap-2">
        {/* Thumbnail placeholder */}
        <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded bg-brand-accent/10 text-brand-accent">
          <Map className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium text-brand-text">
            {activeScene.name}
          </p>
          <p className="text-[9px] text-brand-muted">
            {activeScene.dimensions} · {activeScene.category}
          </p>
          <p className="mt-0.5 text-[9px] text-brand-muted">
            {onMapTokens} tokens · {fogPercent}% fog
          </p>
        </div>
      </div>
      <div className="mt-2 flex gap-1">
        <button
          onClick={() => openModal("createScene")}
          className="flex flex-1 items-center justify-center gap-1 rounded bg-white/[0.04] py-1 text-[9px] text-brand-muted transition-colors hover:bg-white/[0.08] hover:text-brand-text"
        >
          <RefreshCw className="h-2.5 w-2.5" />
          Trocar Cena
        </button>
        <button
          onClick={() => {
            // Could open a scene edit modal; for now just a placeholder
          }}
          className="flex flex-1 items-center justify-center gap-1 rounded bg-white/[0.04] py-1 text-[9px] text-brand-muted transition-colors hover:bg-white/[0.08] hover:text-brand-text"
        >
          <Pencil className="h-2.5 w-2.5" />
          Editar
        </button>
      </div>
    </div>
  );
}
