"use client";

import { useCallback, useRef, useState } from "react";
import { Image, Map, Upload, X } from "lucide-react";
import { ModalShell } from "./modal-shell";
import { useGameplayStore } from "@/lib/gameplay-store";
import { MOCK_SESSION_MAPS } from "@/lib/gameplay-mock-data";

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
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setMapBackgroundImage = useGameplayStore(
    (s) => s.setMapBackgroundImage,
  );

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBgImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleCreate = () => {
    if (bgImage) {
      setMapBackgroundImage(bgImage);
    }
    onClose();
  };

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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {bgImage ? (
          <div className="relative rounded-lg border border-brand-border bg-brand-primary">
            <img
              src={bgImage}
              alt="Background preview"
              className="h-28 w-full rounded-lg object-cover"
            />
            <button
              onClick={() => setBgImage(null)}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="px-3 py-1.5 text-[10px] text-brand-muted">
              Imagem carregada
            </p>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
              dragging
                ? "border-brand-accent bg-brand-accent/10"
                : "border-brand-border bg-brand-primary hover:border-brand-accent/50"
            }`}
          >
            <div className="flex flex-col items-center gap-1 text-brand-muted">
              <Upload className="h-5 w-5" />
              <span className="text-xs">Arraste ou clique para enviar</span>
            </div>
          </div>
        )}
      </div>

      {/* Session maps */}
      {MOCK_SESSION_MAPS.length > 0 && (
        <div className="mb-4">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
            Mapas da Sessao
          </label>
          <div className="grid max-h-[180px] grid-cols-2 gap-2 overflow-y-auto pr-1">
            {MOCK_SESSION_MAPS.map((map) => {
              const isSelected = selectedMapId === map.id;
              return (
                <button
                  key={map.id}
                  onClick={() => {
                    setName(map.name);
                    setCols(String(map.gridCols));
                    setRows(String(map.gridRows));
                    setSelectedMapId(map.id);
                  }}
                  className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-colors ${
                    isSelected
                      ? "border-brand-accent/60 bg-brand-accent/10"
                      : "border-brand-border bg-brand-primary hover:border-brand-accent/30"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/[0.06]">
                    <Map className="h-4 w-4 text-brand-muted" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-brand-text">
                      {map.name}
                    </p>
                    <p className="text-[10px] text-brand-muted">
                      {map.gridCols}x{map.gridRows} · {map.category}
                    </p>
                  </div>
                  {map.isActive && (
                    <span className="ml-auto shrink-0 rounded-full bg-brand-success/15 px-1.5 py-0.5 text-[9px] font-medium text-brand-success">
                      Ativo
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Preset templates */}
      <div className="mb-5">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Templates
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
                setSelectedMapId(null);
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
          onClick={handleCreate}
          className="h-9 rounded-lg bg-brand-accent px-4 text-xs font-medium text-white transition-colors hover:bg-brand-accent/90"
        >
          Criar Cena
        </button>
      </div>
    </ModalShell>
  );
}
