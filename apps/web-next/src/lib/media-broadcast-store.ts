"use client";

// Store de mídia ativa (vídeo) na sessão. Modo dual igual ao
// `npc-conversation-store`: dev local funciona sem backend; com
// backend, ações chamam REST + escutam Socket.IO.

import { create } from "zustand";
import {
  hideMedia as apiHide,
  showMedia as apiShow,
  type ActiveMediaDto,
} from "./media-api";
import { normalizeMediaUrl } from "@questboard/validators";

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
        set({
          pending: false,
          errorMessage:
            (err as { message?: string }).message ?? "Erro ao exibir mídia.",
        });
      }
    },

    hideBackend: async (sessionId) => {
      set({ pending: true });
      try {
        await apiHide(sessionId);
        set({ active: null, pending: false });
      } catch (err) {
        set({
          pending: false,
          errorMessage:
            (err as { message?: string }).message ?? "Erro ao ocultar.",
        });
      }
    },

    applyServerEvent: (next) => set({ active: next, mode: "backend" }),

    openComposer: () => set({ composerOpen: true, errorMessage: null }),
    closeComposer: () => set({ composerOpen: false }),
    clearError: () => set({ errorMessage: null }),
  }),
);
