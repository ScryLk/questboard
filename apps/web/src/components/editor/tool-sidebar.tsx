import { useMapEditorStore } from "../../lib/map-editor-store.js";
import { TERRAIN_CATEGORIES, OBJECT_CATEGORIES, WALL_TYPES, DOOR_TYPES, LIGHT_TYPES } from "../../lib/terrain-data.js";
import type { EditorTool, LayerName } from "@questboard/shared";

const TOOLS: { id: EditorTool; label: string; icon: string }[] = [
  { id: "cursor", label: "Cursor", icon: "↖" },
  { id: "terrain", label: "Terreno", icon: "◻" },
  { id: "objects", label: "Objetos", icon: "⬡" },
  { id: "walls", label: "Paredes", icon: "▬" },
  { id: "doors", label: "Portas", icon: "🚪" },
  { id: "lights", label: "Luzes", icon: "💡" },
  { id: "fog", label: "Fog", icon: "🌫" },
  { id: "annotate", label: "Notas", icon: "✎" },
  { id: "eraser", label: "Apagar", icon: "⌫" },
  { id: "ai_zone", label: "IA Zone", icon: "✨" },
];

const LAYERS: { id: LayerName; label: string }[] = [
  { id: "terrain", label: "Terreno" },
  { id: "objects", label: "Objetos" },
  { id: "structures", label: "Estruturas" },
  { id: "lighting", label: "Iluminação" },
  { id: "annotations", label: "Anotações" },
  { id: "fog", label: "Fog of War" },
];

