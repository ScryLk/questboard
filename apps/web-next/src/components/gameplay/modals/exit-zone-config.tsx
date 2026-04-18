"use client";

import { useState } from "react";
import {
  DoorOpen,
  MapPin,
  Square,
  Trash2,
  Plus,
  Eye,
} from "lucide-react";
import { useNpcBehaviorStore } from "@/lib/npc-behavior-store";
import {
  DEFAULT_EXIT_CONFIG,
  generateMapEdgeExits,
} from "@/lib/exit-zone-types";
import type { ExitZone, SceneExitConfig } from "@/lib/exit-zone-types";

interface ExitZoneConfigProps {
  gridCols: number;
  gridRows: number;
}

export function ExitZoneConfig({ gridCols, gridRows }: ExitZoneConfigProps) {
  const exitZones = useNpcBehaviorStore((s) => s.exitZones);
  const setExitZones = useNpcBehaviorStore((s) => s.setExitZones);
  const addExitZone = useNpcBehaviorStore((s) => s.addExitZone);
  const removeExitZone = useNpcBehaviorStore((s) => s.removeExitZone);

  const [config, setConfig] = useState<SceneExitConfig>(DEFAULT_EXIT_CONFIG);
  const [newZoneLabel, setNewZoneLabel] = useState("");
  const [newZoneX, setNewZoneX] = useState(0);
  const [newZoneY, setNewZoneY] = useState(0);
  const [newZoneW, setNewZoneW] = useState(2);
  const [newZoneH, setNewZoneH] = useState(2);

  function handleToggleDoors(checked: boolean) {
    setConfig((c) => ({ ...c, useDoors: checked }));
  }

  function handleToggleMapEdge(checked: boolean) {
    setConfig((c) => ({ ...c, useMapEdge: checked }));
    if (checked) {
      const edgeZone = generateMapEdgeExits(gridCols, gridRows);
      const hasEdge = exitZones.some((z) => z.id === "map-edge");
      if (!hasEdge) addExitZone(edgeZone);
    } else {
      removeExitZone("map-edge");
    }
  }

  function handleToggleZones(checked: boolean) {
    setConfig((c) => ({ ...c, useZones: checked }));
  }

  function handleAddZone() {
    if (!newZoneLabel.trim()) return;
    const cells: Array<{ x: number; y: number }> = [];
    for (let x = newZoneX; x < newZoneX + newZoneW; x++) {
      for (let y = newZoneY; y < newZoneY + newZoneH; y++) {
        cells.push({ x, y });
      }
    }
    addExitZone({
      id: `zone_${Date.now()}`,
      label: newZoneLabel,
      cells,
      type: "ZONE",
    });
    setNewZoneLabel("");
  }

  const doorExits = exitZones.filter((z) => z.type === "DOOR");
  const zoneExits = exitZones.filter((z) => z.type === "ZONE");
  const hasMapEdge = exitZones.some((z) => z.type === "MAP_EDGE");

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
        Saídas da Cena
      </div>

      {/* Doors toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={config.useDoors}
          onChange={(e) => handleToggleDoors(e.target.checked)}
          className="accent-[#7c5cfc]"
        />
        <DoorOpen className="h-3.5 w-3.5 text-brand-muted" />
        <span className="text-xs text-brand-text">Portas do mapa</span>
      </label>
      {config.useDoors && doorExits.length > 0 && (
        <div className="ml-6 space-y-0.5">
          {doorExits.map((d) => (
            <div key={d.id} className="text-[10px] text-brand-muted">
              {d.label} ({d.cells.length} células)
            </div>
          ))}
        </div>
      )}

      {/* Map edge toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={hasMapEdge}
          onChange={(e) => handleToggleMapEdge(e.target.checked)}
          className="accent-[#7c5cfc]"
        />
        <Square className="h-3.5 w-3.5 text-brand-muted" />
        <span className="text-xs text-brand-text">Borda do mapa</span>
      </label>

      {/* Custom zones toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={config.useZones}
          onChange={(e) => handleToggleZones(e.target.checked)}
          className="accent-[#7c5cfc]"
        />
        <MapPin className="h-3.5 w-3.5 text-brand-muted" />
        <span className="text-xs text-brand-text">Zonas de saída</span>
      </label>

      {config.useZones && (
        <div className="ml-6 space-y-2">
          {zoneExits.map((z) => (
            <div key={z.id} className="flex items-center gap-1.5 text-[10px]">
              <span className="text-brand-text">{z.label}</span>
              <span className="text-brand-muted">({z.cells.length} células)</span>
              <button
                onClick={() => removeExitZone(z.id)}
                className="text-brand-muted hover:text-red-400"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}

          {/* Add zone form */}
          <div className="space-y-1.5 rounded-lg border border-brand-border/50 p-2">
            <input
              type="text"
              value={newZoneLabel}
              onChange={(e) => setNewZoneLabel(e.target.value)}
              placeholder="Nome da zona (ex: Saída da cozinha)"
              className="w-full rounded border border-brand-border bg-white/[0.03] px-2 py-1 text-[11px] text-brand-text placeholder:text-[#444] focus:border-[#7c5cfc] focus:outline-none"
            />
            <div className="flex gap-1.5">
              <div className="flex-1">
                <label className="text-[9px] text-brand-muted">X</label>
                <input
                  type="number"
                  value={newZoneX}
                  onChange={(e) => setNewZoneX(parseInt(e.target.value) || 0)}
                  className="w-full rounded border border-brand-border bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-brand-text focus:border-[#7c5cfc] focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-[9px] text-brand-muted">Y</label>
                <input
                  type="number"
                  value={newZoneY}
                  onChange={(e) => setNewZoneY(parseInt(e.target.value) || 0)}
                  className="w-full rounded border border-brand-border bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-brand-text focus:border-[#7c5cfc] focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-[9px] text-brand-muted">Larg.</label>
                <input
                  type="number"
                  min={1}
                  value={newZoneW}
                  onChange={(e) => setNewZoneW(parseInt(e.target.value) || 1)}
                  className="w-full rounded border border-brand-border bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-brand-text focus:border-[#7c5cfc] focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-[9px] text-brand-muted">Alt.</label>
                <input
                  type="number"
                  min={1}
                  value={newZoneH}
                  onChange={(e) => setNewZoneH(parseInt(e.target.value) || 1)}
                  className="w-full rounded border border-brand-border bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-brand-text focus:border-[#7c5cfc] focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleAddZone}
              disabled={!newZoneLabel.trim()}
              className="flex w-full items-center justify-center gap-1 rounded bg-white/5 py-1 text-[10px] text-brand-text hover:bg-white/10 disabled:opacity-30"
            >
              <Plus className="h-2.5 w-2.5" />
              Adicionar zona
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      {exitZones.length > 0 && (
        <div className="flex items-center gap-1.5 text-[10px] text-[#00B894]">
          <Eye className="h-3 w-3" />
          {exitZones.length} saída(s) configurada(s)
        </div>
      )}
    </div>
  );
}
