import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerSceneCardHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  socket.on("scene:show-card", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem mostrar scene cards" } });
    }

    try {
      const card = await prisma.sceneCard.create({
        data: {
          sessionId: socket.ctx.sessionId,
          title: data.title,
          subtitle: data.subtitle ?? null,
          imageUrl: data.imageUrl ?? null,
          style: (data.style as any) ?? "CINEMATIC",
          duration: data.duration ?? 5,
          animation: data.animation ?? "fade",
          soundEffect: data.soundEffect ?? null,
          dimBackground: data.dimBackground ?? true,
          shownAt: new Date(),
          shownById: socket.ctx.userId!,
        },
      });

      io.to(socket.ctx.sessionId).emit("scene:card-shown", {
        id: card.id,
        title: card.title,
        subtitle: card.subtitle,
        imageUrl: card.imageUrl,
        style: card.style,
        duration: card.duration,
        animation: card.animation,
        soundEffect: card.soundEffect,
        dimBackground: card.dimBackground,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao mostrar scene card" } });
    }
  });

  socket.on("scene:dismiss-card", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem dispensar scene cards" } });
    }

    io.to(socket.ctx.sessionId).emit("scene:card-dismissed", { cardId: data.cardId });
    ack({ success: true });
  });
}
