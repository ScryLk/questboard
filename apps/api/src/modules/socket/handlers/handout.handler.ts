import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

interface HandoutSection {
  id: string;
  title: string;
  content?: string;
  imageUrl?: string;
  isRevealed: boolean;
  revealedAt?: string;
  revealedTo: string[];
  sortOrder: number;
}

export function registerHandoutHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  socket.on("handout:reveal-section", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem revelar seções" } });
    }

    try {
      const handout = await prisma.handout.findFirst({
        where: { id: data.handoutId, sessionId: socket.ctx.sessionId },
      });
      if (!handout) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "Handout não encontrado" } });
      }

      const sections = (handout.sections as HandoutSection[]) ?? [];
      const sectionIdx = sections.findIndex((s) => s.id === data.sectionId);
      if (sectionIdx === -1) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "Seção não encontrada" } });
      }

      const section = sections[sectionIdx]!;
      section.isRevealed = true;
      section.revealedAt = new Date().toISOString();

      if (data.revealTo && data.revealTo.length > 0) {
        const existing = new Set(section.revealedTo);
        data.revealTo.forEach((id) => existing.add(id));
        section.revealedTo = Array.from(existing);
      }

      await prisma.handout.update({
        where: { id: data.handoutId },
        data: { sections: sections as any },
      });

      // Broadcast to appropriate players
      if (data.revealTo && data.revealTo.length > 0) {
        // Reveal to specific players + GMs
        const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
        for (const s of sockets) {
          const ctx = (s as any).ctx;
          if (!ctx) continue;
          if (data.revealTo.includes(ctx.userId) || ["GM", "CO_GM"].includes(ctx.role)) {
            s.emit("handout:section-revealed", {
              handoutId: data.handoutId,
              sectionId: data.sectionId,
              title: section.title,
              content: section.content ?? "",
              imageUrl: section.imageUrl,
            });
          }
        }
      } else {
        // Reveal to all
        io.to(socket.ctx.sessionId).emit("handout:section-revealed", {
          handoutId: data.handoutId,
          sectionId: data.sectionId,
          title: section.title,
          content: section.content ?? "",
          imageUrl: section.imageUrl,
        });
      }

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao revelar seção" } });
    }
  });
}
