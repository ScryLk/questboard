"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  RADIAL_MENU,
  type RadialActionId,
} from "@questboard/constants";
import { computeRadialArc } from "@/lib/radial";
import { useRadialMenuStore } from "@/lib/radial-menu-store";
import { RadialButton } from "./RadialButton";
import { RadialCenter } from "./RadialCenter";

/**
 * Radial central — mount uma vez por layout (GM e Player cada um tem o
 * seu). Lê posição + alvo + ações do `useRadialMenuStore`. Fecha no
 * Esc, clique fora, clique no centro. Animação CSS (fade + scale).
 */
export function RadialMenu({
  onSelect,
}: {
  onSelect?: (id: RadialActionId) => void;
}) {
  const open = useRadialMenuStore((s) => s.open);
  const target = useRadialMenuStore((s) => s.target);
  const screenX = useRadialMenuStore((s) => s.screenX);
  const screenY = useRadialMenuStore((s) => s.screenY);
  const actions = useRadialMenuStore((s) => s.actions);
  const close = useRadialMenuStore((s) => s.close);

  const [viewport, setViewport] = useState({
    w: typeof window === "undefined" ? 1920 : window.innerWidth,
    h: typeof window === "undefined" ? 1080 : window.innerHeight,
  });

  useEffect(() => {
    function onResize() {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Esc fecha
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Posições dos botões
  const position = useMemo(() => {
    return computeRadialArc(
      {
        tokenScreenX: screenX,
        tokenScreenY: screenY,
        viewportWidth: viewport.w,
        viewportHeight: viewport.h,
        radiusPx: RADIAL_MENU.radiusPx,
        buttonSizePx: RADIAL_MENU.buttonSizePx,
        safePaddingPx: RADIAL_MENU.safePaddingPx,
      },
      actions.length,
    );
  }, [screenX, screenY, viewport, actions.length]);

  // Navegação por teclado — índice focado, ignora desabilitados
  const [focusIdx, setFocusIdx] = useState(0);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    // Foca o primeiro habilitado
    const firstEnabled = actions.findIndex((a) => a.enabled);
    if (firstEnabled >= 0) {
      setFocusIdx(firstEnabled);
      requestAnimationFrame(() => {
        btnRefs.current[firstEnabled]?.focus();
      });
    }
  }, [open, actions]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      let idx = focusIdx;
      for (let i = 0; i < actions.length; i++) {
        idx = (idx + dir + actions.length) % actions.length;
        if (actions[idx].enabled) break;
      }
      setFocusIdx(idx);
      btnRefs.current[idx]?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, focusIdx, actions]);

  if (!open || !target) return null;
  if (typeof document === "undefined") return null;

  const handleSelect = (id: RadialActionId) => {
    onSelect?.(id);
    close();
  };

  const overlay = (
    <div
      role="menu"
      aria-label={`Ações em ${target.namePt}`}
      className="fixed inset-0 z-[100] bg-[#04090f]/45 backdrop-blur-[1px]"
      onClick={(e) => {
        // Click no próprio overlay (fora do radial) fecha
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="absolute"
        style={{
          left: screenX,
          top: screenY,
          width: 0,
          height: 0,
        }}
      >
        <RadialCenter target={target} onClose={close} />
        <div
          className="qb-radial-ring"
          style={{ width: 0, height: 0 }}
        >
          {actions.map((action, i) => {
            const angle = position.angles[i];
            if (angle === undefined) return null;
            const ox = Math.cos(angle) * RADIAL_MENU.radiusPx;
            const oy = Math.sin(angle) * RADIAL_MENU.radiusPx;
            return (
              <RadialButton
                key={action.id}
                ref={(el) => {
                  btnRefs.current[i] = el;
                }}
                action={action}
                offsetX={ox}
                offsetY={oy}
                focused={focusIdx === i}
                onFocusRequest={() => setFocusIdx(i)}
                onActivate={() => handleSelect(action.id)}
              />
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes qb-radial-spin-in {
          from {
            transform: scale(0.5) rotate(-180deg);
            opacity: 0;
          }
          to {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .qb-radial-ring {
          animation: qb-radial-spin-in 320ms cubic-bezier(0.22, 1, 0.36, 1);
          transform-origin: center;
        }
      `}</style>
    </div>
  );

  return createPortal(overlay, document.body);
}
