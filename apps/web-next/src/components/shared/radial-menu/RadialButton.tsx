"use client";

import { forwardRef, useState, useEffect } from "react";
import type { RadialActionId } from "@questboard/constants";
import { RADIAL_COLORS, RADIAL_MENU } from "@questboard/constants";
import { RadialActionIcon } from "./icons";
import type { RadialAction } from "@/lib/radial-menu-store";

interface Props {
  action: RadialAction;
  /** Posição calculada (transform absoluto ao centro do menu). */
  offsetX: number;
  offsetY: number;
  onActivate: () => void;
  focused?: boolean;
  onFocusRequest?: () => void;
}

/**
 * Botão individual do radial. Quando desabilitado, toque mostra tooltip
 * com `disabledReasonPt` por 1.5s e não ativa.
 */
export const RadialButton = forwardRef<HTMLButtonElement, Props>(
  ({ action, offsetX, offsetY, onActivate, focused, onFocusRequest }, ref) => {
    const [showTip, setShowTip] = useState(false);
    const color = RADIAL_COLORS[action.id];

    useEffect(() => {
      if (!showTip) return;
      const id = setTimeout(() => setShowTip(false), 1500);
      return () => clearTimeout(id);
    }, [showTip]);

    const handleClick = () => {
      if (!action.enabled) {
        if (action.disabledReasonPt) setShowTip(true);
        return;
      }
      onActivate();
    };

    const size = RADIAL_MENU.buttonSizePx;

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        aria-label={action.labelPt}
        aria-disabled={!action.enabled}
        onClick={handleClick}
        onFocus={onFocusRequest}
        tabIndex={focused ? 0 : -1}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          transform: `translate(${offsetX}px, ${offsetY}px)`,
          borderColor: action.enabled ? color : "rgba(148, 163, 184, 0.3)",
          color: action.enabled ? color : "rgba(148, 163, 184, 0.4)",
        }}
        className={`flex cursor-pointer items-center justify-center rounded-full border-2 bg-[#0a1220] shadow-lg transition-transform hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-accent/60 ${
          action.enabled ? "" : "cursor-not-allowed"
        } ${focused ? "ring-2 ring-brand-accent/60" : ""}`}
      >
        <RadialActionIcon id={action.id} className="h-4 w-4" />

        {/* Tooltip de motivo (só quando desabilitado + tocou) */}
        {showTip && action.disabledReasonPt && (
          <span
            className="pointer-events-none absolute whitespace-nowrap rounded-md border border-brand-warning/40 bg-brand-warning/15 px-2 py-1 text-[10px] text-brand-warning"
            style={{
              bottom: size + 6,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            {action.disabledReasonPt}
          </span>
        )}
      </button>
    );
  },
);

RadialButton.displayName = "RadialButton";
