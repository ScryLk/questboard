// ── Service de entidades do Mundo ──
//
// Discriminator único `kind` (NPC, LOCATION, FACTION, LORE).
// Permissão: GM/CO_GM da campanha pra editar (validado no router via
// requireCampaignGm). Membros podem listar; notas privadas (`notes`
// field) ficam ocultas pra não-GMs no controller.

import type { PrismaClient } from "@questboard/db";
import type {
  WorldEntityCreate,
  WorldEntityListQuery,
  WorldEntityUpdate,
} from "@questboard/validators";
import { NotFoundError } from "../../errors/app-error.js";

export function createWorldService(prisma: PrismaClient) {
  return {
    async list(campaignId: string, query: WorldEntityListQuery = {}) {
      return prisma.worldEntity.findMany({
        where: {
          campaignId,
          deletedAt: null,
          ...(query.kind ? { kind: query.kind } : {}),
        },
        orderBy: [{ kind: "asc" }, { name: "asc" }],
      });
    },

    async getById(id: string) {
      const entity = await prisma.worldEntity.findFirst({
        where: { id, deletedAt: null },
      });
      if (!entity) throw new NotFoundError("WorldEntity");
      return entity;
    },

    async create(
      campaignId: string,
      authorId: string,
      input: WorldEntityCreate,
    ) {
      // Disposition só faz sentido em NPC e FACTION.
      const dispositionAllowed =
        input.kind === "NPC" || input.kind === "FACTION";
      const locationAllowed = input.kind === "NPC" || input.kind === "FACTION";

      return prisma.worldEntity.create({
        data: {
          campaignId,
          authorId,
          kind: input.kind,
          name: input.name,
          description: input.description,
          ...(input.subtitle !== undefined ? { subtitle: input.subtitle } : {}),
          ...(locationAllowed && input.location !== undefined
            ? { location: input.location }
            : {}),
          ...(dispositionAllowed && input.disposition !== undefined
            ? { disposition: input.disposition }
            : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
          ...(input.characterId !== undefined
            ? { characterId: input.characterId }
            : {}),
        },
      });
    },

    async update(id: string, input: WorldEntityUpdate) {
      const existing = await prisma.worldEntity.findFirst({
        where: { id, deletedAt: null },
        select: { kind: true },
      });
      if (!existing) throw new NotFoundError("WorldEntity");

      const dispositionAllowed =
        existing.kind === "NPC" || existing.kind === "FACTION";
      const locationAllowed = existing.kind === "NPC" || existing.kind === "FACTION";

      return prisma.worldEntity.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
          ...(input.subtitle !== undefined ? { subtitle: input.subtitle } : {}),
          ...(locationAllowed && input.location !== undefined
            ? { location: input.location }
            : {}),
          ...(dispositionAllowed && input.disposition !== undefined
            ? { disposition: input.disposition }
            : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
          ...(input.characterId !== undefined
            ? { characterId: input.characterId }
            : {}),
        },
      });
    },

    async delete(id: string) {
      const existing = await prisma.worldEntity.findUnique({
        where: { id },
        select: { id: true, deletedAt: true },
      });
      if (!existing) throw new NotFoundError("WorldEntity");
      if (existing.deletedAt) return existing;
      // Soft delete preserva histórico.
      return prisma.worldEntity.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    },

    async linkCharacter(id: string, characterId: string | null) {
      const existing = await prisma.worldEntity.findFirst({
        where: { id, deletedAt: null },
        select: { kind: true },
      });
      if (!existing) throw new NotFoundError("WorldEntity");
      // Só faz sentido pra kind=NPC.
      if (existing.kind !== "NPC") {
        return prisma.worldEntity.findUnique({ where: { id } });
      }
      return prisma.worldEntity.update({
        where: { id },
        data: { characterId },
      });
    },
  };
}

export type WorldService = ReturnType<typeof createWorldService>;
