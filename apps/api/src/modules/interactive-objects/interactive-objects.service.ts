import type { PrismaClient, Prisma } from "@questboard/db";
import type { CreateInteractiveObjectInput, UpdateInteractiveObjectInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../errors/app-error.js";

export function createInteractiveObjectsService(prisma: PrismaClient) {
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
      return prisma.interactiveObject.findMany({ where: { mapId } });
    },

    async create(sessionId: string, userId: string, mapId: string, input: CreateInteractiveObjectInput) {
      await assertGmOrCoGm(sessionId, userId);

      return prisma.interactiveObject.create({
        data: {
          mapId,
          tokenId: input.tokenId,
          interactionType: input.interactionType as any,
          interactionRange: input.interactionRange ?? 1,
          requiresLineOfSight: input.requiresLineOfSight ?? true,
          requiredRole: input.requiredRole ?? ["GM", "CO_GM", "PLAYER"],
          requiredCheck: input.requiredCheck ? (input.requiredCheck as Prisma.InputJsonValue) : undefined,
          onInteract: (input.onInteract ?? {}) as Prisma.InputJsonValue,
          isHidden: input.isHidden ?? false,
          highlightOnHover: input.highlightOnHover ?? true,
          highlightColor: input.highlightColor ?? "#6C5CE760",
          interactionIcon: input.interactionIcon,
          metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
    },

    async batchCreate(sessionId: string, userId: string, mapId: string, objects: CreateInteractiveObjectInput[]) {
      await assertGmOrCoGm(sessionId, userId);

      const created = [];
      for (const input of objects) {
        const obj = await prisma.interactiveObject.create({
          data: {
            mapId,
            tokenId: input.tokenId,
            interactionType: input.interactionType as any,
            interactionRange: input.interactionRange ?? 1,
            requiresLineOfSight: input.requiresLineOfSight ?? true,
            requiredRole: input.requiredRole ?? ["GM", "CO_GM", "PLAYER"],
            requiredCheck: input.requiredCheck ? (input.requiredCheck as Prisma.InputJsonValue) : undefined,
            onInteract: (input.onInteract ?? {}) as Prisma.InputJsonValue,
            isHidden: input.isHidden ?? false,
            highlightOnHover: input.highlightOnHover ?? true,
            highlightColor: input.highlightColor ?? "#6C5CE760",
            interactionIcon: input.interactionIcon,
            metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
          },
        });
        created.push(obj);
      }
      return created;
    },

    async update(sessionId: string, userId: string, objectId: string, input: UpdateInteractiveObjectInput) {
      await assertGmOrCoGm(sessionId, userId);

      const obj = await prisma.interactiveObject.findUnique({ where: { id: objectId } });
      if (!obj) throw new NotFoundError("InteractiveObject");

      const data: Prisma.InteractiveObjectUpdateInput = {};
      if (input.interactionType !== undefined) data.interactionType = input.interactionType as any;
      if (input.interactionRange !== undefined) data.interactionRange = input.interactionRange;
      if (input.requiresLineOfSight !== undefined) data.requiresLineOfSight = input.requiresLineOfSight;
      if (input.requiredRole !== undefined) data.requiredRole = input.requiredRole;
      if (input.requiredCheck !== undefined) data.requiredCheck = input.requiredCheck as Prisma.InputJsonValue;
      if (input.onInteract !== undefined) data.onInteract = input.onInteract as Prisma.InputJsonValue;
      if (input.isActive !== undefined) data.isActive = input.isActive;
      if (input.isHidden !== undefined) data.isHidden = input.isHidden;
      if (input.highlightOnHover !== undefined) data.highlightOnHover = input.highlightOnHover;
      if (input.highlightColor !== undefined) data.highlightColor = input.highlightColor;
      if (input.interactionIcon !== undefined) data.interactionIcon = input.interactionIcon;
      if (input.metadata !== undefined) data.metadata = input.metadata as Prisma.InputJsonValue;

      return prisma.interactiveObject.update({ where: { id: objectId }, data });
    },

    async delete(sessionId: string, userId: string, objectId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const obj = await prisma.interactiveObject.findUnique({ where: { id: objectId } });
      if (!obj) throw new NotFoundError("InteractiveObject");

      await prisma.interactiveObject.delete({ where: { id: objectId } });
    },

    async interact(sessionId: string, userId: string, objectId: string, context?: { diceResult?: number; hasItem?: string }) {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId } },
      });
      if (!player) throw new ForbiddenError("Não é jogador");

      const obj = await prisma.interactiveObject.findUnique({ where: { id: objectId } });
      if (!obj) throw new NotFoundError("InteractiveObject");
      if (!obj.isActive) throw new BadRequestError("Objeto inativo");

      const onInteract = obj.onInteract as Record<string, unknown>;
      if (obj.hasBeenUsed && (onInteract as Record<string, unknown>).oneTimeOnly) {
        throw new BadRequestError("Objeto já utilizado");
      }

      // Mark as used if one-time
      if ((onInteract as Record<string, unknown>).oneTimeOnly) {
        await prisma.interactiveObject.update({
          where: { id: objectId },
          data: { hasBeenUsed: true, usedById: userId, usedAt: new Date() },
        });
      }

      return { object: obj, context };
    },
  };
}

export type InteractiveObjectsService = ReturnType<typeof createInteractiveObjectsService>;
