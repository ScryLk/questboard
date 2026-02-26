import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerLootHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  socket.on("loot:add", async (data, ack) => {
    if (!socket.ctx.sessionId) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem sessão ativa" } });
    }

    try {
      const loot = await prisma.partyLoot.create({
        data: {
          sessionId: socket.ctx.sessionId,
          name: data.name,
          description: data.description ?? null,
          quantity: data.quantity ?? 1,
          itemType: data.itemType ?? "misc",
          value: data.value ?? null,
          rarity: data.rarity ?? null,
          source: data.source ?? null,
          status: "UNCLAIMED",
          addedById: socket.ctx.userId!,
        },
      });

      io.to(socket.ctx.sessionId).emit("loot:added", {
        id: loot.id,
        name: loot.name,
        description: loot.description,
        quantity: loot.quantity,
        itemType: loot.itemType,
        value: loot.value,
        rarity: loot.rarity,
        source: loot.source,
        status: loot.status,
        addedById: loot.addedById,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao adicionar loot" } });
    }
  });

  socket.on("loot:claim", async (data, ack) => {
    if (!socket.ctx.sessionId) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem sessão ativa" } });
    }

    try {
      const loot = await prisma.partyLoot.findFirst({
        where: { id: data.lootId, sessionId: socket.ctx.sessionId },
      });
      if (!loot) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "Loot não encontrado" } });
      }
      if (loot.status !== "UNCLAIMED") {
        return ack({ success: false, error: { code: "BAD_REQUEST", message: "Item já reivindicado" } });
      }

      await prisma.partyLoot.update({
        where: { id: data.lootId },
        data: { status: "CLAIMED", claimedById: socket.ctx.userId },
      });

      io.to(socket.ctx.sessionId).emit("loot:claimed", {
        lootId: data.lootId,
        claimedById: socket.ctx.userId!,
        name: loot.name,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao reivindicar loot" } });
    }
  });

  socket.on("loot:approve", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem aprovar loot" } });
    }

    try {
      const loot = await prisma.partyLoot.findFirst({
        where: { id: data.lootId, sessionId: socket.ctx.sessionId },
      });
      if (!loot || loot.status !== "CLAIMED") {
        return ack({ success: false, error: { code: "BAD_REQUEST", message: "Item não está pendente de aprovação" } });
      }

      await prisma.partyLoot.update({
        where: { id: data.lootId },
        data: { status: "DISTRIBUTED", approvedByGm: true },
      });

      io.to(socket.ctx.sessionId).emit("loot:distributed", {
        lootId: data.lootId,
        distributedTo: loot.claimedById!,
        name: loot.name,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao aprovar loot" } });
    }
  });

  socket.on("loot:reject", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem rejeitar loot" } });
    }

    try {
      await prisma.partyLoot.update({
        where: { id: data.lootId },
        data: { status: "UNCLAIMED", claimedById: null },
      });

      io.to(socket.ctx.sessionId).emit("loot:added", {
        id: data.lootId,
        status: "UNCLAIMED",
        name: "",
        description: null,
        quantity: 0,
        itemType: "misc",
        value: null,
        rarity: null,
        source: null,
        addedById: "",
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao rejeitar loot" } });
    }
  });
}
