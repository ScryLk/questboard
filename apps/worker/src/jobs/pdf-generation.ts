import { Worker, type Job, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";

interface PdfGenerationJob {
  characterId: string;
  userId: string;
  templateId: string;
}

export function createPdfGenerationWorker(connection: ConnectionOptions) {
  const worker = new Worker<PdfGenerationJob>(
    "pdf-generation",
    async (job: Job<PdfGenerationJob>) => {
      const { characterId, userId, templateId } = job.data;

      try {
        console.log(`Generating PDF for character ${characterId}...`);

        // Load character and template
        const character = await prisma.character.findUnique({
          where: { id: characterId },
          include: { template: true },
        });

        if (!character) {
          throw new Error(`Character ${characterId} not found`);
        }

        if (character.userId !== userId) {
          throw new Error("Unauthorized PDF generation");
        }

        const charData = (character.data as Record<string, unknown>) || {};
        const schema = character.template.schema as Record<string, unknown>;

        // Build PDF content (structured data for client-side rendering)
        // In production, this would use a PDF library (PDFKit, Puppeteer, etc.)
        const pdfContent = {
          character: {
            name: character.name,
            level: character.level,
            experience: character.experience,
            templateName: character.template.name,
            systemName: character.template.systemName,
          },
          data: charData,
          schema,
          inventory: character.inventory,
          spells: character.spells,
          currency: character.currency,
          backstory: character.backstory,
          notes: character.notes,
          generatedAt: new Date().toISOString(),
        };

        // Store as a vault file reference
        // In production: generate actual PDF, upload to R2, create VaultFile record
        const vaultFile = await prisma.characterVaultFile.create({
          data: {
            characterId,
            fileName: `${character.name}_sheet_${Date.now()}.json`,
            fileUrl: `vault/${characterId}/exports/${Date.now()}.json`,
            fileSizeMb: 0.01,
            mimeType: "application/json",
            fileType: "SHEET_EXPORT",
            folder: "/exports",
            description: `Character sheet export - ${new Date().toISOString()}`,
            metadata: { version: character.templateVersion },
          },
        });

        // Update vault usage
        await prisma.character.update({
          where: { id: characterId },
          data: { vaultUsageMb: { increment: 0.01 } },
        });

        console.log(`PDF generated for character ${characterId}: ${vaultFile.id}`);

        return {
          vaultFileId: vaultFile.id,
          fileUrl: vaultFile.fileUrl,
        };
      } catch (error) {
        console.error(`PDF generation failed for character ${characterId}:`, error);
        throw error;
      }
    },
    {
      connection,
      concurrency: 2,
    }
  );

  worker.on("completed", (job) => {
    console.log(`PDF generation job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`PDF generation job ${job?.id} failed:`, error);
  });

  return worker;
}
