import { Worker, type Job, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";
import type { Prisma } from "@questboard/db";

interface WallDetectionJob {
  mapGenerationId: string;
  mapId: string;
  imageUrl: string;
  gridSize: number;
}

export function createWallDetectionWorker(connection: ConnectionOptions) {
  const worker = new Worker<WallDetectionJob>(
    "wall-detection",
    async (job: Job<WallDetectionJob>) => {
      const { mapGenerationId, mapId, imageUrl, gridSize } = job.data;

      try {
        // Update generation status
        await prisma.mapGeneration.update({
          where: { id: mapGenerationId },
          data: { status: "PROCESSING" },
        });

        // Dynamic import provider
        const { getProviderByName } = await import(
          "../../src/modules/map-generation/providers/index.js"
        ).catch(() => ({
          getProviderByName: () => null,
        }));

        const provider = getProviderByName("openai");
        if (!provider) {
          throw new Error("OpenAI provider not available for wall detection");
        }

        const result = await provider.detectWalls(imageUrl, gridSize);

        // Create walls in the database
        for (const wall of result.walls) {
          await prisma.wall.create({
            data: {
              mapId,
              x1: wall.x1,
              y1: wall.y1,
              x2: wall.x2,
              y2: wall.y2,
              wallType: (wall.wallType as any) ?? "NORMAL",
              isDoor: wall.isDoor,
              blocksMovement: true,
              blocksVision: true,
              blocksLight: true,
            },
          });
        }

        // Update generation status
        await prisma.mapGeneration.update({
          where: { id: mapGenerationId },
          data: {
            status: "COMPLETED",
            costCents: result.costCents,
            provider: result.provider,
            model: result.model,
            completedAt: new Date(),
          },
        });

        // Update monthly usage cost
        const generation = await prisma.mapGeneration.findUnique({
          where: { id: mapGenerationId },
        });
        if (generation) {
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
        }

        console.log(`Wall detection for map ${mapId}: ${result.walls.length} walls detected`);
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
    console.log(`Wall detection job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Wall detection job ${job?.id} failed:`, error);
  });

  return worker;
}
