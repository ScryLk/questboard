import type { PrismaClient, Prisma } from "@questboard/db";
import type { CreateWallInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createWallsService(prisma: PrismaClient) {
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
      return prisma.wall.findMany({ where: { mapId } });
    },

    async create(sessionId: string, userId: string, mapId: string, input: CreateWallInput) {
      await assertGmOrCoGm(sessionId, userId);

      return prisma.wall.create({
        data: {
          mapId,
          x1: input.x1,
          y1: input.y1,
          x2: input.x2,
          y2: input.y2,
          wallType: (input.wallType as any) ?? "NORMAL",
          blocksMovement: input.blocksMovement ?? true,
          blocksVision: input.blocksVision ?? true,
          blocksLight: input.blocksLight ?? true,
          isDoor: input.isDoor ?? false,
          doorState: (input.doorState as any) ?? "CLOSED",
          doorLocked: input.doorLocked ?? false,
          metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
    },

    async batchCreate(sessionId: string, userId: string, mapId: string, walls: CreateWallInput[]) {
      await assertGmOrCoGm(sessionId, userId);

      const created = [];
      for (const input of walls) {
        const wall = await prisma.wall.create({
          data: {
            mapId,
            x1: input.x1,
            y1: input.y1,
            x2: input.x2,
            y2: input.y2,
            wallType: (input.wallType as any) ?? "NORMAL",
            blocksMovement: input.blocksMovement ?? true,
            blocksVision: input.blocksVision ?? true,
            blocksLight: input.blocksLight ?? true,
            isDoor: input.isDoor ?? false,
            doorState: (input.doorState as any) ?? "CLOSED",
            doorLocked: input.doorLocked ?? false,
            metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
          },
        });
        created.push(wall);
      }
      return created;
    },

    async toggleDoor(sessionId: string, userId: string, wallId: string, doorState: string) {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId } },
      });
      if (!player) throw new ForbiddenError("Não é jogador");

      const wall = await prisma.wall.findUnique({ where: { id: wallId } });
      if (!wall) throw new NotFoundError("Wall");
      if (!wall.isDoor) throw new ForbiddenError("Não é uma porta");

      // Only GM/CO_GM can lock/unlock; players can open/close
      const isGm = ["GM", "CO_GM"].includes(player.role);
      if (!isGm && (doorState === "LOCKED" || doorState === "SECRET")) {
        throw new ForbiddenError("Sem permissão para trancar porta");
      }
      if (!isGm && wall.doorLocked) {
        throw new ForbiddenError("Porta trancada");
      }

      return prisma.wall.update({
        where: { id: wallId },
        data: {
          doorState: doorState as any,
          doorLocked: doorState === "LOCKED",
        },
      });
    },

    async delete(sessionId: string, userId: string, wallId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const wall = await prisma.wall.findUnique({ where: { id: wallId } });
      if (!wall) throw new NotFoundError("Wall");

      await prisma.wall.delete({ where: { id: wallId } });
    },

    async deleteAll(sessionId: string, userId: string, mapId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const result = await prisma.wall.deleteMany({ where: { mapId } });
      return { deleted: result.count };
    },
  };
}

export type WallsService = ReturnType<typeof createWallsService>;
