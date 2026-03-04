"use client";

import { useGameplayStore } from "@/lib/gameplay-store";

export function ToastOverlay() {
  const toasts = useGameplayStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none absolute bottom-14 left-1/2 z-40 flex -translate-x-1/2 flex-col-reverse gap-1">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-in fade-in whitespace-nowrap rounded-lg border border-brand-border bg-[#16161D] px-3 py-1.5 text-xs text-brand-text shadow-xl"
          style={{ animation: "fadeIn 200ms ease-out" }}
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
}
