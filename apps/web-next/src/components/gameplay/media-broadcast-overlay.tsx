"use client";

// Overlay fullscreen que renderiza a mídia ativa da sessão. Aparece
// pra todos (player view + dashboard do GM). Player não fecha — só o
// GM fecha pelo modal. Player pode minimizar pra canto.

import { useState } from "react";
import { Maximize2, Minimize2, Tv } from "lucide-react";
import { useMediaBroadcastStore } from "@/lib/media-broadcast-store";

interface Props {
  /** Quando true, esconde o controle "Minimizar" (modo GM preview). */
  hideMinimize?: boolean;
}

export function MediaBroadcastOverlay({ hideMinimize }: Props) {
  const active = useMediaBroadcastStore((s) => s.active);
  const [minimized, setMinimized] = useState(false);

  if (!active) return null;

  if (minimized && !hideMinimize) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-4 right-4 z-[55] flex items-center gap-2 rounded-lg border border-white/15 bg-brand-surface/95 px-3 py-2 text-xs text-white shadow-2xl backdrop-blur hover:border-brand-accent/50"
        title="Reabrir vídeo"
      >
        <Tv className="h-3.5 w-3.5 text-brand-accent" />
        <span className="max-w-[160px] truncate">
          {active.title ?? "Vídeo em exibição"}
        </span>
        <Maximize2 className="h-3 w-3 text-brand-muted" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/5 bg-black/40 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Tv className="h-3.5 w-3.5 shrink-0 text-brand-accent" />
          <span className="truncate text-xs font-semibold uppercase tracking-wider text-brand-accent">
            {active.title ?? "Vídeo em exibição"}
          </span>
        </div>
        {!hideMinimize && (
          <button
            onClick={() => setMinimized(true)}
            className="flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[11px] text-brand-muted hover:border-white/20 hover:text-white"
            title="Minimizar"
          >
            <Minimize2 className="h-3 w-3" />
            Minimizar
          </button>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="aspect-video w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
          {active.provider === "mp4" ? (
            <video
              src={active.embedUrl}
              controls
              autoPlay
              playsInline
              className="h-full w-full"
            />
          ) : (
            <iframe
              src={active.embedUrl}
              title={active.title ?? "Mídia"}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          )}
        </div>
      </div>

      <p className="border-t border-white/5 bg-black/40 px-4 py-2 text-center text-[10px] text-brand-muted">
        O mestre controla a exibição. Use Minimizar pra continuar jogando.
      </p>
    </div>
  );
}
