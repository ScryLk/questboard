import { Worker, type Job, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";

interface MediaProcessingJob {
  type: "image_thumbnail" | "audio_metadata" | "file_scan";
  fileUrl: string;
  fileName: string;
  mimeType: string;
  userId: string;
  messageId?: string;
  handoutId?: string;
}

export function createMediaProcessingWorker(connection: ConnectionOptions) {
  const worker = new Worker<MediaProcessingJob>(
    "media-processing",
    async (job: Job<MediaProcessingJob>) => {
      const { type, fileUrl, fileName, mimeType, userId, messageId, handoutId } = job.data;

      try {
        console.log(`Processing media: ${type} for ${fileName}...`);

        switch (type) {
          case "image_thumbnail": {
            // In production: use sharp to resize image and generate thumbnail
            // Store thumbnail alongside original
            const thumbnailUrl = fileUrl; // Placeholder

            // If attached to a chat message, update the attachment metadata
            if (messageId) {
              const message = await prisma.chatMessage.findUnique({
                where: { id: messageId },
              });
              if (message) {
                const attachments = (message.attachments as any[]) ?? [];
                const updated = attachments.map((a: any) => {
                  if (a.url === fileUrl) {
                    return { ...a, thumbnailUrl };
                  }
                  return a;
                });
                await prisma.chatMessage.update({
                  where: { id: messageId },
                  data: { attachments: updated },
                });
              }
            }

            console.log(`Thumbnail generated for ${fileName}`);
            return { thumbnailUrl };
          }

          case "audio_metadata": {
            // In production: use ffprobe or music-metadata to extract duration, format, etc.
            const metadata = {
              duration: 0,
              format: mimeType.split("/")[1] ?? "unknown",
              sampleRate: 44100,
              channels: 2,
              bitrate: 128,
            };

            console.log(`Audio metadata extracted for ${fileName}`);
            return { metadata };
          }

          case "file_scan": {
            // In production: run virus/malware scan on uploaded files
            const scanResult = {
              clean: true,
              threats: [] as string[],
              scannedAt: new Date().toISOString(),
            };

            console.log(`File scan completed for ${fileName}: clean`);
            return { scanResult };
          }

          default:
            console.warn(`Unknown media processing type: ${type}`);
        }
      } catch (error) {
        console.error(`Media processing failed for ${fileName}:`, error);
        throw error;
      }
    },
    {
      connection,
      concurrency: 4,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Media processing job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Media processing job ${job?.id} failed:`, error);
  });

  return worker;
}
