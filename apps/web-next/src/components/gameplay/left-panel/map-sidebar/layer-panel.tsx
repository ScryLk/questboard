"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Cloud,
  Sparkles,
  Circle,
  Armchair,
  Fence,
  Square,
  Grid3x3,
  Image,
} from "lucide-react";
import { useMapSidebarStore } from "@/lib/map-sidebar-store";
import type { LayerId } from "@/lib/map-sidebar-types";

const LAYER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Cloud,
  Sparkles,
  Circle,
  Armchair,
  Fence,
  Square,
  Grid3x3,
  Image,
};

export function LayerPanel() {
  const layers = useMapSidebarStore((s) => s.layers);
  const toggleLayerVisible = useMapSidebarStore((s) => s.toggleLayerVisible);
  const toggleLayerLocked = useMapSidebarStore((s) => s.toggleLayerLocked);
  const setLayerOpacity = useMapSidebarStore((s) => s.setLayerOpacity);
  const soloLayer = useMapSidebarStore((s) => s.soloLayer);
  const showAllLayers = useMapSidebarStore((s) => s.showAllLayers);
  const hideAllLayers = useMapSidebarStore((s) => s.hideAllLayers);
  const soloLayerId = useMapSidebarStore((s) => s._soloLayerId);

  const [expandedLayer, setExpandedLayer] = useState<LayerId | null>(null);

  const sorted = [...layers].sort((a, b) => b.order - a.order);

  return (
    <div className="space-y-0.5">
      {sorted.map((layer) => {
        const IconComp = LAYER_ICONS[layer.icon] ?? Square;
        const isExpanded = expandedLayer === layer.id;

        return (
          <div key={layer.id}>
            <div
              className={`group flex items-center gap-1 rounded-md px-1 py-0.5 transition-colors hover:bg-white/[0.03] ${
                !layer.visible ? "opacity-40" : ""
              }`}
            >
              {/* Visible toggle */}
              <button
                onClick={() => toggleLayerVisible(layer.id)}
                className="flex h-4 w-4 items-center justify-center rounded text-brand-muted hover:text-brand-text"
                title={layer.visible ? "Ocultar" : "Mostrar"}
              >
                {layer.visible ? (
                  <Eye className="h-2.5 w-2.5" />
                ) : (
                  <EyeOff className="h-2.5 w-2.5" />
                )}
              </button>

              {/* Lock toggle */}
              <button
                onClick={() => toggleLayerLocked(layer.id)}
                className={`flex h-4 w-4 items-center justify-center rounded ${
                  layer.locked
                    ? "text-yellow-500"
                    : "text-brand-muted/30 hover:text-brand-muted"
                }`}
                title={layer.locked ? "Destravar" : "Travar"}
              >
                {layer.locked ? (
                  <Lock className="h-2.5 w-2.5" />
                ) : (
                  <Unlock className="h-2.5 w-2.5" />
                )}
              </button>

              {/* Icon + name */}
              <IconComp className="h-3 w-3 shrink-0 text-brand-muted" />
              <button
                onClick={() =>
                  setExpandedLayer(isExpanded ? null : layer.id)
                }
                className="flex-1 truncate text-left text-[10px] text-brand-text"
              >
                {layer.name}
              </button>

              {/* Opacity badge */}
              {layer.opacity < 100 && (
                <span className="text-[8px] tabular-nums text-brand-muted">
                  {layer.opacity}%
                </span>
              )}

              {/* Solo button */}
              <button
                onClick={() => soloLayer(layer.id)}
                className={`rounded px-1 py-0.5 text-[7px] font-bold uppercase transition-colors ${
                  soloLayerId === layer.id
                    ? "bg-brand-accent/20 text-brand-accent"
                    : "text-brand-muted/30 opacity-0 hover:text-brand-muted group-hover:opacity-100"
                }`}
                title="Isolar layer"
              >
                S
              </button>
            </div>

            {/* Expanded: opacity slider */}
            {isExpanded && (
              <div className="ml-9 mr-1 pb-1 pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-brand-muted">Opacidade</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={layer.opacity}
                    onChange={(e) =>
                      setLayerOpacity(layer.id, parseInt(e.target.value))
                    }
                    className="h-1 flex-1 accent-brand-accent"
                  />
                  <span className="w-6 text-right text-[8px] tabular-nums text-brand-muted">
                    {layer.opacity}%
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Bulk actions */}
      <div className="flex gap-1 pt-1">
        <button
          onClick={showAllLayers}
          className="flex flex-1 items-center justify-center gap-1 rounded bg-white/[0.04] py-0.5 text-[8px] text-brand-muted transition-colors hover:bg-white/[0.08] hover:text-brand-text"
        >
          <Eye className="h-2.5 w-2.5" />
          Mostrar Tudo
        </button>
        <button
          onClick={hideAllLayers}
          className="flex flex-1 items-center justify-center gap-1 rounded bg-white/[0.04] py-0.5 text-[8px] text-brand-muted transition-colors hover:bg-white/[0.08] hover:text-brand-text"
        >
          <EyeOff className="h-2.5 w-2.5" />
          Esconder Tudo
        </button>
      </div>
    </div>
  );
}
