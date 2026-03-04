"use client";

import { useGameplayStore } from "@/lib/gameplay-store";
import { MAP_OBJECT_CATALOG } from "@/lib/gameplay-mock-data";

interface ObjectOverlayProps {
  scaledCell: number;
}

const objectIconMap = new Map(
  MAP_OBJECT_CATALOG.map((o) => [o.type, o.icon]),
);

export function ObjectOverlay({ scaledCell }: ObjectOverlayProps) {
  const mapObjects = useGameplayStore((s) => s.mapObjects);

  if (mapObjects.length === 0) return null;

  return (
    <>
      {mapObjects.map((obj) => {
        const icon = objectIconMap.get(obj.type) ?? "?";
        const fontSize = Math.max(10, scaledCell * 0.5);

        return (
          <div
            key={obj.id}
            className="pointer-events-none absolute flex items-center justify-center"
            style={{
              left: obj.x * scaledCell,
              top: obj.y * scaledCell,
              width: scaledCell,
              height: scaledCell,
              transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
              zIndex: 4,
            }}
          >
            <span
              className="select-none drop-shadow-md"
              style={{ fontSize, lineHeight: 1 }}
            >
              {icon}
            </span>
          </div>
        );
      })}
    </>
  );
}
