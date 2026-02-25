import type { PrismaClient, Prisma } from "@questboard/db";
import type { CreateMapInput, UpdateMapInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createMapsService(prisma: PrismaClient) {
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
    async list(sessionId: string) {
      return prisma.map.findMany({
        where: { sessionId, deletedAt: null },
        orderBy: { sortOrder: "asc" },
      });
    },

    async getById(mapId: string) {
      const map = await prisma.map.findUnique({
        where: { id: mapId, deletedAt: null },
        include: {
          tokens: true,
          fogAreas: true,
          walls: true,
          lightSources: true,
          layers: { orderBy: { sortOrder: "asc" } },
          annotations: true,
        },
      });
      if (!map) throw new NotFoundError("Mapa");
      return map;
    },

    async getFullState(mapId: string) {
      const map = await prisma.map.findUnique({
        where: { id: mapId, deletedAt: null },
        include: {
          tokens: true,
          fogAreas: true,
          walls: true,
          lightSources: true,
          layers: { orderBy: { sortOrder: "asc" } },
          annotations: true,
        },
      });
      if (!map) throw new NotFoundError("Mapa");
      return map;
    },

    async create(sessionId: string, userId: string, input: CreateMapInput & { imageUrl: string; imageWidth: number; imageHeight: number; fileSizeMb: number }) {
      await assertGmOrCoGm(sessionId, userId);

      const cellsWide = Math.ceil(input.imageWidth / (input.gridSize ?? 32));
      const cellsHigh = Math.ceil(input.imageHeight / (input.gridSize ?? 32));

      const map = await prisma.map.create({
        data: {
          sessionId,
          name: input.name,
          description: input.description,
          imageUrl: input.imageUrl,
          imageWidth: input.imageWidth,
          imageHeight: input.imageHeight,
          fileSizeMb: input.fileSizeMb,
          gridType: (input.gridType as any) ?? "SQUARE",
          gridSize: input.gridSize ?? 32,
          gridColor: input.gridColor ?? "#FFFFFF20",
          gridVisible: input.gridVisible ?? true,
          cellsWide,
          cellsHigh,
          settings: (input.settings ?? {}) as Prisma.InputJsonValue,
          metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });

      // If first map, activate it
      const mapCount = await prisma.map.count({ where: { sessionId, deletedAt: null } });
      if (mapCount === 1) {
        await this.setActive(sessionId, userId, map.id);
      }

      return map;
    },

    async update(sessionId: string, userId: string, mapId: string, input: UpdateMapInput) {
      await assertGmOrCoGm(sessionId, userId);

      const map = await prisma.map.findUnique({ where: { id: mapId, deletedAt: null } });
      if (!map) throw new NotFoundError("Mapa");

      const data: Prisma.MapUpdateInput = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.description !== undefined) data.description = input.description;
      if (input.gridType !== undefined) data.gridType = input.gridType as any;
      if (input.gridSize !== undefined) {
        data.gridSize = input.gridSize;
        data.cellsWide = Math.ceil(map.imageWidth / input.gridSize);
        data.cellsHigh = Math.ceil(map.imageHeight / input.gridSize);
      }
      if (input.gridOffsetX !== undefined) data.gridOffsetX = input.gridOffsetX;
      if (input.gridOffsetY !== undefined) data.gridOffsetY = input.gridOffsetY;
      if (input.gridColor !== undefined) data.gridColor = input.gridColor;
      if (input.gridVisible !== undefined) data.gridVisible = input.gridVisible;
      if (input.isLocked !== undefined) data.isLocked = input.isLocked;
      if (input.settings !== undefined) data.settings = input.settings as Prisma.InputJsonValue;
      if (input.metadata !== undefined) data.metadata = input.metadata as Prisma.InputJsonValue;

      return prisma.map.update({ where: { id: mapId }, data });
    },

    async delete(sessionId: string, userId: string, mapId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const map = await prisma.map.findUnique({ where: { id: mapId, deletedAt: null } });
      if (!map) throw new NotFoundError("Mapa");

      await prisma.map.update({
        where: { id: mapId },
        data: { deletedAt: new Date(), isActive: false },
      });
    },

    async setActive(sessionId: string, userId: string, mapId: string) {
      await assertGmOrCoGm(sessionId, userId);

      await prisma.$transaction([
        prisma.map.updateMany({
          where: { sessionId, isActive: true },
          data: { isActive: false },
        }),
        prisma.map.update({
          where: { id: mapId },
          data: { isActive: true },
        }),
      ]);

      return { mapId };
    },

    async reorder(sessionId: string, userId: string, mapIds: string[]) {
      await assertGmOrCoGm(sessionId, userId);

      const updates = mapIds.map((id, index) =>
        prisma.map.update({ where: { id }, data: { sortOrder: index } })
      );
      await prisma.$transaction(updates);
    },

    async getStorageUsage(sessionId: string): Promise<number> {
      const result = await prisma.map.aggregate({
        where: { sessionId, deletedAt: null },
        _sum: { fileSizeMb: true },
      });
      return result._sum.fileSizeMb ?? 0;
    },
  };
}

export type MapsService = ReturnType<typeof createMapsService>;
