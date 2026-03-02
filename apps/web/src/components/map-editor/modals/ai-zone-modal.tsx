import { useState } from "react";
import { useMapEditorStore } from "../../../stores/map-editor-store.js";
import { BIOME_OPTIONS } from "@questboard/shared/constants";
import type {
  ZoneType,
  BiomeType,
  VisualStyle,
  DetailLevel,
} from "@questboard/shared";

const ZONE_TYPES: { key: ZoneType; label: string }[] = [
  { key: "room", label: "Sala" },
  { key: "corridor", label: "Corredor" },
  { key: "outdoor", label: "Área Externa" },
  { key: "cave", label: "Caverna" },
  { key: "custom", label: "Custom" },
];

const VISUAL_STYLES: { key: VisualStyle; label: string }[] = [
  { key: "realistic", label: "Realista" },
  { key: "fantasy", label: "Fantasia" },
  { key: "cartoon", label: "Cartoon" },
  { key: "dark", label: "Dark" },
  { key: "painterly", label: "Painterly" },
];

const DETAIL_LEVELS: { key: DetailLevel; label: string }[] = [
  { key: "simple", label: "Simples" },
  { key: "moderate", label: "Moderado" },
  { key: "detailed", label: "Detalhado" },
];

export function AIZoneModal() {
  const {
    showAIZoneModal,
    setShowAIZoneModal,
    aiZoneSelection,
    setAIZoneSelection,
    biome: mapBiome,
    applyAIGeneration,
  } = useMapEditorStore();

  const [zoneType, setZoneType] = useState<ZoneType>("room");
  const [biome, setBiome] = useState<BiomeType>(mapBiome);
  const [description, setDescription] = useState("");
  const [visualStyle, setVisualStyle] = useState<VisualStyle>("fantasy");
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("moderate");
  const [includeTerrain, setIncludeTerrain] = useState(true);
  const [includeObjects, setIncludeObjects] = useState(true);
  const [includeLighting, setIncludeLighting] = useState(true);
  const [includeWalls, setIncludeWalls] = useState(false);
  const [includeDescriptions, setIncludeDescriptions] = useState(true);
  const [includeInteractive, setIncludeInteractive] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!showAIZoneModal || !aiZoneSelection) return null;

  const zoneTiles = aiZoneSelection.width * aiZoneSelection.height;
  const zoneFeet = `${aiZoneSelection.width * 5}x${aiZoneSelection.height * 5} pés`;
  const creditCost = zoneTiles > 50 ? 2 : 1;

  const handleClose = () => {
    setShowAIZoneModal(false);
    setAIZoneSelection(null);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // TODO: Replace with actual API call to AI generation endpoint
      // For now, generate a simple mock layout
      const result = generateMockZone(aiZoneSelection, zoneType, biome);
      applyAIGeneration(result);
      handleClose();
    } catch (error) {
      console.error("AI generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#16161C] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B4AE8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <h2 className="text-sm font-semibold text-white">Gerar Zona com IA</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Zone info */}
          <div className="rounded-lg bg-brand-muted/10 px-4 py-2.5">
            <p className="text-xs text-gray-300">
              Zona selecionada:{" "}
              <span className="font-semibold text-white">
                {aiZoneSelection.width}x{aiZoneSelection.height} tiles
              </span>{" "}
              ({zoneFeet})
            </p>
          </div>

          {/* Zone Type */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Tipo de Zona
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ZONE_TYPES.map((zt) => (
                <button
                  key={zt.key}
                  onClick={() => setZoneType(zt.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs transition ${
                    zoneType === zt.key
                      ? "bg-brand-accent text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {zt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Biome */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Bioma
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BIOME_OPTIONS.map((b) => (
                <button
                  key={b.key}
                  onClick={() => setBiome(b.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs transition ${
                    biome === b.key
                      ? "bg-brand-accent text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uma taverna aconchegante com lareira no centro, mesas de madeira, um balcão com bebidas, e um bardo tocando no canto."
              className="w-full rounded-lg border border-white/10 bg-[#0F0F12] px-4 py-3 text-xs text-white outline-none placeholder:text-gray-600 focus:border-brand-accent"
              rows={4}
              maxLength={500}
            />
            <p className="mt-1 text-right text-[10px] text-gray-500">
              {description.length}/500
            </p>
          </div>

          {/* Visual Style */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Estilo Visual
            </label>
            <div className="flex flex-wrap gap-1.5">
              {VISUAL_STYLES.map((vs) => (
                <button
                  key={vs.key}
                  onClick={() => setVisualStyle(vs.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs transition ${
                    visualStyle === vs.key
                      ? "bg-brand-accent text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {vs.label}
                </button>
              ))}
            </div>
          </div>

          {/* Detail Level */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Nível de Detalhe
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DETAIL_LEVELS.map((dl) => (
                <button
                  key={dl.key}
                  onClick={() => setDetailLevel(dl.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs transition ${
                    detailLevel === dl.key
                      ? "bg-brand-accent text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {dl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Include checkboxes */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Incluir
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Terreno base", checked: includeTerrain, onChange: setIncludeTerrain },
                { label: "Objetos", checked: includeObjects, onChange: setIncludeObjects },
                { label: "Iluminação", checked: includeLighting, onChange: setIncludeLighting },
                { label: "Paredes", checked: includeWalls, onChange: setIncludeWalls },
                { label: "Descrições", checked: includeDescriptions, onChange: setIncludeDescriptions },
                { label: "Detalhes interativos", checked: includeInteractive, onChange: setIncludeInteractive },
              ].map((item) => (
                <label
                  key={item.label}
                  className="flex items-center gap-2 text-xs text-gray-300"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.onChange(e.target.checked)}
                    className="accent-brand-accent"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Preview area placeholder */}
          <div className="rounded-lg border border-white/10 bg-[#0F0F12] p-4">
            <div className="flex h-24 items-center justify-center">
              <p className="text-xs text-gray-500">
                Preview da zona gerada aparecerá aqui
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
          <p className="text-xs text-gray-500">
            Custo:{" "}
            <span className="font-semibold text-brand-muted">
              {creditCost} crédito{creditCost > 1 ? "s" : ""} de IA
            </span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-300 transition hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-brand-accent px-4 py-2 text-xs font-medium text-white transition hover:bg-brand-accent/80 disabled:opacity-40"
            >
              {isGenerating ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Gerando...
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  Gerar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mock generation (placeholder until real AI integration) ───

function generateMockZone(
  zone: { x: number; y: number; width: number; height: number },
  zoneType: ZoneType,
  biome: BiomeType
) {
  const terrainMap: Record<string, string> = {
    room_dungeon: "stone_floor",
    room_forest: "wooden_floor",
    room_city: "cobblestone",
    room_cave: "rocky",
    corridor_dungeon: "stone_floor",
    outdoor_forest: "grass",
    outdoor_city: "cobblestone",
    cave_cave: "rocky",
    cave_dungeon: "dirt_floor",
  };

  const baseType = terrainMap[`${zoneType}_${biome}`] ?? "stone_floor";

  const tiles: any[][] = [];
  for (let y = 0; y < zone.height; y++) {
    tiles[y] = [];
    for (let x = 0; x < zone.width; x++) {
      // Edge tiles might be walls
      const isEdge = x === 0 || x === zone.width - 1 || y === 0 || y === zone.height - 1;
      tiles[y]![x] = {
        x: zone.x + x,
        y: zone.y + y,
        type: isEdge && zoneType === "room" ? "stone_wall" : baseType,
        variant: Math.floor(Math.random() * 4),
        elevation: 0,
        detail: null,
        imageUrl: null,
        tintColor: null,
        opacity: 1,
      };
    }
  }

  // Add some objects for rooms
  const objects: any[] = [];
  if (zoneType === "room" && zone.width > 4 && zone.height > 4) {
    objects.push({
      id: `obj_ai_${Date.now()}_1`,
      x: zone.x + Math.floor(zone.width / 2),
      y: zone.y + Math.floor(zone.height / 2),
      width: 2,
      height: 1,
      type: "table",
      name: "Mesa",
      imageUrl: "",
      rotation: 0,
      isInteractable: true,
      interactionLabel: "Examinar",
      layer: "below_tokens" as const,
      opacity: 1,
    });
  }

  // Add a light source
  const lights: any[] = [];
  if (zone.width > 3 && zone.height > 3) {
    lights.push({
      id: `light_ai_${Date.now()}`,
      x: zone.x + Math.floor(zone.width / 2),
      y: zone.y + Math.floor(zone.height / 2),
      radius: Math.min(zone.width, zone.height),
      color: "#FF9933",
      intensity: 0.7,
      type: "torch",
      flicker: true,
      castsShadows: false,
    });
  }

  return {
    terrain: { tiles },
    objects: { objects },
    lighting: { globalLight: 0.3, ambientColor: "#FFD700", sources: lights },
  };
}
