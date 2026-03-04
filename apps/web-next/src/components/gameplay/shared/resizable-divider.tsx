"use client";

import { useCallback, useRef } from "react";

interface ResizableDividerProps {
  side: "left" | "right";
  onResize: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
}

export function ResizableDivider({
  side,
  onResize,
  minWidth = 200,
  maxWidth = 480,
}: ResizableDividerProps) {
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      startX.current = e.clientX;

      // Get the panel element's current width
      const panelEl =
        side === "left"
          ? (e.currentTarget as HTMLElement).previousElementSibling
          : (e.currentTarget as HTMLElement).nextElementSibling;

      startWidth.current = panelEl
        ? (panelEl as HTMLElement).getBoundingClientRect().width
        : 280;

      function onMouseMove(ev: MouseEvent) {
        const delta = ev.clientX - startX.current;
        const newWidth =
          side === "left"
            ? startWidth.current + delta
            : startWidth.current - delta;
        onResize(Math.max(minWidth, Math.min(maxWidth, newWidth)));
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [side, onResize, minWidth, maxWidth],
  );

  return (
    <div
      onMouseDown={handleMouseDown}
      className="group relative flex h-full cursor-col-resize items-center justify-center"
      style={{ width: 4, flexShrink: 0 }}
    >
      <div className="h-full w-px bg-brand-border transition-colors group-hover:bg-brand-accent" />
    </div>
  );
}
