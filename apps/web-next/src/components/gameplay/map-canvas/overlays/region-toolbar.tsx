"use client";

import { useState } from "react";
import { Cloud, PaintBucket, Ruler, Sun, Trash2 } from "lucide-react";
import { MOCK_MAP } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { RegionSelection } from "@/lib/gameplay-store";

interface RegionToolbarProps {
  left: number;
  top: number;
  width: number;
  region: RegionSelection;
  scaledCell: number;
}

const { cellSizeFt } = MOCK_MAP;

export function RegionToolbar({ left, top, width, region }: RegionToolbarProps) {
  const [showInfo, setShowInfo] = useState(false);
  const tokens = useGameplayStore((s) => s.tokens);

  const minX = Math.min(region.x1, region.x2);
  const minY = Math.min(region.y1, region.y2);
  const maxX = Math.max(region.x1, region.x2);
  const maxY = Math.max(region.y1, region.y2);
  const cols = maxX - minX + 1;
  const rows = maxY - minY + 1;
  const cellCount = cols * rows;
  const widthFt = cols * cellSizeFt;
  const heightFt = rows * cellSizeFt;

  const tokensInArea = tokens.filter(
    (t) => t.onMap && t.x >= minX && t.x <= maxX && t.y >= minY && t.y <= maxY,
  );

  const ACTIONS = [
    { key: "fog", icon: Cloud, label: "Nevoa", action: () => useGameplayStore.getState().regionFog() },
    { key: "reveal", icon: Sun, label: "Revelar", action: () => useGameplayStore.getState().regionReveal() },
    { key: "paint", icon: PaintBucket, label: "Pintar Terreno", action: () => useGameplayStore.getState().regionPaintTerrain() },
    { key: "measure", icon: Ruler, label: "Medir", action: () => setShowInfo((v) => !v) },
    { key: "clear", icon: Trash2, label: "Limpar", action: () => useGameplayStore.getState().regionClear() },
  ];

  return (
    <div
      className="absolute z-20"
      style={{
        left: left + width / 2,
        top: top - 44,
        transform: "translateX(-50%)",
      }}
    >
      {/* Info popover */}
      {showInfo && (
        <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-brand-border bg-[#16161D] p-3 shadow-xl">
          <div className="text-xs font-semibold text-brand-text">
            {cellCount} celulas
          </div>
          <div className="text-[10px] text-brand-muted">
            {cols}x{rows} ({widthFt}x{heightFt}ft)
          </div>
          <div className="text-[10px] text-brand-muted">
            Area total: {widthFt * heightFt} sq.ft
          </div>
          {tokensInArea.length > 0 && (
            <>
              <div className="mt-1.5 h-px bg-brand-border" />
              <div className="mt-1.5 text-[10px] text-brand-muted">
                Tokens na area: {tokensInArea.length}
              </div>
              {tokensInArea.map((t) => (
                <div key={t.id} className="text-[10px] text-brand-text">
                  - {t.name}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1 rounded-lg border border-brand-border bg-[#111116] px-2 py-1.5 shadow-xl">
        {ACTIONS.map(({ key, icon: Icon, label, action }) => (
          <button
            key={key}
            title={label}
            onClick={(e) => { e.stopPropagation(); action(); }}
            className="flex h-8 w-8 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
