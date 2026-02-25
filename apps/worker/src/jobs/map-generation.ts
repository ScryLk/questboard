import { Worker, type Job, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";
import type { Prisma } from "@questboard/db";

interface MapGenerationJob {
  mapGenerationId: string;
  sessionId: string;
}

export function createMapGenerationWorker(connection: ConnectionOptions) {
  const worker = new Worker<MapGenerationJob>(
    "map-generation",
    async (job: Job<MapGenerationJob>) => {
      const { mapGenerationId } = job.data;

      const generation = await prisma.mapGeneration.findUnique({
        where: { id: mapGenerationId },
      });
      if (!generation) throw new Error("Generation not found");

      // Update status to PROCESSING
      await prisma.mapGeneration.update({
        where: { id: mapGenerationId },
        data: { status: "PROCESSING", startedAt: new Date() },
      });

      try {
        const providerName = generation.provider ?? "openai";

        // Dynamic import of provider to avoid bundling issues
        const { getProviderByName } = await import(
          "../../src/modules/map-generation/providers/index.js"
        ).catch(() => ({
          getProviderByName: () => null,
        }));

        const provider = getProviderByName(providerName);
        if (!provider) {
          throw new Error(`Provider ${providerName} not available`);
        }

        const sourceImageUrl = generation.sourceMapId
          ? (await prisma.map.findUnique({ where: { id: generation.sourceMapId } }))?.imageUrl
          : undefined;

        const result = await provider.generateMap({
          mode: generation.mode as any,
          prompt: generation.prompt ?? undefined,
          parameters: generation.parameters as Record<string, unknown>,
          sourceImageUrl: sourceImageUrl ?? undefined,
          maskData: generation.maskData ?? undefined,
          inpaintPrompt: generation.inpaintPrompt ?? undefined,
        });

        await prisma.mapGeneration.update({
          where: { id: mapGenerationId },
          data: {
            status: "COMPLETED",
            resultUrl: result.imageUrl,
            resultWidth: result.width,
            resultHeight: result.height,
            provider: result.provider,
            model: result.model,
            costCents: result.costCents,
            completedAt: new Date(),
          },
        });

        // Update monthly usage cost
        const now = new Date();
        await prisma.aiUsageMonthly.upsert({
          where: {
            userId_year_month: {
              userId: generation.requestedById,
              year: now.getFullYear(),
              month: now.getMonth() + 1,
            },
          },
          create: {
            userId: generation.requestedById,
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            totalCostCents: result.costCents,
          },
          update: {
            totalCostCents: { increment: result.costCents },
          },
        });

        console.log(`Map generation ${mapGenerationId} completed (${result.provider}/${result.model})`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await prisma.mapGeneration.update({
          where: { id: mapGenerationId },
          data: {
            status: "FAILED",
            errorMessage,
            completedAt: new Date(),
          },
        });
        throw error;
      }
    },
    {
      connection,
      concurrency: 2,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Map generation job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Map generation job ${job?.id} failed:`, error);
  });

  return worker;
}
