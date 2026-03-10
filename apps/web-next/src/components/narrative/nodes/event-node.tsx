/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Swords, MapPin, Users } from "lucide-react";
import type { BranchStatus, BaseNodeData } from "@/types/narrative";

const STATUS_STYLES: Record<BranchStatus, { border: string; bg: string; dot: string; opacity: string }> = {
  active: { border: "border-emerald-500/60", bg: "bg-[#0D1F12]", dot: "bg-emerald-400", opacity: "opacity-100" },
  pending: { border: "border-[#2A2A3A]", bg: "bg-[#12121E]", dot: "bg-brand-muted", opacity: "opacity-100" },
  discarded: { border: "border-[#1A1A2A] border-dashed", bg: "bg-[#0C0C14]", dot: "bg-gray-600", opacity: "opacity-50" },
  hidden: { border: "border-red-900/30 border-dashed", bg: "bg-[#140C0C]", dot: "bg-red-800", opacity: "opacity-30" },
};

const STATUS_LABELS: Record<BranchStatus, string> = {
  active: "Ativo",
  pending: "Pendente",
  discarded: "Descartado",
  hidden: "Oculto",
};

function EventNodeComponent(props: any) {
  const data = props.data as BaseNodeData;
  const selected = props.selected as boolean;
  const style = STATUS_STYLES[data.status];
  const customColor = data.color;

  return (
    <div
      className={`min-w-[220px] max-w-[280px] rounded-lg border ${!customColor ? style.border : ""} ${style.bg} ${style.opacity} transition-shadow ${
        selected ? "ring-2 ring-brand-accent shadow-[0_0_20px_rgba(108,92,231,0.3)]" : ""
      }`}
      style={customColor ? { borderColor: `${customColor}60`, borderWidth: 1 } : undefined}
    >
      {/* @ts-expect-error React 19 JSX compat */}
      <Handle type="target" position={Position.Top} className="!bg-brand-accent !border-brand-surface !w-2.5 !h-2.5" />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${style.dot}`} />
          <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">Evento</span>
        </div>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] text-brand-muted">
          {STATUS_LABELS[data.status]}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5">
        <p className="text-[13px] font-medium leading-tight text-brand-text">{data.title}</p>

        {data.sessionNumber && (
          <p className="mt-1 text-[10px] text-brand-muted">
            Sessão #{data.sessionNumber}
          </p>
        )}

        {/* Link chips */}
        {((data.linkedEncounterIds?.length ?? 0) > 0 || (data.linkedNpcIds?.length ?? 0) > 0 || (data.linkedMapIds?.length ?? 0) > 0) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {(data.linkedEncounterIds?.length ?? 0) > 0 && (
              <span className="flex items-center gap-0.5 rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-brand-muted">
                <Swords className="h-2.5 w-2.5" /> {data.linkedEncounterIds!.length}
              </span>
            )}
            {(data.linkedNpcIds?.length ?? 0) > 0 && (
              <span className="flex items-center gap-0.5 rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-brand-muted">
                <Users className="h-2.5 w-2.5" /> {data.linkedNpcIds!.length}
              </span>
            )}
            {(data.linkedMapIds?.length ?? 0) > 0 && (
              <span className="flex items-center gap-0.5 rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-brand-muted">
                <MapPin className="h-2.5 w-2.5" /> {data.linkedMapIds!.length}
              </span>
            )}
          </div>
        )}
      </div>

      {/* @ts-expect-error React 19 JSX compat */}
      <Handle type="source" position={Position.Bottom} className="!bg-brand-accent !border-brand-surface !w-2.5 !h-2.5" />
    </div>
  );
}

export const EventNode = memo(EventNodeComponent);
