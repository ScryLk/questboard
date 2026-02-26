import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerThoughtHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  socket.on("thought:send", async (data, ack) => {
    if (!socket.ctx.sessionId) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem sessão ativa" } });
    }

    try {
      const bubble = await prisma.thoughtBubble.create({
        data: {
          sessionId: socket.ctx.sessionId,
          userId: socket.ctx.userId!,
          characterId: data.characterId,
          content: data.content,
          position: data.position ?? null,
          isLocationBound: data.isLocationBound ?? false,
        },
      });

      // Only GM and the sender see thoughts by default
      const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
      for (const s of sockets) {
        const ctx = (s as any).ctx;
        if (!ctx) continue;
        if (["GM", "CO_GM"].includes(ctx.role) || ctx.userId === socket.ctx.userId) {
          s.emit("thought:shown", {
            id: bubble.id,
            characterId: bubble.characterId,
            content: bubble.content,
            position: bubble.position as any,
          });
        }
      }

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao enviar pensamento" } });
    }
  });
}
