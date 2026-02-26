import { Worker, type Job, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";
import type { Prisma } from "@questboard/db";
import { migrateData, getDefaultValues } from "@questboard/game-engine";
import type { TemplateSchema } from "@questboard/game-engine";

interface TemplateMigrationJob {
  templateId: string;
  oldVersion: number;
  newVersion: number;
  oldSchema: TemplateSchema;
  newSchema: TemplateSchema;
  newDefaults: Record<string, unknown>;
}

export function createTemplateMigrationWorker(connection: ConnectionOptions) {
  const worker = new Worker<TemplateMigrationJob>(
    "template-migration",
    async (job: Job<TemplateMigrationJob>) => {
      const { templateId, oldVersion, newVersion, oldSchema, newSchema, newDefaults } = job.data;

      try {
        console.log(`Migrating characters from template ${templateId} v${oldVersion} → v${newVersion}...`);

        // Find all characters using the old version of this template
        const characters = await prisma.character.findMany({
          where: {
            templateId,
            templateVersion: { lt: newVersion },
            deletedAt: null,
          },
        });

        let migrated = 0;
        let failed = 0;

        for (const character of characters) {
          try {
            const currentData = (character.data as Record<string, unknown>) || {};
            const defaults = getDefaultValues(newSchema, newDefaults);

            const { data: migratedData, changes } = migrateData(
              currentData,
              oldSchema,
              newSchema,
              defaults
            );

            // Update character
            await prisma.character.update({
              where: { id: character.id },
              data: {
                data: migratedData as Prisma.InputJsonValue,
                templateVersion: newVersion,
                metadata: {
                  ...(character.metadata as Record<string, unknown> || {}),
                  lastMigration: {
                    fromVersion: oldVersion,
                    toVersion: newVersion,
                    changes,
                    migratedAt: new Date().toISOString(),
                  },
                } as Prisma.InputJsonValue,
              },
            });

            migrated++;
            await job.updateProgress(Math.round(((migrated + failed) / characters.length) * 100));
          } catch (error) {
            console.error(`Failed to migrate character ${character.id}:`, error);
            failed++;
          }
        }

        const summary = {
          templateId,
          oldVersion,
          newVersion,
          totalCharacters: characters.length,
          migrated,
          failed,
        };

        console.log(`Template migration complete:`, summary);
        return summary;
      } catch (error) {
        console.error(`Template migration failed:`, error);
        throw error;
      }
    },
    {
      connection,
      concurrency: 1,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Template migration job ${job.id} completed:`, job.returnvalue);
  });

  worker.on("failed", (job, error) => {
    console.error(`Template migration job ${job?.id} failed:`, error);
  });

  return worker;
}
