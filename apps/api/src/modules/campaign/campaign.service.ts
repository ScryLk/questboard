import type { PrismaClient } from "@questboard/db";
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from "../../errors/app-error.js";
import { PLAN_LIMITS } from "../../config/plan-limits.js";
import { randomBytes } from "node:crypto";

type PlanKey = keyof typeof PLAN_LIMITS;

function generateCode(): string {
  return randomBytes(4).toString("hex").toUpperCase().slice(0, 8);
}

export function createCampaignService(prisma: PrismaClient) {
  return {
    async list(userId: string) {
      return prisma.campaign.findMany({
        where: {
          deletedAt: null,
          OR: [
            { ownerId: userId },
            { members: { some: { userId, leftAt: null } } },
          ],
        },
        include: {
          owner: { select: { id: true, displayName: true, avatarUrl: true } },
          _count: { select: { members: true, sessions: true } },
        },
        orderBy: { updatedAt: "desc" },
      });
    },

    async getById(campaignId: string) {
      const campaign = await prisma.campaign.findFirst({
        where: { id: campaignId, deletedAt: null },
        include: {
          owner: { select: { id: true, displayName: true, avatarUrl: true } },
          members: {
            where: { leftAt: null },
            include: { user: { select: { id: true, displayName: true, avatarUrl: true } } },
          },
          sessions: {
            where: { deletedAt: null },
            select: { id: true, name: true, status: true, scheduledAt: true },
            orderBy: { updatedAt: "desc" },
          },
        },
      });
      if (!campaign) throw new NotFoundError("Campaign");
      return campaign;
    },

    async create(userId: string, plan: string, input: { name: string; description?: string; system: string; isPublic?: boolean; maxPlayers?: number }) {
      const limits = PLAN_LIMITS[plan as PlanKey] ?? PLAN_LIMITS.FREE;
      if (limits.maxActiveCampaigns !== -1) {
        const count = await prisma.campaign.count({ where: { ownerId: userId, deletedAt: null } });
        if (count >= limits.maxActiveCampaigns) {
          throw new ForbiddenError("Limite de campanhas atingido");
        }
      }

      return prisma.campaign.create({
        data: {
          ownerId: userId,
          name: input.name,
          description: input.description,
          system: input.system,
          isPublic: input.isPublic ?? false,
          maxPlayers: input.maxPlayers ?? 5,
          code: generateCode(),
          members: {
            create: { userId, role: "GM" },
          },
        },
      });
    },

    async update(campaignId: string, userId: string, input: { name?: string; description?: string; isPublic?: boolean; maxPlayers?: number; tags?: string[] }) {
      const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, deletedAt: null }, select: { ownerId: true } });
      if (!campaign) throw new NotFoundError("Campaign");
      if (campaign.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode editar a campanha");

      return prisma.campaign.update({ where: { id: campaignId }, data: input });
    },

    async delete(campaignId: string, userId: string) {
      const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, deletedAt: null }, select: { ownerId: true } });
      if (!campaign) throw new NotFoundError("Campaign");
      if (campaign.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode deletar a campanha");

      return prisma.campaign.update({ where: { id: campaignId }, data: { deletedAt: new Date() } });
    },

    async joinByCode(code: string, userId: string) {
      const campaign = await prisma.campaign.findFirst({
        where: { code, deletedAt: null },
        select: { id: true, maxPlayers: true, _count: { select: { members: { where: { leftAt: null } } } } },
      });
      if (!campaign) throw new NotFoundError("Campaign");

      if (campaign._count.members >= campaign.maxPlayers) {
        throw new BadRequestError("Campanha cheia");
      }

      const existing = await prisma.campaignMember.findUnique({
        where: { campaignId_userId: { campaignId: campaign.id, userId } },
      });
      if (existing && !existing.leftAt) throw new ConflictError("Já é membro da campanha");

      if (existing) {
        return prisma.campaignMember.update({
          where: { id: existing.id },
          data: { leftAt: null, role: "PLAYER" },
        });
      }

      return prisma.campaignMember.create({
        data: { campaignId: campaign.id, userId, role: "PLAYER" },
      });
    },

    async removeMember(campaignId: string, userId: string, targetUserId: string) {
      const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, deletedAt: null }, select: { ownerId: true } });
      if (!campaign) throw new NotFoundError("Campaign");
      if (campaign.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode remover membros");
      if (campaign.ownerId === targetUserId) throw new BadRequestError("O GM não pode se remover");

      const member = await prisma.campaignMember.findUnique({
        where: { campaignId_userId: { campaignId, userId: targetUserId } },
      });
      if (!member) throw new NotFoundError("CampaignMember");

      return prisma.campaignMember.update({ where: { id: member.id }, data: { leftAt: new Date() } });
    },

    async updateMemberRole(campaignId: string, userId: string, targetUserId: string, role: "GM" | "CO_GM" | "PLAYER" | "SPECTATOR") {
      const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, deletedAt: null }, select: { ownerId: true } });
      if (!campaign) throw new NotFoundError("Campaign");
      if (campaign.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode alterar roles");

      const member = await prisma.campaignMember.findUnique({
        where: { campaignId_userId: { campaignId, userId: targetUserId } },
      });
      if (!member) throw new NotFoundError("CampaignMember");

      return prisma.campaignMember.update({ where: { id: member.id }, data: { role } });
    },
  };
}

export type CampaignService = ReturnType<typeof createCampaignService>;
