"use client";

import { useState } from "react";
import { ModalShell } from "@/components/gameplay/modals/modal-shell";
import { useMapLibraryStore } from "@/lib/map-library-store";
import type { MapCategory } from "@/lib/map-types";

interface NewMapModalProps {
  onClose: () => void;
  onCreated: (id: string) => void;
}

const SIZE_PRESETS = [
  { label: "Pequeno", cols: 15, rows: 15 },
  { label: "Médio", cols: 25, rows: 25 },
  { label: "Grande", cols: 40, rows: 30 },
  { label: "Enorme", cols: 60, rows: 60 },
] as const;

const CATEGORIES: { value: MapCategory; label: string }[] = [
  { value: "dungeon", label: "Dungeon" },
  { value: "outdoor", label: "Natureza" },
  { value: "city", label: "Urbano" },
  { value: "cave", label: "Caverna" },
  { value: "custom", label: "Custom" },
];

export function NewMapModal({ onClose, onCreated }: NewMapModalProps) {
  const addMap = useMapLibraryStore((s) => s.addMap);

  const [name, setName] = useState("");
  const [cols, setCols] = useState(25);
  const [rows, setRows] = useState(25);
  const [category, setCategory] = useState<MapCategory>("dungeon");
  const [selectedPreset, setSelectedPreset] = useState<number>(1); // Medium
  const [customSize, setCustomSize] = useState(false);

  const handlePreset = (index: number) => {
    const p = SIZE_PRESETS[index];
    setCols(p.cols);
    setRows(p.rows);
    setSelectedPreset(index);
    setCustomSize(false);
  };

  const handleCreate = () => {
    const mapName = name.trim() || "Novo Mapa";
    const id = addMap({
      version: 1,
      name: mapName,
      description: "",
      tags: [],
      category,
      thumbnail: null,
      width: cols,
      height: rows,
      cellSizeFt: 5,
      terrain: {},
      walls: {},
      objects: [],
      backgroundImage: null,
      backgroundOpacity: 0.5,
      stats: { terrainCount: 0, wallCount: 0, objectCount: 0 },
    });
    onCreated(id);
    onClose();
  };

  return (
    <ModalShell title="Novo Mapa" maxWidth={440} onClose={onClose}>
      {/* Name */}
      <div className="mb-4">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Nome
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Caverna do Goblin"
          className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text placeholder:text-brand-muted/60 focus:border-brand-accent focus:outline-none"
          autoFocus
        />
      </div>

      {/* Size presets */}
      <div className="mb-4">
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Tamanho
        </label>
        <div className="grid grid-cols-4 gap-2">
          {SIZE_PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => handlePreset(i)}
              className={`rounded-lg border px-2 py-2 text-center text-xs transition-colors ${
                !customSize && selectedPreset === i
                  ? "border-brand-accent bg-brand-accent/10 text-white"
                  : "border-brand-border text-brand-muted hover:border-brand-accent/40 hover:text-brand-text"
              }`}
            >
              <div className="font-medium">{p.label}</div>
              <div className="text-[10px] opacity-70">{p.cols}x{p.rows}</div>
            </button>
          ))}
        </div>

        {/* Custom toggle */}
        <button
          onClick={() => setCustomSize(!customSize)}
          className={`mt-2 text-[10px] transition-colors ${
            customSize ? "text-brand-accent" : "text-brand-muted hover:text-brand-text"
          }`}
        >
          {customSize ? "Usar preset" : "Tamanho personalizado"}
        </button>

        {customSize && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              value={cols}
              onChange={(e) => setCols(Math.max(5, Math.min(100, Number(e.target.value) || 5)))}
              className="h-8 w-20 rounded border border-brand-border bg-brand-primary px-2 text-center text-xs text-brand-text focus:border-brand-accent focus:outline-none"
            />
            <span className="text-xs text-brand-muted">x</span>
            <input
              type="number"
              value={rows}
              onChange={(e) => setRows(Math.max(5, Math.min(100, Number(e.target.value) || 5)))}
              className="h-8 w-20 rounded border border-brand-border bg-brand-primary px-2 text-center text-xs text-brand-text focus:border-brand-accent focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Categoria
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                category === c.value
                  ? "border-brand-accent bg-brand-accent/10 text-white"
                  : "border-brand-border text-brand-muted hover:border-brand-accent/40 hover:text-brand-text"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-xs text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
        >
          Cancelar
        </button>
        <button
          onClick={handleCreate}
          className="rounded-lg bg-brand-accent px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-accent/80"
        >
          Criar Mapa
        </button>
      </div>
    </ModalShell>
  );
}
