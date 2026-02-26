import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerMapNoteHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  socket.on("mapnote:add", async (data, ack) => {
    if (!socket.ctx.sessionId) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem sessão ativa" } });
    }

    try {
      const isGm = ["GM", "CO_GM"].includes(socket.ctx.role!);
      const visibility = isGm ? (data.visibility ?? "ALL") : "PERSONAL";

      const note = await prisma.mapNote.create({
        data: {
          mapId: data.mapId,
          authorId: socket.ctx.userId!,
          x: data.x,
          y: data.y,
          content: data.content,
          icon: data.icon ?? "📌",
          color: data.color ?? "#6C5CE7",
          visibility: visibility as any,
        },
      });

      const noteData = {
        id: note.id,
        mapId: note.mapId,
        x: note.x,
        y: note.y,
        content: note.content,
        icon: note.icon,
        color: note.color,
        visibility: note.visibility,
        authorId: note.authorId,
      };

      // Route based on visibility
      if (visibility === "ALL" || visibility === "PARTY") {
        io.to(socket.ctx.sessionId).emit("mapnote:added", noteData);
      } else if (visibility === "GM_ONLY") {
        const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
        for (const s of sockets) {
          const ctx = (s as any).ctx;
          if (ctx && ["GM", "CO_GM"].includes(ctx.role)) {
            s.emit("mapnote:added", noteData);
          }
        }
      } else {
        // PERSONAL - only emit to the creator
        socket.emit("mapnote:added", noteData);
      }

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao adicionar nota" } });
    }
  });

  socket.on("mapnote:remove", async (data, ack) => {
    if (!socket.ctx.sessionId) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem sessão ativa" } });
    }

    try {
      const note = await prisma.mapNote.findFirst({
        where: { id: data.noteId },
      });
      if (!note) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "Nota não encontrada" } });
      }

      const isGm = ["GM", "CO_GM"].includes(socket.ctx.role!);
      if (!isGm && note.authorId !== socket.ctx.userId) {
        return ack({ success: false, error: { code: "FORBIDDEN", message: "Só pode deletar suas notas" } });
      }

      await prisma.mapNote.delete({ where: { id: data.noteId } });

      io.to(socket.ctx.sessionId).emit("mapnote:removed", {
        noteId: data.noteId,
        mapId: note.mapId,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao remover nota" } });
    }
  });
}
