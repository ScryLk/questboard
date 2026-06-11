"use client";

// Modal "Exibir vídeo" do GM. Cola URL (YouTube/Vimeo/MP4 direto),
// preview imediato + botão "Exibir pra todos". Quando há mídia
// ativa, mostra controles pra ocultar.

import { useMemo, useRef, useState } from "react";
import { FileVideo, Loader2, Play, Tv, Upload, X } from "lucide-react";
import { normalizeMediaUrl } from "@questboard/validators";
import { useMediaBroadcastStore } from "@/lib/media-broadcast-store";

const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];
const ACCEPTED_VIDEO_EXTENSIONS = ".mp4,.webm,.ogv,.ogg";
const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
  const uploadAndShow = useMediaBroadcastStore((s) => s.uploadAndShow);
  const hideLocal = useMediaBroadcastStore((s) => s.hideLocal);
  const hideBackend = useMediaBroadcastStore((s) => s.hideBackend);
  const clearError = useMediaBroadcastStore((s) => s.clearError);

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const preview = useMemo(() => {
    if (!url.trim()) return null;
    return normalizeMediaUrl(url.trim());
  }, [url]);

  if (!composerOpen) return null;

  const canSubmitUrl =
    !pending && preview !== null && preview.provider !== "unknown";
  const canSubmitFile = !pending && file !== null && !fileError;
  const canSubmit = file ? canSubmitFile : canSubmitUrl;

  function validateAndSetFile(f: File | null) {
    if (!f) {
      setFile(null);
      setFileError(null);
      return;
    }
    if (!ACCEPTED_VIDEO_TYPES.includes(f.type)) {
      setFile(null);
      setFileError("Formato não suportado. Use MP4, WebM ou OGG.");
      return;
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      setFile(null);
      setFileError(
        `Arquivo grande demais (${formatFileSize(f.size)}). Limite: 200MB.`,
      );
      return;
    }
    setFile(f);
    setFileError(null);
    if (errorMessage) clearError();
  }

  function handleShow() {
    if (file) {
      if (!canSubmitFile) return;
      void uploadAndShow(sessionId, file, title.trim() || undefined);
      setUrl("");
      setTitle("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (!canSubmitUrl || !preview) return;
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
              Cola um link do YouTube/Vimeo, MP4 direto, ou envie um
              arquivo (MP4, WebM, máx. 200MB). O overlay aparece em
              fullscreen pra todos os jogadores da sessão.
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
                disabled={file !== null}
                className="w-full rounded-lg border border-white/10 bg-brand-primary px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-brand-accent disabled:cursor-not-allowed disabled:opacity-50"
                autoFocus
              />
            </label>

            {/* File upload — alternativa ao URL. Mutuamente exclusivo:
                quando há arquivo selecionado, o input de URL desabilita. */}
            <div>
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
                Ou envie um arquivo
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_VIDEO_EXTENSIONS}
                onChange={(e) => validateAndSetFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
                  <FileVideo className="h-4 w-4 shrink-0 text-emerald-300" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-white">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-brand-muted">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => validateAndSetFile(null)}
                    disabled={pending}
                    className="rounded p-1 text-brand-muted transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
                    aria-label="Remover arquivo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={url.trim().length > 0}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-3 py-3 text-xs text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Escolher MP4/WebM (máx. 200MB)
                </button>
              )}
              {fileError && (
                <p className="mt-1 text-[10px] text-rose-300">{fileError}</p>
              )}
            </div>

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

            {!file && preview && (
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
                  {file ? "Enviando..." : "Exibindo..."}
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  {file ? "Enviar e exibir" : "Exibir pra todos"}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
