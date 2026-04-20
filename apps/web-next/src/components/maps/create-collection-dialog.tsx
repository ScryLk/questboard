"use client";

import { useState } from "react";
import { FolderPlus, X } from "lucide-react";
import { useMapCollectionsStore } from "@/lib/map-collections-store";

interface Props {
  onClose: () => void;
  onCreated?: (id: string) => void;
}

export function CreateCollectionDialog({ onClose, onCreated }: Props) {
  const createCollection = useMapCollectionsStore((s) => s.createCollection);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    const result = createCollection({
      name,
      description: description || undefined,
    });
    if ("error" in result) {
      setError(result.error);
      return;
    }
    onCreated?.(result.id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-brand-border bg-[#111116] shadow-2xl">
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
          <div className="flex items-center gap-2">
            <FolderPlus className="h-4 w-4 text-brand-accent" />
            <h2 className="text-sm font-semibold text-brand-text">Nova Coleção</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div>
            <label className="mb-1.5 block text-xs text-brand-muted">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value.slice(0, 60));
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) handleSubmit();
              }}
              placeholder="Ex: Castelo Ravenloft"
              maxLength={60}
              autoFocus
              className="w-full rounded-md border border-brand-border bg-[#0A0A0F] px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted/50 outline-none focus:border-brand-accent"
            />
            <div className="mt-1 text-right text-[10px] text-brand-muted">
              {name.length}/60
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-brand-muted">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              placeholder="Ex: Dungeon de 3 andares + torre."
              rows={3}
              maxLength={500}
              className="w-full resize-none rounded-md border border-brand-border bg-[#0A0A0F] px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted/50 outline-none focus:border-brand-accent"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-brand-border px-4 py-3">
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-xs text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-1.5 rounded-md bg-brand-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-accent/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FolderPlus className="h-3 w-3" />
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}
