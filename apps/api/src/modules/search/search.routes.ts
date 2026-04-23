import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createSearchService } from "./search.service.js";
import { createSearchController } from "./search.controller.js";

export async function searchRoutes(app: FastifyInstance) {
  const service = createSearchService(prisma);
  const controller = createSearchController(service);

  app.get(
    "/campaigns/:campaignId/search",
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: "1 minute",
          keyGenerator: (request) => request.user?.id ?? request.ip,
          errorResponseBuilder: () => ({
            success: false,
            error: {
              code: "RATE_LIMITED",
              message: "Muitas buscas em pouco tempo. Tente novamente em instantes.",
            },
          }),
        },
      },
    },
    controller.search,
  );
}
