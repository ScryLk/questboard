import { Worker, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";

interface RecapGenerationData {
  sessionId: string;
  userId: string;
  sessionNumber: number;
}

export function createRecapGenerationWorker(connection: ConnectionOptions) {
  return new Worker<RecapGenerationData>(
    "recap-generation",
    async (job) => {
      const { sessionId, userId, sessionNumber } = job.data;

      // Gather source data for AI recap
      const [recentMessages, quests, combatLogs, sessionInfo] = await Promise.all([
        prisma.chatMessage.findMany({
          where: { sessionId },
          orderBy: { createdAt: "desc" },
          take: 200,
          select: {
            content: true,
            senderName: true,
            channel: true,
            isNpcMessage: true,
            npcName: true,
            createdAt: true,
          },
        }),
        prisma.quest.findMany({
          where: { sessionId },
          select: { name: true, status: true, objectives: true, completedAt: true },
        }),
        prisma.chatMessage.findMany({
          where: { sessionId, channel: "SYSTEM" },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: { content: true, createdAt: true },
        }),
        prisma.session.findUnique({
          where: { id: sessionId },
          select: { name: true, description: true, sessionNumber: true },
        }),
      ]);

      const sourceData = {
        sessionName: sessionInfo?.name,
        sessionNumber: sessionNumber || sessionInfo?.sessionNumber,
        messageCount: recentMessages.length,
        icMessages: recentMessages
          .filter((m) => m.channel === "IN_CHARACTER")
          .slice(0, 50)
          .map((m) => ({ speaker: m.senderName, content: m.content })),
        questSummaries: quests.map((q) => ({
          name: q.name,
          status: q.status,
          objectiveCount: (q.objectives as any[])?.length ?? 0,
          completed: q.completedAt != null,
        })),
        systemEvents: combatLogs.slice(0, 20).map((m) => m.content),
      };

      // In production: call an AI API (e.g. Claude) to generate the recap from sourceData
      const narrativePoints = [];
      if (sourceData.icMessages.length > 0) {
        narrativePoints.push(`A party engaged in roleplay with ${sourceData.icMessages.length} in-character exchanges.`);
      }
      if (sourceData.questSummaries.some((q) => q.completed)) {
        const completed = sourceData.questSummaries.filter((q) => q.completed);
        narrativePoints.push(`Completed quests: ${completed.map((q) => q.name).join(", ")}.`);
      }
      if (sourceData.systemEvents.length > 0) {
        narrativePoints.push(`${sourceData.systemEvents.length} notable system events occurred.`);
      }

      const content = narrativePoints.length > 0
        ? narrativePoints.join("\n\n")
        : `Session ${sessionNumber} recap: ${recentMessages.length} messages exchanged, ${quests.length} active quests.`;

      await prisma.sessionRecap.create({
        data: {
          sessionId,
          content,
          sessionNumber,
          aiGenerated: true,
          sourceData: sourceData as any,
          createdById: userId,
        },
      });

      return { success: true, sessionId, sessionNumber };
    },
    {
      connection,
      concurrency: 2,
    }
  );
}
