"use client";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useState, useCallback } from "react";
import { useStoryStore } from "@/stores/storyStore";
import type { StoryEvent, EventStatus } from "@/types/story";
import { EVENT_STATUS_LABELS } from "@/types/story";
import { EventCard } from "./event-card";

const COLUMNS: { status: EventStatus; label: string; color: string }[] = [
  { status: "pending", label: "Planejado", color: "#6B7280" },
  { status: "in_progress", label: "Em Andamento", color: "#8B5CF6" },
  { status: "completed", label: "Concluído", color: "#10B981" },
  { status: "skipped", label: "Pulado", color: "#4B5563" },
];

function StatusColumn({
  status,
  label,
  color,
  events,
}: {
  status: EventStatus;
  label: string;
  color: string;
  events: (StoryEvent & { arcColor: string; arcTitle: string })[];
}) {
  const selectEvent = useStoryStore((s) => s.selectEvent);
  const selectedEventId = useStoryStore((s) => s.selectedEventId);

  const { setNodeRef, isOver } = useDroppable({ id: `kanban-${status}` });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-[260px] shrink-0 flex-col rounded-xl border border-brand-border/60 bg-[#0E0E14] transition-colors ${
        isOver ? "border-brand-accent/40 bg-brand-accent/[0.02]" : ""
      }`}
    >
      <div className="border-b border-brand-border/40 px-3.5 py-3">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold text-brand-text">{label}</span>
          <span className="ml-auto rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] tabular-nums text-brand-muted">
            {events.length}
          </span>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {events.length === 0 ? (
          <p className="py-4 text-center text-[11px] text-brand-muted/50">
            Nenhum evento
          </p>
        ) : (
          events.map((event) => (
            <div key={event.id}>
              <EventCard
                event={event}
                isSelected={selectedEventId === event.id}
                onClick={() => selectEvent(event.id)}
                arcColor={event.arcColor}
              />
              {/* Arc badge */}
              <div className="mt-0.5 flex justify-end px-1">
                <span
                  className="rounded-sm px-1 py-0.5 text-[9px] font-medium"
                  style={{
                    color: event.arcColor,
                    backgroundColor: event.arcColor + "15",
                  }}
                >
                  {event.arcTitle}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function KanbanView() {
  const arcs = useStoryStore((s) => s.arcs);
  const updateEvent = useStoryStore((s) => s.updateEvent);

  const [activeEvent, setActiveEvent] = useState<StoryEvent | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const allEvents = arcs.flatMap((a) =>
    a.events.map((e) => ({ ...e, arcColor: a.color, arcTitle: a.title })),
  );

  const findEvent = useCallback(
    (id: string) => allEvents.find((e) => e.id === id),
    [allEvents],
  );

  function handleDragStart(event: DragStartEvent) {
    const e = findEvent(event.active.id as string);
    if (e) setActiveEvent(e);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveEvent(null);
    const { active, over } = event;
    if (!over) return;

    const overId = over.id as string;
    if (!overId.startsWith("kanban-")) return;

    const newStatus = overId.replace("kanban-", "") as EventStatus;
    const activeId = active.id as string;
    updateEvent(activeId, { status: newStatus });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <StatusColumn
            key={col.status}
            status={col.status}
            label={col.label}
            color={col.color}
            events={allEvents.filter((e) => e.status === col.status)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeEvent ? (
          <div className="w-[240px] opacity-90">
            <EventCard
              event={activeEvent}
              isSelected={false}
              onClick={() => {}}
              arcColor={arcs.find((a) => a.id === activeEvent.arcId)?.color ?? "#6C5CE7"}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
