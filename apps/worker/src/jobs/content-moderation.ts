import { Worker, type Job, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";

interface ContentModerationJob {
  messageId: string;
  sessionId: string;
  userId: string;
  content: string;
}

export function createContentModerationWorker(connection: ConnectionOptions) {
  const worker = new Worker<ContentModerationJob>(
    "content-moderation",
    async (job: Job<ContentModerationJob>) => {
      const { messageId, sessionId, userId, content } = job.data;

      try {
        console.log(`Checking content moderation for message ${messageId}...`);

        // In production: call an external moderation API (OpenAI, Perspective API, etc.)
        // For now, use simple keyword detection as a stub
        const flaggedCategories: string[] = [];
        let confidence = 0;

        const toxicPatterns = [
          { pattern: /\b(hate|kill|die)\b/i, category: "violence", weight: 0.3 },
          { pattern: /\b(spam|buy now|click here)\b/i, category: "spam", weight: 0.5 },
        ];

        for (const { pattern, category, weight } of toxicPatterns) {
          if (pattern.test(content)) {
            flaggedCategories.push(category);
            confidence = Math.max(confidence, weight);
          }
        }

        // Only flag if confidence is above threshold
        if (flaggedCategories.length > 0 && confidence >= 0.5) {
          await prisma.chatModeration.create({
            data: {
              sessionId,
              messageId,
              userId,
              action: "AUTO_FLAGGED",
              isAutomatic: true,
              confidence,
              categories: flaggedCategories,
              performedById: "system",
            },
          });

          console.log(`Message ${messageId} flagged: ${flaggedCategories.join(", ")} (confidence: ${confidence})`);

          return {
            flagged: true,
            categories: flaggedCategories,
            confidence,
          };
        }

        console.log(`Message ${messageId} passed moderation check`);
        return { flagged: false };
      } catch (error) {
        console.error(`Content moderation failed for message ${messageId}:`, error);
        throw error;
      }
    },
    {
      connection,
      concurrency: 8,
    }
  );

  worker.on("completed", (job) => {
    if (job.returnvalue?.flagged) {
      console.log(`Content moderation job ${job.id}: FLAGGED`);
    }
  });

  worker.on("failed", (job, error) => {
    console.error(`Content moderation job ${job?.id} failed:`, error);
  });

  return worker;
}
