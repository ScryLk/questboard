import { useState } from "react";
import { useMapEditorStore } from "../../lib/map-editor-store.js";
import type { BiomeType } from "@questboard/shared";

interface NewMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BIOMES: { id: BiomeType; label: string; desc: string }[] = [
  { id: "dungeon", label: "Dungeon", desc: "Masmorras, ruínas, subterrâneos" },
  { id: "forest", label: "Floresta", desc: "Áreas arborizadas, clareiras" },
  { id: "city", label: "Cidade", desc: "Tavernas, castelos, vilas" },
  { id: "cave", label: "Caverna", desc: "Cavernas naturais, minas" },
  { id: "desert", label: "Deserto", desc: "Dunas, oásis, templos de areia" },
  { id: "swamp", label: "Pântano", desc: "Charcos, mangues, áreas húmidas" },
  { id: "mountain", label: "Montanha", desc: "Picos, desfiladeiros, passagens" },
  { id: "coast", label: "Costa", desc: "Praias, portos, cavernas litorâneas" },
  { id: "underground", label: "Subterrâneo", desc: "Underdark, esgotos, catacumbas" },
  { id: "ice", label: "Gelo", desc: "Tundra, geleiras, templos gelados" },
];

const PRESETS = [
  { label: "Pequeno", w: 20, h: 15 },
  { label: "Médio", w: 30, h: 20 },
  { label: "Padrão", w: 40, h: 30 },
  { label: "Grande", w: 50, h: 40 },
  { label: "Épico", w: 80, h: 60 },
];

export function NewMapModal({ isOpen, onClose }: NewMapModalProps) {
  const { initMap } = useMapEditorStore();
  const [name, setName] = useState("Novo Mapa");
  const [width, setWidth] = useState(40);
  const [height, setHeight] = useState(30);
  const [biome, setBiome] = useState<BiomeType>("dungeon");

  if (!isOpen) return null;

  const handleCreate = () => {
    initMap(width, height, name, biome);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#16161C] shadow-2xl">
        <div className="border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Novo Mapa</h2>
          <p className="text-xs text-gray-500">Configure as dimensões e bioma do seu mapa</p>
        </div>

        <div className="space-y-4 px-6 py-4">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Nome do Mapa</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-[#0F0F12] px-4 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-brand-accent"
            />
          </div>

          {/* Size presets */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Tamanho</label>
            <div className="flex gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setWidth(p.w); setHeight(p.h); }}
                  className={`flex-1 rounded-lg px-2 py-2 text-center text-xs font-medium transition-colors ${
                    width === p.w && height === p.h
                      ? "bg-brand-accent text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <div>{p.label}</div>
                  <div className="text-[10px] opacity-60">{p.w}×{p.h}</div>
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-[10px] text-gray-500">Largura</label>
                <input
                  type="number"
                  value={width}
                  min={5}
                  max={100}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full rounded bg-[#0F0F12] px-3 py-1.5 text-sm text-white outline-none ring-1 ring-white/10"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-[10px] text-gray-500">Altura</label>
                <input
                  type="number"
                  value={height}
                  min={5}
                  max={100}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full rounded bg-[#0F0F12] px-3 py-1.5 text-sm text-white outline-none ring-1 ring-white/10"
                />
              </div>
            </div>
          </div>

          {/* Biome */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Bioma</label>
            <div className="grid grid-cols-2 gap-1.5">
              {BIOMES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBiome(b.id)}
                  className={`rounded-lg px-3 py-2 text-left transition-colors ${
                    biome === b.id
                      ? "bg-brand-accent/20 ring-1 ring-brand-accent"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="text-xs font-medium text-white">{b.label}</div>
                  <div className="text-[10px] text-gray-500">{b.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            className="rounded-lg bg-brand-accent px-5 py-2 text-sm font-medium text-white hover:bg-brand-accent/80"
          >
            Criar Mapa
          </button>
        </div>
      </div>
    </div>
  );
}
