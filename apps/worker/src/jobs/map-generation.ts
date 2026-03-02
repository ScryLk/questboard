import { Worker, type Job, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";
import type { AIZoneGenerationParams, AIFullMapGenerationParams } from "@questboard/shared";

interface MapGenerationJob {
  mapGenerationId: string;
  prompt: string;
  type: "zone" | "full_map" | "tile_detail";
  params: AIZoneGenerationParams | AIFullMapGenerationParams | Record<string, unknown>;
  mapId?: string;
  sessionId: string;
}

export function createMapGenerationWorker(connection: ConnectionOptions) {
  const worker = new Worker<MapGenerationJob>(
    "map-generation",
    async (job: Job<MapGenerationJob>) => {
      const { mapGenerationId, type, params, prompt } = job.data;

      await prisma.mapGeneration.update({
        where: { id: mapGenerationId },
        data: { status: "PROCESSING" },
      });

      try {
        console.log(`Processing ${type} generation ${mapGenerationId}`);

        // TODO: Implement AI generation based on type:
        // - "zone": Use AI to generate terrain layout for a zone
        //   Call LLM with zone prompt to get tile layout JSON
        //   Optionally call image generation for tile detail images
        // - "full_map": Use AI to generate complete map layout
        //   Call LLM with full map prompt to get room/corridor layout
        //   Generate terrain, walls, doors, objects, lighting
        // - "tile_detail": Use AI to generate description and image for a tile
        //   Call LLM for name, description, perception/investigation DCs
        //   Call image generation for close-up detail image

        await prisma.mapGeneration.update({
          where: { id: mapGenerationId },
          data: {
            status: "COMPLETED",
            result: {},
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
