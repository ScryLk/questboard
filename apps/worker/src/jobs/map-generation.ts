import { Worker, type Job, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";

interface MapGenerationJob {
  mapGenerationId: string;
  prompt: string;
  params: Record<string, unknown>;
  sessionId: string;
}

export function createMapGenerationWorker(connection: ConnectionOptions) {
  const worker = new Worker<MapGenerationJob>(
    "map-generation",
    async (job: Job<MapGenerationJob>) => {
      const { mapGenerationId } = job.data;

      // Update status to PROCESSING
      await prisma.mapGeneration.update({
        where: { id: mapGenerationId },
        data: { status: "PROCESSING" },
      });

      try {
        // TODO: Implement actual AI generation call
        // For now, just mark as completed with a placeholder
        console.log(`Processing map generation ${mapGenerationId}`);

        await prisma.mapGeneration.update({
          where: { id: mapGenerationId },
          data: {
            status: "COMPLETED",
            imageUrl: "https://placeholder.com/map.png",
          },
        });
      } catch (error) {
        await prisma.mapGeneration.update({
          where: { id: mapGenerationId },
          data: { status: "FAILED" },
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
