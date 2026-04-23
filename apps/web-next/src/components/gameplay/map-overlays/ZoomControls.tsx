"use client";

import { useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { useCameraStore, isZoomAnimating } from "@/lib/camera-store";

/**
 * Controles de zoom flutuantes — canto inferior direito do canvas.
 * Mostra nível atual em % e atalhos `+` / `-` / `0` funcionam mesmo sem
 * o botão focado, desde que não haja foco em input/textarea.
 */
export function ZoomControls() {
  const zoom = useCameraStore((s) => s.zoom);
  const zoomIn = useCameraStore((s) => s.zoomIn);
  const zoomOut = useCameraStore((s) => s.zoomOut);
  const reset = useCameraStore((s) => s.reset);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t.isContentEditable
      )
        return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "+" || e.key === "=") {
        if (isZoomAnimating()) return;
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-" || e.key === "_") {
        if (isZoomAnimating()) return;
        e.preventDefault();
        zoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        reset();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomIn, zoomOut, reset]);

  const percent = Math.round(zoom * 100);

  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 z-40 flex flex-col overflow-hidden rounded-lg border border-brand-border bg-[#0D0D12]/90 shadow-xl backdrop-blur-md">
      <button
        type="button"
        onClick={() => zoomIn()}
        title="Aumentar zoom (+)"
        aria-label="Aumentar zoom"
        className="flex h-8 w-10 cursor-pointer items-center justify-center text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={reset}
        title="Resetar zoom (0)"
        className="flex h-7 w-10 cursor-pointer items-center justify-center border-y border-brand-border text-[10px] font-mono tabular-nums text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
      >
        {percent}%
      </button>
      <button
        type="button"
        onClick={() => zoomOut()}
        title="Diminuir zoom (−)"
        aria-label="Diminuir zoom"
        className="flex h-8 w-10 cursor-pointer items-center justify-center text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
