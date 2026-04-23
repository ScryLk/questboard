"use client";

import {
  RADIAL_CENTER_COLOR,
  RADIAL_CLOSE_LABEL_PT,
  RADIAL_MENU,
} from "@questboard/constants";
import { Close } from "./icons";
import type { RadialTargetInfo } from "@/lib/radial-menu-store";

interface Props {
  target: RadialTargetInfo;
  onClose: () => void;
}

/**
 * Círculo central — mostra nome + HP/distância do alvo. Clique fecha o
 * radial (atalho pra usuário desistir).
 */
export function RadialCenter({ target, onClose }: Props) {
  const size = RADIAL_MENU.centerButtonSizePx;

  return (
    <>
      {/* Botão central de fechar */}
      <button
        type="button"
        aria-label={RADIAL_CLOSE_LABEL_PT}
        onClick={onClose}
        style={{
          width: size,
          height: size,
          borderColor: RADIAL_CENTER_COLOR,
          color: RADIAL_CENTER_COLOR,
        }}
        className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 bg-[#0a1220] shadow-xl transition-transform hover:scale-110 focus:scale-110 focus:outline-none"
      >
        <Close className="h-[14px] w-[14px]" />
      </button>

      {/* Label do alvo (acima do centro) */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#04090f]/90 px-2 py-0.5 text-center"
        style={{ marginTop: -(size / 2) - 28 }}
      >
        <p className="text-[10px] font-semibold text-white">{target.namePt}</p>
        {(target.hpText || target.distanceCells !== undefined) && (
          <p className="text-[9px] text-brand-muted">
            {target.hpText}
            {target.hpText && target.distanceCells !== undefined && " · "}
            {target.distanceCells !== undefined &&
              `${target.distanceCells} ${target.distanceCells === 1 ? "célula" : "células"}`}
          </p>
        )}
      </div>
    </>
  );
}
