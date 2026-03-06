"use client";

import { useCallback, useRef, useState } from "react";
import { FileJson, Upload } from "lucide-react";
import { ModalShell } from "@/components/gameplay/modals/modal-shell";
import { useMapLibraryStore } from "@/lib/map-library-store";
import { parseMapJSON } from "@/lib/map-export";
import type { QuestBoardMap } from "@/lib/map-types";

interface ImportMapModalProps {
  onClose: () => void;
  onImported?: (id: string) => void;
}

export function ImportMapModal({ onClose, onImported }: ImportMapModalProps) {
  const importMap = useMapLibraryStore((s) => s.importMap);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<QuestBoardMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawJson, setRawJson] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    setPreview(null);

    const reader = new FileReader();
    reader.onload = () => {
      const json = reader.result as string;
      const result = parseMapJSON(json);
      if ("error" in result) {
        setError(result.error);
      } else {
        setPreview(result);
        setRawJson(json);
      }
    };
    reader.readAsText(file);
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

  const handleImport = () => {
    if (!rawJson) return;
    const id = importMap(rawJson);
    if (id) {
      onImported?.(id);
      onClose();
    } else {
      setError("Erro ao importar o mapa.");
    }
  };

  return (
    <ModalShell title="Importar Mapa" maxWidth={440} onClose={onClose}>
      {!preview ? (
        <>
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-10 transition-colors ${
              dragging
                ? "border-brand-accent bg-brand-accent/5"
                : "border-brand-border hover:border-brand-accent/40"
            }`}
          >
            <Upload className="mb-3 h-8 w-8 text-brand-muted" />
            <p className="text-xs text-brand-text">
              Arraste um arquivo .json aqui
            </p>
            <p className="mt-1 text-[10px] text-brand-muted">
              ou clique para selecionar
            </p>
            <p className="mt-3 text-[10px] text-brand-muted/60">
              Formatos aceitos: .questmap.json, .json
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.questmap.json,application/json"
            className="hidden"
            onChange={handleFileSelect}
          />

          {error && (
            <p className="mt-3 text-xs text-brand-danger">{error}</p>
          )}
        </>
      ) : (
        <>
          {/* Preview */}
          <div className="rounded-lg border border-brand-border bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-accent/10">
                <FileJson className="h-5 w-5 text-brand-accent" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-brand-text">
                  {preview.name}
                </h3>
                <p className="text-[10px] text-brand-muted">
                  {preview.width}x{preview.height} &middot;{" "}
                  {preview.stats.terrainCount} terrenos &middot;{" "}
                  {preview.stats.wallCount} paredes &middot;{" "}
                  {preview.stats.objectCount} objetos
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => { setPreview(null); setRawJson(null); setError(null); }}
              className="rounded-lg px-4 py-2 text-xs text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            >
              Trocar arquivo
            </button>
            <button
              onClick={handleImport}
              className="rounded-lg bg-brand-accent px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-accent/80"
            >
              Importar
            </button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
