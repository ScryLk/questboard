"use client";

// Shell base dos popovers do combat tracker. Centraliza no viewport com
// backdrop semi-transparente. Esc fecha; click no backdrop fecha; foco
// inicial no primeiro elemento focável dentro de `children`.

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Largura fixa em px (default 280). */
  widthPx?: number;
}

export function PopoverShell({
  title,
  subtitle,
  onClose,
  children,
  widthPx = 280,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-label={title}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#04090f]/55 backdrop-blur-[1px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className="rounded-lg border border-brand-border bg-brand-surface shadow-2xl"
        style={{ width: widthPx }}
      >
        <div className="flex items-start justify-between border-b border-brand-border px-3 py-2">
          <div className="min-w-0">
            <p className="truncate font-cinzel text-[11px] font-semibold uppercase tracking-wider text-brand-text">
              {title}
            </p>
            {subtitle && (
              <p className="truncate text-[10px] text-brand-muted">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            aria-label="Fechar"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        <div className="px-3 py-3">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
