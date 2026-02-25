import type { PrismaClient, Prisma } from "@questboard/db";
import type { RequestMapGenerationInput, AcceptGenerationInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../errors/app-error.js";
import { getAvailableProvider } from "./providers/index.js";

export function createMapGenerationService(prisma: PrismaClient) {
  async function assertGmOrCoGm(sessionId: string, userId: string) {
    const player = await prisma.sessionPlayer.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    if (!player || !["GM", "CO_GM"].includes(player.role)) {
      throw new ForbiddenError("Sem permissão");
    }
    return player;
  }

  async function getMonthlyUsage(userId: string) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    return prisma.aiUsageMonthly.upsert({
      where: { userId_year_month: { userId, year, month } },
      create: { userId, year, month },
      update: {},
    });
  }

  async function getAiMapsLimit(sessionId: string): Promise<number> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { owner: { include: { plan: { include: { limits: true } } } } },
    });
    return session?.owner?.plan?.limits?.maxAiMapsPerMonth ?? 0;
  }

  return {
    async request(sessionId: string, userId: string, input: RequestMapGenerationInput) {
      await assertGmOrCoGm(sessionId, userId);

      // Check monthly limit
      const limit = await getAiMapsLimit(sessionId);
      const usage = await getMonthlyUsage(userId);

      const isInpaint = input.mode === "INPAINT";
      if (isInpaint) {
        // Inpainting might have separate limits in the future; for now use same
      }

      if (limit > 0 && usage.mapsGenerated >= limit) {
        throw new BadRequestError(`Limite mensal de gerações atingido (${limit})`);
      }

      // Ensure a provider is available
      const provider = getAvailableProvider();
      if (!provider) {
        throw new BadRequestError("Nenhum provedor de IA disponível");
      }

      const generation = await prisma.mapGeneration.create({
        data: {
          sessionId,
          requestedById: userId,
          mode: input.mode as any,
          prompt: input.prompt,
          parameters: (input.parameters ?? {}) as Prisma.InputJsonValue,
          sourceMapId: input.sourceMapId,
          maskData: input.maskData,
          inpaintPrompt: input.inpaintPrompt,
          variationOfId: input.variationOfId,
          status: "QUEUED",
          provider: provider.name,
        },
      });

      // Increment usage counter
      const now = new Date();
      await prisma.aiUsageMonthly.upsert({
        where: { userId_year_month: { userId, year: now.getFullYear(), month: now.getMonth() + 1 } },
        create: {
          userId,
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          mapsGenerated: 1,
          inpaintsUsed: isInpaint ? 1 : 0,
        },
        update: {
          mapsGenerated: { increment: 1 },
          ...(isInpaint ? { inpaintsUsed: { increment: 1 } } : {}),
        },
      });

      return generation;
    },

    async getStatus(generationId: string) {
      const gen = await prisma.mapGeneration.findUnique({ where: { id: generationId } });
      if (!gen) throw new NotFoundError("MapGeneration");
      return gen;
    },

    async listBySession(sessionId: string) {
      return prisma.mapGeneration.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    },

    async accept(sessionId: string, userId: string, generationId: string, input: AcceptGenerationInput) {
      await assertGmOrCoGm(sessionId, userId);

      const gen = await prisma.mapGeneration.findUnique({ where: { id: generationId } });
      if (!gen) throw new NotFoundError("MapGeneration");
      if (gen.status !== "COMPLETED") throw new BadRequestError("Geração não está completa");
      if (!gen.resultUrl) throw new BadRequestError("Sem resultado para aceitar");

      // Create a map from the generation result
      const map = await prisma.map.create({
        data: {
          sessionId,
          name: input.name,
          imageUrl: gen.resultUrl,
          imageWidth: gen.resultWidth ?? 1024,
          imageHeight: gen.resultHeight ?? 1024,
          gridType: (input.gridType as any) ?? "SQUARE",
          gridSize: input.gridSize ?? 32,
          cellsWide: Math.ceil((gen.resultWidth ?? 1024) / (input.gridSize ?? 32)),
          cellsHigh: Math.ceil((gen.resultHeight ?? 1024) / (input.gridSize ?? 32)),
        },
      });

      // Link generation to map
      await prisma.mapGeneration.update({
        where: { id: generationId },
        data: { status: "ACCEPTED", mapId: map.id, acceptedAt: new Date() },
      });

      return { generation: gen, map };
    },

    async reject(sessionId: string, userId: string, generationId: string) {
      await assertGmOrCoGm(sessionId, userId);

      const gen = await prisma.mapGeneration.findUnique({ where: { id: generationId } });
      if (!gen) throw new NotFoundError("MapGeneration");
      if (gen.status !== "COMPLETED") throw new BadRequestError("Geração não está completa");

      return prisma.mapGeneration.update({
        where: { id: generationId },
        data: { status: "REJECTED" },
      });
    },

    async rate(generationId: string, userId: string, rating: number) {
      const gen = await prisma.mapGeneration.findUnique({ where: { id: generationId } });
      if (!gen) throw new NotFoundError("MapGeneration");
      if (gen.requestedById !== userId) throw new ForbiddenError("Sem permissão");

      return prisma.mapGeneration.update({
        where: { id: generationId },
        data: { userRating: rating },
      });
    },

    async getUsage(userId: string) {
      const now = new Date();
      const usage = await prisma.aiUsageMonthly.findUnique({
        where: {
          userId_year_month: { userId, year: now.getFullYear(), month: now.getMonth() + 1 },
        },
      });

      return {
        mapsGenerated: usage?.mapsGenerated ?? 0,
        inpaintsUsed: usage?.inpaintsUsed ?? 0,
        totalCostCents: usage?.totalCostCents ?? 0,
      };
    },
  };
}

export type MapGenerationService = ReturnType<typeof createMapGenerationService>;
