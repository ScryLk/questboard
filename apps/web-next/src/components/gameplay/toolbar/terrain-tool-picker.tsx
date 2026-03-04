"use client";

import { useState } from "react";
import { Eraser, PaintBucket, Paintbrush, Square, Trash2, Stamp } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { TerrainEditorTool, TerrainType } from "@/lib/gameplay-mock-data";
import {
  TERRAIN_CATALOG,
  TERRAIN_CATEGORIES,
  getTerrainsByCategory,
  type TerrainCategoryId,
} from "@/lib/terrain-catalog";
import { getTerrainCSSPattern } from "@/components/gameplay/map-canvas/terrain-patterns";
import { ROOM_TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/room-templates";

const EDITOR_TOOLS: {
  tool: TerrainEditorTool;
  icon: typeof Paintbrush;
  label: string;
}[] = [
  { tool: "brush", icon: Paintbrush, label: "Pincel" },
  { tool: "rectangle", icon: Square, label: "Retangulo" },
  { tool: "fill", icon: PaintBucket, label: "Preencher" },
  { tool: "eraser", icon: Eraser, label: "Apagar" },
];

const BRUSH_SIZES = [1, 2, 3] as const;

const CATEGORY_TABS: { id: TerrainCategoryId | "all"; label: string }[] = [
  { id: "all", label: "Todos" },
  ...TERRAIN_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
];

export function TerrainToolPicker() {
  const activeTool = useGameplayStore((s) => s.activeTool);
  const editorTool = useGameplayStore((s) => s.terrainEditorTool);
  const brushSize = useGameplayStore((s) => s.terrainBrushSize);
  const category = useGameplayStore((s) => s.terrainCategory);
  const activeTerrainType = useGameplayStore((s) => s.activeTerrainType);
  const setEditorTool = useGameplayStore((s) => s.setTerrainEditorTool);
  const setBrushSize = useGameplayStore((s) => s.setTerrainBrushSize);
  const setCategory = useGameplayStore((s) => s.setTerrainCategory);
  const setActiveTerrainType = useGameplayStore((s) => s.setActiveTerrainType);
  const clearTerrain = useGameplayStore((s) => s.clearTerrain);
  const stampTemplate = useGameplayStore((s) => s.stampTemplate);
  const hoverCell = useGameplayStore((s) => s.hoverCell);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateCat, setTemplateCat] = useState<string>("all");

  if (activeTool !== "terrain") return null;

  const terrains = getTerrainsByCategory(category);

  return (
    <div className="absolute left-1/2 top-14 z-40 flex w-[340px] -translate-x-1/2 flex-col gap-2 rounded-lg border border-brand-border bg-[#111116] p-3 shadow-xl">
      {/* Editor tools */}
      <div className="flex items-center gap-1">
        {EDITOR_TOOLS.map(({ tool, icon: Icon, label }) => (
          <button
            key={tool}
            title={label}
            onClick={() => setEditorTool(tool)}
            className={`flex h-7 flex-1 items-center justify-center gap-1 rounded-md text-[10px] transition-colors ${
              editorTool === tool
                ? "bg-brand-accent text-white"
                : "text-brand-muted hover:bg-white/[0.06] hover:text-brand-text"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Brush size (only for brush/eraser) */}
      {(editorTool === "brush" || editorTool === "eraser") && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-brand-muted">Tamanho:</span>
          <div className="flex items-center gap-1">
            {BRUSH_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`flex h-6 w-8 items-center justify-center rounded text-[10px] font-semibold transition-colors ${
                  brushSize === size
                    ? "bg-brand-accent text-white"
                    : "text-brand-muted hover:bg-white/[0.06] hover:text-brand-text"
                }`}
              >
                {size}x{size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="h-px bg-brand-border" />

      {/* Category tabs */}
      <div className="flex items-center gap-1">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategory(tab.id)}
            className={`flex-1 rounded px-1 py-1 text-[10px] transition-colors ${
              category === tab.id
                ? "bg-white/10 font-semibold text-brand-text"
                : "text-brand-muted hover:bg-white/[0.04] hover:text-brand-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Terrain grid */}
      <div className="grid max-h-[200px] grid-cols-4 gap-1 overflow-y-auto">
        {terrains.map((t) => {
          const isActive = activeTerrainType === t.type;
          const pattern = t.pattern
            ? getTerrainCSSPattern(t.pattern.type, t.pattern.color, t.pattern.opacity, 28)
            : null;

          return (
            <button
              key={t.type}
              title={t.label}
              onClick={() => setActiveTerrainType(t.type as TerrainType)}
              className={`flex flex-col items-center gap-0.5 rounded-md border p-1.5 transition-colors ${
                isActive
                  ? "border-brand-accent bg-brand-accent/10"
                  : "border-transparent hover:border-brand-border hover:bg-white/[0.04]"
              }`}
            >
              <div
                className="h-7 w-7 rounded"
                style={{
                  backgroundColor: t.color,
                  borderRight: `1px solid ${t.borderColor}`,
                  borderBottom: `1px solid ${t.borderColor}`,
                  ...(pattern && {
                    backgroundImage: pattern.backgroundImage,
                    backgroundSize: pattern.backgroundSize,
                  }),
                }}
              />
              <span className="w-full truncate text-center text-[9px] leading-tight text-brand-muted">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="h-px bg-brand-border" />

      {/* Room templates toggle */}
      <button
        onClick={() => setShowTemplates((v) => !v)}
        className={`flex items-center justify-center gap-1 rounded-md py-1 text-[10px] transition-colors ${
          showTemplates
            ? "bg-brand-accent/20 text-brand-accent"
            : "text-brand-muted hover:bg-white/[0.06] hover:text-brand-text"
        }`}
      >
        <Stamp className="h-3 w-3" />
        Templates de Sala
      </button>

      {showTemplates && (
        <>
          <div className="flex items-center gap-1">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setTemplateCat(cat.id)}
                className={`flex-1 rounded px-1 py-0.5 text-[9px] transition-colors ${
                  templateCat === cat.id
                    ? "bg-white/10 font-semibold text-brand-text"
                    : "text-brand-muted hover:bg-white/[0.04] hover:text-brand-text"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="grid max-h-[120px] grid-cols-3 gap-1 overflow-y-auto">
            {ROOM_TEMPLATES.filter(
              (t) => templateCat === "all" || t.category === templateCat,
            ).map((tmpl) => (
              <button
                key={tmpl.id}
                title={`${tmpl.name} (${tmpl.width}x${tmpl.height}) — Click para colocar no centro`}
                onClick={() => {
                  const cx = hoverCell?.x ?? Math.floor((25 - tmpl.width) / 2);
                  const cy = hoverCell?.y ?? Math.floor((25 - tmpl.height) / 2);
                  stampTemplate(tmpl, cx, cy);
                }}
                className="flex flex-col items-center gap-0.5 rounded-md border border-transparent p-1.5 transition-colors hover:border-brand-border hover:bg-white/[0.04]"
              >
                <span className="text-base">{tmpl.icon}</span>
                <span className="w-full truncate text-center text-[8px] leading-tight text-brand-muted">
                  {tmpl.name}
                </span>
                <span className="text-[7px] text-brand-muted/60">
                  {tmpl.width}x{tmpl.height}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="h-px bg-brand-border" />

      {/* Clear */}
      <button
        onClick={clearTerrain}
        className="flex items-center justify-center gap-1 rounded-md py-1 text-[10px] text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
      >
        <Trash2 className="h-3 w-3" />
        Limpar Terreno
      </button>
    </div>
  );
}
