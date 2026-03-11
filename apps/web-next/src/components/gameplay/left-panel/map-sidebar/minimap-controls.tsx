"use client";

import { useMapSidebarStore } from "@/lib/map-sidebar-store";
import {
  MINIMAP_POSITION_LABELS,
  MINIMAP_SIZE_LABELS,
} from "@/lib/map-sidebar-types";
import type { MinimapPosition, MinimapSize } from "@/lib/map-sidebar-types";

export function MinimapControls() {
  const minimapVisible = useMapSidebarStore((s) => s.minimapVisible);
  const minimapPosition = useMapSidebarStore((s) => s.minimapPosition);
  const minimapSize = useMapSidebarStore((s) => s.minimapSize);
  const minimapOpacity = useMapSidebarStore((s) => s.minimapOpacity);
  const minimapShowTokens = useMapSidebarStore((s) => s.minimapShowTokens);
  const minimapShowViewport = useMapSidebarStore((s) => s.minimapShowViewport);
  const minimapShowFog = useMapSidebarStore((s) => s.minimapShowFog);

  const setMinimapVisible = useMapSidebarStore((s) => s.setMinimapVisible);
  const setMinimapPosition = useMapSidebarStore((s) => s.setMinimapPosition);
  const setMinimapSize = useMapSidebarStore((s) => s.setMinimapSize);
  const setMinimapOpacity = useMapSidebarStore((s) => s.setMinimapOpacity);
  const setMinimapShowTokens = useMapSidebarStore((s) => s.setMinimapShowTokens);
  const setMinimapShowViewport = useMapSidebarStore(
    (s) => s.setMinimapShowViewport,
  );
  const setMinimapShowFog = useMapSidebarStore((s) => s.setMinimapShowFog);

  return (
    <div className="space-y-2">
      {/* Visible toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-brand-text">Visível</span>
        <Toggle checked={minimapVisible} onChange={setMinimapVisible} />
      </div>

      {minimapVisible && (
        <>
          {/* Position */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-brand-muted">Posição</span>
            <select
              value={minimapPosition}
              onChange={(e) =>
                setMinimapPosition(e.target.value as MinimapPosition)
              }
              className="h-5 flex-1 rounded border border-brand-border bg-brand-primary px-1 text-[9px] text-brand-text outline-none focus:border-brand-accent/40"
            >
              {Object.entries(MINIMAP_POSITION_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-brand-muted">Tamanho</span>
            <select
              value={minimapSize}
              onChange={(e) => setMinimapSize(e.target.value as MinimapSize)}
              className="h-5 flex-1 rounded border border-brand-border bg-brand-primary px-1 text-[9px] text-brand-text outline-none focus:border-brand-accent/40"
            >
              {Object.entries(MINIMAP_SIZE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Opacity */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-brand-muted">Opacidade</span>
            <input
              type="range"
              min={20}
              max={100}
              value={minimapOpacity}
              onChange={(e) => setMinimapOpacity(parseInt(e.target.value))}
              className="h-1 flex-1 accent-brand-accent"
            />
            <span className="w-6 text-right text-[8px] tabular-nums text-brand-muted">
              {minimapOpacity}%
            </span>
          </div>

          {/* Show options */}
          <div className="space-y-1">
            <ToggleRow
              label="Tokens no mini-mapa"
              checked={minimapShowTokens}
              onChange={setMinimapShowTokens}
            />
            <ToggleRow
              label="Viewport (retângulo)"
              checked={minimapShowViewport}
              onChange={setMinimapShowViewport}
            />
            <ToggleRow
              label="Fog no mini-mapa"
              checked={minimapShowFog}
              onChange={setMinimapShowFog}
            />
          </div>
        </>
      )}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-4 w-7 rounded-full transition-colors ${
        checked ? "bg-brand-accent" : "bg-white/10"
      }`}
    >
      <div
        className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${
          checked ? "translate-x-3.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[9px] text-brand-muted">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}
