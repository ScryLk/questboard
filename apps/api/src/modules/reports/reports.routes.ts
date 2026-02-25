import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createReportsService } from "./reports.service.js";
import { createReportSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function reportsRoutes(app: FastifyInstance) {
  const service = createReportsService(prisma);

  app.post("/sessions/:id/reports", async (request, reply) => {
    const input = createReportSchema.parse(request.body);
    const report = await service.create(request.params.id, request.user.id, input);
    return reply.status(201).send(createSuccessResponse(report));
  });

  app.get("/reports/mine", async (request, reply) => {
    const reports = await service.listMine(request.user.id);
    return reply.send(createSuccessResponse(reports));
  });
}
