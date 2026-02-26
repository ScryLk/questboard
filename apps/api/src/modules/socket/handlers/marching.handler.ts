import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerMarchingHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  socket.on("marching:set", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem definir ordem de marcha" } });
    }

    try {
      const existing = await prisma.marchingOrder.findFirst({
        where: { sessionId: socket.ctx.sessionId },
      });

      let order;
      if (existing) {
        order = await prisma.marchingOrder.update({
          where: { id: existing.id },
          data: {
            formation: data.formation as any,
            isActive: data.isActive ?? existing.isActive,
            rules: data.rules as any ?? existing.rules,
          },
        });
      } else {
        order = await prisma.marchingOrder.create({
          data: {
            sessionId: socket.ctx.sessionId,
            formation: data.formation as any,
            isActive: data.isActive ?? true,
            rules: data.rules as any ?? {},
          },
        });
      }

      io.to(socket.ctx.sessionId).emit("marching:updated", {
        formation: order.formation as any[],
        isActive: order.isActive,
        rules: order.rules as any,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao definir ordem de marcha" } });
    }
  });

  socket.on("marching:toggle", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem ativar/desativar marcha" } });
    }

    try {
      const existing = await prisma.marchingOrder.findFirst({
        where: { sessionId: socket.ctx.sessionId },
      });

      if (!existing) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "Ordem de marcha não encontrada" } });
      }

      const order = await prisma.marchingOrder.update({
        where: { id: existing.id },
        data: { isActive: data.isActive },
      });

      io.to(socket.ctx.sessionId).emit("marching:updated", {
        formation: order.formation as any[],
        isActive: order.isActive,
        rules: order.rules as any,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao alternar marcha" } });
    }
  });
}
