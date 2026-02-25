import type { PrismaClient, Prisma } from "@questboard/db";
import type { CreateFogAreaInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createFogService(prisma: PrismaClient) {
  async function assertGmOrCoGm(sessionId: string, userId: string) {
    const player = await prisma.sessionPlayer.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    if (!player || !["GM", "CO_GM"].includes(player.role)) {
      throw new ForbiddenError("Sem permissão");
    }
    return player;
  }

  return {
    async list(mapId: string) {
      return prisma.fogArea.findMany({ where: { mapId } });
    },

    async create(sessionId: string, userId: string, mapId: string, input: CreateFogAreaInput) {
      await assertGmOrCoGm(sessionId, userId);

      return prisma.fogArea.create({
        data: {
          mapId,
          shapeType: input.shapeType as any,
          geometry: input.geometry as Prisma.InputJsonValue,
          isRevealed: input.isRevealed ?? false,
          metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
    },

    async reveal(sessionId: string, userId: string, fogAreaId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const area = await prisma.fogArea.findUnique({ where: { id: fogAreaId } });
      if (!area) throw new NotFoundError("FogArea");

      return prisma.fogArea.update({
        where: { id: fogAreaId },
        data: { isRevealed: true },
      });
    },

    async hide(sessionId: string, userId: string, fogAreaId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const area = await prisma.fogArea.findUnique({ where: { id: fogAreaId } });
      if (!area) throw new NotFoundError("FogArea");

      return prisma.fogArea.update({
        where: { id: fogAreaId },
        data: { isRevealed: false },
      });
    },

    async batchReveal(sessionId: string, userId: string, fogAreaIds: string[]) {
      await assertGmOrCoGm(sessionId, userId);

      await prisma.fogArea.updateMany({
        where: { id: { in: fogAreaIds } },
        data: { isRevealed: true },
      });

      return { revealed: fogAreaIds.length };
    },

    async revealAll(sessionId: string, userId: string, mapId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const result = await prisma.fogArea.updateMany({
        where: { mapId, isRevealed: false },
        data: { isRevealed: true },
      });

      return { revealed: result.count };
    },

    async hideAll(sessionId: string, userId: string, mapId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const result = await prisma.fogArea.updateMany({
        where: { mapId, isRevealed: true },
        data: { isRevealed: false },
      });

      return { hidden: result.count };
    },

    async reset(sessionId: string, userId: string, mapId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const result = await prisma.fogArea.deleteMany({ where: { mapId } });
      return { deleted: result.count };
    },

    async delete(sessionId: string, userId: string, fogAreaId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const area = await prisma.fogArea.findUnique({ where: { id: fogAreaId } });
      if (!area) throw new NotFoundError("FogArea");

      await prisma.fogArea.delete({ where: { id: fogAreaId } });
    },
  };
}

export type FogService = ReturnType<typeof createFogService>;
