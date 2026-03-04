"use client";

import { useState } from "react";
import { Image, Upload } from "lucide-react";
import { ModalShell } from "./modal-shell";

interface CreateSceneModalProps {
  onClose: () => void;
}

const PRESET_MAPS = [
  { id: "tavern", name: "Taverna", size: "20x15" },
  { id: "dungeon", name: "Masmorra", size: "30x30" },
  { id: "forest", name: "Floresta", size: "25x25" },
  { id: "castle", name: "Castelo", size: "40x30" },
];

export function CreateSceneModal({ onClose }: CreateSceneModalProps) {
  const [name, setName] = useState("");
  const [cols, setCols] = useState("25");
  const [rows, setRows] = useState("25");
  const [cellSize, setCellSize] = useState("40");

  return (
    <ModalShell title="Nova Cena" maxWidth={480} onClose={onClose}>
      {/* Scene name */}
      <div className="mb-4">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Nome da cena
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Sala do Trono"
          className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text placeholder:text-brand-muted/60 focus:border-brand-accent focus:outline-none"
        />
      </div>

      {/* Grid dimensions */}
      <div className="mb-4">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Dimensoes do Grid
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="number"
              value={cols}
              onChange={(e) => setCols(e.target.value)}
              className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text focus:border-brand-accent focus:outline-none"
            />
            <span className="mt-0.5 block text-[10px] text-brand-muted">
              Colunas
            </span>
          </div>
          <span className="flex items-center pt-0 text-brand-muted">x</span>
          <div className="flex-1">
            <input
              type="number"
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text focus:border-brand-accent focus:outline-none"
            />
            <span className="mt-0.5 block text-[10px] text-brand-muted">
              Linhas
            </span>
          </div>
          <div className="flex-1">
            <input
              type="number"
              value={cellSize}
              onChange={(e) => setCellSize(e.target.value)}
              className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text focus:border-brand-accent focus:outline-none"
            />
            <span className="mt-0.5 block text-[10px] text-brand-muted">
              Celula (px)
            </span>
          </div>
        </div>
      </div>

      {/* Background image upload */}
      <div className="mb-4">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Imagem de Fundo (opcional)
        </label>
        <div className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-brand-border bg-brand-primary transition-colors hover:border-brand-accent/50">
          <div className="flex flex-col items-center gap-1 text-brand-muted">
            <Upload className="h-5 w-5" />
            <span className="text-xs">Arraste ou clique para enviar</span>
          </div>
        </div>
      </div>

      {/* Preset maps */}
      <div className="mb-5">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Mapas prontos
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_MAPS.map((map) => (
            <button
              key={map.id}
              onClick={() => {
                setName(map.name);
                const [c, r] = map.size.split("x");
                setCols(c);
                setRows(r);
              }}
              className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-primary p-2.5 text-left transition-colors hover:border-brand-accent/50"
            >
              <Image className="h-4 w-4 text-brand-muted" />
              <div>
                <p className="text-xs font-medium text-brand-text">
                  {map.name}
                </p>
                <p className="text-[10px] text-brand-muted">{map.size}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="h-9 rounded-lg border border-brand-border px-4 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
        >
          Cancelar
        </button>
        <button
          onClick={onClose}
          className="h-9 rounded-lg bg-brand-accent px-4 text-xs font-medium text-white transition-colors hover:bg-brand-accent/90"
        >
          Criar Cena
        </button>
      </div>
    </ModalShell>
  );
}
