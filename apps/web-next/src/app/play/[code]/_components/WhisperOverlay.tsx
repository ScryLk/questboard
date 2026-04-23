"use client";

import { EyeOff, Reply, X } from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";

export function WhisperOverlay() {
  const pendingWhisper = usePlayerViewStore((s) => s.pendingWhisper);
  const dismissWhisper = usePlayerViewStore((s) => s.dismissWhisper);
  const setActiveTab = usePlayerViewStore((s) => s.setActiveTab);
  const setChatChannel = usePlayerViewStore((s) => s.setChatChannel);
  const setPanelVisible = usePlayerViewStore((s) => s.setPanelVisible);

  if (!pendingWhisper) return null;

  const handleReply = () => {
    dismissWhisper();
    setChatChannel("sussurro");
    setActiveTab("chat");
    setPanelVisible(true);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[150] flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-sm animate-in slide-in-from-bottom rounded-2xl border border-brand-accent/20 bg-[#1a1430] p-4 shadow-2xl shadow-brand-accent/10">
        {/* Header */}
        <div className="mb-2 flex items-center gap-2">
          <EyeOff className="h-4 w-4 text-brand-accent" />
          <span className="text-xs font-medium text-brand-accent">
            {pendingWhisper.fromName} sussurrou para você:
          </span>
          <button
            onClick={dismissWhisper}
            className="ml-auto rounded-full p-1 text-white/30 hover:bg-white/10 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Message */}
        {pendingWhisper.message && pendingWhisper.message !== "[imagem]" && (
          <p className="text-sm italic text-white/70">
            &ldquo;{pendingWhisper.message}&rdquo;
          </p>
        )}

        {/* Imagem anexada (se houver) */}
        {pendingWhisper.imageUrl && (
          <div className="mt-2 overflow-hidden rounded-lg border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingWhisper.imageUrl}
              alt="Anexo do mestre"
              className="max-h-64 w-full object-contain"
            />
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleReply}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-accent/15 py-2 text-xs font-medium text-brand-accent transition-colors hover:bg-brand-accent/25"
          >
            <Reply className="h-3.5 w-3.5" />
            Responder
          </button>
          <button
            onClick={dismissWhisper}
            className="flex-1 rounded-lg bg-white/5 py-2 text-xs text-white/40 transition-colors hover:bg-white/10"
          >
            Dispensar
          </button>
        </div>
      </div>
    </div>
  );
}
