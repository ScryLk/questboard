import { Worker, type Job, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";

interface ThumbnailJob {
  mapId: string;
  imageUrl: string;
}

export function createThumbnailWorker(connection: ConnectionOptions) {
  const worker = new Worker<ThumbnailJob>(
    "thumbnail-generation",
    async (job: Job<ThumbnailJob>) => {
      const { mapId, imageUrl } = job.data;

      try {
        // Fetch the image and create a thumbnail
        // In production this would use sharp or similar to resize
        // For now, we store the original URL as thumbnail
        const thumbnailUrl = imageUrl; // Placeholder until image processing is added

        await prisma.map.update({
          where: { id: mapId },
          data: { thumbnailUrl },
        });

        console.log(`Thumbnail generated for map ${mapId}`);
      } catch (error) {
        console.error(`Thumbnail generation failed for map ${mapId}:`, error);
        throw error;
      }
    },
    {
      connection,
      concurrency: 4,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Thumbnail job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Thumbnail job ${job?.id} failed:`, error);
  });

  return worker;
}
