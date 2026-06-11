"use client";

// Store de mídia ativa (vídeo) na sessão. Modo dual igual ao
// `npc-conversation-store`: dev local funciona sem backend; com
// backend, ações chamam REST + escutam Socket.IO.

import { create } from "zustand";
import {
  hideMedia as apiHide,
  showMedia as apiShow,
  uploadMedia as apiUpload,
  type ActiveMediaDto,
} from "./media-api";
import { normalizeMediaUrl } from "@questboard/validators";

/** Converte erro do `apiRequest` em texto curto pro modal. Usa
 *  `message` quando o backend mandou (o handler já extrai do
 *  `{error:{message}}` ou fallbacks). Em 403, hint específico. */
function mediaErrorMessage(err: unknown): string {
  const e = err as { message?: string; statusCode?: number; code?: string };
  if (e?.statusCode === 401) return "Sessão expirou. Recarregue a página.";
  if (e?.statusCode === 403) {
    return e.message ?? "Você não tem permissão para isso.";
  }
  if (e?.statusCode === 404) {
    return e.message ?? "Sessão não encontrada.";
  }
  // O backend devolve mensagens em pt-BR via AppError; usa direto se veio.
  if (e?.message && !e.message.startsWith("Request falhou")) return e.message;
  return "Erro ao enviar vídeo — verifique se a sessão está iniciada (LIVE).";
}

export type MediaMode = "local" | "backend";

interface MediaBroadcastState {
  mode: MediaMode;
  /** Mídia exibida no momento. null = nada. */
  active: ActiveMediaDto | null;
  /** Modal "Exibir vídeo" aberto no painel do GM. */
  composerOpen: boolean;
  pending: boolean;
  errorMessage: string | null;

  // Local (sem backend) — usado em dev offline.
  showLocal: (input: { url: string; title?: string; by?: string }) => void;
  hideLocal: () => void;

  // Backend
  showBackend: (
    sessionId: string,
    input: { url: string; title?: string },
  ) => Promise<void>;
  /** Upload de arquivo local (MP4/WebM) — backend sobe pro R2 e já
   *  ativa o broadcast. Sem backend (modo local), arquivo é exposto
   *  como blob URL e tratado como MP4 direto. */
  uploadAndShow: (
    sessionId: string | null,
    file: File,
    title?: string,
  ) => Promise<void>;
  hideBackend: (sessionId: string) => Promise<void>;

  /** Aplicado pelo socket bridge ao receber `media:show` / `media:hide`. */
  applyServerEvent: (next: ActiveMediaDto | null) => void;

  openComposer: () => void;
  closeComposer: () => void;
  clearError: () => void;
}

export const useMediaBroadcastStore = create<MediaBroadcastState>(
  (set, get) => ({
    mode: "local",
    active: null,
    composerOpen: false,
    pending: false,
    errorMessage: null,

    showLocal: ({ url, title, by }) => {
      const { provider, embedUrl } = normalizeMediaUrl(url);
      if (provider === "unknown") {
        set({
          errorMessage:
            "URL não suportada. Aceita YouTube, Vimeo ou MP4 direto.",
        });
        return;
      }
      set({
        mode: "local",
        active: {
          provider,
          embedUrl,
          originalUrl: url,
          title,
          startedAt: new Date().toISOString(),
          by: by ?? "local-gm",
        },
        composerOpen: false,
        errorMessage: null,
      });
    },

    hideLocal: () => {
      set({ active: null });
    },

    showBackend: async (sessionId, input) => {
      set({ mode: "backend", pending: true, errorMessage: null });
      try {
        const dto = await apiShow(sessionId, input);
        set({ active: dto, pending: false, composerOpen: false });
      } catch (err) {
        set({ pending: false, errorMessage: mediaErrorMessage(err) });
      }
    },

    uploadAndShow: async (sessionId, file, title) => {
      set({ pending: true, errorMessage: null });
      try {
        if (sessionId) {
          const dto = await apiUpload(sessionId, file, title);
          set({
            mode: "backend",
            active: dto,
            pending: false,
            composerOpen: false,
          });
        } else {
          // Modo dev/offline — sem backend, gera blob URL local. Sobrevive
          // só enquanto a aba viver; suficiente pra testar o overlay.
          const blobUrl = URL.createObjectURL(file);
          set({
            mode: "local",
            active: {
              provider: "mp4",
              embedUrl: blobUrl,
              originalUrl: blobUrl,
              title,
              startedAt: new Date().toISOString(),
              by: "local-gm",
            },
            pending: false,
            composerOpen: false,
          });
        }
      } catch (err) {
        set({ pending: false, errorMessage: mediaErrorMessage(err) });
      }
    },

    hideBackend: async (sessionId) => {
      set({ pending: true });
      try {
        await apiHide(sessionId);
        set({ active: null, pending: false });
      } catch (err) {
        set({ pending: false, errorMessage: mediaErrorMessage(err) });
      }
    },

    applyServerEvent: (next) => set({ active: next, mode: "backend" }),

    openComposer: () => set({ composerOpen: true, errorMessage: null }),
    closeComposer: () => set({ composerOpen: false }),
    clearError: () => set({ errorMessage: null }),
  }),
);
