import {
  MousePointer2,
  Mountain,
  BoxSelect,
  Minus,
  DoorOpen,
  Lightbulb,
  Cloud,
  StickyNote,
  Eraser,
  Sparkles,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useEditorStore } from "../../lib/editor-store";
import { TERRAIN_BY_CATEGORY, type TerrainInfo } from "../../lib/terrain-data";
import type { EditorTool, EditorLayerVisibility } from "@questboard/shared/types";

// ─── Tool Button ─────────────────────────────────────────

const TOOLS: { id: EditorTool; label: string; icon: typeof MousePointer2 }[] = [
  { id: "cursor", label: "Cursor", icon: MousePointer2 },
  { id: "terrain", label: "Terreno", icon: Mountain },
  { id: "objects", label: "Objetos", icon: BoxSelect },
  { id: "walls", label: "Paredes", icon: Minus },
  { id: "doors", label: "Portas", icon: DoorOpen },
  { id: "lights", label: "Luzes", icon: Lightbulb },
  { id: "fog", label: "Fog", icon: Cloud },
  { id: "annotate", label: "Notas", icon: StickyNote },
  { id: "eraser", label: "Apagar", icon: Eraser },
  { id: "ia_zone", label: "IA Zona", icon: Sparkles },
];

function ToolButton({
  tool,
  isActive,
  onClick,
}: {
  tool: (typeof TOOLS)[number];
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = tool.icon;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
        isActive
          ? "bg-accent/15 text-accent"
          : "text-text-secondary hover:bg-border/50 hover:text-text-primary"
      }`}
    >
      <Icon size={16} />
      <span className="font-medium">{tool.label}</span>
    </button>
  );
}

// ─── Terrain Palette ─────────────────────────────────────

function TerrainSwatch({
  terrain,
  isSelected,
  onClick,
}: {
  terrain: TerrainInfo;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={terrain.name}
      className={`w-11 h-11 rounded-lg border-2 transition-all ${
        isSelected
          ? "border-accent scale-110 shadow-[0_0_8px_rgba(108,92,231,0.4)]"
          : "border-transparent hover:border-border-hover"
      }`}
      style={{ backgroundColor: terrain.color }}
    />
  );
}

function TerrainPalette() {
  const { selectedTerrainType, setSelectedTerrainType, brushSize, setBrushSize, brushShape, setBrushShape } =
    useEditorStore();
  const [expandedCat, setExpandedCat] = useState<string>("Dungeon");

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
        Paleta de Terrenos
      </span>

      {Object.entries(TERRAIN_BY_CATEGORY).map(([category, terrains]) => (
        <div key={category}>
          <button
            onClick={() => setExpandedCat(expandedCat === category ? "" : category)}
            className="flex items-center gap-1 text-xs font-medium text-text-secondary mb-1.5 hover:text-text-primary"
          >
            {expandedCat === category ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {category}
          </button>
          {expandedCat === category && (
            <div className="grid grid-cols-4 gap-1.5">
              {terrains.map((t) => (
                <TerrainSwatch
                  key={t.type}
                  terrain={t}
                  isSelected={selectedTerrainType === t.type}
                  onClick={() => setSelectedTerrainType(t.type)}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Brush settings */}
      <div className="flex flex-col gap-2 mt-1">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Pincel
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 5].map((size) => (
            <button
              key={size}
              onClick={() => setBrushSize(size)}
              className={`flex-1 h-7 rounded text-xs font-medium transition-colors ${
                brushSize === size
                  ? "bg-accent text-white"
                  : "bg-bg-input text-text-secondary hover:bg-border"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["square", "circle", "diamond"] as const).map((shape) => (
            <button
              key={shape}
              onClick={() => setBrushShape(shape)}
              className={`flex-1 h-7 rounded text-xs font-medium capitalize transition-colors ${
                brushShape === shape
                  ? "bg-accent text-white"
                  : "bg-bg-input text-text-secondary hover:bg-border"
              }`}
            >
              {shape === "square" ? "Quad" : shape === "circle" ? "Circ" : "Diam"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Layers Panel ────────────────────────────────────────

const LAYER_NAMES: { key: keyof EditorLayerVisibility; label: string }[] = [
  { key: "terrain", label: "Terreno" },
  { key: "objects", label: "Objetos" },
  { key: "structures", label: "Estruturas" },
  { key: "lighting", label: "Iluminação" },
  { key: "fog", label: "Fog of War" },
  { key: "annotations", label: "Anotações" },
];

function LayersPanel() {
  const { layerVisibility, toggleLayerVisibility } = useEditorStore();

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
        Camadas
      </span>
      {LAYER_NAMES.map((layer) => (
        <button
          key={layer.key}
          onClick={() => toggleLayerVisibility(layer.key)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm hover:bg-border/30 transition-colors"
        >
          {layerVisibility[layer.key] ? (
            <Eye size={14} className="text-accent" />
          ) : (
            <EyeOff size={14} className="text-text-muted" />
          )}
          <span
            className={
              layerVisibility[layer.key] ? "text-text-primary" : "text-text-muted"
            }
          >
            {layer.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Left Panel ──────────────────────────────────────────

export function LeftPanel() {
  const { activeTool, setActiveTool } = useEditorStore();

  return (
    <div className="w-[280px] bg-bg-panel border-r border-border flex flex-col overflow-y-auto">
      {/* Tools */}
      <div className="p-3 border-b border-border">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
          Ferramentas
        </span>
        <div className="flex flex-col gap-0.5">
          {TOOLS.map((tool) => (
            <ToolButton
              key={tool.id}
              tool={tool}
              isActive={activeTool === tool.id}
              onClick={() => setActiveTool(tool.id)}
            />
          ))}
        </div>
      </div>

      {/* Terrain Palette (when terrain tool active) */}
      {activeTool === "terrain" && (
        <div className="p-3 border-b border-border">
          <TerrainPalette />
        </div>
      )}

      {/* Layers */}
      <div className="p-3">
        <LayersPanel />
      </div>
    </div>
  );
}
