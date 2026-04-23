"use client";

import { useCallback, useRef } from "react";
import { TOUCH_LONG_PRESS_MS } from "@questboard/constants";

export interface UseRadialGestureOpts {
  /** Tap curto (<N ms, movimento <8px). Abre o radial. */
  onShortTap: (evt: React.PointerEvent<HTMLElement>) => void;
  /** Timer de long-press completou — consumidor inicia o drag atual. */
  onLongPressStart?: (evt: React.PointerEvent<HTMLElement>) => void;
  /** Movimento após long-press — consumidor atualiza posição do drag. */
  onLongPressMove?: (evt: PointerEvent) => void;
  /** Solto depois de long-press. */
  onLongPressEnd?: (evt: PointerEvent) => void;
  longPressMs?: number;
}

const MOVE_THRESHOLD_PX = 8;

/**
 * Separa tap-curto de long-press-drag em PointerEvents. Tap curto abre
 * radial, long-press chama handler de drag existente (se fornecido).
 * Consumidor aplica o `handlers` no elemento do token.
 */
export function useRadialGesture(opts: UseRadialGestureOpts) {
  const {
    onShortTap,
    onLongPressStart,
    onLongPressMove,
    onLongPressEnd,
    longPressMs = TOUCH_LONG_PRESS_MS,
  } = opts;

  const stateRef = useRef<{
    downEvt: React.PointerEvent<HTMLElement> | null;
    startX: number;
    startY: number;
    timer: ReturnType<typeof setTimeout> | null;
    longPressFired: boolean;
    cancelled: boolean;
  }>({
    downEvt: null,
    startX: 0,
    startY: 0,
    timer: null,
    longPressFired: false,
    cancelled: false,
  });

  const cleanup = useCallback(() => {
    const s = stateRef.current;
    if (s.timer) clearTimeout(s.timer);
    s.timer = null;
    s.downEvt = null;
    s.longPressFired = false;
    s.cancelled = false;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return; // só primário (left/touch)
      const s = stateRef.current;
      s.downEvt = e;
      s.startX = e.clientX;
      s.startY = e.clientY;
      s.longPressFired = false;
      s.cancelled = false;

      // Preserva o evento pra long-press handler (React 17+ pool pool)
      const persisted = e;
      s.timer = setTimeout(() => {
        const cur = stateRef.current;
        if (cur.cancelled || !cur.downEvt) return;
        cur.longPressFired = true;
        onLongPressStart?.(persisted);
      }, longPressMs);

      const onMove = (ev: PointerEvent) => {
        const cur = stateRef.current;
        if (!cur.downEvt) return;
        const dx = ev.clientX - cur.startX;
        const dy = ev.clientY - cur.startY;
        if (!cur.longPressFired) {
          // Se moveu além do threshold antes do long-press, cancela tap
          if (Math.hypot(dx, dy) > MOVE_THRESHOLD_PX) {
            cur.cancelled = true;
            if (cur.timer) clearTimeout(cur.timer);
            cur.timer = null;
          }
        } else {
          onLongPressMove?.(ev);
        }
      };

      const onUp = (ev: PointerEvent) => {
        const cur = stateRef.current;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);

        if (!cur.downEvt) {
          cleanup();
          return;
        }

        if (cur.longPressFired) {
          onLongPressEnd?.(ev);
        } else if (!cur.cancelled) {
          // Short tap — dispara se não foi cancelado nem virou long-press
          onShortTap(cur.downEvt);
        }
        cleanup();
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [
      cleanup,
      longPressMs,
      onLongPressEnd,
      onLongPressMove,
      onLongPressStart,
      onShortTap,
    ],
  );

  return { onPointerDown };
}
