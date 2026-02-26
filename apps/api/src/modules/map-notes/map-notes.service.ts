import type { PrismaClient } from "@questboard/db";
import type { CreateMapNoteInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createMapNotesService(prisma: PrismaClient) {
  return {
    async create(mapId: string, userId: string, role: string, input: CreateMapNoteInput) {
      const isGm = ["GM", "CO_GM"].includes(role);

      // Players can only create PERSONAL notes unless party notes are allowed
      if (!isGm && input.visibility !== "PERSONAL") {
        throw new ForbiddenError("Jogadores só podem criar notas pessoais");
      }

      const note = await prisma.mapNote.create({
        data: {
          mapId,
          authorId: userId,
          x: input.x,
          y: input.y,
          content: input.content,
          icon: input.icon ?? "📌",
          color: input.color ?? "#6C5CE7",
          visibility: (input.visibility as any) ?? "PERSONAL",
        },
      });

      return this.format(note);
    },

    async list(mapId: string, userId: string, role: string) {
      const isGm = ["GM", "CO_GM"].includes(role);

      const notes = await prisma.mapNote.findMany({
        where: { mapId },
        orderBy: { createdAt: "desc" },
      });

      // Filter visibility
      const visible = isGm
        ? notes
        : notes.filter((n) => {
            switch (n.visibility) {
              case "ALL":
                return true;
              case "PARTY":
                return true;
              case "PERSONAL":
                return n.authorId === userId;
              case "GM_ONLY":
                return false;
              default:
                return n.authorId === userId;
            }
          });

      return visible.map(this.format);
    },

    async delete(noteId: string, userId: string, role: string) {
      const note = await prisma.mapNote.findFirst({
        where: { id: noteId },
      });
      if (!note) throw new NotFoundError("Map note");

      const isGm = ["GM", "CO_GM"].includes(role);
      if (!isGm && note.authorId !== userId) {
        throw new ForbiddenError("Você só pode deletar suas próprias notas");
      }

      await prisma.mapNote.delete({ where: { id: noteId } });
    },

    async update(noteId: string, userId: string, role: string, input: Partial<CreateMapNoteInput>) {
      const note = await prisma.mapNote.findFirst({
        where: { id: noteId },
      });
      if (!note) throw new NotFoundError("Map note");

      const isGm = ["GM", "CO_GM"].includes(role);
      if (!isGm && note.authorId !== userId) {
        throw new ForbiddenError("Você só pode editar suas próprias notas");
      }

      const data: any = {};
      if (input.content !== undefined) data.content = input.content;
      if (input.icon !== undefined) data.icon = input.icon;
      if (input.color !== undefined) data.color = input.color;
      if (input.x !== undefined) data.x = input.x;
      if (input.y !== undefined) data.y = input.y;
      if (input.visibility !== undefined) {
        if (!isGm && input.visibility !== "PERSONAL") {
          throw new ForbiddenError("Jogadores só podem criar notas pessoais");
        }
        data.visibility = input.visibility;
      }

      const updated = await prisma.mapNote.update({
        where: { id: noteId },
        data,
      });

      return this.format(updated);
    },

    format(note: any) {
      return {
        id: note.id,
        mapId: note.mapId,
        authorId: note.authorId,
        x: note.x,
        y: note.y,
        content: note.content,
        icon: note.icon,
        color: note.color,
        visibility: note.visibility,
        createdAt: note.createdAt.toISOString(),
      };
    },
  };
}
