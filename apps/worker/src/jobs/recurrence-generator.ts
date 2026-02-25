import { Worker, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";

/**
 * Recurrence generator worker.
 * Runs daily to generate future schedule occurrences for sessions
 * with recurring rules.
 */
export function createRecurrenceGeneratorWorker(connection: ConnectionOptions) {
  const worker = new Worker(
    "recurrence-generator",
    async () => {
      // Find sessions with recurringRule set
      const sessions = await prisma.session.findMany({
        where: {
          deletedAt: null,
          status: { in: ["IDLE", "LIVE", "PAUSED"] },
          recurringRule: { not: null },
        },
        select: { id: true, name: true, recurringRule: true },
      });

      for (const session of sessions) {
        if (!session.recurringRule) continue;

        const rule = session.recurringRule as {
          frequency: string;
          dayOfWeek: number;
          time: string;
          timezone: string;
          exceptions?: string[];
          endsAt?: string;
        };

        const [hours, minutes] = rule.time.split(":").map(Number);
        const occurrences: Date[] = [];
        const now = new Date();

        let current = new Date(now);
        current.setHours(hours, minutes, 0, 0);

        // Adjust to next matching day of week
        while (current.getDay() !== rule.dayOfWeek || current <= now) {
          current.setDate(current.getDate() + 1);
          current.setHours(hours, minutes, 0, 0);
        }

        const intervalDays = rule.frequency === "biweekly" ? 14 : rule.frequency === "monthly" ? 28 : 7;
        const targetCount = 8;

        while (occurrences.length < targetCount) {
          if (rule.endsAt && current > new Date(rule.endsAt)) break;
          const dateStr = current.toISOString().split("T")[0];
          if (!rule.exceptions?.includes(dateStr)) {
            occurrences.push(new Date(current));
          }
          current.setDate(current.getDate() + intervalDays);
          current.setHours(hours, minutes, 0, 0);
        }

        // Upsert occurrences
        let created = 0;
        for (const date of occurrences) {
          try {
            await prisma.sessionSchedule.upsert({
              where: { sessionId_scheduledFor: { sessionId: session.id, scheduledFor: date } },
              create: { sessionId: session.id, scheduledFor: date, isRecurring: true },
              update: {},
            });
            created++;
          } catch {
            // May fail if unique constraint race condition — safe to ignore
          }
        }

        if (created > 0) {
          console.log(`Generated ${created} occurrences for session "${session.name}" (${session.id})`);
        }
      }
    },
    {
      connection,
      concurrency: 1,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Recurrence generator job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Recurrence generator job ${job?.id} failed:`, error);
  });

  return worker;
}
