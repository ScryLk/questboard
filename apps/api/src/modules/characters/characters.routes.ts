import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createCharactersService } from "./characters.service.js";
import {
  createCharacterSchema,
  updateCharacterSchema,
  updateCharacterFieldSchema,
  batchUpdateFieldsSchema,
  addInventoryItemSchema,
  updateInventoryItemSchema,
  addSpellSchema,
  updateSpellSchema,
  levelUpSchema,
  setSharePermissionSchema,
  characterNoteSchema,
  shortRestSchema,
} from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function charactersRoutes(app: FastifyInstance) {
  const service = createCharactersService(prisma);

  // ── CRUD ──

  app.get("/characters", async (request, reply) => {
    const query = request.query as Record<string, string>;
    const characters = await service.list(request.user.id, {
      status: query["status"],
      search: query["search"],
    });
    return reply.send(createSuccessResponse(characters));
  });

  app.get("/characters/:id", async (request, reply) => {
    const character = await service.getById((request.params as any).id, request.user.id);
    return reply.send(createSuccessResponse(character));
  });

  app.post("/characters", async (request, reply) => {
    const input = createCharacterSchema.parse(request.body);
    const character = await service.create(request.user.id, input);
    return reply.status(201).send(createSuccessResponse(character));
  });

  app.patch("/characters/:id", async (request, reply) => {
    const input = updateCharacterSchema.parse(request.body);
    const character = await service.update((request.params as any).id, request.user.id, input);
    return reply.send(createSuccessResponse(character));
  });

  app.delete("/characters/:id", async (request, reply) => {
    await service.softDelete((request.params as any).id, request.user.id);
    return reply.status(204).send();
  });

  // ── Field Updates ──

  app.patch("/characters/:id/fields", async (request, reply) => {
    const input = updateCharacterFieldSchema.parse(request.body);
    const result = await service.updateField(
      (request.params as any).id,
      request.user.id,
      input.fieldPath,
      input.value
    );
    return reply.send(createSuccessResponse(result));
  });

  app.patch("/characters/:id/fields/batch", async (request, reply) => {
    const input = batchUpdateFieldsSchema.parse(request.body);
    const result = await service.batchUpdateFields(
      (request.params as any).id,
      request.user.id,
      input.updates
    );
    return reply.send(createSuccessResponse(result));
  });

  // ── Inventory ──

  app.post("/characters/:id/inventory", async (request, reply) => {
    const input = addInventoryItemSchema.parse(request.body);
    const inventory = await service.addInventoryItem(
      (request.params as any).id,
      request.user.id,
      input
    );
    return reply.status(201).send(createSuccessResponse(inventory));
  });

  app.patch("/characters/:id/inventory/:itemId", async (request, reply) => {
    const input = updateInventoryItemSchema.parse(request.body);
    const inventory = await service.updateInventoryItem(
      (request.params as any).id,
      request.user.id,
      (request.params as any).itemId,
      input
    );
    return reply.send(createSuccessResponse(inventory));
  });

  app.delete("/characters/:id/inventory/:itemId", async (request, reply) => {
    const inventory = await service.removeInventoryItem(
      (request.params as any).id,
      request.user.id,
      (request.params as any).itemId
    );
    return reply.send(createSuccessResponse(inventory));
  });

  app.patch("/characters/:id/inventory/:itemId/equip", async (request, reply) => {
    const inventory = await service.toggleEquipItem(
      (request.params as any).id,
      request.user.id,
      (request.params as any).itemId
    );
    return reply.send(createSuccessResponse(inventory));
  });

  app.get("/characters/:id/inventory/weight", async (request, reply) => {
    const result = await service.getInventoryWeight(
      (request.params as any).id,
      request.user.id
    );
    return reply.send(createSuccessResponse(result));
  });

  // ── Spells ──

  app.post("/characters/:id/spells", async (request, reply) => {
    const input = addSpellSchema.parse(request.body);
    const spell = await service.addSpell(
      (request.params as any).id,
      request.user.id,
      input
    );
    return reply.status(201).send(createSuccessResponse(spell));
  });

  app.patch("/characters/:id/spells/:spellId", async (request, reply) => {
    const input = updateSpellSchema.parse(request.body);
    await service.updateSpell(
      (request.params as any).id,
      request.user.id,
      (request.params as any).spellId,
      input
    );
    return reply.status(204).send();
  });

  app.delete("/characters/:id/spells/:spellId", async (request, reply) => {
    await service.removeSpell(
      (request.params as any).id,
      request.user.id,
      (request.params as any).spellId
    );
    return reply.status(204).send();
  });

  app.patch("/characters/:id/spells/:spellId/toggle-prepared", async (request, reply) => {
    await service.toggleSpellPrepared(
      (request.params as any).id,
      request.user.id,
      (request.params as any).spellId
    );
    return reply.status(204).send();
  });

  // ── Level Up ──

  app.post("/characters/:id/level-up", async (request, reply) => {
    const input = levelUpSchema.parse(request.body);
    const result = await service.levelUp(
      (request.params as any).id,
      request.user.id,
      input
    );
    return reply.send(createSuccessResponse(result));
  });

  // ── Rest ──

  app.post("/characters/:id/short-rest", async (request, reply) => {
    const input = shortRestSchema.parse(request.body);
    const result = await service.shortRest(
      (request.params as any).id,
      request.user.id,
      input.hitDiceToSpend
    );
    return reply.send(createSuccessResponse(result));
  });

  app.post("/characters/:id/long-rest", async (request, reply) => {
    const result = await service.longRest(
      (request.params as any).id,
      request.user.id
    );
    return reply.send(createSuccessResponse(result));
  });

  // ── Notes ──

  app.post("/characters/:id/notes", async (request, reply) => {
    const input = characterNoteSchema.parse(request.body);
    const note = await service.addNote(
      (request.params as any).id,
      request.user.id,
      input
    );
    return reply.status(201).send(createSuccessResponse(note));
  });

  app.patch("/characters/:id/notes/:noteId", async (request, reply) => {
    const input = characterNoteSchema.partial().parse(request.body);
    await service.updateNote(
      (request.params as any).id,
      request.user.id,
      (request.params as any).noteId,
      input
    );
    return reply.status(204).send();
  });

  app.delete("/characters/:id/notes/:noteId", async (request, reply) => {
    await service.deleteNote(
      (request.params as any).id,
      request.user.id,
      (request.params as any).noteId
    );
    return reply.status(204).send();
  });

  // ── Share Permissions ──

  app.get("/characters/:id/share", async (request, reply) => {
    const permissions = await service.getSharePermissions(
      (request.params as any).id,
      request.user.id
    );
    return reply.send(createSuccessResponse(permissions));
  });

  app.post("/characters/:id/share", async (request, reply) => {
    const input = setSharePermissionSchema.parse(request.body);
    const permission = await service.setSharePermission(
      (request.params as any).id,
      request.user.id,
      input
    );
    return reply.status(201).send(createSuccessResponse(permission));
  });

  app.delete("/characters/:id/share/:permissionId", async (request, reply) => {
    await service.removeSharePermission(
      (request.params as any).id,
      request.user.id,
      (request.params as any).permissionId
    );
    return reply.status(204).send();
  });

  // ── Session Link ──

  app.post("/characters/:id/link-session", async (request, reply) => {
    const { sessionId } = request.body as { sessionId: string };
    const character = await service.linkToSession(
      (request.params as any).id,
      request.user.id,
      sessionId
    );
    return reply.send(createSuccessResponse(character));
  });

  app.post("/characters/:id/unlink-session", async (request, reply) => {
    const character = await service.unlinkFromSession(
      (request.params as any).id,
      request.user.id
    );
    return reply.send(createSuccessResponse(character));
  });
}
