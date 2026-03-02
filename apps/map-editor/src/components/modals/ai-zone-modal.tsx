import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useEditorStore } from "../../lib/editor-store";
import { BIOME_OPTIONS } from "../../lib/terrain-data";
import type { ZoneType, MapBiome, VisualStyle, DetailLevel } from "@questboard/shared/types";

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

function PillSelector<T extends string>({
  options,
  selected,
  onChange,
}: {
  options: { key: T; label: string }[];
  selected: T;
  onChange: (key: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selected === opt.key
              ? "bg-accent text-white"
              : "bg-bg-input text-text-secondary border border-border hover:border-border-hover"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function AIZoneModal() {
  const { showAIZoneModal, aiZoneSelection, closeAIZone } = useEditorStore();

  const [zoneType, setZoneType] = useState<ZoneType>("room");
  const [biome, setBiome] = useState<MapBiome>("dungeon");
  const [description, setDescription] = useState("");
  const [visualStyle, setVisualStyle] = useState<VisualStyle>("fantasy");
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("moderate");
  const [includes, setIncludes] = useState({
    terrain: true,
    objects: true,
    lighting: true,
    walls: false,
    descriptions: true,
    interactiveDetails: true,
  });

  if (!showAIZoneModal || !aiZoneSelection) return null;

  const zoneSizeFeet = `${aiZoneSelection.width * 5}×${aiZoneSelection.height * 5} pés`;

  function toggleInclude(key: keyof typeof includes) {
    setIncludes((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-[640px] max-h-[90vh] bg-bg-card rounded-2xl border border-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-accent" />
            <h2 className="text-base font-semibold text-text-primary">
              Gerar Zona com IA
            </h2>
          </div>
          <button
            onClick={closeAIZone}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-border/50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">
          {/* Zone info */}
          <div className="bg-bg-input rounded-lg px-3 py-2 text-xs text-text-secondary">
            Zona selecionada: {aiZoneSelection.width}×{aiZoneSelection.height} tiles ({zoneSizeFeet})
          </div>

          {/* Zone Type */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-text-muted">Tipo de Zona</label>
            <PillSelector options={ZONE_TYPES} selected={zoneType} onChange={setZoneType} />
          </div>

          {/* Biome */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-text-muted">Bioma</label>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              <PillSelector options={BIOME_OPTIONS} selected={biome} onChange={setBiome} />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-text-muted">
              Descrição (o que tem nessa zona)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uma taverna aconchegante com lareira no centro, mesas de madeira, um balcão com bebidas, e um bardo tocando no canto..."
              maxLength={500}
              rows={4}
              className="bg-bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary resize-none placeholder:text-text-muted"
            />
            <span className="text-xs text-text-muted text-right">
              {description.length}/500
            </span>
          </div>

          {/* Visual Style */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-text-muted">Estilo Visual</label>
            <PillSelector options={VISUAL_STYLES} selected={visualStyle} onChange={setVisualStyle} />
          </div>

          {/* Detail Level */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-text-muted">Nível de Detalhe</label>
            <PillSelector options={DETAIL_LEVELS} selected={detailLevel} onChange={setDetailLevel} />
          </div>

          {/* Includes */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-text-muted">Incluir</label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["terrain", "Terreno base"],
                  ["objects", "Objetos"],
                  ["lighting", "Iluminação"],
                  ["walls", "Paredes"],
                  ["descriptions", "Descrições"],
                  ["interactiveDetails", "Detalhes interativos"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={includes[key]}
                    onChange={() => toggleInclude(key)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent bg-bg-input"
                  />
                  <span className="text-sm text-text-secondary">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preview area */}
          <div className="h-32 rounded-xl border border-border bg-bg-input flex items-center justify-center">
            <span className="text-xs text-text-muted">
              Preview da geração aparecerá aqui
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-text-muted">
            Custo: 1 crédito de IA (restam 27)
          </span>
          <div className="flex gap-2">
            <button
              onClick={closeAIZone}
              className="px-4 h-9 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-border/50 transition-colors"
            >
              Cancelar
            </button>
            <button className="px-4 h-9 rounded-lg border border-accent/30 text-accent text-sm font-medium hover:bg-accent/10 transition-colors">
              Preview
            </button>
            <button className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors">
              <Sparkles size={14} />
              Gerar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
