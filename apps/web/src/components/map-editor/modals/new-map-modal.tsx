import { useState } from "react";
import { useMapEditorStore } from "../../../stores/map-editor-store.js";
import { BIOME_OPTIONS, DEFAULT_MAP_SETTINGS } from "@questboard/shared/constants";
import type { BiomeType, AmbianceType } from "@questboard/shared";

interface NewMapModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function NewMapModal({ open, onClose, onCreated }: NewMapModalProps) {
  const { initializeMap } = useMapEditorStore();

  const [name, setName] = useState("Novo Mapa");
  const [width, setWidth] = useState(DEFAULT_MAP_SETTINGS.width);
  const [height, setHeight] = useState(DEFAULT_MAP_SETTINGS.height);
  const [biome, setBiome] = useState<BiomeType>(DEFAULT_MAP_SETTINGS.biome);
  const [ambiance, setAmbiance] = useState<AmbianceType>(DEFAULT_MAP_SETTINGS.ambiance);

  if (!open) return null;

  const handleCreate = () => {
    initializeMap({ name, width, height, biome, ambiance });
    onCreated();
  };

  const presets = [
    { label: "Pequeno (20x15)", w: 20, h: 15 },
    { label: "Médio (40x30)", w: 40, h: 30 },
    { label: "Grande (60x40)", w: 60, h: 40 },
    { label: "Enorme (80x60)", w: 80, h: 60 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[480px] rounded-2xl bg-[#16161C] shadow-2xl">
        <div className="border-b border-white/10 px-6 py-4">
          <h2 className="text-sm font-semibold text-white">Criar Novo Mapa</h2>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Name */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Nome do Mapa
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
              placeholder="Ex: Taverna do Dragão Cego"
            />
          </div>

          {/* Size presets */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Tamanho
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setWidth(p.w); setHeight(p.h); }}
                  className={`rounded-lg px-3 py-2 text-xs transition ${
                    width === p.w && height === p.h
                      ? "bg-brand-accent text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-[10px] text-gray-500">Largura</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Math.max(5, Math.min(100, parseInt(e.target.value) || 5)))}
                  className="w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-[10px] text-gray-500">Altura</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Math.max(5, Math.min(100, parseInt(e.target.value) || 5)))}
                  className="w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>
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

          {/* Ambiance */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Ambiência
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { key: "dark", label: "Sombrio" },
                  { key: "bright", label: "Claro" },
                  { key: "mystical", label: "Místico" },
                  { key: "horror", label: "Horror" },
                ] as const
              ).map((a) => (
                <button
                  key={a.key}
                  onClick={() => setAmbiance(a.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs transition ${
                    ambiance === a.key
                      ? "bg-brand-accent text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-white/10 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-300 transition hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="rounded-lg bg-brand-accent px-4 py-2 text-xs font-medium text-white transition hover:bg-brand-accent/80 disabled:opacity-40"
          >
            Criar Mapa
          </button>
        </div>
      </div>
    </div>
  );
}
