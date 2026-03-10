"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useStoryStore } from "@/stores/storyStore";
import type { EventType } from "@/types/story";
import { EVENT_TYPE_LABELS } from "@/types/story";

const TYPE_OPTIONS: EventType[] = [
  "encounter",
  "revelation",
  "milestone",
  "exploration",
  "social",
  "rest",
  "custom",
];

interface NewEventModalProps {
  arcId: string;
  onClose: () => void;
}

export function NewEventModal({ arcId, onClose }: NewEventModalProps) {
  const addEvent = useStoryStore((s) => s.addEvent);
  const arcs = useStoryStore((s) => s.arcs);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("milestone");
  const [description, setDescription] = useState("");
  const [sessionNumber, setSessionNumber] = useState<string>("");

  const arc = arcs.find((a) => a.id === arcId);

  function handleSubmit() {
    if (!title.trim()) return;
    addEvent(arcId, {
      title: title.trim(),
      type,
      description: description.trim() || undefined,
      sessionNumber: sessionNumber ? Number(sessionNumber) : undefined,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-xl border border-brand-border bg-[#111116] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-brand-text">Novo Evento</h2>
            {arc && (
              <p className="mt-0.5 text-[11px] text-brand-muted">
                Arco: {arc.title}
              </p>
            )}
          </div>
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
              placeholder="Ex: Encontro com o Dragão"
              className="w-full rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-muted/50 focus:border-brand-accent/40"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-brand-muted">
              Tipo
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className="w-full rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent/40"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {EVENT_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-brand-muted">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Descrição opcional..."
              className="w-full resize-none rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-muted/50 focus:border-brand-accent/40"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-brand-muted">
              Sessão prevista
            </label>
            <input
              type="number"
              value={sessionNumber}
              onChange={(e) => setSessionNumber(e.target.value)}
              placeholder="Ex: 8"
              className="w-full rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-muted/50 focus:border-brand-accent/40"
            />
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
            Criar Evento
          </button>
        </div>
      </div>
    </div>
  );
}
