// ── Service de notas de campanha ──
//
// CRUD escopado por Campaign. Permissão é validada no router via
// requireCampaignGm (mutação) ou requireCampaignMember (leitura).
// Players só veem notas com `visibility != GM_ONLY` — filtro aplicado
// no service quando o caller passa `excludeGmOnly: true`.

import type { PrismaClient } from "@questboard/db";
import type { NoteCreate, NoteUpdate } from "@questboard/validators";
import {
  ForbiddenError,
  NotFoundError,
} from "../../errors/app-error.js";

export function createNotesService(prisma: PrismaClient) {
  return {
    async list(
      campaignId: string,
      opts: { excludeGmOnly?: boolean } = {},
    ) {
      return prisma.note.findMany({
        where: {
          campaignId,
          deletedAt: null,
          ...(opts.excludeGmOnly
            ? { visibility: { not: "GM_ONLY" } }
            : {}),
        },
        orderBy: { updatedAt: "desc" },
      });
    },

    async getById(noteId: string, opts: { excludeGmOnly?: boolean } = {}) {
      const note = await prisma.note.findFirst({
        where: {
          id: noteId,
          deletedAt: null,
          ...(opts.excludeGmOnly
            ? { visibility: { not: "GM_ONLY" } }
            : {}),
        },
      });
      if (!note) throw new NotFoundError("Note");
      return note;
    },

    async create(
      campaignId: string,
      authorId: string,
      input: NoteCreate,
    ) {
      return prisma.note.create({
        data: {
          campaignId,
          authorId,
          title: input.title,
          content: input.content,
          category: input.category,
          visibility: input.visibility,
        },
      });
    },

    async update(noteId: string, userId: string, input: NoteUpdate) {
      const note = await prisma.note.findUnique({
        where: { id: noteId },
        select: { authorId: true, campaignId: true },
      });
      if (!note) throw new NotFoundError("Note");

      // Author OR GM (CO_GM passou no requireCampaignGm) pode editar.
      // Como o middleware já validou que é GM/CO_GM, deixamos passar.
      // Se não fosse o caso, validaríamos `authorId === userId` aqui.
      void userId;

      return prisma.note.update({
        where: { id: noteId },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.content !== undefined ? { content: input.content } : {}),
          ...(input.category !== undefined ? { category: input.category } : {}),
          ...(input.visibility !== undefined
            ? { visibility: input.visibility }
            : {}),
        },
      });
    },

    async delete(noteId: string, userId: string) {
      const note = await prisma.note.findUnique({
        where: { id: noteId },
        select: { authorId: true },
      });
      if (!note) throw new NotFoundError("Note");
      // Mesmo princípio do update — middleware já gateou.
      void userId;

      // Soft delete preserva histórico.
      return prisma.note.update({
        where: { id: noteId },
        data: { deletedAt: new Date() },
      });
    },

    /** Helper público pra controllers checarem se o user pode ver
     *  uma nota específica (usado quando role da campanha não é GM). */
    assertVisibility(role: "OWNER" | "CO_GM" | "PLAYER" | "SPECTATOR", visibility: string) {
      if (visibility === "GM_ONLY" && role !== "OWNER" && role !== "CO_GM") {
        throw new ForbiddenError("Esta nota é privada do mestre.");
      }
    },
  };
}

export type NotesService = ReturnType<typeof createNotesService>;
