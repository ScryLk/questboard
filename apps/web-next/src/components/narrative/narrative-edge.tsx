"use client";

import { memo } from "react";
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  type EdgeProps,
} from "@xyflow/react";
import type { BranchStatus } from "@/types/narrative";

const EDGE_COLORS: Record<BranchStatus, string> = {
  active: "#10B981",
  pending: "#3A3A5A",
  discarded: "#2A2A3A",
  hidden: "#1A1A2A",
};

function NarrativeEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const status = (data?.status as BranchStatus) ?? "pending";
  const label = data?.label as string | undefined;
  const color = EDGE_COLORS[status];
  const isDashed = status === "discarded" || status === "hidden";
  const opacity = status === "discarded" ? 0.4 : status === "hidden" ? 0.2 : 1;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
  });

  return (
    <>
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={selected ? "#6C5CE7" : color}
        strokeWidth={selected ? 2.5 : status === "active" ? 2 : 1.5}
        strokeDasharray={isDashed ? "6 4" : undefined}
        opacity={opacity}
        className={status === "active" ? "narrative-edge-active" : ""}
      />

      {label && (
        // @ts-expect-error React 19 JSX compat
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-auto absolute rounded-full border border-white/10 bg-[#1A1A2E] px-2 py-0.5 text-[10px] text-brand-muted"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              opacity,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const NarrativeEdge = memo(NarrativeEdgeComponent);

export const narrativeEdgeTypes = {
  narrative: NarrativeEdge,
};
