"use client";

import { useCallback, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useStoryStore } from "@/stores/storyStore";
import type { StoryEvent } from "@/types/story";
import { ArcColumn } from "./arc-column";
import { EventCard } from "./event-card";

interface RoadmapViewProps {
  onAddEvent: (arcId: string) => void;
}

export function RoadmapView({ onAddEvent }: RoadmapViewProps) {
  const arcs = useStoryStore((s) => s.arcs);
  const moveEvent = useStoryStore((s) => s.moveEvent);

  const [activeEvent, setActiveEvent] = useState<StoryEvent | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const sorted = [...arcs].sort((a, b) => a.order - b.order);

  const findEvent = useCallback(
    (id: string): StoryEvent | undefined =>
      arcs.flatMap((a) => a.events).find((e) => e.id === id),
    [arcs],
  );

  function handleDragStart(event: DragStartEvent) {
    const e = findEvent(event.active.id as string);
    if (e) setActiveEvent(e);
  }

  function handleDragOver(event: DragOverEvent) {
    // Handled in drag end
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveEvent(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Determine target arc and index
    let toArcId: string | null = null;
    let toIndex = 0;

    // Dropped on an arc drop zone
    if (overId.startsWith("arc-drop-")) {
      toArcId = overId.replace("arc-drop-", "");
      const arc = arcs.find((a) => a.id === toArcId);
      toIndex = arc ? arc.events.length : 0;
    } else {
      // Dropped on another event
      const overEvent = findEvent(overId);
      if (overEvent) {
        toArcId = overEvent.arcId;
        const arc = arcs.find((a) => a.id === toArcId);
        if (arc) {
          toIndex = arc.events.findIndex((e) => e.id === overId);
          if (toIndex === -1) toIndex = arc.events.length;
        }
      }
    }

    if (!toArcId) return;

    const activeEvent = findEvent(activeId);
    if (!activeEvent) return;

    // Same arc reorder
    if (activeEvent.arcId === toArcId) {
      const arc = arcs.find((a) => a.id === toArcId);
      if (!arc) return;
      const oldIndex = arc.events.findIndex((e) => e.id === activeId);
      const newIndex = arc.events.findIndex((e) => e.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        // Use store's moveEvent for simplicity
        moveEvent(activeId, toArcId, newIndex);
      }
    } else {
      // Cross-arc move
      moveEvent(activeId, toArcId, toIndex);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {sorted.map((arc) => (
          <ArcColumn key={arc.id} arc={arc} onAddEvent={onAddEvent} />
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
