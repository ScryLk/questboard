"use client";

import { RotateCcw } from "lucide-react";
import { useMapSidebarStore } from "@/lib/map-sidebar-store";
import { MAP_SIDEBAR_SECTIONS } from "@/lib/map-sidebar-types";
import type { MapSidebarSectionKey } from "@/lib/map-sidebar-types";

interface MapSidebarSettingsProps {
  onClose: () => void;
}

export function MapSidebarSettings({ onClose }: MapSidebarSettingsProps) {
  const visibleSections = useMapSidebarStore((s) => s.visibleSections);
  const sidebarLayout = useMapSidebarStore((s) => s.sidebarLayout);
  const toggleSectionVisibility = useMapSidebarStore(
    (s) => s.toggleSectionVisibility,
  );
  const setSidebarLayout = useMapSidebarStore((s) => s.setSidebarLayout);
  const resetSidebarSettings = useMapSidebarStore(
    (s) => s.resetSidebarSettings,
  );

  return (
    <div className="absolute right-0 top-6 z-50 w-48 rounded-md border border-brand-border bg-[#1a1a22] p-2 shadow-xl">
      <p className="mb-2 text-[10px] font-semibold text-brand-text">
        Configurações do Mapa
      </p>

      <div className="mb-2">
        <p className="mb-1 text-[9px] text-brand-muted">Seções visíveis:</p>
        <div className="space-y-0.5">
          {MAP_SIDEBAR_SECTIONS.map(({ key, label }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 hover:bg-white/[0.03]"
            >
              <input
                type="checkbox"
                checked={visibleSections[key]}
                onChange={() => toggleSectionVisibility(key)}
                className="h-3 w-3 accent-brand-accent"
              />
              <span className="text-[9px] text-brand-text">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-2">
        <p className="mb-1 text-[9px] text-brand-muted">Layout:</p>
        <div className="flex gap-1">
          {(["compact", "expanded"] as const).map((layout) => (
            <button
              key={layout}
              onClick={() => setSidebarLayout(layout)}
              className={`flex-1 rounded-md py-1 text-[9px] font-medium transition-colors ${
                sidebarLayout === layout
                  ? "bg-brand-accent/20 text-brand-accent"
                  : "border border-brand-border text-brand-muted hover:text-brand-text"
              }`}
            >
              {layout === "compact" ? "Compacto" : "Expandido"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 border-t border-brand-border pt-2">
        <button
          onClick={resetSidebarSettings}
          className="flex flex-1 items-center justify-center gap-1 rounded bg-white/[0.04] py-1 text-[9px] text-brand-muted transition-colors hover:bg-white/[0.08] hover:text-brand-text"
        >
          <RotateCcw className="h-2.5 w-2.5" />
          Restaurar padrão
        </button>
        <button
          onClick={onClose}
          className="flex-1 rounded bg-white/[0.04] py-1 text-[9px] text-brand-muted transition-colors hover:bg-white/[0.08] hover:text-brand-text"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
