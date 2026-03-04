"use client";

import type { SelectionBox } from "@/lib/gameplay-store";

interface SelectionBoxOverlayProps {
  box: SelectionBox;
}

export function SelectionBoxOverlay({ box }: SelectionBoxOverlayProps) {
  const left = Math.min(box.startX, box.endX);
  const top = Math.min(box.startY, box.endY);
  const width = Math.abs(box.endX - box.startX);
  const height = Math.abs(box.endY - box.startY);

  if (width < 4 && height < 4) return null;

  return (
    <div
      className="pointer-events-none absolute border-2 border-dashed border-brand-accent/60 bg-brand-accent/8"
      style={{ left, top, width, height }}
    />
  );
}
