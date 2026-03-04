"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalShellProps {
  title: string;
  maxWidth?: number;
  children: React.ReactNode;
  onClose: () => void;
}

export function ModalShell({
  title,
  maxWidth = 480,
  children,
  onClose,
}: ModalShellProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className="relative max-h-[85vh] overflow-y-auto rounded-xl border border-brand-border bg-[#111116] shadow-2xl"
        style={{ width: `min(${maxWidth}px, calc(100vw - 32px))` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-4">
          <h2 className="text-sm font-semibold text-brand-text">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
