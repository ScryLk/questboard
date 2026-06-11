// ── Service de broadcast de mídia ──
//
// GM exibe URL (YouTube/Vimeo/MP4) pra todos os jogadores. Persiste
// em Session.activeMedia + emite socket. Hide limpa o campo + emite.

import { Prisma, type PrismaClient } from "@questboard/db";
import {
  type ActiveMediaPayload,
  type MediaShowInput,
  normalizeMediaUrl,
} from "@questboard/validators";
import { BadRequestError, NotFoundError } from "../../errors/app-error.js";
import {
  emitMediaHide,
  emitMediaShow,
} from "../../lib/socket-events.js";
import { uploadFile } from "../../lib/r2.js";

const ALLOWED_UPLOAD_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
]);
const ALLOWED_UPLOAD_EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogv",
};
const MAX_UPLOAD_BYTES = 200 * 1024 * 1024; // 200MB — bate com o limite do multipart

export function createMediaService(prisma: PrismaClient) {
  return {
    async show(
      sessionId: string,
      userId: string,
      input: MediaShowInput,
    ): Promise<ActiveMediaPayload> {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { id: true, status: true },
      });
      if (!session) throw new NotFoundError("Session");
      if (session.status !== "LIVE") {
        throw new BadRequestError(
          "Sessão precisa estar LIVE pra exibir mídia.",
        );
      }

      const { provider, embedUrl } = normalizeMediaUrl(input.url);
      if (provider === "unknown") {
        throw new BadRequestError(
          "URL não suportada. Aceita YouTube, Vimeo ou MP4 direto.",
        );
      }

      const payload: ActiveMediaPayload = {
        provider,
        embedUrl,
        originalUrl: input.url,
        title: input.title,
        startedAt: new Date().toISOString(),
        by: userId,
      };

      await prisma.session.update({
        where: { id: sessionId },
        data: { activeMedia: payload as unknown as object },
      });

      emitMediaShow({ sessionId, ...payload });

      return payload;
    },

    // Upload de vídeo local (MP4/WebM) → R2 → ativa media broadcast.
    // Mesma semântica do `show` com URL, só que o link é gerado aqui.
    async upload(
      sessionId: string,
      userId: string,
      file: { buffer: Buffer; contentType: string; size: number },
      input: { title?: string },
    ): Promise<ActiveMediaPayload> {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { id: true, status: true },
      });
      if (!session) throw new NotFoundError("Session");
      if (session.status !== "LIVE") {
        throw new BadRequestError(
          "Sessão precisa estar LIVE pra exibir mídia.",
        );
      }
      if (!ALLOWED_UPLOAD_MIME.has(file.contentType)) {
        throw new BadRequestError(
          "Formato não suportado. Envie MP4, WebM ou OGG.",
        );
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        throw new BadRequestError(
          "Arquivo maior que 200MB. Comprima ou use link externo.",
        );
      }

      const ext = ALLOWED_UPLOAD_EXT[file.contentType] ?? "mp4";
      const key = `media/${sessionId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;
      const url = await uploadFile(key, file.buffer, file.contentType);

      const payload: ActiveMediaPayload = {
        provider: "mp4",
        embedUrl: url,
        originalUrl: url,
        title: input.title,
        startedAt: new Date().toISOString(),
        by: userId,
      };

      await prisma.session.update({
        where: { id: sessionId },
        data: { activeMedia: payload as unknown as object },
      });

      emitMediaShow({ sessionId, ...payload });

      return payload;
    },

    async hide(sessionId: string, userId: string): Promise<void> {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { id: true, activeMedia: true },
      });
      if (!session) throw new NotFoundError("Session");

      // Idempotente: se já está vazio, só emite o evento pra garantir
      // que clientes possivelmente desincronizados fechem.
      await prisma.session.update({
        where: { id: sessionId },
        data: { activeMedia: Prisma.JsonNull },
      });

      emitMediaHide({
        sessionId,
        at: new Date().toISOString(),
        by: userId,
      });
    },

    async getActive(sessionId: string): Promise<ActiveMediaPayload | null> {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { activeMedia: true },
      });
      if (!session) throw new NotFoundError("Session");
      return (session.activeMedia as ActiveMediaPayload | null) ?? null;
    },
  };
}

export type MediaService = ReturnType<typeof createMediaService>;
