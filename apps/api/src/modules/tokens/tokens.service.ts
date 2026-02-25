import type { PrismaClient, Prisma } from "@questboard/db";
import type { CreateTokenInput, UpdateTokenInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createTokensService(prisma: PrismaClient) {
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
      return prisma.token.findMany({ where: { mapId } });
    },

    async create(sessionId: string, userId: string, mapId: string, input: CreateTokenInput) {
      await assertGmOrCoGm(sessionId, userId);

      return prisma.token.create({
        data: {
          mapId,
          name: input.name,
          type: input.type as any,
          imageUrl: input.imageUrl,
          color: input.color,
          x: input.x ?? 0,
          y: input.y ?? 0,
          rotation: input.rotation ?? 0,
          width: input.width ?? 1,
          height: input.height ?? 1,
          ownerId: input.ownerId,
          characterId: input.characterId,
          isVisible: input.isVisible ?? true,
          hp: input.hp ? (input.hp as Prisma.InputJsonValue) : undefined,
          conditions: input.conditions ?? [],
          statusRing: input.statusRing,
          auraRadius: input.auraRadius,
          auraColor: input.auraColor,
          elevation: input.elevation ?? 0,
          label: input.label,
          metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
    },

    async batchCreate(sessionId: string, userId: string, mapId: string, tokens: CreateTokenInput[]) {
      await assertGmOrCoGm(sessionId, userId);

      const created = [];
      for (const input of tokens) {
        const token = await prisma.token.create({
          data: {
            mapId,
            name: input.name,
            type: input.type as any,
            imageUrl: input.imageUrl,
            color: input.color,
            x: input.x ?? 0,
            y: input.y ?? 0,
            width: input.width ?? 1,
            height: input.height ?? 1,
            ownerId: input.ownerId,
            characterId: input.characterId,
            isVisible: input.isVisible ?? true,
            hp: input.hp ? (input.hp as Prisma.InputJsonValue) : undefined,
            conditions: input.conditions ?? [],
            metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
          },
        });
        created.push(token);
      }
      return created;
    },

    async update(sessionId: string, userId: string, tokenId: string, input: UpdateTokenInput) {
      const token = await prisma.token.findUnique({
        where: { id: tokenId },
        include: { map: { select: { sessionId: true } } },
      });
      if (!token) throw new NotFoundError("Token");

      // GM/CO_GM can edit any token; token owner can edit their own
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId } },
      });
      if (!player) throw new ForbiddenError("Não é jogador");

      const isGm = ["GM", "CO_GM"].includes(player.role);
      const isOwner = token.ownerId === userId;
      if (!isGm && !isOwner) throw new ForbiddenError("Sem permissão");

      const data: Prisma.TokenUpdateInput = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.type !== undefined) data.type = input.type as any;
      if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl;
      if (input.color !== undefined) data.color = input.color;
      if (input.x !== undefined) data.x = input.x;
      if (input.y !== undefined) data.y = input.y;
      if (input.rotation !== undefined) data.rotation = input.rotation;
      if (input.width !== undefined) data.width = input.width;
      if (input.height !== undefined) data.height = input.height;
      if (input.isVisible !== undefined) data.isVisible = input.isVisible;
      if (input.isLocked !== undefined) data.isLocked = input.isLocked;
      if (input.layer !== undefined) data.layer = input.layer;
      if (input.hp !== undefined) data.hp = input.hp as Prisma.InputJsonValue;
      if (input.conditions !== undefined) data.conditions = input.conditions;
      if (input.statusRing !== undefined) data.statusRing = input.statusRing;
      if (input.auraRadius !== undefined) data.auraRadius = input.auraRadius;
      if (input.auraColor !== undefined) data.auraColor = input.auraColor;
      if (input.elevation !== undefined) data.elevation = input.elevation;
      if (input.label !== undefined) data.label = input.label;
      if (input.metadata !== undefined) data.metadata = input.metadata as Prisma.InputJsonValue;

      return prisma.token.update({ where: { id: tokenId }, data });
    },

    async updateHp(sessionId: string, userId: string, tokenId: string, delta: number) {
      const token = await prisma.token.findUnique({ where: { id: tokenId } });
      if (!token) throw new NotFoundError("Token");

      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId } },
      });
      if (!player) throw new ForbiddenError("Não é jogador");

      const isGm = ["GM", "CO_GM"].includes(player.role);
      const isOwner = token.ownerId === userId;
      if (!isGm && !isOwner) throw new ForbiddenError("Sem permissão");

      const hp = token.hp as { current: number; max: number; temp?: number } | null;
      if (!hp) throw new NotFoundError("Token não tem HP");

      hp.current = Math.max(0, Math.min(hp.max, hp.current + delta));

      await prisma.token.update({
        where: { id: tokenId },
        data: { hp: hp as Prisma.InputJsonValue },
      });

      return { tokenId, hp };
    },

    async delete(sessionId: string, userId: string, tokenId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const token = await prisma.token.findUnique({ where: { id: tokenId } });
      if (!token) throw new NotFoundError("Token");

      await prisma.token.delete({ where: { id: tokenId } });
    },
  };
}

export type TokensService = ReturnType<typeof createTokensService>;
