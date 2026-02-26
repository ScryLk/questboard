import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerTradeHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  // In-memory trade tracking (per-session, expires on disconnect)
  const activeTrades = new Map<string, {
    offerId: string;
    fromUserId: string;
    toUserId: string;
    items: any[];
    createdAt: number;
  }>();

  socket.on("trade:offer", async (data, ack) => {
    if (!socket.ctx.sessionId) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem sessão ativa" } });
    }

    try {
      const offerId = `trade_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      activeTrades.set(offerId, {
        offerId,
        fromUserId: socket.ctx.userId!,
        toUserId: data.toUserId,
        items: data.items,
        createdAt: Date.now(),
      });

      // Send offer to target player
      const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
      for (const s of sockets) {
        const ctx = (s as any).ctx;
        if (ctx?.userId === data.toUserId) {
          s.emit("trade:offer-received", {
            offerId,
            fromUserId: socket.ctx.userId!,
            items: data.items,
          });
        }
      }

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao enviar oferta" } });
    }
  });

  socket.on("trade:accept", async (data, ack) => {
    if (!socket.ctx.sessionId) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem sessão ativa" } });
    }

    try {
      const trade = activeTrades.get(data.offerId);
      if (!trade || trade.toUserId !== socket.ctx.userId) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "Oferta não encontrada" } });
      }

      activeTrades.delete(data.offerId);

      // Notify both parties
      const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
      for (const s of sockets) {
        const ctx = (s as any).ctx;
        if (ctx?.userId === trade.fromUserId || ctx?.userId === trade.toUserId) {
          s.emit("trade:accepted", {
            offerId: data.offerId,
            fromUserId: trade.fromUserId,
            toUserId: trade.toUserId,
            items: trade.items,
          });
        }
      }

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao aceitar oferta" } });
    }
  });

  socket.on("trade:decline", async (data, ack) => {
    if (!socket.ctx.sessionId) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem sessão ativa" } });
    }

    try {
      const trade = activeTrades.get(data.offerId);
      if (!trade || trade.toUserId !== socket.ctx.userId) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "Oferta não encontrada" } });
      }

      activeTrades.delete(data.offerId);

      const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
      for (const s of sockets) {
        const ctx = (s as any).ctx;
        if (ctx?.userId === trade.fromUserId) {
          s.emit("trade:declined", { offerId: data.offerId });
        }
      }

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao recusar oferta" } });
    }
  });
}
