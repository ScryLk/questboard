"use client";

// Modal "Exibir vídeo" do GM. Cola URL (YouTube/Vimeo/MP4 direto),
// preview imediato + botão "Exibir pra todos". Quando há mídia
// ativa, mostra controles pra ocultar.

import { useMemo, useState } from "react";
import { Loader2, Play, Tv, X } from "lucide-react";
import { normalizeMediaUrl } from "@questboard/validators";
import { useMediaBroadcastStore } from "@/lib/media-broadcast-store";

interface Props {
  /** Quando presente, opera em modo backend (REST + socket). Quando
   *  null, opera em modo local (apenas store). */
  sessionId: string | null;
}

const PROVIDER_LABEL: Record<string, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  mp4: "MP4 direto",
  unknown: "Desconhecido",
};

export function MediaBroadcastModal({ sessionId }: Props) {
  const composerOpen = useMediaBroadcastStore((s) => s.composerOpen);
  const closeComposer = useMediaBroadcastStore((s) => s.closeComposer);
  const active = useMediaBroadcastStore((s) => s.active);
  const pending = useMediaBroadcastStore((s) => s.pending);
  const errorMessage = useMediaBroadcastStore((s) => s.errorMessage);
  const showLocal = useMediaBroadcastStore((s) => s.showLocal);
  const showBackend = useMediaBroadcastStore((s) => s.showBackend);
  const hideLocal = useMediaBroadcastStore((s) => s.hideLocal);
  const hideBackend = useMediaBroadcastStore((s) => s.hideBackend);
  const clearError = useMediaBroadcastStore((s) => s.clearError);

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  const preview = useMemo(() => {
    if (!url.trim()) return null;
    return normalizeMediaUrl(url.trim());
  }, [url]);

  if (!composerOpen) return null;

  const canSubmit =
    !pending && preview !== null && preview.provider !== "unknown";

  function handleShow() {
    if (!canSubmit || !preview) return;
    if (sessionId) {
      void showBackend(sessionId, {
        url: url.trim(),
        title: title.trim() || undefined,
      });
    } else {
      showLocal({
        url: url.trim(),
        title: title.trim() || undefined,
      });
    }
    setUrl("");
    setTitle("");
  }

  function handleHide() {
    if (sessionId) {
      void hideBackend(sessionId);
    } else {
      hideLocal();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={closeComposer}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-white/10 bg-brand-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-4 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
              <Tv className="h-3.5 w-3.5" />
              Broadcast de vídeo
            </div>
            <h2 className="font-cinzel text-lg font-bold text-white">
              Exibir vídeo pra todos
            </h2>
            <p className="mt-1 text-xs text-brand-muted">
              Cola um link do YouTube, Vimeo ou MP4 direto. Quando você
              ativa, o overlay aparece em fullscreen pra todos os jogadores
              da sessão.
            </p>
          </div>
          <button
            onClick={closeComposer}
            className="rounded-md p-1 text-brand-muted hover:bg-white/5 hover:text-white"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {active ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
              Exibindo agora
            </p>
            <p className="mt-1 truncate text-sm text-white">
              {active.title ?? active.originalUrl}
            </p>
            <p className="mt-0.5 text-[10px] text-brand-muted">
              {PROVIDER_LABEL[active.provider]} · iniciado{" "}
              {new Date(active.startedAt).toLocaleTimeString("pt-BR")}
            </p>
            <button
              onClick={handleHide}
              disabled={pending}
              className="mt-3 w-full rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
            >
              {pending ? "Ocultando..." : "Ocultar pra todos"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
                URL do vídeo
              </span>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (errorMessage) clearError();
                }}
                placeholder="https://youtu.be/... ou https://vimeo.com/..."
                className="w-full rounded-lg border border-white/10 bg-brand-primary px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-brand-accent"
                autoFocus
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
                Título (opcional)
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Trailer da expansão"
                className="w-full rounded-lg border border-white/10 bg-brand-primary px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-brand-accent"
              />
            </label>

            {preview && (
              <div
                className={`rounded-md border px-3 py-2 text-[11px] ${
                  preview.provider === "unknown"
                    ? "border-rose-500/30 bg-rose-500/5 text-rose-300"
                    : "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                }`}
              >
                Provedor detectado:{" "}
                <strong>{PROVIDER_LABEL[preview.provider]}</strong>
                {preview.provider === "unknown" && (
                  <p className="mt-1 text-[10px] text-rose-300/80">
                    Aceita YouTube (youtu.be / youtube.com), Vimeo
                    (vimeo.com/ID) ou URL terminada em .mp4 / .webm.
                  </p>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-md border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-[11px] text-rose-300">
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleShow}
              disabled={!canSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-accent px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-accent/85 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Exibindo...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Exibir pra todos
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
