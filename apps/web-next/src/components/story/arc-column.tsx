"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Plus,
  Pencil,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { StoryArc } from "@/types/story";
import { calcArcProgress } from "@/types/story";
import { useStoryStore } from "@/stores/storyStore";
import { EventCard } from "./event-card";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { StoryEvent } from "@/types/story";

interface ArcColumnProps {
  arc: StoryArc;
  onAddEvent: (arcId: string) => void;
}

function SortableEventCard({
  event,
  isSelected,
  onClick,
  arcColor,
}: {
  event: StoryEvent;
  isSelected: boolean;
  onClick: () => void;
  arcColor: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <EventCard
        event={event}
        isSelected={isSelected}
        onClick={onClick}
        arcColor={arcColor}
      />
    </div>
  );
}

export function ArcColumn({ arc, onAddEvent }: ArcColumnProps) {
  const selectEvent = useStoryStore((s) => s.selectEvent);
  const selectedEventId = useStoryStore((s) => s.selectedEventId);
  const deleteArc = useStoryStore((s) => s.deleteArc);
  const updateArc = useStoryStore((s) => s.updateArc);
  const reorderArcs = useStoryStore((s) => s.reorderArcs);
  const arcs = useStoryStore((s) => s.arcs);

  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(arc.title);

  const progress = calcArcProgress(arc);
  const completed = arc.events.filter((e) => e.status === "completed").length;
  const sorted = [...arc.events].sort((a, b) => a.order - b.order);
  const eventIds = sorted.map((e) => e.id);

  const { setNodeRef, isOver } = useDroppable({ id: `arc-drop-${arc.id}` });

  const arcIndex = arcs.findIndex((a) => a.id === arc.id);

  function commitRename() {
    if (renameValue.trim()) {
      updateArc(arc.id, { title: renameValue.trim() });
    }
    setRenaming(false);
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex w-[260px] shrink-0 flex-col rounded-xl border border-brand-border/60 bg-[#0E0E14] transition-colors ${
        isOver ? "border-brand-accent/40 bg-brand-accent/[0.02]" : ""
      }`}
    >
      {/* Header */}
      <div className="border-b border-brand-border/40 px-3.5 py-3">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: arc.color }}
          />
          {renaming ? (
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") setRenaming(false);
              }}
              className="flex-1 rounded border border-brand-accent/40 bg-brand-primary px-1.5 py-0.5 text-sm font-semibold text-brand-text outline-none"
            />
          ) : (
            <span className="flex-1 truncate text-sm font-semibold text-brand-text">
              {arc.title}
            </span>
          )}
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
              arc.status === "completed"
                ? "bg-emerald-500/15 text-emerald-400"
                : arc.status === "in_progress"
                  ? "bg-brand-accent/15 text-brand-accent"
                  : "bg-white/5 text-brand-muted"
            }`}
          >
            {arc.status === "completed"
              ? "✓"
              : arc.status === "in_progress"
                ? "◐"
                : "○"}
          </span>

          {/* Context menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-brand-border bg-[#1C1C28] py-1 shadow-xl">
                  <button
                    onClick={() => { setRenaming(true); setRenameValue(arc.title); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-brand-text transition-colors hover:bg-white/5"
                  >
                    <Pencil className="h-3 w-3" /> Renomear
                  </button>
                  {arcIndex > 0 && (
                    <button
                      onClick={() => { reorderArcs(arcIndex, arcIndex - 1); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-brand-text transition-colors hover:bg-white/5"
                    >
                      <ChevronUp className="h-3 w-3" /> Mover para cima
                    </button>
                  )}
                  {arcIndex < arcs.length - 1 && (
                    <button
                      onClick={() => { reorderArcs(arcIndex, arcIndex + 1); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-brand-text transition-colors hover:bg-white/5"
                    >
                      <ChevronDown className="h-3 w-3" /> Mover para baixo
                    </button>
                  )}
                  <div className="my-1 h-px bg-brand-border/50" />
                  <button
                    onClick={() => { deleteArc(arc.id); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3 w-3" /> Excluir arco
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats + progress */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] text-brand-muted">
            {arc.events.length} eventos · {completed} completos
          </span>
          <span className="ml-auto text-[11px] tabular-nums text-brand-muted">
            {progress}%
          </span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              backgroundColor: arc.color,
            }}
          />
        </div>
      </div>

      {/* Events */}
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        <SortableContext items={eventIds} strategy={verticalListSortingStrategy}>
          {sorted.map((event) => (
            <SortableEventCard
              key={event.id}
              event={event}
              isSelected={selectedEventId === event.id}
              onClick={() => selectEvent(event.id)}
              arcColor={arc.color}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add event button */}
      <div className="border-t border-brand-border/30 p-2">
        <button
          onClick={() => onAddEvent(arc.id)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-brand-border/50 py-1.5 text-[11px] text-brand-muted transition-colors hover:border-brand-accent/30 hover:bg-white/[0.02] hover:text-brand-text"
        >
          <Plus className="h-3 w-3" />
          Adicionar evento
        </button>
      </div>
    </div>
  );
}
