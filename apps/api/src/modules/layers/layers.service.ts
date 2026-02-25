import type { PrismaClient, Prisma } from "@questboard/db";
import type { CreateLayerInput, UpdateLayerInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../errors/app-error.js";

export function createLayersService(prisma: PrismaClient) {
  async function assertGmOrCoGm(sessionId: string, userId: string) {
    const player = await prisma.sessionPlayer.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    if (!player || !["GM", "CO_GM"].includes(player.role)) {
      throw new ForbiddenError("Sem permissão");
    }
    return player;
  }

  async function getMaxLayersLimit(sessionId: string): Promise<number> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { owner: { include: { plan: { include: { limits: true } } } } },
    });
    return session?.owner?.plan?.limits?.maxMapLayers ?? 0;
  }

  return {
    async list(mapId: string) {
      return prisma.mapLayer.findMany({
        where: { mapId },
        orderBy: { sortOrder: "asc" },
      });
    },

    async create(sessionId: string, userId: string, mapId: string, input: CreateLayerInput) {
      await assertGmOrCoGm(sessionId, userId);

      // Check plan limits
      const maxLayers = await getMaxLayersLimit(sessionId);
      const currentCount = await prisma.mapLayer.count({ where: { mapId } });
      if (maxLayers > 0 && currentCount >= maxLayers) {
        throw new BadRequestError(`Limite de camadas atingido (${maxLayers})`);
      }

      const nextOrder = currentCount;

      return prisma.mapLayer.create({
        data: {
          mapId,
          name: input.name,
          layerType: (input.layerType as any) ?? "DRAWING",
          isVisible: input.isVisible ?? true,
          opacity: input.opacity ?? 1.0,
          sortOrder: nextOrder,
          metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
    },

    async update(sessionId: string, userId: string, layerId: string, input: UpdateLayerInput) {
      await assertGmOrCoGm(sessionId, userId);

      const layer = await prisma.mapLayer.findUnique({ where: { id: layerId } });
      if (!layer) throw new NotFoundError("MapLayer");

      const data: Prisma.MapLayerUpdateInput = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.isVisible !== undefined) data.isVisible = input.isVisible;
      if (input.isLocked !== undefined) data.isLocked = input.isLocked;
      if (input.opacity !== undefined) data.opacity = input.opacity;
      if (input.objects !== undefined) data.objects = input.objects as Prisma.InputJsonValue;
      if (input.metadata !== undefined) data.metadata = input.metadata as Prisma.InputJsonValue;

      return prisma.mapLayer.update({ where: { id: layerId }, data });
    },

    async reorder(sessionId: string, userId: string, layerIds: string[]) {
      await assertGmOrCoGm(sessionId, userId);

      const updates = layerIds.map((id, index) =>
        prisma.mapLayer.update({ where: { id }, data: { sortOrder: index } })
      );
      await prisma.$transaction(updates);
    },

    async delete(sessionId: string, userId: string, layerId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const layer = await prisma.mapLayer.findUnique({ where: { id: layerId } });
      if (!layer) throw new NotFoundError("MapLayer");

      await prisma.mapLayer.delete({ where: { id: layerId } });
    },
  };
}

export type LayersService = ReturnType<typeof createLayersService>;
