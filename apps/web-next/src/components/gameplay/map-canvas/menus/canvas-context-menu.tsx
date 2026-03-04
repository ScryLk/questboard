"use client";

import { useEffect, useRef } from "react";
import {
  Grid3x3,
  Layers,
  Maximize,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";

interface CanvasContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export function CanvasContextMenu({ x, y, onClose }: CanvasContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const setZoom = useGameplayStore((s) => s.setZoom);
  const zoom = useGameplayStore((s) => s.zoom);
  const toggleGrid = useGameplayStore((s) => s.toggleGrid);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  function MenuItem({
    icon: Icon,
    label,
    onClick,
  }: {
    icon: typeof ZoomIn;
    label: string;
    onClick?: () => void;
  }) {
    return (
      <button
        onClick={() => { onClick?.(); onClose(); }}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-brand-text transition-colors hover:bg-white/[0.05]"
      >
        <Icon className="h-3 w-3 shrink-0 text-brand-muted" />
        {label}
      </button>
    );
  }

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[180px] rounded-lg border border-brand-border bg-[#16161D] py-1 shadow-xl"
      style={{ left: x, top: y }}
    >
      <MenuItem icon={ZoomIn} label="Zoom In" onClick={() => setZoom(zoom + 25)} />
      <MenuItem icon={ZoomOut} label="Zoom Out" onClick={() => setZoom(zoom - 25)} />
      <MenuItem icon={Maximize} label="Ajustar a Tela" onClick={() => setZoom(100)} />
      <div className="mx-2 my-0.5 h-px bg-brand-border" />
      <MenuItem icon={Grid3x3} label="Toggle Grid" onClick={toggleGrid} />
      <MenuItem icon={Layers} label="Gerenciar Camadas" />
    </div>
  );
}
