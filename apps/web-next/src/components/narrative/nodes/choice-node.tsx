/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { GitFork } from "lucide-react";
import type { BaseNodeData, BranchStatus } from "@/types/narrative";

const STATUS_BORDER: Record<BranchStatus, string> = {
  active: "border-brand-accent",
  pending: "border-[#3A3A5A]",
  discarded: "border-[#2A2A3A] border-dashed",
  hidden: "border-red-900/30 border-dashed",
};

function ChoiceNodeComponent(props: any) {
  const data = props.data as BaseNodeData;
  const selected = props.selected as boolean;
  const border = STATUS_BORDER[data.status];
  const isLive = data.status === "active" || data.status === "pending";
  const customColor = data.color;

  return (
    <div
      className={`min-w-[200px] max-w-[260px] rounded-xl border-2 ${!customColor ? border : ""} bg-[#13111E] transition-shadow ${
        isLive ? "" : "opacity-50"
      } ${selected ? "ring-2 ring-brand-accent shadow-[0_0_24px_rgba(108,92,231,0.35)]" : ""}`}
      style={customColor ? { borderColor: customColor } : undefined}
    >
      {/* @ts-expect-error React 19 JSX compat */}
      <Handle type="target" position={Position.Top} className="!bg-brand-accent !border-brand-surface !w-2.5 !h-2.5" />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <GitFork className="h-3.5 w-3.5 text-brand-accent" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Escolha
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5">
        <p className="text-[13px] font-medium leading-tight text-brand-text">{data.title}</p>
      </div>

      {/* Multiple source handles for branches */}
      {/* @ts-expect-error React 19 JSX compat */}
      <Handle type="source" position={Position.Bottom} id="left" className="!bg-brand-accent !border-brand-surface !w-2.5 !h-2.5" style={{ left: "30%" }} />
      {/* @ts-expect-error React 19 JSX compat */}
      <Handle type="source" position={Position.Bottom} id="center" className="!bg-brand-accent !border-brand-surface !w-2.5 !h-2.5" style={{ left: "50%" }} />
      {/* @ts-expect-error React 19 JSX compat */}
      <Handle type="source" position={Position.Bottom} id="right" className="!bg-brand-accent !border-brand-surface !w-2.5 !h-2.5" style={{ left: "70%" }} />
    </div>
  );
}

export const ChoiceNode = memo(ChoiceNodeComponent);
