import type { PrismaClient, Prisma } from "@questboard/db";
import type { CreateAnnotationInput } from "@questboard/shared";
import { ForbiddenError } from "../../errors/app-error.js";

export function createAnnotationsService(prisma: PrismaClient) {
  async function assertSessionPlayer(sessionId: string, userId: string) {
    const player = await prisma.sessionPlayer.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    if (!player) throw new ForbiddenError("Não é jogador");
    return player;
  }

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
    async list(mapId: string, userId: string, sessionId: string) {
      const player = await assertSessionPlayer(sessionId, userId);
      const isGm = ["GM", "CO_GM"].includes(player.role);

      if (isGm) {
        return prisma.mapAnnotation.findMany({ where: { mapId } });
      }

      // Non-GM players see ALL and their own SPECIFIC annotations
      return prisma.mapAnnotation.findMany({
        where: {
          mapId,
          OR: [
            { visibleTo: "ALL" },
            { visibleTo: "SPECIFIC", authorId: userId },
          ],
        },
      });
    },

    async create(sessionId: string, userId: string, mapId: string, input: CreateAnnotationInput) {
      await assertSessionPlayer(sessionId, userId);

      return prisma.mapAnnotation.create({
        data: {
          mapId,
          authorId: userId,
          type: input.type as any,
          data: input.data as Prisma.InputJsonValue,
          visibleTo: (input.visibleTo as any) ?? "ALL",
          isPersistent: input.isPersistent ?? false,
        },
      });
    },

    async clearNonPersistent(sessionId: string, userId: string, mapId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const result = await prisma.mapAnnotation.deleteMany({
        where: { mapId, isPersistent: false },
      });
      return { cleared: result.count };
    },

    async clearAll(sessionId: string, userId: string, mapId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const result = await prisma.mapAnnotation.deleteMany({ where: { mapId } });
      return { cleared: result.count };
    },
  };
}

export type AnnotationsService = ReturnType<typeof createAnnotationsService>;
