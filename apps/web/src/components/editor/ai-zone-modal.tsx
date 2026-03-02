import { useState } from "react";
import type { BiomeType, ZoneType, VisualStyle, DetailLevel } from "@questboard/shared";

interface AIZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  zoneWidth: number;
  zoneHeight: number;
}

const ZONE_TYPES: { id: ZoneType; label: string }[] = [
  { id: "room", label: "Sala" },
  { id: "corridor", label: "Corredor" },
  { id: "outdoor", label: "Área Externa" },
  { id: "cave", label: "Caverna" },
  { id: "custom", label: "Custom" },
];

const BIOMES: { id: BiomeType; label: string }[] = [
  { id: "dungeon", label: "Dungeon" },
  { id: "forest", label: "Floresta" },
  { id: "city", label: "Cidade" },
  { id: "cave", label: "Caverna" },
  { id: "desert", label: "Deserto" },
  { id: "swamp", label: "Pântano" },
  { id: "mountain", label: "Montanha" },
  { id: "coast", label: "Costa" },
  { id: "underground", label: "Subterrâneo" },
  { id: "ice", label: "Gelo" },
];

const STYLES: { id: VisualStyle; label: string }[] = [
  { id: "realistic", label: "Realista" },
  { id: "fantasy", label: "Fantasia" },
  { id: "cartoon", label: "Cartoon" },
  { id: "dark", label: "Dark" },
  { id: "painterly", label: "Painterly" },
];

const DETAIL_LEVELS: { id: DetailLevel; label: string }[] = [
  { id: "simple", label: "Simples" },
  { id: "moderate", label: "Moderado" },
  { id: "detailed", label: "Detalhado" },
];

export function AIZoneModal({ isOpen, onClose, zoneWidth, zoneHeight }: AIZoneModalProps) {
  const [zoneType, setZoneType] = useState<ZoneType>("room");
  const [biome, setBiome] = useState<BiomeType>("dungeon");
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState<VisualStyle>("fantasy");
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("moderate");
  const [includeTerrain, setIncludeTerrain] = useState(true);
  const [includeObjects, setIncludeObjects] = useState(true);
  const [includeLighting, setIncludeLighting] = useState(true);
  const [includeWalls, setIncludeWalls] = useState(false);
  const [includeDescriptions, setIncludeDescriptions] = useState(true);
  const [includeInteractions, setIncludeInteractions] = useState(true);

  if (!isOpen) return null;

  const feetW = zoneWidth * 5;
  const feetH = zoneHeight * 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[640px] rounded-2xl bg-[#16161C] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <span className="text-brand-accent">✨</span> Gerar Zona com IA
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Zona selecionada: {zoneWidth}×{zoneHeight} tiles ({feetW}×{feetH} pés)
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            ✕
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {/* Zone Type */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-gray-400">
              Tipo de Zona
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ZONE_TYPES.map((z) => (
                <button
                  key={z.id}
                  onClick={() => setZoneType(z.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    zoneType === z.id
                      ? "bg-brand-accent text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>

          {/* Biome */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-gray-400">Bioma</label>
            <div className="flex flex-wrap gap-1.5">
              {BIOMES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBiome(b.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    biome === b.id
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
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-gray-400">
              Descrição (o que tem nessa zona)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              placeholder="Uma taverna aconchegante com lareira no centro, mesas de madeira, um balcão com bebidas, e um bardo tocando no canto..."
              rows={4}
              className="w-full rounded-lg bg-[#0F0F12] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none ring-1 ring-white/10 focus:ring-brand-accent"
            />
            <p className="mt-1 text-right text-xs text-gray-600">{description.length}/500</p>
          </div>

          {/* Visual Style */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-gray-400">
              Estilo Visual
            </label>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    style === s.id
                      ? "bg-brand-accent text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Detail Level */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-gray-400">
              Nível de Detalhe
            </label>
            <div className="flex gap-1.5">
              {DETAIL_LEVELS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDetailLevel(d.id)}
                  className={`flex-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                    detailLevel === d.id
                      ? "bg-brand-accent text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Include checkboxes */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-gray-400">
              Incluir
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Terreno base", state: includeTerrain, toggle: setIncludeTerrain },
                { label: "Objetos", state: includeObjects, toggle: setIncludeObjects },
                { label: "Iluminação", state: includeLighting, toggle: setIncludeLighting },
                { label: "Paredes", state: includeWalls, toggle: setIncludeWalls },
                { label: "Descrições", state: includeDescriptions, toggle: setIncludeDescriptions },
                { label: "Detalhes interativos", state: includeInteractions, toggle: setIncludeInteractions },
              ].map((item) => (
                <label key={item.label} className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={item.state}
                    onChange={(e) => item.toggle(e.target.checked)}
                    className="h-3.5 w-3.5 rounded accent-brand-accent"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Preview area */}
          <div className="mb-4 rounded-lg bg-[#0F0F12] p-4">
            <div className="flex items-center justify-center">
              <div
                className="grid gap-px"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(zoneWidth, 20)}, 12px)`,
                  gridTemplateRows: `repeat(${Math.min(zoneHeight, 15)}, 12px)`,
                }}
              >
                {Array.from({ length: Math.min(zoneWidth, 20) * Math.min(zoneHeight, 15) }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-sm bg-white/5"
                    style={{ width: 12, height: 12 }}
                  />
                ))}
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-gray-600">
              Preview da zona a ser gerada
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
          <p className="text-xs text-gray-500">
            Custo: 1 crédito de IA (restam 27)
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:bg-white/5"
            >
              Cancelar
            </button>
            <button className="rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10">
              Preview
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-brand-accent px-5 py-2 text-sm font-medium text-white hover:bg-brand-accent/80">
              <span>✨</span> Gerar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
