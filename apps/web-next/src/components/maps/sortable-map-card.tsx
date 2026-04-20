"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Map as MapIcon, Pencil, Trash2, Undo2 } from "lucide-react";
import type { QuestBoardMap } from "@/lib/map-types";

const CATEGORY_LABELS: Record<string, string> = {
  dungeon: "Dungeon",
  outdoor: "Natureza",
  city: "Urbano",
  cave: "Caverna",
  custom: "Custom",
};

interface Props {
  map: QuestBoardMap;
  onEdit: (id: string) => void;
  onRemoveFromCollection: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SortableMapCard({ map, onEdit, onRemoveFromCollection, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: map.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative overflow-hidden rounded-xl border bg-brand-surface transition-all ${
        isDragging ? "border-brand-accent shadow-2xl" : "border-white/10 hover:border-brand-accent/40"
      }`}
    >
      <div
        className="relative aspect-video w-full cursor-pointer bg-brand-primary"
        onClick={() => onEdit(map.id)}
      >
        {map.thumbnail ? (
          <img src={map.thumbnail} alt={map.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <MapIcon className="h-10 w-10 text-brand-muted/30" />
          </div>
        )}

        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="absolute left-2 top-2 flex h-7 w-7 cursor-grab items-center justify-center rounded-md bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 group-hover:opacity-100 active:cursor-grabbing"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(map.id);
            }}
            title="Editar"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-black/50 text-white backdrop-blur-sm hover:bg-brand-accent"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFromCollection(map.id);
            }}
            title="Remover da coleção"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-black/50 text-white backdrop-blur-sm hover:bg-brand-accent"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(map.id);
            }}
            title="Excluir"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-black/50 text-white backdrop-blur-sm hover:bg-brand-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-white">{map.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-brand-muted">
            {map.width}x{map.height}
          </span>
          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-brand-muted">
            {CATEGORY_LABELS[map.category] ?? map.category}
          </span>
        </div>
      </div>
    </div>
  );
}
