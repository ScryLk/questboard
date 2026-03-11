/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { BaseNodeData, BranchStatus } from "@/types/narrative";

const STATUS_STYLES: Record<BranchStatus, { border: string; bg: string; opacity: string }> = {
  active: { border: "border-emerald-500/40", bg: "bg-[#0F1A14]", opacity: "opacity-100" },
  pending: { border: "border-[#2A2A3A]", bg: "bg-[#12121E]", opacity: "opacity-100" },
  discarded: { border: "border-[#1A1A2A] border-dashed", bg: "bg-[#0C0C14]", opacity: "opacity-50" },
  hidden: { border: "border-red-900/30 border-dashed", bg: "bg-[#140C0C]", opacity: "opacity-30" },
};

function ConsequenceNodeComponent(props: any) {
  const data = props.data as BaseNodeData;
  const selected = props.selected as boolean;
  const style = STATUS_STYLES[data.status];
  const customColor = data.color;

  return (
    <div
      className={`min-w-[200px] max-w-[260px] rounded-lg border ${!customColor ? style.border : ""} ${style.bg} ${style.opacity} transition-shadow ${
        selected ? "ring-2 ring-brand-accent shadow-[0_0_20px_rgba(108,92,231,0.3)]" : ""
      }`}
      style={customColor ? { borderColor: `${customColor}60`, borderWidth: 1 } : undefined}
    >
      {/* @ts-expect-error React 19 JSX compat */}
      <Handle type="target" position={Position.Top} className="!bg-brand-accent !border-brand-surface !w-2.5 !h-2.5" />

      {/* Header */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5">
        <span className="text-[10px] text-brand-muted">↳</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
          Consequência
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5">
        <p className="text-[13px] font-medium leading-tight text-brand-text">{data.title}</p>
        {data.description && (
          <p className="mt-1 text-[11px] leading-relaxed text-brand-muted line-clamp-2">
            {data.description}
          </p>
        )}
      </div>

      {/* @ts-expect-error React 19 JSX compat */}
      <Handle type="source" position={Position.Bottom} className="!bg-brand-accent !border-brand-surface !w-2.5 !h-2.5" />
    </div>
  );
}

export const ConsequenceNode = memo(ConsequenceNodeComponent);
