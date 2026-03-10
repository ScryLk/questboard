import type { PrismaClient } from "@questboard/db";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";
import { PLAN_LIMITS } from "../../config/plan-limits.js";

type PlanKey = keyof typeof PLAN_LIMITS;

export function createCharacterService(prisma: PrismaClient) {
  return {
    async list(userId: string) {
      return prisma.character.findMany({
        where: { userId, deletedAt: null },
        orderBy: { updatedAt: "desc" },
      });
    },

    async getById(characterId: string) {
      const character = await prisma.character.findFirst({
        where: { id: characterId, deletedAt: null },
      });
      if (!character) throw new NotFoundError("Character");
      return character;
    },

    async create(userId: string, plan: string, input: {
      name: string; system: string; race?: string; class?: string;
      level?: number; avatarUrl?: string; campaignId?: string;
      attributes?: Record<string, unknown>;
    }) {
      const limits = PLAN_LIMITS[plan as PlanKey] ?? PLAN_LIMITS.FREE;
      if (limits.maxCharacters !== -1) {
        const count = await prisma.character.count({ where: { userId, deletedAt: null } });
        if (count >= limits.maxCharacters) {
          throw new ForbiddenError("Limite de personagens atingido");
        }
      }

      return prisma.character.create({
        data: {
          userId,
          name: input.name,
          system: input.system,
          race: input.race,
          class: input.class,
          level: input.level ?? 1,
          avatarUrl: input.avatarUrl,
          campaignId: input.campaignId,
          attributes: input.attributes ?? {},
        },
      });
    },

    async update(characterId: string, userId: string, input: Record<string, unknown>) {
      const character = await prisma.character.findFirst({ where: { id: characterId, deletedAt: null } });
      if (!character) throw new NotFoundError("Character");
      if (character.userId !== userId) throw new ForbiddenError("Sem permissão");

      return prisma.character.update({ where: { id: characterId }, data: input });
    },

    async delete(characterId: string, userId: string) {
      const character = await prisma.character.findFirst({ where: { id: characterId, deletedAt: null } });
      if (!character) throw new NotFoundError("Character");
      if (character.userId !== userId) throw new ForbiddenError("Sem permissão");

      return prisma.character.update({ where: { id: characterId }, data: { deletedAt: new Date() } });
    },

    async updateResources(characterId: string, userId: string, resources: Record<string, unknown>) {
      const character = await prisma.character.findFirst({ where: { id: characterId, deletedAt: null } });
      if (!character) throw new NotFoundError("Character");
      if (character.userId !== userId) throw new ForbiddenError("Sem permissão");

      return prisma.character.update({
        where: { id: characterId },
        data: { resources },
      });
    },
  };
}

export type CharacterService = ReturnType<typeof createCharacterService>;
