import type { PrismaClient, Prisma } from "@questboard/db";
import type { CreateMapZoneInput, UpdateMapZoneInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createZonesService(prisma: PrismaClient) {
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
      return prisma.mapZone.findMany({
        where: { mapId },
        orderBy: { sortOrder: "asc" },
      });
    },

    async create(sessionId: string, userId: string, mapId: string, input: CreateMapZoneInput) {
      await assertGmOrCoGm(sessionId, userId);

      return prisma.mapZone.create({
        data: {
          mapId,
          name: input.name,
          zoneType: input.zoneType as any,
          shapeType: input.shapeType,
          geometry: input.geometry as Prisma.InputJsonValue,
          properties: (input.properties ?? {}) as Prisma.InputJsonValue,
          isVisible: input.isVisible ?? true,
          visibleToGmOnly: input.visibleToGmOnly ?? false,
          overlayColor: input.overlayColor,
          metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
    },

    async batchCreate(sessionId: string, userId: string, mapId: string, zones: CreateMapZoneInput[]) {
      await assertGmOrCoGm(sessionId, userId);

      const created = [];
      for (const input of zones) {
        const zone = await prisma.mapZone.create({
          data: {
            mapId,
            name: input.name,
            zoneType: input.zoneType as any,
            shapeType: input.shapeType,
            geometry: input.geometry as Prisma.InputJsonValue,
            properties: (input.properties ?? {}) as Prisma.InputJsonValue,
            isVisible: input.isVisible ?? true,
            visibleToGmOnly: input.visibleToGmOnly ?? false,
            overlayColor: input.overlayColor,
            metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
          },
        });
        created.push(zone);
      }
      return created;
    },

    async update(sessionId: string, userId: string, zoneId: string, input: UpdateMapZoneInput) {
      await assertGmOrCoGm(sessionId, userId);

      const zone = await prisma.mapZone.findUnique({ where: { id: zoneId } });
      if (!zone) throw new NotFoundError("MapZone");

      const data: Prisma.MapZoneUpdateInput = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.zoneType !== undefined) data.zoneType = input.zoneType as any;
      if (input.shapeType !== undefined) data.shapeType = input.shapeType;
      if (input.geometry !== undefined) data.geometry = input.geometry as Prisma.InputJsonValue;
      if (input.properties !== undefined) data.properties = input.properties as Prisma.InputJsonValue;
      if (input.isVisible !== undefined) data.isVisible = input.isVisible;
      if (input.visibleToGmOnly !== undefined) data.visibleToGmOnly = input.visibleToGmOnly;
      if (input.overlayColor !== undefined) data.overlayColor = input.overlayColor;
      if (input.isActive !== undefined) data.isActive = input.isActive;
      if (input.metadata !== undefined) data.metadata = input.metadata as Prisma.InputJsonValue;

      return prisma.mapZone.update({ where: { id: zoneId }, data });
    },

    async delete(sessionId: string, userId: string, zoneId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const zone = await prisma.mapZone.findUnique({ where: { id: zoneId } });
      if (!zone) throw new NotFoundError("MapZone");

      await prisma.mapZone.delete({ where: { id: zoneId } });
    },
  };
}

export type ZonesService = ReturnType<typeof createZonesService>;
