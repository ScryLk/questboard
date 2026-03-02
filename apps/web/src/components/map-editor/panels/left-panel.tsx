import { useMapEditorStore } from "../../../stores/map-editor-store.js";
import {
  TERRAIN_PALETTE,
  TERRAIN_CATEGORIES,
  WALL_TYPES,
  LIGHT_TYPES,
  DOOR_TYPES,
} from "@questboard/shared/constants";
import type { EditorTool, TerrainType, BrushShape } from "@questboard/shared";

const TOOLS: { key: EditorTool; label: string; icon: string }[] = [
  { key: "cursor", label: "Cursor", icon: "M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" },
  { key: "terrain", label: "Terreno", icon: "M2 22h20L12 2 2 22zm2-2 8-14 8 14H4z" },
  { key: "objects", label: "Objetos", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" },
  { key: "walls", label: "Paredes", icon: "M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" },
  { key: "doors", label: "Portas", icon: "M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM15 12a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" },
  { key: "lights", label: "Luzes", icon: "M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2zM9 21h6M10 17v4M14 17v4" },
  { key: "fog", label: "Fog", icon: "M3 15c2.483 0 4.345-3 6.828-3 2.484 0 4.345 3 6.828 3 2.484 0 3.172-1.5 4.344-3M3 9c2.483 0 4.345-3 6.828-3 2.484 0 4.345 3 6.828 3 2.484 0 3.172-1.5 4.344-3" },
  { key: "annotate", label: "Notas", icon: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" },
  { key: "eraser", label: "Borracha", icon: "M20 20H7L3 16l8.5-8.5L20 16M7.5 13.5l5-5" },
  { key: "ai_zone", label: "IA Zone", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
];

const BRUSH_SIZES = [1, 2, 3, 5];
const BRUSH_SHAPES: { key: BrushShape; label: string }[] = [
  { key: "square", label: "Quadrado" },
  { key: "circle", label: "Círculo" },
  { key: "diamond", label: "Diamante" },
];

export function LeftPanel() {
  const {
    activeTool,
    setActiveTool,
    selectedTerrainType,
    setSelectedTerrainType,
    selectedWallType,
    setSelectedWallType,
    selectedDoorType,
    setSelectedDoorType,
    selectedLightType,
    setSelectedLightType,
    brushSize,
    setBrushSize,
    brushShape,
    setBrushShape,
    layerVisibility,
    setLayerVisibility,
  } = useMapEditorStore();

  return (
    <div className="flex h-full w-[280px] flex-col border-r border-white/10 bg-[#111116]">
      {/* Tools */}
      <div className="border-b border-white/10 p-3">
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Ferramentas
        </h3>
        <div className="grid grid-cols-2 gap-1">
          {TOOLS.map((tool) => (
            <button
              key={tool.key}
              onClick={() => setActiveTool(tool.key)}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition ${
                activeTool === tool.key
                  ? "bg-brand-accent/20 text-brand-accent"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={tool.icon} />
              </svg>
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tool-specific palette */}
      <div className="flex-1 overflow-y-auto">
        {activeTool === "terrain" && (
          <TerrainPalette
            selected={selectedTerrainType}
            onSelect={setSelectedTerrainType}
            brushSize={brushSize}
            onBrushSizeChange={setBrushSize}
            brushShape={brushShape}
            onBrushShapeChange={setBrushShape}
          />
        )}

        {activeTool === "walls" && (
          <WallPalette selected={selectedWallType} onSelect={setSelectedWallType} />
        )}

        {activeTool === "doors" && (
          <DoorPalette selected={selectedDoorType} onSelect={setSelectedDoorType} />
        )}

        {activeTool === "lights" && (
          <LightPalette selected={selectedLightType} onSelect={setSelectedLightType} />
        )}

        {activeTool === "ai_zone" && (
          <AIZoneHelp />
        )}
      </div>

      {/* Layers */}
      <div className="border-t border-white/10 p-3">
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Camadas
        </h3>
        <div className="space-y-1">
          {(
            [
              { key: "terrain", label: "Terreno" },
              { key: "objects", label: "Objetos" },
              { key: "structures", label: "Estruturas" },
              { key: "lighting", label: "Iluminação" },
              { key: "fog", label: "Fog of War" },
              { key: "annotations", label: "Notas GM" },
            ] as const
          ).map((layer) => (
            <label
              key={layer.key}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/5"
            >
              <input
                type="checkbox"
                checked={layerVisibility[layer.key]}
                onChange={(e) =>
                  setLayerVisibility(layer.key, e.target.checked)
                }
                className="rounded border-white/20 bg-transparent accent-brand-accent"
              />
              {layer.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Terrain Palette ───

function TerrainPalette({
  selected,
  onSelect,
  brushSize,
  onBrushSizeChange,
  brushShape,
  onBrushShapeChange,
}: {
  selected: TerrainType;
  onSelect: (type: TerrainType) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  brushShape: BrushShape;
  onBrushShapeChange: (shape: BrushShape) => void;
}) {
  return (
    <div className="p-3">
      {/* Brush settings */}
      <div className="mb-3 space-y-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Pincel
        </h3>
        <div className="flex items-center gap-1">
          <span className="w-12 text-[10px] text-gray-500">Tamanho:</span>
          {BRUSH_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => onBrushSizeChange(size)}
              className={`h-7 w-7 rounded text-xs ${
                brushSize === size
                  ? "bg-brand-accent text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="w-12 text-[10px] text-gray-500">Forma:</span>
          {BRUSH_SHAPES.map((shape) => (
            <button
              key={shape.key}
              onClick={() => onBrushShapeChange(shape.key)}
              className={`rounded px-2 py-1 text-[10px] ${
                brushShape === shape.key
                  ? "bg-brand-accent text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {shape.label}
            </button>
          ))}
        </div>
      </div>

      {/* Terrain types by category */}
      {TERRAIN_CATEGORIES.map((category) => {
        const terrains = TERRAIN_PALETTE.filter(
          (t) => t.category === category.key
        );
        if (terrains.length === 0) return null;

        return (
          <div key={category.key} className="mb-3">
            <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              {category.label}
            </h4>
            <div className="grid grid-cols-4 gap-1">
              {terrains.map((terrain) => (
                <button
                  key={terrain.type}
                  onClick={() => onSelect(terrain.type)}
                  className={`group flex flex-col items-center rounded-lg p-1.5 transition ${
                    selected === terrain.type
                      ? "ring-2 ring-brand-accent"
                      : "hover:bg-white/5"
                  }`}
                  title={terrain.label}
                >
                  <div
                    className="mb-1 h-10 w-10 rounded"
                    style={{ backgroundColor: terrain.color }}
                  />
                  <span className="text-[9px] leading-tight text-gray-400 group-hover:text-white">
                    {terrain.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Wall Palette ───

function WallPalette({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (type: any) => void;
}) {
  return (
    <div className="p-3">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        Tipo de Parede
      </h3>
      <div className="space-y-1">
        {WALL_TYPES.map((wall) => (
          <button
            key={wall.key}
            onClick={() => onSelect(wall.key)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${
              selected === wall.key
                ? "bg-brand-accent/20 text-brand-accent"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div
              className="h-3 w-8 rounded-full"
              style={{ backgroundColor: wall.color }}
            />
            {wall.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-gray-500">
        Clique num ponto da grid para iniciar, clique em outro para finalizar a parede.
        Pressione Esc para cancelar.
      </p>
    </div>
  );
}

// ─── Door Palette ───

function DoorPalette({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (type: any) => void;
}) {
  const { selectedDoorState } = useMapEditorStore();

  return (
    <div className="p-3">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        Tipo de Porta
      </h3>
      <div className="space-y-1">
        {DOOR_TYPES.map((door) => (
          <button
            key={door.key}
            onClick={() => onSelect(door.key)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${
              selected === door.key
                ? "bg-brand-accent/20 text-brand-accent"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {door.label}
          </button>
        ))}
      </div>

      <h3 className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        Estado Inicial
      </h3>
      <div className="space-y-1">
        {(["open", "closed", "locked", "barred", "secret"] as const).map((state) => {
          const labels: Record<string, string> = {
            open: "Aberta",
            closed: "Fechada",
            locked: "Trancada",
            barred: "Barrada",
            secret: "Secreta",
          };
          return (
            <button
              key={state}
              onClick={() => useMapEditorStore.setState({ selectedDoorState: state })}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${
                selectedDoorState === state
                  ? "bg-brand-accent/20 text-brand-accent"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {labels[state]}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-gray-500">
        Clique no tile para inserir a porta. A posição (N/S/L/O) depende de onde no tile você clicar.
      </p>
    </div>
  );
}

// ─── Light Palette ───

function LightPalette({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (type: any) => void;
}) {
  return (
    <div className="p-3">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        Tipo de Luz
      </h3>
      <div className="space-y-1">
        {LIGHT_TYPES.map((light) => (
          <button
            key={light.key}
            onClick={() => onSelect(light.key)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${
              selected === light.key
                ? "bg-brand-accent/20 text-brand-accent"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: light.defaultColor }}
            />
            <span>{light.label}</span>
            <span className="ml-auto text-[10px] text-gray-500">
              {light.defaultRadius} tiles
            </span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-gray-500">
        Clique no tile para colocar a fonte de luz.
      </p>
    </div>
  );
}

// ─── AI Zone Help ───

function AIZoneHelp() {
  return (
    <div className="p-3">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        Geração por IA
      </h3>
      <div className="rounded-lg bg-brand-muted/20 p-3">
        <p className="text-xs leading-relaxed text-gray-300">
          Clique e arraste no canvas para selecionar uma zona. A IA irá gerar terreno, objetos e detalhes para a área selecionada.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-3 w-3 rounded border border-brand-muted bg-brand-muted/30" />
          <span className="text-[10px] text-gray-400">Zona selecionada</span>
        </div>
      </div>
    </div>
  );
}
