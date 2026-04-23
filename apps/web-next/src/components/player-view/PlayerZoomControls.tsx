"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";

// Largura do PlayerPanel no desktop (md+). Quando o painel tá aberto,
// offset o zoom/tools pra não sobrepor.
const PANEL_WIDTH_PX = 280;
const GAP_PX = 8;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

/**
 * Variante dos ZoomControls pro player canvas. Usa `playerZoom` do
 * playerViewStore (separado do camera-store do GM).
 */
export function PlayerZoomControls() {
  const zoom = usePlayerViewStore((s) => s.playerZoom);
  const zoomIn = usePlayerViewStore((s) => s.playerZoomIn);
  const zoomOut = usePlayerViewStore((s) => s.playerZoomOut);
  const reset = usePlayerViewStore((s) => s.resetPlayerZoom);
  const panelVisible = usePlayerViewStore((s) => s.panelVisible);
  const isDesktop = useIsDesktop();

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
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-" || e.key === "_") {
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

  // Desktop com painel aberto: encosta à esquerda do painel. Mobile ou
  // painel fechado: encosta na borda direita.
  const rightPx =
    isDesktop && panelVisible ? PANEL_WIDTH_PX + GAP_PX : 16;

  return (
    <div
      className="pointer-events-auto fixed bottom-20 z-40 flex flex-col overflow-hidden rounded-lg border border-brand-border bg-[#0D0D12]/90 shadow-xl backdrop-blur-md md:bottom-4"
      style={{ right: rightPx }}
    >
      <button
        type="button"
        onClick={zoomIn}
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
        onClick={zoomOut}
        title="Diminuir zoom (−)"
        aria-label="Diminuir zoom"
        className="flex h-8 w-10 cursor-pointer items-center justify-center text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
