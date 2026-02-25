import { z } from "zod";

export const createAnnotationSchema = z.object({
  type: z.enum(["FREEHAND", "ARROW", "CIRCLE", "RECTANGLE", "TEXT", "RULER", "CONE", "SPHERE", "LINE", "CUBE"]),
  data: z.record(z.unknown()),
  visibleTo: z.enum(["ALL", "GM_ONLY", "SPECIFIC"]).default("ALL"),
  isPersistent: z.boolean().default(false),
});

export type CreateAnnotationInput = z.infer<typeof createAnnotationSchema>;
