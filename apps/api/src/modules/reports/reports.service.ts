import type { PrismaClient } from "@questboard/db";
import type { CreateReportInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError, ConflictError } from "../../errors/app-error.js";

export function createReportsService(prisma: PrismaClient) {
  return {
    async create(sessionId: string, reporterId: string, input: CreateReportInput) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId, deletedAt: null },
      });
      if (!session) throw new NotFoundError("Sessão");

      if (session.type !== "PUBLIC") {
        throw new ForbiddenError("Apenas sessões públicas podem ser denunciadas");
      }

      if (session.ownerId === reporterId) {
        throw new ConflictError("Não é possível denunciar sua própria sessão");
      }

      // Prevent duplicate reports from same user
      const existing = await prisma.sessionReport.findFirst({
        where: { sessionId, reporterId, status: { in: ["OPEN", "UNDER_REVIEW"] } },
      });
      if (existing) {
        throw new ConflictError("Você já possui uma denúncia em aberto para esta sessão");
      }

      return prisma.sessionReport.create({
        data: {
          sessionId,
          reporterId,
          reason: input.reason,
          description: input.description ?? null,
          evidence: input.evidence ?? [],
        },
      });
    },

    async listBySession(sessionId: string) {
      return prisma.sessionReport.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
      });
    },

    async listMine(userId: string) {
      return prisma.sessionReport.findMany({
        where: { reporterId: userId },
        orderBy: { createdAt: "desc" },
        include: {
          session: { select: { id: true, name: true } },
        },
      });
    },

    async resolve(reportId: string, resolution: string) {
      const report = await prisma.sessionReport.findUnique({ where: { id: reportId } });
      if (!report) throw new NotFoundError("Denúncia");

      return prisma.sessionReport.update({
        where: { id: reportId },
        data: { status: "RESOLVED", resolution },
      });
    },

    async dismiss(reportId: string, resolution: string) {
      const report = await prisma.sessionReport.findUnique({ where: { id: reportId } });
      if (!report) throw new NotFoundError("Denúncia");

      return prisma.sessionReport.update({
        where: { id: reportId },
        data: { status: "DISMISSED", resolution },
      });
    },
  };
}

export type ReportsService = ReturnType<typeof createReportsService>;
