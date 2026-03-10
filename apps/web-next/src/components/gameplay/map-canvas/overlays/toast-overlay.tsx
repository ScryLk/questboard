"use client";

import { useGameplayStore } from "@/lib/gameplay-store";

export function ToastOverlay() {
  const toasts = useGameplayStore((s) => s.toasts);
  const removeToast = useGameplayStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none absolute bottom-14 left-1/2 z-40 flex -translate-x-1/2 flex-col-reverse gap-1">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-in fade-in flex items-center gap-2 whitespace-nowrap rounded-lg border border-brand-border bg-[#16161D] px-3 py-1.5 text-xs text-brand-text shadow-xl ${toast.action ? "pointer-events-auto" : ""}`}
          style={{ animation: "fadeIn 200ms ease-out" }}
        >
          <span>{toast.text}</span>
          {toast.action && (
            <button
              onClick={() => {
                toast.action!.onClick();
                removeToast(toast.id);
              }}
              className="cursor-pointer rounded px-2 py-0.5 text-[11px] font-semibold text-brand-accent transition-colors hover:bg-brand-accent/10"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
