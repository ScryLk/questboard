import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerEmoteHandlers(io: TypedIO, socket: TypedSocket, _prisma: PrismaClient) {
  socket.on("character:emote", async (data, ack) => {
    if (!socket.ctx.sessionId) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem sessão ativa" } });
    }

    try {
      io.to(socket.ctx.sessionId).emit("character:emote", {
        userId: socket.ctx.userId!,
        characterId: data.characterId,
        emote: data.emote,
        animation: data.animation,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao enviar emote" } });
    }
  });
}
