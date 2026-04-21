"use client";

import { HelpCircle } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { MAP_OBJECT_CATALOG } from "@/lib/gameplay-mock-data";
import { ObjectSpriteIcon } from "@/components/gameplay/object-sprite-icon";
import { hasObjectSprite } from "@questboard/constants";

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
        const fallback = objectIconMap.get(obj.type) ?? HelpCircle;
        // Sprites ocupam a célula inteira (scaledCell). Lucide fica menor (50%)
        // pra não parecer vetor gigante e manter o look existente.
        const renderSize = hasObjectSprite(obj.type)
          ? scaledCell
          : Math.max(10, scaledCell * 0.5);

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
