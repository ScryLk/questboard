"use client";

import { Download, FileJson, Image } from "lucide-react";
import { ModalShell } from "@/components/gameplay/modals/modal-shell";
import { downloadMapJSON, downloadMapPNG } from "@/lib/map-export";
import type { QuestBoardMap } from "@/lib/map-types";

interface ExportMapModalProps {
  map: QuestBoardMap;
  onClose: () => void;
}

export function ExportMapModal({ map, onClose }: ExportMapModalProps) {
  const jsonSize = new Blob([JSON.stringify(map)]).size;
  const sizeLabel =
    jsonSize < 1024
      ? `${jsonSize} B`
      : jsonSize < 1024 * 1024
        ? `${(jsonSize / 1024).toFixed(1)} KB`
        : `${(jsonSize / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <ModalShell title="Exportar Mapa" maxWidth={440} onClose={onClose}>
      <p className="mb-4 text-xs text-brand-muted">
        &ldquo;{map.name}&rdquo; &mdash; {map.width}x{map.height}
      </p>

      <div className="flex flex-col gap-3">
        {/* JSON export */}
        <button
          onClick={() => { downloadMapJSON(map); onClose(); }}
          className="flex items-start gap-3 rounded-lg border border-brand-border p-3 text-left transition-colors hover:border-brand-accent/40 hover:bg-white/[0.02]"
        >
          <FileJson className="mt-0.5 h-5 w-5 shrink-0 text-brand-accent" />
          <div className="flex-1">
            <div className="text-xs font-medium text-brand-text">
              JSON (.questmap.json)
            </div>
            <div className="mt-0.5 text-[10px] text-brand-muted">
              Arquivo editável com todos os dados do mapa. Pode reimportar depois.
            </div>
            <div className="mt-1 text-[10px] text-brand-muted/70">
              ~{sizeLabel}
            </div>
          </div>
          <Download className="mt-0.5 h-4 w-4 shrink-0 text-brand-muted" />
        </button>

        {/* PNG export */}
        <button
          onClick={() => {
            if (map.thumbnail) {
              downloadMapPNG(map.thumbnail, map.name);
              onClose();
            }
          }}
          disabled={!map.thumbnail}
          className="flex items-start gap-3 rounded-lg border border-brand-border p-3 text-left transition-colors hover:border-brand-accent/40 hover:bg-white/[0.02] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Image className="mt-0.5 h-5 w-5 shrink-0 text-brand-accent" />
          <div className="flex-1">
            <div className="text-xs font-medium text-brand-text">
              PNG (miniatura)
            </div>
            <div className="mt-0.5 text-[10px] text-brand-muted">
              Imagem de preview do mapa (200x200px).
              {!map.thumbnail && " Salve o mapa primeiro para gerar a miniatura."}
            </div>
          </div>
          <Download className="mt-0.5 h-4 w-4 shrink-0 text-brand-muted" />
        </button>
      </div>

      <button
        onClick={onClose}
        className="mt-4 w-full rounded-lg py-2 text-xs text-brand-muted transition-colors hover:bg-white/5"
      >
        Fechar
      </button>
    </ModalShell>
  );
}
