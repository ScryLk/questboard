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