export function ToolSidebar() {
  const {
    activeTool,
    setActiveTool,
    selectedTerrain,
    setSelectedTerrain,
    brushSize,
    setBrushSize,
    brushShape,
    setBrushShape,
    layerVisibility,
    toggleLayerVisibility,
    selectedWallType,
    setSelectedWallType,
    selectedDoorType,
    setSelectedDoorType,
    selectedDoorState,
    setSelectedDoorState,
    selectedLightType,
    setSelectedLightType,
    lightRadius,
    setLightRadius,
    lightColor,
    setLightColor,
    selectedObjectType,
    setSelectedObjectType,
    fogBrushMode,
    setFogBrushMode,
  } = useMapEditorStore();

  return (
    <div className="flex h-full w-[280px] flex-col overflow-y-auto border-r border-white/10 bg-[#111116]">
      {/* Tools */}
      <div className="border-b border-white/10 p-3">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Ferramentas
        </h3>
        <div className="flex flex-col gap-0.5">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                activeTool === tool.id
                  ? "bg-brand-accent/20 text-brand-accent"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="w-5 text-center">{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Terrain palette */}
      {activeTool === "terrain" && (
        <div className="border-b border-white/10 p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Paleta de Terreno
          </h3>
          {TERRAIN_CATEGORIES.map((cat) => (
            <div key={cat.id} className="mb-3">
              <p className="mb-1.5 text-xs font-medium text-gray-500">{cat.label}</p>
              <div className="grid grid-cols-4 gap-1.5">
                {cat.terrains.map((t) => (
                  <button
                    key={t.type}
                    onClick={() => setSelectedTerrain(t.type)}
                    title={t.label}
                    className={`group relative aspect-square rounded-md border-2 transition-all ${
                      selectedTerrain === t.type
                        ? "border-brand-accent shadow-glow"
                        : "border-transparent hover:border-white/20"
                    }`}
                    style={{ backgroundColor: t.color }}
                  >
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate rounded-b-md bg-black/60 px-0.5 py-px text-[9px] leading-tight text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Brush settings */}
          <div className="mt-3 border-t border-white/10 pt-3">
            <p className="mb-1.5 text-xs font-medium text-gray-500">Tamanho do Pincel</p>
            <div className="flex gap-1">
              {[1, 2, 3, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setBrushSize(s)}
                  className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                    brushSize === s
                      ? "bg-brand-accent text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {s}×{s}
                </button>
              ))}
            </div>
            <p className="mb-1.5 mt-3 text-xs font-medium text-gray-500">Forma do Pincel</p>
            <div className="flex gap-1">
              {(["square", "circle", "diamond"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setBrushShape(s)}
                  className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                    brushShape === s
                      ? "bg-brand-accent text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {s === "square" ? "■" : s === "circle" ? "●" : "◆"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wall types */}
      {activeTool === "walls" && (
        <div className="border-b border-white/10 p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Tipo de Parede
          </h3>
          <div className="flex flex-col gap-1">
            {WALL_TYPES.map((w) => (
              <button
                key={w.type}
                onClick={() => setSelectedWallType(w.type as any)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  selectedWallType === w.type
                    ? "bg-brand-accent/20 text-brand-accent"
                    : "text-gray-400 hover:bg-white/5"
                }`}
              >
                <span
                  className="inline-block h-1 w-6 rounded"
                  style={{ backgroundColor: w.color, height: w.thickness * 2 }}
                />
                <span>{w.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Clique em dois pontos da grid para desenhar uma parede.
          </p>
        </div>
      )}

      {/* Door types */}
      {activeTool === "doors" && (
        <div className="border-b border-white/10 p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Tipo de Porta
          </h3>
          <div className="flex flex-wrap gap-1">
            {DOOR_TYPES.map((d) => (
              <button
                key={d.type}
                onClick={() => setSelectedDoorType(d.type as any)}
                className={`rounded px-3 py-1.5 text-xs font-medium ${
                  selectedDoorType === d.type
                    ? "bg-brand-accent text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className="mb-1.5 mt-3 text-xs font-medium text-gray-500">Estado Inicial</p>
          <div className="flex flex-wrap gap-1">
            {(["open", "closed", "locked", "barred", "secret"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSelectedDoorState(s)}
                className={`rounded px-3 py-1.5 text-xs font-medium ${
                  selectedDoorState === s
                    ? "bg-brand-accent text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {s === "open" ? "Aberta" : s === "closed" ? "Fechada" : s === "locked" ? "Trancada" : s === "barred" ? "Barrada" : "Secreta"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Light types */}
      {activeTool === "lights" && (
        <div className="border-b border-white/10 p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Tipo de Luz
          </h3>
          <div className="flex flex-col gap-1">
            {LIGHT_TYPES.map((l) => (
              <button
                key={l.type}
                onClick={() => {
                  setSelectedLightType(l.type as any);
                  setLightColor(l.defaultColor);
                  setLightRadius(l.defaultRadius);
                }}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  selectedLightType === l.type
                    ? "bg-brand-accent/20 text-brand-accent"
                    : "text-gray-400 hover:bg-white/5"
                }`}
              >
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: l.defaultColor }} />
                <span>{l.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            <label className="block">
              <span className="text-xs text-gray-500">Raio ({lightRadius} tiles)</span>
              <input
                type="range"
                min={1}
                max={20}
                value={lightRadius}
                onChange={(e) => setLightRadius(Number(e.target.value))}
                className="mt-1 w-full accent-brand-accent"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Cor</span>
              <input
                type="color"
                value={lightColor}
                onChange={(e) => setLightColor(e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-white/10 bg-transparent"
              />
            </label>
          </div>
        </div>
      )}

      {/* Objects */}
      {activeTool === "objects" && (
        <div className="border-b border-white/10 p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Biblioteca de Objetos
          </h3>
          {OBJECT_CATEGORIES.map((cat) => (
            <div key={cat.id} className="mb-3">
              <p className="mb-1 text-xs font-medium text-gray-500">{cat.label}</p>
              <div className="flex flex-wrap gap-1">
                {cat.objects.map((obj) => (
                  <button
                    key={obj.type}
                    onClick={() => setSelectedObjectType(obj.type as any)}
                    className={`rounded px-2 py-1 text-xs ${
                      selectedObjectType === obj.type
                        ? "bg-brand-accent text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {obj.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-500">
            Clique no mapa para posicionar o objeto selecionado.
          </p>
        </div>
      )}

      {/* Fog controls */}
      {activeTool === "fog" && (
        <div className="border-b border-white/10 p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Fog of War
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => setFogBrushMode("reveal")}
              className={`flex-1 rounded px-3 py-2 text-xs font-medium ${
                fogBrushMode === "reveal"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Revelar
            </button>
            <button
              onClick={() => setFogBrushMode("hide")}
              className={`flex-1 rounded px-3 py-2 text-xs font-medium ${
                fogBrushMode === "hide"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Esconder
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => useMapEditorStore.getState().revealAllFog()}
              className="flex-1 rounded bg-white/5 px-2 py-1.5 text-xs text-gray-400 hover:bg-white/10"
            >
              Revelar Tudo
            </button>
            <button
              onClick={() => useMapEditorStore.getState().hideAllFog()}
              className="flex-1 rounded bg-white/5 px-2 py-1.5 text-xs text-gray-400 hover:bg-white/10"
            >
              Esconder Tudo
            </button>
          </div>
        </div>
      )}

      {/* Layers */}
      <div className="p-3">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Camadas
        </h3>
        <div className="flex flex-col gap-1">
          {LAYERS.map((layer) => (
            <label
              key={layer.id}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-300 hover:bg-white/5"
            >
              <input
                type="checkbox"
                checked={layerVisibility[layer.id]}
                onChange={() => toggleLayerVisibility(layer.id)}
                className="h-3.5 w-3.5 rounded border-white/20 accent-brand-accent"
              />
              <span>{layer.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
