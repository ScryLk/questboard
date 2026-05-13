// ── Broadcast de mídia (vídeo) pra sessão ──
//
// GM cola URL no modal; backend normaliza pra embedUrl e persiste em
// Session.activeMedia + emite socket event pra todos os jogadores.
//
// Provedores suportados no MVP: YouTube, Vimeo, MP4 direto.

import { z } from "zod";

export const MEDIA_PROVIDERS = ["youtube", "vimeo", "mp4", "unknown"] as const;

export type MediaProvider = (typeof MEDIA_PROVIDERS)[number];

export const mediaShowSchema = z.object({
  url: z.string().min(5).max(1000),
  /** Título opcional pra exibir no overlay. */
  title: z.string().max(200).optional(),
});

export type MediaShowInput = z.infer<typeof mediaShowSchema>;

export interface ActiveMediaPayload {
  provider: MediaProvider;
  /** URL final usada no `<iframe src>` ou `<video src>`. */
  embedUrl: string;
  /** URL original que o GM colou (pra reabrir externamente). */
  originalUrl: string;
  title?: string;
  startedAt: string;
  by: string;
}

/** Extrai videoId do YouTube de URL variant. Aceita:
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://youtu.be/VIDEO_ID
 *  - https://www.youtube.com/embed/VIDEO_ID
 *  - https://www.youtube.com/shorts/VIDEO_ID */
export function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return /^[A-Za-z0-9_-]{6,}$/.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v && /^[A-Za-z0-9_-]{6,}$/.test(v)) return v;
      const m = u.pathname.match(/^\/(?:embed|shorts)\/([A-Za-z0-9_-]{6,})/);
      if (m) return m[1]!;
    }
    return null;
  } catch {
    return null;
  }
}

/** Vimeo: https://vimeo.com/12345678 → "12345678". */
export function extractVimeoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.replace(/^www\./, "").endsWith("vimeo.com")) return null;
    const m = u.pathname.match(/^\/(\d{5,})/);
    return m ? m[1]! : null;
  } catch {
    return null;
  }
}

/** Detecta MP4/WebM direto pela extensão (URL termina em .mp4/.webm). */
export function isDirectVideoUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return /\.(mp4|webm|ogg)$/i.test(u.pathname);
  } catch {
    return false;
  }
}

/** Normaliza qualquer URL aceita pra `{ provider, embedUrl }`. Quando
 *  o provider é desconhecido, devolve `unknown` + a URL original
 *  (frontend pode mostrar um aviso ao GM). */
export function normalizeMediaUrl(url: string): {
  provider: MediaProvider;
  embedUrl: string;
} {
  const ytId = extractYouTubeId(url);
  if (ytId) {
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`,
    };
  }
  const vmId = extractVimeoId(url);
  if (vmId) {
    return {
      provider: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vmId}?autoplay=1`,
    };
  }
  if (isDirectVideoUrl(url)) {
    return { provider: "mp4", embedUrl: url };
  }
  return { provider: "unknown", embedUrl: url };
}
