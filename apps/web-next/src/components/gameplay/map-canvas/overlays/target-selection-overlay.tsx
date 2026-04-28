"use client";

// Anéis ao redor dos tokens-alvo do ataque atual. Lê do attack-store
// — ativo enquanto a fase != idle. Cor depende da fase + resultado:
//   configuring     → cyan tracejado
//   animating       → cyan pulsante
//   done/applied    → ouro (crit), verde (acertou), cinza (errou)
//
// Sem interação — só feedback visual. Usado para deixar claro quais
// tokens estão sendo atacados, especialmente em multi-alvo.

import type { GameToken } from "@/lib/gameplay-mock-data";
import { useAttackStore } from "@/lib/attack-store";

interface Props {
  tokens: GameToken[];
  scaledCell: number;
}

const RING_THICKNESS = 3;

export function TargetSelectionOverlay({ tokens, scaledCell }: Props) {
  const phase = useAttackStore((s) => s.phase);
  const pending = useAttackStore((s) => s.pending);
  const result = useAttackStore((s) => s.result);

  if (phase === "idle" || !pending || pending.targetTokenIds.length === 0) {
    return null;
  }

  return (
    <>
      {pending.targetTokenIds.map((tokenId) => {
        const token = tokens.find((t) => t.id === tokenId);
        if (!token) return null;

        const targetResult = result?.results.find(
          (r) => r.targetTokenId === tokenId,
        );

        const { stroke, fill, dashed, pulse } = ringStyle(phase, targetResult);

        const cx = token.x * scaledCell + scaledCell / 2;
        const cy = token.y * scaledCell + scaledCell / 2;
        const radius = scaledCell * 0.55;

        return (
          <div
            key={`target-ring-${tokenId}`}
            className={`pointer-events-none absolute ${pulse ? "qb-target-ring-pulse" : ""}`}
            style={{
              left: cx - radius,
              top: cy - radius,
              width: radius * 2,
              height: radius * 2,
              borderRadius: "50%",
              border: `${RING_THICKNESS}px ${dashed ? "dashed" : "solid"} ${stroke}`,
              backgroundColor: fill,
              boxShadow: `0 0 12px ${stroke}`,
            }}
          />
        );
      })}

      <style>{`
        @keyframes qb-target-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.08); }
        }
        .qb-target-ring-pulse {
          animation: qb-target-pulse 900ms ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

type Phase = ReturnType<typeof useAttackStore.getState>["phase"];
type TargetResult = NonNullable<
  ReturnType<typeof useAttackStore.getState>["result"]
>["results"][number];

function ringStyle(
  phase: Phase,
  r: TargetResult | undefined,
): { stroke: string; fill: string; dashed: boolean; pulse: boolean } {
  if (phase === "configuring") {
    return {
      stroke: "rgba(165, 243, 252, 0.85)",
      fill: "rgba(165, 243, 252, 0.10)",
      dashed: true,
      pulse: false,
    };
  }
  if (phase === "animating") {
    return {
      stroke: "rgba(165, 243, 252, 0.95)",
      fill: "rgba(165, 243, 252, 0.15)",
      dashed: false,
      pulse: true,
    };
  }
  // done / applied — depende do resultado por alvo
  if (!r) {
    return {
      stroke: "rgba(148, 163, 184, 0.7)",
      fill: "transparent",
      dashed: false,
      pulse: false,
    };
  }
  if (r.isCrit) {
    return {
      stroke: "rgba(253, 224, 71, 0.95)",
      fill: "rgba(253, 224, 71, 0.18)",
      dashed: false,
      pulse: false,
    };
  }
  if (r.isFumble || !r.hit) {
    return {
      stroke: "rgba(148, 163, 184, 0.85)",
      fill: "transparent",
      dashed: false,
      pulse: false,
    };
  }
  return {
    stroke: "rgba(74, 222, 128, 0.95)",
    fill: "rgba(74, 222, 128, 0.18)",
    dashed: false,
    pulse: false,
  };
}
