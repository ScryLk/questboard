"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useStoryStore } from "@/stores/storyStore";

const COLOR_OPTIONS = [
  "#6C5CE7",
  "#3B82F6",
  "#10B981",
  "#EF4444",
  "#F59E0B",
  "#EC4899",
];

interface NewArcModalProps {
  onClose: () => void;
}

export function NewArcModal({ onClose }: NewArcModalProps) {
  const addArc = useStoryStore((s) => s.addArc);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  function handleSubmit() {
    if (!title.trim()) return;
    addArc(title.trim(), color, description.trim() || undefined);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-y-auto rounded-xl border border-brand-border bg-[#111116] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-4">
          <h2 className="text-sm font-semibold text-brand-text">Novo Arco</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-brand-muted">
              Título *
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Ex: Aliados e Artefatos"
              className="w-full rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-muted/50 focus:border-brand-accent/40"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-brand-muted">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Descrição opcional do arco..."
              className="w-full resize-none rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-muted/50 focus:border-brand-accent/40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-brand-muted">
              Cor
            </label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform ${
                    color === c ? "scale-110 ring-2 ring-white/30" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-brand-border px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-brand-muted transition-colors hover:text-brand-text"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-accent/80 disabled:opacity-40"
          >
            Criar Arco
          </button>
        </div>
      </div>
    </div>
  );
}
