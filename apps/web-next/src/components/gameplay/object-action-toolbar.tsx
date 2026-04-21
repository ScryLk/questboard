"use client";

import type { LucideIcon } from "lucide-react";
import { Copy, RotateCw, Trash2 } from "lucide-react";

interface Props {
  /** Posição em pixels no espaço do canvas transformado (inclui pan/zoom). */
  left: number;
  /** Posição em pixels no espaço do canvas transformado (inclui pan/zoom). */
  top: number;
  onRotate: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const TOOLBAR_HEIGHT = 36;

/**
 * Toolbar flutuante acima do objeto selecionado no editor.
 * Deve ser colocada dentro do mesmo container transformado do canvas
 * (o que aplica `translate(panX, panY)`) pra acompanhar o pan/zoom.
 */
export function ObjectActionToolbar({
  left,
  top,
  onRotate,
  onDuplicate,
  onDelete,
}: Props) {
  return (
    <div
      className="pointer-events-auto absolute z-50 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-brand-border bg-[#111116]/95 px-1 py-1 shadow-xl backdrop-blur-sm"
      style={{ left, top, height: TOOLBAR_HEIGHT }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <ToolbarButton icon={RotateCw} label="Rotacionar (R)" onClick={onRotate} />
      <ToolbarButton icon={Copy} label="Duplicar (Ctrl+D)" onClick={onDuplicate} />
      <div className="mx-0.5 h-5 w-px bg-brand-border" />
      <ToolbarButton
        icon={Trash2}
        label="Deletar (Del)"
        onClick={onDelete}
        variant="danger"
      />
    </div>
  );
}

interface ToolbarButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  variant = "default",
}: ToolbarButtonProps) {
  const cls =
    variant === "danger"
      ? "text-red-400 hover:bg-red-500/15 hover:text-red-300"
      : "text-brand-muted hover:bg-white/5 hover:text-brand-text";
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors ${cls}`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

export { TOOLBAR_HEIGHT };
