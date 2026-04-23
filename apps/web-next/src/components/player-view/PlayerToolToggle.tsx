"use client";

import { useEffect, useState } from "react";
import { Hand, MousePointer2 } from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";

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
 * Toggle de ferramenta do canvas do player:
 *   - Mão (pan): arrastar move o mapa, wheel zooma sem modifier
 *   - Ponteiro (action): clique stageia movimento, hover em tokens
 *
 * Posicionado no canto inferior direito, acima do ZoomControls. Quando
 * o painel direito está aberto no desktop, offset pra não sobrepor.
 */
export function PlayerToolToggle() {
  const tool = usePlayerViewStore((s) => s.canvasTool);
  const setTool = usePlayerViewStore((s) => s.setCanvasTool);
  const panelVisible = usePlayerViewStore((s) => s.panelVisible);
  const isDesktop = useIsDesktop();

  const rightPx =
    isDesktop && panelVisible ? PANEL_WIDTH_PX + GAP_PX : 16;

  return (
    <div
      className="pointer-events-auto fixed bottom-40 z-40 flex flex-col overflow-hidden rounded-lg border border-brand-border bg-[#0D0D12]/90 shadow-xl backdrop-blur-md md:bottom-[110px]"
      style={{ right: rightPx }}
    >
      <button
        type="button"
        onClick={() => setTool("pan")}
        title="Modo mão — arrastar pra mover o mapa"
        aria-label="Ferramenta mão"
        aria-pressed={tool === "pan"}
        className={`flex h-8 w-10 cursor-pointer items-center justify-center transition-colors ${
          tool === "pan"
            ? "bg-brand-accent/20 text-brand-accent"
            : "text-brand-muted hover:bg-white/[0.06] hover:text-brand-text"
        }`}
      >
        <Hand className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setTool("action")}
        title="Modo ponteiro — clique pra agir"
        aria-label="Ferramenta ponteiro"
        aria-pressed={tool === "action"}
        className={`flex h-8 w-10 cursor-pointer items-center justify-center border-t border-brand-border transition-colors ${
          tool === "action"
            ? "bg-brand-accent/20 text-brand-accent"
            : "text-brand-muted hover:bg-white/[0.06] hover:text-brand-text"
        }`}
      >
        <MousePointer2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
