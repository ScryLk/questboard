import type { PrismaClient } from "@questboard/db";
import type { CreateNpcProfileInput, UpdateNpcProfileInput, SetNpcDispositionInput, NpcQuery } from "@questboard/shared";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createNpcProfilesService(prisma: PrismaClient) {
  return {
    async create(sessionId: string, userId: string, role: string, input: CreateNpcProfileInput) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem criar perfis de NPC");
      }

      const npc = await prisma.npcProfile.create({
        data: {
          sessionId,
          name: input.name,
          title: input.title,
          description: input.description,
          portraitUrl: input.portraitUrl,
          tokenId: input.tokenId,
          quickStats: (input.quickStats ?? {}) as any,
          dispositions: {} as any,
          personality: (input.personality ?? {}) as any,
          notes: input.notes,
          tags: input.tags ?? [],
          isRecurring: input.isRecurring ?? false,
          createdById: userId,
        },
      });

      return this.format(npc, role);
    },

    async getById(sessionId: string, npcId: string, role: string) {
      const npc = await prisma.npcProfile.findFirst({
        where: { id: npcId, sessionId },
      });
      if (!npc) throw new NotFoundError("NPC profile");

      return this.format(npc, role);
    },

    async list(sessionId: string, role: string, query: NpcQuery) {
      const where: any = { sessionId };

      if (query.search) {
        where.name = { contains: query.search, mode: "insensitive" };
      }
      if (query.tag) {
        where.tags = { has: query.tag };
      }

      const npcs = await prisma.npcProfile.findMany({
        where,
        orderBy: { name: "asc" },
        take: query.limit ?? 50,
        skip: query.offset ?? 0,
      });

      return npcs.map((n) => this.format(n, role));
    },

    async update(sessionId: string, npcId: string, role: string, input: UpdateNpcProfileInput) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem editar perfis de NPC");
      }

      const npc = await prisma.npcProfile.findFirst({
        where: { id: npcId, sessionId },
      });
      if (!npc) throw new NotFoundError("NPC profile");

      const data: any = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.title !== undefined) data.title = input.title;
      if (input.description !== undefined) data.description = input.description;
      if (input.portraitUrl !== undefined) data.portraitUrl = input.portraitUrl;
      if (input.tokenId !== undefined) data.tokenId = input.tokenId;
      if (input.quickStats !== undefined) data.quickStats = input.quickStats;
      if (input.personality !== undefined) data.personality = input.personality;
      if (input.notes !== undefined) data.notes = input.notes;
      if (input.tags !== undefined) data.tags = input.tags;
      if (input.isRecurring !== undefined) data.isRecurring = input.isRecurring;

      const updated = await prisma.npcProfile.update({
        where: { id: npcId },
        data,
      });

      return this.format(updated, role);
    },

    async setDisposition(sessionId: string, npcId: string, role: string, input: SetNpcDispositionInput) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem definir disposições de NPC");
      }

      const npc = await prisma.npcProfile.findFirst({
        where: { id: npcId, sessionId },
      });
      if (!npc) throw new NotFoundError("NPC profile");

      const dispositions = (npc.dispositions as Record<string, any>) ?? {};
      dispositions[input.userId] = {
        attitude: input.attitude,
        notes: input.notes,
        updatedAt: new Date().toISOString(),
      };

      const updated = await prisma.npcProfile.update({
        where: { id: npcId },
        data: { dispositions: dispositions as any },
      });

      return this.format(updated, role);
    },

    async delete(sessionId: string, npcId: string, role: string) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem deletar perfis de NPC");
      }
      const npc = await prisma.npcProfile.findFirst({
        where: { id: npcId, sessionId },
      });
      if (!npc) throw new NotFoundError("NPC profile");
      await prisma.npcProfile.delete({ where: { id: npcId } });
    },

    format(npc: any, role: string) {
      const isGm = ["GM", "CO_GM"].includes(role);

      return {
        id: npc.id,
        sessionId: npc.sessionId,
        name: npc.name,
        title: npc.title,
        description: npc.description,
        portraitUrl: npc.portraitUrl,
        tokenId: npc.tokenId,
        quickStats: isGm ? npc.quickStats : { hp: (npc.quickStats as any)?.hp },
        dispositions: isGm ? npc.dispositions : {},
        personality: isGm ? npc.personality : {},
        notes: isGm ? npc.notes : null,
        tags: npc.tags,
        isRecurring: npc.isRecurring,
        createdById: npc.createdById,
        createdAt: npc.createdAt.toISOString(),
        updatedAt: npc.updatedAt.toISOString(),
      };
    },
  };
}
