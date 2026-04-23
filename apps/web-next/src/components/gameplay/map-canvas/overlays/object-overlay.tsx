"use client";

import { HelpCircle } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useMapSidebarStore } from "@/lib/map-sidebar-store";
import { MAP_OBJECT_CATALOG } from "@/lib/gameplay-mock-data";
import { ObjectSpriteIcon } from "@/components/gameplay/object-sprite-icon";
import { hasObjectSprite } from "@questboard/constants";

interface ObjectOverlayProps {
  scaledCell: number;
  dragPos?: { id: string; x: number; y: number } | null;
  onObjectMouseDown?: (
    e: React.MouseEvent,
    objectId: string,
    objX: number,
    objY: number,
  ) => void;
}

const objectIconMap = new Map(
  MAP_OBJECT_CATALOG.map((o) => [o.type, o.icon]),
);

export function ObjectOverlay({
  scaledCell,
  dragPos,
  onObjectMouseDown,
}: ObjectOverlayProps) {
  const mapObjects = useGameplayStore((s) => s.mapObjects);
  const selectedId = useGameplayStore((s) => s.selectedMapObjectId);
  const layers = useMapSidebarStore((s) => s.layers);
  const decorationsLocked =
    layers.find((l) => l.id === "decorations")?.locked ?? false;

  if (mapObjects.length === 0) return null;

  return (
    <>
      {mapObjects.map((obj) => {
        const fallback = objectIconMap.get(obj.type) ?? HelpCircle;
        const renderSize = hasObjectSprite(obj.type)
          ? scaledCell
          : Math.max(10, scaledCell * 0.5);

        const isSelected = selectedId === obj.id;
        const isDragging = dragPos?.id === obj.id;
        const x = isDragging && dragPos ? dragPos.x : obj.x;
        const y = isDragging && dragPos ? dragPos.y : obj.y;

        return (
          <div
            key={obj.id}
            onMouseDown={(e) =>
              onObjectMouseDown?.(e, obj.id, obj.x, obj.y)
            }
            className={`absolute flex items-center justify-center rounded-md ${
              decorationsLocked || !onObjectMouseDown
                ? "pointer-events-none"
                : "pointer-events-auto cursor-grab active:cursor-grabbing"
            } ${isSelected ? "ring-2 ring-brand-accent" : ""}`}
            style={{
              left: x * scaledCell,
              top: y * scaledCell,
              width: scaledCell,
              height: scaledCell,
              transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
              zIndex: isSelected || isDragging ? 6 : 4,
              opacity: isDragging ? 0.7 : 1,
            }}
          >
            <ObjectSpriteIcon
              type={obj.type}
              fallback={fallback}
              size={renderSize}
              className="select-none drop-shadow-md text-brand-text"
            />
          </div>
        );
      })}
    </>
  );
}
