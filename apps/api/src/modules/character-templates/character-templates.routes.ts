import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createCharacterTemplatesService } from "./character-templates.service.js";
import { createCharacterTemplateSchema, updateCharacterTemplateSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function characterTemplatesRoutes(app: FastifyInstance) {
  const service = createCharacterTemplatesService(prisma);

  // List all active templates (with optional filters)
  app.get("/templates", async (request, reply) => {
    const query = request.query as Record<string, string>;
    const templates = await service.list({
      systemName: query["systemName"],
      tier: query["tier"],
      isOfficial: query["isOfficial"] === "true" ? true : query["isOfficial"] === "false" ? false : undefined,
      search: query["search"],
    });
    return reply.send(createSuccessResponse(templates));
  });

  // Get template by ID
  app.get("/templates/:id", async (request, reply) => {
    const template = await service.getById((request.params as any).id);
    return reply.send(createSuccessResponse(template));
  });

  // Get template by slug
  app.get("/templates/slug/:slug", async (request, reply) => {
    const template = await service.getBySlug((request.params as any).slug);
    return reply.send(createSuccessResponse(template));
  });

  // Create template (admin or users with custom template permission)
  app.post("/templates", async (request, reply) => {
    const input = createCharacterTemplateSchema.parse(request.body);
    const template = await service.create(request.user.id, input);
    return reply.status(201).send(createSuccessResponse(template));
  });

  // Update template
  app.patch("/templates/:id", async (request, reply) => {
    const input = updateCharacterTemplateSchema.parse(request.body);
    const template = await service.update((request.params as any).id, request.user.id, input);
    return reply.send(createSuccessResponse(template));
  });

  // Deactivate template
  app.delete("/templates/:id", async (request, reply) => {
    await service.deactivate((request.params as any).id, request.user.id);
    return reply.status(204).send();
  });
}
