import { z } from "zod";
import { ReportReason } from "../types/enums.js";

export const createReportSchema = z.object({
  reason: z.nativeEnum(ReportReason),
  description: z.string().max(1000).optional().nullable(),
  evidence: z.array(z.string().url()).max(5).default([]),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
