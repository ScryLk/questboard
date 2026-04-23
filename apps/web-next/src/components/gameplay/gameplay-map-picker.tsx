"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Map as MapIcon, X } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useMapLibraryStore } from "@/lib/map-library-store";
import { useMapCollectionsStore } from "@/lib/map-collections-store";

// Tools que abrem pickers flutuantes em cima do canvas — quando algum
// desses está ativo, escondemos o botão de troca de mapa pra não
// poluir visualmente a área do picker.
const TOOLS_WITH_FLOATING_PICKER = new Set([
  "aoe",
  "draw",
  "fog",
  "objects",
  "terrain",
  "vision",
  "wall",
]);

export function GameplayMapPicker() {
  const [open, setOpen] = useState(false);
  const activeMapId = useGameplayStore((s) => s.activeMapId);
  const mapConfig = useGameplayStore((s) => s.mapConfig);
  const activeTool = useGameplayStore((s) => s.activeTool);
  const loadMapFromLibrary = useGameplayStore((s) => s.loadMapFromLibrary);
  const addToast = useGameplayStore((s) => s.addToast);
  const maps = useMapLibraryStore((s) => s.maps);
  const collections = useMapCollectionsStore((s) => s.collections);

  const hideButton = TOOLS_WITH_FLOATING_PICKER.has(activeTool);

  const mapList = useMemo(() => {
    return Object.values(maps).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [maps]);

  // Fecha com Esc — o modal é portalado, então o listener fica no window.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function handleSelect(mapId: string) {
    const res = loadMapFromLibrary(mapId);
    if ("error" in res) {
      addToast(res.error);
      return;
    }
    addToast(`Mapa "${maps[mapId]?.name}" carregado.`);
    setOpen(false);
  }

  // Modal renderizado via portal pro document.body — o wrapper do botão
  // tem `pointer-events-none`, então se o modal ficasse aninhado, X e
  // backdrop não receberiam cliques.
  const modal = open && typeof document !== "undefined"
    ? createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-brand-border bg-[#111116] shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
              <div className="flex items-center gap-2">
                <MapIcon className="h-4 w-4 text-brand-accent" />
                <h2 className="text-sm font-semibold text-brand-text">Escolher mapa</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded p-1 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {mapList.length === 0 ? (
                <div className="py-12 text-center">
                  <MapIcon className="mx-auto h-10 w-10 text-brand-muted/30" />
                  <p className="mt-3 text-xs text-brand-muted">
                    Nenhum mapa na biblioteca.
                  </p>
                  <p className="mt-1 text-[10px] text-brand-muted/60">
                    Crie no editor em /maps.
                  </p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {mapList.map((m) => {
                    const isActive = m.id === activeMapId;
                    const collection = m.collectionId ? collections[m.collectionId] : null;
                    return (
                      <li key={m.id}>
                        <button
                          onClick={() => handleSelect(m.id)}
                          className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/[0.04]"
                        >
                          <div className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-brand-primary">
                            {m.thumbnail ? (
                              <img src={m.thumbnail} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <MapIcon className="h-4 w-4 text-brand-muted/40" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm text-brand-text">{m.name}</span>
                              {isActive && (
                                <Check className="h-3 w-3 shrink-0 text-brand-accent" />
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-brand-muted">
                              <span>{m.width}×{m.height}</span>
                              <span>·</span>
                              <span>{Object.keys(m.walls).length} paredes</span>
                              {collection && (
                                <>
                                  <span>·</span>
                                  <span className="text-brand-accent/80">{collection.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-brand-border px-4 py-2 text-[10px] text-brand-muted">
              Ao selecionar, o terreno, paredes e objetos do mapa substituem a cena atual.
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      {!hideButton && (
        <button
          onClick={() => setOpen(true)}
          title="Trocar mapa ativo"
          className="pointer-events-auto flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-[#111116]/90 px-3 py-1.5 text-xs text-brand-text backdrop-blur-sm transition-colors hover:border-brand-accent/40 hover:bg-[#111116]"
        >
          <MapIcon className="h-3.5 w-3.5 text-brand-accent" />
          <span className="max-w-[180px] truncate">
            {mapConfig.name || "Sem mapa ativo"}
          </span>
          <span className="text-[10px] text-brand-muted">
            {mapConfig.gridCols}×{mapConfig.gridRows}
          </span>
        </button>
      )}
      {modal}
    </>
  );
}
