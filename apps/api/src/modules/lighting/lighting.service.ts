import type { PrismaClient, Prisma } from "@questboard/db";
import type { CreateLightSourceInput, UpdateLightSourceInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createLightingService(prisma: PrismaClient) {
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
      return prisma.lightSource.findMany({ where: { mapId } });
    },

    async create(sessionId: string, userId: string, mapId: string, input: CreateLightSourceInput) {
      await assertGmOrCoGm(sessionId, userId);

      return prisma.lightSource.create({
        data: {
          mapId,
          x: input.x,
          y: input.y,
          brightRadius: input.brightRadius,
          dimRadius: input.dimRadius,
          color: input.color ?? "#FFF4E0",
          intensity: input.intensity ?? 1.0,
          lightType: (input.lightType as any) ?? "POINT",
          coneAngle: input.coneAngle,
          coneDirection: input.coneDirection,
          isEnabled: input.isEnabled ?? true,
          flickers: input.flickers ?? false,
          flickerIntensity: input.flickerIntensity ?? 0.1,
          tokenId: input.tokenId ?? null,
          isStatic: input.isStatic ?? true,
          metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
    },

    async update(sessionId: string, userId: string, lightId: string, input: UpdateLightSourceInput) {
      await assertGmOrCoGm(sessionId, userId);

      const light = await prisma.lightSource.findUnique({ where: { id: lightId } });
      if (!light) throw new NotFoundError("LightSource");

      const data: Prisma.LightSourceUpdateInput = {};
      if (input.x !== undefined) data.x = input.x;
      if (input.y !== undefined) data.y = input.y;
      if (input.brightRadius !== undefined) data.brightRadius = input.brightRadius;
      if (input.dimRadius !== undefined) data.dimRadius = input.dimRadius;
      if (input.color !== undefined) data.color = input.color;
      if (input.intensity !== undefined) data.intensity = input.intensity;
      if (input.lightType !== undefined) data.lightType = input.lightType as any;
      if (input.coneAngle !== undefined) data.coneAngle = input.coneAngle;
      if (input.coneDirection !== undefined) data.coneDirection = input.coneDirection;
      if (input.isEnabled !== undefined) data.isEnabled = input.isEnabled;
      if (input.flickers !== undefined) data.flickers = input.flickers;
      if (input.flickerIntensity !== undefined) data.flickerIntensity = input.flickerIntensity;
      if (input.metadata !== undefined) data.metadata = input.metadata as Prisma.InputJsonValue;

      return prisma.lightSource.update({ where: { id: lightId }, data });
    },

    async toggle(sessionId: string, userId: string, lightId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const light = await prisma.lightSource.findUnique({ where: { id: lightId } });
      if (!light) throw new NotFoundError("LightSource");

      return prisma.lightSource.update({
        where: { id: lightId },
        data: { isEnabled: !light.isEnabled },
      });
    },

    async delete(sessionId: string, userId: string, lightId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const light = await prisma.lightSource.findUnique({ where: { id: lightId } });
      if (!light) throw new NotFoundError("LightSource");

      await prisma.lightSource.delete({ where: { id: lightId } });
    },

    async deleteAll(sessionId: string, userId: string, mapId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const result = await prisma.lightSource.deleteMany({ where: { mapId } });
      return { deleted: result.count };
    },
  };
}

export type LightingService = ReturnType<typeof createLightingService>;
