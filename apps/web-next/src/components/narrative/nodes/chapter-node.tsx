/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { BaseNodeData } from "@/types/narrative";

function ChapterNodeComponent(props: any) {
  const data = props.data as BaseNodeData;
  const selected = props.selected as boolean;
  const color = data.color ?? "#6C5CE7";
  const isActive = data.status === "active";

  return (
    <div
      className={`min-w-[300px] rounded-xl transition-shadow ${
        selected ? "ring-2 ring-brand-accent shadow-[0_0_24px_rgba(108,92,231,0.3)]" : ""
      } ${isActive ? "opacity-100" : "opacity-60"}`}
      style={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
        border: `1px solid ${color}40`,
      }}
    >
      {/* @ts-expect-error React 19 JSX compat */}
      <Handle type="target" position={Position.Top} className="!bg-brand-accent !border-brand-surface !w-2.5 !h-2.5" />

      <div className="flex items-center justify-center gap-3 px-5 py-3">
        <div className="h-px flex-1" style={{ background: `${color}40` }} />
        <p
          className="font-cinzel text-center text-[12px] font-bold uppercase tracking-[0.2em]"
          style={{ color }}
        >
          {data.chapterLabel ?? data.title}
        </p>
        <div className="h-px flex-1" style={{ background: `${color}40` }} />
      </div>

      {/* @ts-expect-error React 19 JSX compat */}
      <Handle type="source" position={Position.Bottom} className="!bg-brand-accent !border-brand-surface !w-2.5 !h-2.5" />
    </div>
  );
}

export const ChapterNode = memo(ChapterNodeComponent);
