"use client";

import { Sun, Sunset, Moon, Square, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { useMapSidebarStore } from "@/lib/map-sidebar-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { AmbientLight } from "@/lib/map-sidebar-types";
import { AMBIENT_LIGHT_CONFIG } from "@/lib/map-sidebar-types";

const LIGHT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun,
  Sunset,
  Moon,
  Square,
};

const AMBIENT_OPTIONS: AmbientLight[] = ["bright", "dim", "dark", "pitch_black"];

export function LightingControls() {
  const ambientLight = useMapSidebarStore((s) => s.ambientLight);
  const setAmbientLight = useMapSidebarStore((s) => s.setAmbientLight);
  const lightSources = useGameplayStore((s) => s.lightSources);
  const removeLightSource = useGameplayStore((s) => s.removeLightSource);

  return (
    <div className="space-y-2">
      {/* Ambient light buttons */}
      <div>
        <span className="mb-1.5 block text-[9px] text-brand-muted">Ambiente</span>
        <div className="grid grid-cols-4 gap-1">
          {AMBIENT_OPTIONS.map((level) => {
            const config = AMBIENT_LIGHT_CONFIG[level];
            const IconComp = LIGHT_ICONS[config.icon] ?? Square;
            const isActive = ambientLight === level;

            return (
              <button
                key={level}
                onClick={() => setAmbientLight(level)}
                className={`flex flex-col items-center gap-0.5 rounded-md px-1 py-1.5 text-[8px] transition-colors ${
                  isActive
                    ? "bg-brand-accent/15 text-brand-accent"
                    : "bg-white/[0.03] text-brand-muted hover:bg-white/[0.06] hover:text-brand-text"
                }`}
              >
                <IconComp className="h-3.5 w-3.5" />
                <span className="leading-tight">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Light sources */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[9px] text-brand-muted">
            Fontes de Luz: {lightSources.length}
          </span>
        </div>

        {lightSources.length > 0 && (
          <div className="max-h-[120px] space-y-0.5 overflow-y-auto">
            {lightSources.map((ls) => (
              <div
                key={ls.id}
                className="group flex items-center gap-1.5 rounded px-1 py-0.5 text-[9px] text-brand-text hover:bg-white/[0.03]"
              >
                <span className="text-amber-400">🔥</span>
                <span className="flex-1 truncate">
                  {ls.type} em ({ls.x}, {ls.y})
                </span>
                <span className="text-[8px] text-brand-muted">
                  {ls.brightRadius}/{ls.dimRadius}ft
                </span>
                <button
                  onClick={() => removeLightSource(ls.id)}
                  className="text-brand-muted/30 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {lightSources.length > 3 && (
          <button
            onClick={() => {
              lightSources.forEach((ls) => removeLightSource(ls.id));
            }}
            className="mt-1 flex w-full items-center justify-center gap-1 rounded bg-red-500/10 py-0.5 text-[8px] text-red-400 transition-colors hover:bg-red-500/20"
          >
            <Trash2 className="h-2.5 w-2.5" />
            Apagar todas
          </button>
        )}
      </div>
    </div>
  );
}
