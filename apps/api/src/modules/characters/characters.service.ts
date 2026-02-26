import type { PrismaClient, Prisma } from "@questboard/db";
import type {
  CreateCharacterInput,
  UpdateCharacterInput,
  AddInventoryItemInput,
  UpdateInventoryItemInput,
  AddSpellInput,
  UpdateSpellInput,
  LevelUpInput,
  SetSharePermissionInput,
  CharacterNoteInput,
} from "@questboard/shared";
import {
  evaluateFormula,
  computeAllFields,
  getDependents,
  getDefaultValues,
  setNestedValue,
  resolveDiceNotation,
  addItem,
  removeItem,
  updateItem,
  updateQuantity,
  toggleEquipped,
  calculateTotalWeight,
  applyLevelUp,
  canLevelUp,
  applyShortRest,
  applyLongRest,
} from "@questboard/game-engine";
import type { TemplateSchema, FormulaContext, InventoryItem, LevelConfig, RestConfig } from "@questboard/game-engine";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../errors/app-error.js";

export function createCharactersService(prisma: PrismaClient) {
  async function getCharacterWithOwnership(characterId: string, userId: string) {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: { template: true },
    });
    if (!character) throw new NotFoundError("Personagem");
    if (character.userId !== userId) throw new ForbiddenError("Não é dono deste personagem");
    return character;
  }

  function buildFormulaContext(data: Record<string, unknown>, level: number, experience: number): FormulaContext {
    return { data, level, experience };
  }

  return {
    // ── CRUD ──

    async list(userId: string, filters?: { status?: string; search?: string }) {
      const where: Prisma.CharacterWhereInput = { userId, deletedAt: null };

      if (filters?.status) where.status = filters.status as any;
      if (filters?.search) {
        where.name = { contains: filters.search, mode: "insensitive" };
      }

      return prisma.character.findMany({
        where,
        include: { template: { select: { name: true, systemName: true } } },
        orderBy: { updatedAt: "desc" },
      });
    },

    async getById(characterId: string, requesterId: string) {
      const character = await prisma.character.findUnique({
        where: { id: characterId, deletedAt: null },
        include: {
          template: true,
          vaultFiles: true,
          sharePermissions: true,
        },
      });
      if (!character) throw new NotFoundError("Personagem");

      // Owner always has full access
      if (character.userId === requesterId) return character;

      // Public characters are visible
      if (character.isPublic) return character;

      // Check share permissions
      const permission = await prisma.characterSharePermission.findFirst({
        where: {
          characterId,
          OR: [
            { targetType: "ALL_PLAYERS" },
            { targetType: "SPECIFIC_USER", targetUserId: requesterId },
            { targetType: "GM" },
            { targetType: "CO_GM" },
          ],
        },
      });
      if (!permission) throw new ForbiddenError("Sem acesso a este personagem");
      return character;
    },

    async create(userId: string, input: CreateCharacterInput) {
      const template = await prisma.characterTemplate.findUnique({
        where: { id: input.templateId },
      });
      if (!template) throw new NotFoundError("Template");

      const schema = template.schema as unknown as TemplateSchema;
      const defaults = template.defaults as Record<string, unknown> || {};
      const defaultData = getDefaultValues(schema, defaults);
      const mergedData = { ...defaultData, ...input.data };

      // Compute initial values
      const formulas = template.formulas as Record<string, string> || {};
      const ctx = buildFormulaContext(mergedData, 1, 0);
      const computed = computeAllFields(schema, formulas, ctx);

      for (const [path, value] of Object.entries(computed)) {
        setNestedValue(mergedData, path, value);
      }

      return prisma.character.create({
        data: {
          userId,
          templateId: input.templateId,
          templateVersion: template.version,
          name: input.name,
          avatarUrl: input.avatarUrl ?? null,
          bannerUrl: input.bannerUrl ?? null,
          pronouns: input.pronouns ?? null,
          data: mergedData as Prisma.InputJsonValue,
          backstory: input.backstory ?? null,
        },
        include: { template: { select: { name: true, systemName: true } } },
      });
    },

    async update(characterId: string, userId: string, input: UpdateCharacterInput) {
      await getCharacterWithOwnership(characterId, userId);

      const data: Prisma.CharacterUpdateInput = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
      if (input.bannerUrl !== undefined) data.bannerUrl = input.bannerUrl;
      if (input.pronouns !== undefined) data.pronouns = input.pronouns;
      if (input.status !== undefined) data.status = input.status as any;
      if (input.isPublic !== undefined) data.isPublic = input.isPublic;
      if (input.backstory !== undefined) data.backstory = input.backstory;
      if (input.metadata !== undefined) data.metadata = input.metadata as Prisma.InputJsonValue;

      return prisma.character.update({
        where: { id: characterId },
        data,
        include: { template: { select: { name: true, systemName: true } } },
      });
    },

    async softDelete(characterId: string, userId: string) {
      await getCharacterWithOwnership(characterId, userId);
      return prisma.character.update({
        where: { id: characterId },
        data: { deletedAt: new Date() },
      });
    },

    // ── Field Updates ──

    async updateField(characterId: string, userId: string, fieldPath: string, value: unknown) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const charData = (character.data as Record<string, unknown>) || {};
      const formulas = (character.template.formulas as Record<string, string>) || {};
      const schema = character.template.schema as unknown as TemplateSchema;

      // Set the new value
      setNestedValue(charData, fieldPath, value);

      // Recompute dependents
      const dependents = getDependents(fieldPath, formulas, schema);
      const ctx = buildFormulaContext(charData, character.level, character.experience);
      const computedChanges: Record<string, unknown> = {};

      for (const depPath of dependents) {
        const formula = formulas[depPath];
        if (formula) {
          const computed = evaluateFormula(formula, ctx);
          setNestedValue(charData, depPath, computed);
          computedChanges[depPath] = computed;
        }
      }

      await prisma.character.update({
        where: { id: characterId },
        data: { data: charData as Prisma.InputJsonValue },
      });

      return { fieldPath, value, computedChanges };
    },

    async batchUpdateFields(characterId: string, userId: string, updates: Array<{ fieldPath: string; value: unknown }>) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const charData = (character.data as Record<string, unknown>) || {};
      const formulas = (character.template.formulas as Record<string, string>) || {};
      const schema = character.template.schema as unknown as TemplateSchema;

      // Apply all updates
      for (const update of updates) {
        setNestedValue(charData, update.fieldPath, update.value);
      }

      // Recompute all dependent fields
      const ctx = buildFormulaContext(charData, character.level, character.experience);
      const computed = computeAllFields(schema, formulas, ctx);
      for (const [path, value] of Object.entries(computed)) {
        setNestedValue(charData, path, value);
      }

      await prisma.character.update({
        where: { id: characterId },
        data: { data: charData as Prisma.InputJsonValue },
      });

      return { computedChanges: computed };
    },

    // ── Inventory ──

    async addInventoryItem(characterId: string, userId: string, input: AddInventoryItemInput) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const inventory = (character.inventory as unknown as InventoryItem[]) || [];
      const newInventory = addItem(inventory, input);

      await prisma.character.update({
        where: { id: characterId },
        data: { inventory: newInventory as unknown as Prisma.InputJsonValue },
      });

      return newInventory;
    },

    async removeInventoryItem(characterId: string, userId: string, itemId: string) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const inventory = (character.inventory as unknown as InventoryItem[]) || [];
      const newInventory = removeItem(inventory, itemId);

      await prisma.character.update({
        where: { id: characterId },
        data: { inventory: newInventory as unknown as Prisma.InputJsonValue },
      });

      return newInventory;
    },

    async updateInventoryItem(characterId: string, userId: string, itemId: string, input: UpdateInventoryItemInput) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const inventory = (character.inventory as unknown as InventoryItem[]) || [];
      const newInventory = updateItem(inventory, itemId, input);

      await prisma.character.update({
        where: { id: characterId },
        data: { inventory: newInventory as unknown as Prisma.InputJsonValue },
      });

      return newInventory;
    },

    async toggleEquipItem(characterId: string, userId: string, itemId: string) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const inventory = (character.inventory as unknown as InventoryItem[]) || [];
      const newInventory = toggleEquipped(inventory, itemId);

      await prisma.character.update({
        where: { id: characterId },
        data: { inventory: newInventory as unknown as Prisma.InputJsonValue },
      });

      return newInventory;
    },

    async getInventoryWeight(characterId: string, userId: string) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const inventory = (character.inventory as unknown as InventoryItem[]) || [];
      return { totalWeight: calculateTotalWeight(inventory) };
    },

    // ── Spells ──

    async addSpell(characterId: string, userId: string, input: AddSpellInput) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const spells = (character.spells as Record<string, unknown>) || {};
      const spellList = (spells["list"] as unknown[]) || [];

      const newSpell = {
        id: crypto.randomUUID(),
        ...input,
      };

      const updatedSpells = {
        ...spells,
        list: [...spellList, newSpell],
      };

      await prisma.character.update({
        where: { id: characterId },
        data: { spells: updatedSpells as Prisma.InputJsonValue },
      });

      return newSpell;
    },

    async removeSpell(characterId: string, userId: string, spellId: string) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const spells = (character.spells as Record<string, unknown>) || {};
      const spellList = (spells["list"] as Array<{ id: string }>) || [];

      const updatedSpells = {
        ...spells,
        list: spellList.filter((s) => s.id !== spellId),
      };

      await prisma.character.update({
        where: { id: characterId },
        data: { spells: updatedSpells as Prisma.InputJsonValue },
      });
    },

    async updateSpell(characterId: string, userId: string, spellId: string, input: UpdateSpellInput) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const spells = (character.spells as Record<string, unknown>) || {};
      const spellList = (spells["list"] as Array<Record<string, unknown>>) || [];

      const updatedSpells = {
        ...spells,
        list: spellList.map((s) =>
          s["id"] === spellId ? { ...s, ...input } : s
        ),
      };

      await prisma.character.update({
        where: { id: characterId },
        data: { spells: updatedSpells as Prisma.InputJsonValue },
      });
    },

    async toggleSpellPrepared(characterId: string, userId: string, spellId: string) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const spells = (character.spells as Record<string, unknown>) || {};
      const spellList = (spells["list"] as Array<Record<string, unknown>>) || [];

      const updatedSpells = {
        ...spells,
        list: spellList.map((s) =>
          s["id"] === spellId ? { ...s, prepared: !s["prepared"] } : s
        ),
      };

      await prisma.character.update({
        where: { id: characterId },
        data: { spells: updatedSpells as Prisma.InputJsonValue },
      });
    },

    // ── Level Up ──

    async levelUp(characterId: string, userId: string, choices: LevelUpInput) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const settings = (character.template.settings as Record<string, unknown>) || {};

      const config: LevelConfig = {
        hitDie: (settings["hitDie"] as number) || 8,
        spellProgression: (settings["spellProgression"] as any) || "none",
      };

      if (!canLevelUp(character.level, character.experience, config)) {
        throw new BadRequestError("XP insuficiente para subir de nível");
      }

      const charData = (character.data as Record<string, unknown>) || {};
      const result = applyLevelUp(character.level, charData, choices, config);

      // Update HP
      const hp = (charData["hp"] as Record<string, unknown>) || { current: 0, max: 0 };
      const newMaxHp = ((hp["max"] as number) || 0) + result.hpGained;
      const newCurrentHp = ((hp["current"] as number) || 0) + result.hpGained;

      setNestedValue(charData, "hp.max", newMaxHp);
      setNestedValue(charData, "hp.current", newCurrentHp);

      // Record level history
      const levelHistory = (character.levelHistory as unknown as unknown[]) || [];
      levelHistory.push({
        level: result.newLevel,
        hpGained: result.hpGained,
        choices,
        timestamp: new Date().toISOString(),
      });

      // Recompute all fields
      const formulas = (character.template.formulas as Record<string, string>) || {};
      const schema = character.template.schema as unknown as TemplateSchema;
      const ctx = buildFormulaContext(charData, result.newLevel, character.experience);
      const computed = computeAllFields(schema, formulas, ctx);
      for (const [path, value] of Object.entries(computed)) {
        setNestedValue(charData, path, value);
      }

      await prisma.character.update({
        where: { id: characterId },
        data: {
          level: result.newLevel,
          data: charData as Prisma.InputJsonValue,
          levelHistory: levelHistory as Prisma.InputJsonValue,
        },
      });

      return result;
    },

    // ── Rest ──

    async shortRest(characterId: string, userId: string, hitDiceToSpend: number) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const charData = (character.data as Record<string, unknown>) || {};
      const settings = (character.template.settings as Record<string, unknown>) || {};

      const hp = (charData["hp"] as Record<string, unknown>) || { current: 0, max: 0 };
      const hitDice = (charData["hitDice"] as Record<string, unknown>) || { current: character.level, max: character.level };

      const config: RestConfig = {
        type: "short",
        hitDie: (settings["hitDie"] as number) || 8,
        maxHitDice: character.level,
        currentHitDice: (hitDice["current"] as number) || character.level,
        currentHp: (hp["current"] as number) || 0,
        maxHp: (hp["max"] as number) || 0,
        constitutionModifier: (charData["abilities.constitution.modifier"] as number) || 0,
      };

      const result = applyShortRest(config, hitDiceToSpend);

      // Apply HP restoration
      const newCurrentHp = Math.min(config.maxHp, config.currentHp + result.hpRestored);
      setNestedValue(charData, "hp.current", newCurrentHp);
      setNestedValue(charData, "hitDice.current", config.currentHitDice - result.hitDiceUsed);

      await prisma.character.update({
        where: { id: characterId },
        data: { data: charData as Prisma.InputJsonValue },
      });

      return result;
    },

    async longRest(characterId: string, userId: string) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const charData = (character.data as Record<string, unknown>) || {};
      const settings = (character.template.settings as Record<string, unknown>) || {};

      const hp = (charData["hp"] as Record<string, unknown>) || { current: 0, max: 0 };

      const config: RestConfig = {
        type: "long",
        hitDie: (settings["hitDie"] as number) || 8,
        maxHitDice: character.level,
        currentHitDice: (charData["hitDice.current"] as number) || character.level,
        currentHp: (hp["current"] as number) || 0,
        maxHp: (hp["max"] as number) || 0,
        constitutionModifier: 0,
      };

      const result = applyLongRest(config);

      // Full HP recovery
      setNestedValue(charData, "hp.current", config.maxHp);
      // Recover half hit dice (minimum 1)
      const hitDiceRecovered = Math.max(1, Math.floor(character.level / 2));
      const currentHitDice = (charData["hitDice.current"] as number) || 0;
      setNestedValue(charData, "hitDice.current", Math.min(character.level, currentHitDice + hitDiceRecovered));
      // Reset death saves
      setNestedValue(charData, "deathSaves.successes", 0);
      setNestedValue(charData, "deathSaves.failures", 0);

      await prisma.character.update({
        where: { id: characterId },
        data: { data: charData as Prisma.InputJsonValue },
      });

      return result;
    },

    // ── Notes ──

    async addNote(characterId: string, userId: string, input: CharacterNoteInput) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const notes = (character.notes as unknown as Array<Record<string, unknown>>) || [];

      const newNote = {
        id: crypto.randomUUID(),
        title: input.title,
        content: input.content,
        isPrivate: input.isPrivate ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      notes.push(newNote);

      await prisma.character.update({
        where: { id: characterId },
        data: { notes: notes as Prisma.InputJsonValue },
      });

      return newNote;
    },

    async updateNote(characterId: string, userId: string, noteId: string, input: Partial<CharacterNoteInput>) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const notes = (character.notes as unknown as Array<Record<string, unknown>>) || [];

      const updatedNotes = notes.map((n) =>
        n["id"] === noteId
          ? { ...n, ...input, updatedAt: new Date().toISOString() }
          : n
      );

      await prisma.character.update({
        where: { id: characterId },
        data: { notes: updatedNotes as Prisma.InputJsonValue },
      });
    },

    async deleteNote(characterId: string, userId: string, noteId: string) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const notes = (character.notes as unknown as Array<Record<string, unknown>>) || [];

      const updatedNotes = notes.filter((n) => n["id"] !== noteId);

      await prisma.character.update({
        where: { id: characterId },
        data: { notes: updatedNotes as Prisma.InputJsonValue },
      });
    },

    // ── Share Permissions ──

    async setSharePermission(characterId: string, userId: string, input: SetSharePermissionInput) {
      await getCharacterWithOwnership(characterId, userId);

      return prisma.characterSharePermission.upsert({
        where: {
          characterId_sessionId_targetType_targetUserId: {
            characterId,
            sessionId: input.sessionId,
            targetType: input.targetType as any,
            targetUserId: input.targetUserId ?? "",
          },
        },
        create: {
          characterId,
          sessionId: input.sessionId,
          targetType: input.targetType as any,
          targetUserId: input.targetUserId,
          visibleSections: input.visibleSections as Prisma.InputJsonValue,
          canEdit: input.canEdit ?? false,
        },
        update: {
          visibleSections: input.visibleSections as Prisma.InputJsonValue,
          canEdit: input.canEdit ?? false,
        },
      });
    },

    async removeSharePermission(characterId: string, userId: string, permissionId: string) {
      await getCharacterWithOwnership(characterId, userId);

      await prisma.characterSharePermission.delete({
        where: { id: permissionId },
      });
    },

    async getSharePermissions(characterId: string, userId: string) {
      await getCharacterWithOwnership(characterId, userId);
      return prisma.characterSharePermission.findMany({
        where: { characterId },
      });
    },

    // ── Session Link ──

    async linkToSession(characterId: string, userId: string, sessionId: string) {
      await getCharacterWithOwnership(characterId, userId);
      return prisma.character.update({
        where: { id: characterId },
        data: { activeSessionId: sessionId },
      });
    },

    async unlinkFromSession(characterId: string, userId: string) {
      await getCharacterWithOwnership(characterId, userId);
      return prisma.character.update({
        where: { id: characterId },
        data: { activeSessionId: null },
      });
    },

    // ── HP Sync with Token ──

    async syncHpToToken(characterId: string, hp: { current: number; max: number; temp?: number }) {
      // Find tokens linked to this character and update their HP
      const tokens = await prisma.token.findMany({
        where: { characterId },
      });

      for (const token of tokens) {
        await prisma.token.update({
          where: { id: token.id },
          data: {
            hp: { current: hp.current, max: hp.max, temp: hp.temp ?? 0 } as Prisma.InputJsonValue,
          },
        });
      }

      return tokens.map((t) => t.id);
    },

    // ── Resolve dice notation ──

    async resolveDice(characterId: string, userId: string, notation: string) {
      const character = await getCharacterWithOwnership(characterId, userId);
      const charData = (character.data as Record<string, unknown>) || {};
      const ctx = buildFormulaContext(charData, character.level, character.experience);
      return resolveDiceNotation(notation, ctx);
    },
  };
}
