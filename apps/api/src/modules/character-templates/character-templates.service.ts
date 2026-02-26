import type { PrismaClient, Prisma } from "@questboard/db";
import type { CreateCharacterTemplateInput, UpdateCharacterTemplateInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../errors/app-error.js";

export function createCharacterTemplatesService(prisma: PrismaClient) {
  return {
    async list(filters?: {
      systemName?: string;
      tier?: string;
      isOfficial?: boolean;
      search?: string;
    }) {
      const where: Prisma.CharacterTemplateWhereInput = { isActive: true };

      if (filters?.systemName) where.systemName = filters.systemName;
      if (filters?.tier) where.tier = filters.tier as any;
      if (filters?.isOfficial !== undefined) where.isOfficial = filters.isOfficial;
      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { systemName: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      return prisma.characterTemplate.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          systemName: true,
          iconUrl: true,
          coverUrl: true,
          version: true,
          tier: true,
          isOfficial: true,
        },
        orderBy: [{ isOfficial: "desc" }, { name: "asc" }],
      });
    },

    async getById(id: string) {
      const template = await prisma.characterTemplate.findUnique({
        where: { id },
      });
      if (!template) throw new NotFoundError("Template");
      return template;
    },

    async getBySlug(slug: string) {
      const template = await prisma.characterTemplate.findUnique({
        where: { slug },
      });
      if (!template) throw new NotFoundError("Template");
      return template;
    },

    async create(userId: string, input: CreateCharacterTemplateInput) {
      // Check if slug is unique
      const existing = await prisma.characterTemplate.findUnique({
        where: { slug: input.slug },
      });
      if (existing) throw new BadRequestError("Slug já existe");

      return prisma.characterTemplate.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description ?? null,
          systemName: input.systemName,
          iconUrl: input.iconUrl ?? null,
          coverUrl: input.coverUrl ?? null,
          schema: input.schema as Prisma.InputJsonValue,
          layout: (input.layout ?? {}) as Prisma.InputJsonValue,
          formulas: (input.formulas ?? {}) as Prisma.InputJsonValue,
          diceActions: (input.diceActions ?? []) as Prisma.InputJsonValue,
          defaults: (input.defaults ?? {}) as Prisma.InputJsonValue,
          settings: (input.settings ?? {}) as Prisma.InputJsonValue,
          tier: input.tier as any ?? "FREE",
          isOfficial: input.isOfficial ?? false,
          createdById: userId,
        },
      });
    },

    async update(id: string, userId: string, input: UpdateCharacterTemplateInput) {
      const template = await prisma.characterTemplate.findUnique({
        where: { id },
      });
      if (!template) throw new NotFoundError("Template");

      // Only creator or admin can update
      if (template.createdById && template.createdById !== userId) {
        throw new ForbiddenError("Sem permissão para editar este template");
      }

      const data: Prisma.CharacterTemplateUpdateInput = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.description !== undefined) data.description = input.description;
      if (input.systemName !== undefined) data.systemName = input.systemName;
      if (input.iconUrl !== undefined) data.iconUrl = input.iconUrl;
      if (input.coverUrl !== undefined) data.coverUrl = input.coverUrl;
      if (input.schema !== undefined) {
        data.schema = input.schema as Prisma.InputJsonValue;
        data.version = { increment: 1 };
      }
      if (input.layout !== undefined) data.layout = input.layout as Prisma.InputJsonValue;
      if (input.formulas !== undefined) data.formulas = input.formulas as Prisma.InputJsonValue;
      if (input.diceActions !== undefined) data.diceActions = input.diceActions as Prisma.InputJsonValue;
      if (input.defaults !== undefined) data.defaults = input.defaults as Prisma.InputJsonValue;
      if (input.settings !== undefined) data.settings = input.settings as Prisma.InputJsonValue;
      if (input.tier !== undefined) data.tier = input.tier as any;
      if (input.isOfficial !== undefined) data.isOfficial = input.isOfficial;
      if (input.changelog !== undefined) data.changelog = input.changelog;

      return prisma.characterTemplate.update({
        where: { id },
        data,
      });
    },

    async deactivate(id: string, userId: string) {
      const template = await prisma.characterTemplate.findUnique({
        where: { id },
      });
      if (!template) throw new NotFoundError("Template");
      if (template.createdById && template.createdById !== userId) {
        throw new ForbiddenError("Sem permissão");
      }

      return prisma.characterTemplate.update({
        where: { id },
        data: { isActive: false },
      });
    },

    async getAvailableForPlan(planLimits: { availableSheetTemplates: unknown; allowCustomTemplates: boolean }) {
      const allowedSlugs = Array.isArray(planLimits.availableSheetTemplates)
        ? planLimits.availableSheetTemplates as string[]
        : ["generic"];

      const where: Prisma.CharacterTemplateWhereInput = {
        isActive: true,
        OR: [
          { slug: { in: allowedSlugs } },
          ...(planLimits.allowCustomTemplates ? [{ isOfficial: false }] : []),
        ],
      };

      return prisma.characterTemplate.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          systemName: true,
          iconUrl: true,
          coverUrl: true,
          version: true,
          tier: true,
          isOfficial: true,
        },
        orderBy: [{ isOfficial: "desc" }, { name: "asc" }],
      });
    },
  };
}
