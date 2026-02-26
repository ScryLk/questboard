import type { PrismaClient } from "@questboard/db";
import type { CreateHandoutInput, UpdateHandoutInput, HandoutQuery } from "@questboard/shared";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../errors/app-error.js";

interface HandoutSection {
  id: string;
  title: string;
  content?: string;
  imageUrl?: string;
  isRevealed: boolean;
  revealedAt?: string;
  revealedTo: string[];
  revealCondition?: string;
  sortOrder: number;
}

export function createHandoutsService(prisma: PrismaClient) {
  function generateSectionId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  return {
    async create(sessionId: string, userId: string, role: string, input: CreateHandoutInput) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem criar handouts");
      }

      const sections = input.sections.map((s, i) => ({
        id: s.id ?? generateSectionId(),
        title: s.title,
        content: s.content,
        imageUrl: s.imageUrl,
        isRevealed: s.isRevealed ?? false,
        revealedAt: s.isRevealed ? new Date().toISOString() : undefined,
        revealedTo: s.revealedTo ?? [],
        revealCondition: s.revealCondition,
        sortOrder: s.sortOrder ?? i,
      }));

      const handout = await prisma.handout.create({
        data: {
          sessionId,
          name: input.name,
          description: input.description,
          handoutType: input.handoutType as any,
          sections: sections as any,
          coverImageUrl: input.coverImageUrl,
          style: input.style ?? "parchment",
          visibleTo: input.visibleTo ?? [],
          createdById: userId,
        },
      });

      return this.formatHandout(handout, userId, role);
    },

    async getById(sessionId: string, handoutId: string, userId: string, role: string) {
      const handout = await prisma.handout.findFirst({
        where: { id: handoutId, sessionId },
      });
      if (!handout) throw new NotFoundError("Handout");

      return this.formatHandout(handout, userId, role);
    },

    async list(sessionId: string, userId: string, role: string, query: HandoutQuery) {
      const isGm = ["GM", "CO_GM"].includes(role);

      const where: any = { sessionId };
      if (query.type) where.handoutType = query.type;
      if (query.pinnedOnly) where.isPinned = true;
      if (query.search) {
        where.name = { contains: query.search, mode: "insensitive" };
      }

      const handouts = await prisma.handout.findMany({
        where,
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        take: query.limit ?? 50,
        skip: query.offset ?? 0,
      });

      // Filter visibility for non-GMs
      const visible = isGm
        ? handouts
        : handouts.filter((h) => h.visibleTo.length === 0 || h.visibleTo.includes(userId));

      return visible.map((h) => {
        const sections = (h.sections as HandoutSection[]) ?? [];
        const revealedCount = sections.filter((s) =>
          isGm ? true : s.isRevealed && (s.revealedTo.length === 0 || s.revealedTo.includes(userId))
        ).length;

        return {
          id: h.id,
          name: h.name,
          handoutType: h.handoutType,
          coverImageUrl: h.coverImageUrl,
          style: h.style,
          isPinned: h.isPinned,
          revealedSectionCount: revealedCount,
          totalSectionCount: isGm ? sections.length : revealedCount,
          createdAt: h.createdAt.toISOString(),
        };
      });
    },

    async update(sessionId: string, handoutId: string, userId: string, role: string, input: UpdateHandoutInput) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem editar handouts");
      }

      const handout = await prisma.handout.findFirst({
        where: { id: handoutId, sessionId },
      });
      if (!handout) throw new NotFoundError("Handout");

      const data: any = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.description !== undefined) data.description = input.description;
      if (input.coverImageUrl !== undefined) data.coverImageUrl = input.coverImageUrl;
      if (input.style !== undefined) data.style = input.style;
      if (input.visibleTo !== undefined) data.visibleTo = input.visibleTo;
      if (input.isPinned !== undefined) data.isPinned = input.isPinned;
      if (input.sections !== undefined) {
        data.sections = input.sections.map((s, i) => ({
          id: s.id ?? generateSectionId(),
          title: s.title,
          content: s.content,
          imageUrl: s.imageUrl,
          isRevealed: s.isRevealed ?? false,
          revealedTo: s.revealedTo ?? [],
          revealCondition: s.revealCondition,
          sortOrder: s.sortOrder ?? i,
        }));
      }

      const updated = await prisma.handout.update({
        where: { id: handoutId },
        data,
      });

      return this.formatHandout(updated, userId, role);
    },

    async delete(sessionId: string, handoutId: string, role: string) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem deletar handouts");
      }

      const handout = await prisma.handout.findFirst({
        where: { id: handoutId, sessionId },
      });
      if (!handout) throw new NotFoundError("Handout");

      await prisma.handout.delete({ where: { id: handoutId } });
    },

    async revealSection(
      sessionId: string,
      handoutId: string,
      sectionId: string,
      role: string,
      revealTo?: string[]
    ) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem revelar seções");
      }

      const handout = await prisma.handout.findFirst({
        where: { id: handoutId, sessionId },
      });
      if (!handout) throw new NotFoundError("Handout");

      const sections = (handout.sections as HandoutSection[]) ?? [];
      const sectionIdx = sections.findIndex((s) => s.id === sectionId);
      if (sectionIdx === -1) throw new NotFoundError("Seção do handout");

      sections[sectionIdx]!.isRevealed = true;
      sections[sectionIdx]!.revealedAt = new Date().toISOString();
      if (revealTo && revealTo.length > 0) {
        const existing = new Set(sections[sectionIdx]!.revealedTo);
        revealTo.forEach((id) => existing.add(id));
        sections[sectionIdx]!.revealedTo = Array.from(existing);
      }

      await prisma.handout.update({
        where: { id: handoutId },
        data: { sections: sections as any },
      });

      return sections[sectionIdx]!;
    },

    formatHandout(handout: any, userId: string, role: string) {
      const isGm = ["GM", "CO_GM"].includes(role);
      const sections = (handout.sections as HandoutSection[]) ?? [];

      const visibleSections = isGm
        ? sections
        : sections
            .filter((s) => s.isRevealed && (s.revealedTo.length === 0 || s.revealedTo.includes(userId)))
            .map((s) => ({
              ...s,
              revealCondition: undefined, // hide reveal conditions from players
            }));

      return {
        id: handout.id,
        sessionId: handout.sessionId,
        name: handout.name,
        description: handout.description,
        handoutType: handout.handoutType,
        sections: visibleSections,
        coverImageUrl: handout.coverImageUrl,
        style: handout.style,
        visibleTo: isGm ? handout.visibleTo : [],
        isPinned: handout.isPinned,
        createdById: handout.createdById,
        createdAt: handout.createdAt.toISOString(),
        updatedAt: handout.updatedAt.toISOString(),
      };
    },
  };
}
