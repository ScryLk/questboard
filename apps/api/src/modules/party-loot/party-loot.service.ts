import type { PrismaClient } from "@questboard/db";
import type { AddLootInput, LootQuery } from "@questboard/shared";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../errors/app-error.js";

export function createPartyLootService(prisma: PrismaClient) {
  return {
    async add(sessionId: string, userId: string, _role: string, input: AddLootInput) {
      const loot = await prisma.partyLoot.create({
        data: {
          sessionId,
          name: input.name,
          description: input.description,
          quantity: input.quantity ?? 1,
          itemType: input.itemType,
          value: input.value as any,
          source: input.source,
          foundOnMapId: input.foundOnMapId,
          status: "UNCLAIMED",
          addedById: userId,
        },
      });

      return this.format(loot);
    },

    async list(sessionId: string, query: LootQuery) {
      const where: any = { sessionId };
      if (query.status) where.status = query.status;

      const loot = await prisma.partyLoot.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query.limit ?? 50,
        skip: query.offset ?? 0,
      });

      return loot.map(this.format);
    },

    async getById(sessionId: string, lootId: string) {
      const loot = await prisma.partyLoot.findFirst({
        where: { id: lootId, sessionId },
      });
      if (!loot) throw new NotFoundError("Loot");
      return this.format(loot);
    },

    async claim(sessionId: string, lootId: string, userId: string) {
      const loot = await prisma.partyLoot.findFirst({
        where: { id: lootId, sessionId },
      });
      if (!loot) throw new NotFoundError("Loot");

      if (loot.status !== "UNCLAIMED") {
        throw new BadRequestError("Este item já foi reivindicado ou distribuído");
      }

      const updated = await prisma.partyLoot.update({
        where: { id: lootId },
        data: {
          status: "CLAIMED",
          claimedById: userId,
          claimedAt: new Date(),
        },
      });

      return this.format(updated);
    },

    async approveClaim(sessionId: string, lootId: string, role: string) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem aprovar reivindicações");
      }

      const loot = await prisma.partyLoot.findFirst({
        where: { id: lootId, sessionId },
      });
      if (!loot) throw new NotFoundError("Loot");

      if (loot.status !== "CLAIMED") {
        throw new BadRequestError("Este item não está aguardando aprovação");
      }

      const updated = await prisma.partyLoot.update({
        where: { id: lootId },
        data: {
          status: "DISTRIBUTED",
          approvedByGm: true,
        },
      });

      return this.format(updated);
    },

    async rejectClaim(sessionId: string, lootId: string, role: string) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem rejeitar reivindicações");
      }

      const loot = await prisma.partyLoot.findFirst({
        where: { id: lootId, sessionId },
      });
      if (!loot) throw new NotFoundError("Loot");

      if (loot.status !== "CLAIMED") {
        throw new BadRequestError("Este item não está aguardando aprovação");
      }

      const updated = await prisma.partyLoot.update({
        where: { id: lootId },
        data: {
          status: "UNCLAIMED",
          claimedById: null,
          claimedAt: null,
        },
      });

      return this.format(updated);
    },

    async distribute(sessionId: string, lootId: string, toUserId: string, role: string) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem distribuir loot diretamente");
      }

      const loot = await prisma.partyLoot.findFirst({
        where: { id: lootId, sessionId },
      });
      if (!loot) throw new NotFoundError("Loot");

      const updated = await prisma.partyLoot.update({
        where: { id: lootId },
        data: {
          status: "DISTRIBUTED",
          claimedById: toUserId,
          approvedByGm: true,
        },
      });

      return this.format(updated);
    },

    async delete(sessionId: string, lootId: string, role: string) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem deletar loot");
      }
      const loot = await prisma.partyLoot.findFirst({
        where: { id: lootId, sessionId },
      });
      if (!loot) throw new NotFoundError("Loot");
      await prisma.partyLoot.delete({ where: { id: lootId } });
    },

    format(loot: any) {
      return {
        id: loot.id,
        sessionId: loot.sessionId,
        name: loot.name,
        description: loot.description,
        quantity: loot.quantity,
        itemType: loot.itemType,
        value: loot.value,
        status: loot.status,
        source: loot.source,
        foundOnMapId: loot.foundOnMapId,
        claimedById: loot.claimedById,
        claimedAt: loot.claimedAt?.toISOString() ?? null,
        approvedByGm: loot.approvedByGm,
        addedById: loot.addedById,
        createdAt: loot.createdAt.toISOString(),
        updatedAt: loot.updatedAt.toISOString(),
      };
    },
  };
}
