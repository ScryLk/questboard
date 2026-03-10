import type { PrismaClient } from "@questboard/db";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createNarrativeService(prisma: PrismaClient) {
  // ─── Helpers ─────────────────────────────────────────
  async function verifyCampaignGM(campaignId: string, userId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { ownerId: true },
    });
    if (!campaign) throw new NotFoundError("Campaign");
    if (campaign.ownerId !== userId) {
      const member = await prisma.campaignMember.findUnique({
        where: { campaignId_userId: { campaignId, userId } },
        select: { role: true },
      });
      if (!member || (member.role !== "GM" && member.role !== "CO_GM")) {
        throw new ForbiddenError("Apenas o GM pode editar a árvore narrativa");
      }
    }
  }

  async function verifyCampaignMember(campaignId: string, userId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { ownerId: true },
    });
    if (!campaign) throw new NotFoundError("Campaign");
    if (campaign.ownerId !== userId) {
      const member = await prisma.campaignMember.findUnique({
        where: { campaignId_userId: { campaignId, userId } },
      });
      if (!member) throw new ForbiddenError("Não é membro da campanha");
    }
  }

  return {
    // ─── Tree ──────────────────────────────────────────
    async getTree(campaignId: string, userId: string) {
      await verifyCampaignMember(campaignId, userId);

      const [nodes, edges, viewport] = await Promise.all([
        prisma.narrativeNode.findMany({ where: { campaignId }, orderBy: { createdAt: "asc" } }),
        prisma.narrativeEdge.findMany({ where: { campaignId }, orderBy: { createdAt: "asc" } }),
        prisma.narrativeViewport.findUnique({ where: { campaignId } }),
      ]);

      return { nodes, edges, viewport };
    },

    async getPlayerTree(campaignId: string, userId: string) {
      await verifyCampaignMember(campaignId, userId);

      const [nodes, edges, viewport] = await Promise.all([
        prisma.narrativeNode.findMany({
          where: { campaignId, status: { in: ["active", "pending"] } },
          orderBy: { createdAt: "asc" },
        }),
        prisma.narrativeEdge.findMany({
          where: { campaignId, status: { in: ["active", "pending"] } },
          orderBy: { createdAt: "asc" },
        }),
        prisma.narrativeViewport.findUnique({ where: { campaignId } }),
      ]);

      // Strip GM notes from player view
      const sanitized = nodes.map(({ gmNotes: _, ...node }) => node);

      return { nodes: sanitized, edges, viewport };
    },

    // ─── Nodes ─────────────────────────────────────────
    async createNode(
      campaignId: string,
      userId: string,
      input: {
        type: string;
        title: string;
        description?: string;
        status?: string;
        positionX?: number;
        positionY?: number;
        gmNotes?: string;
        sessionId?: string;
        sessionNumber?: number;
        chapterLabel?: string;
        color?: string;
        linkedEncounterIds?: string[];
        linkedNpcIds?: string[];
        linkedMapIds?: string[];
      },
    ) {
      await verifyCampaignGM(campaignId, userId);

      return prisma.narrativeNode.create({
        data: {
          campaignId,
          type: input.type,
          title: input.title,
          description: input.description,
          status: input.status ?? "pending",
          positionX: input.positionX ?? 0,
          positionY: input.positionY ?? 0,
          gmNotes: input.gmNotes,
          sessionId: input.sessionId,
          sessionNumber: input.sessionNumber,
          chapterLabel: input.chapterLabel,
          color: input.color,
          linkedEncounterIds: input.linkedEncounterIds ?? [],
          linkedNpcIds: input.linkedNpcIds ?? [],
          linkedMapIds: input.linkedMapIds ?? [],
        },
      });
    },

    async updateNode(
      campaignId: string,
      nodeId: string,
      userId: string,
      input: Record<string, unknown>,
    ) {
      await verifyCampaignGM(campaignId, userId);

      const node = await prisma.narrativeNode.findUnique({ where: { id: nodeId } });
      if (!node) throw new NotFoundError("NarrativeNode");
      if (node.campaignId !== campaignId) throw new ForbiddenError("Nó não pertence a esta campanha");

      return prisma.narrativeNode.update({ where: { id: nodeId }, data: input });
    },

    async updateNodeStatus(campaignId: string, nodeId: string, userId: string, status: string) {
      await verifyCampaignGM(campaignId, userId);

      const node = await prisma.narrativeNode.findUnique({ where: { id: nodeId } });
      if (!node) throw new NotFoundError("NarrativeNode");
      if (node.campaignId !== campaignId) throw new ForbiddenError("Nó não pertence a esta campanha");

      return prisma.narrativeNode.update({ where: { id: nodeId }, data: { status } });
    },

    async deleteNode(campaignId: string, nodeId: string, userId: string) {
      await verifyCampaignGM(campaignId, userId);

      const node = await prisma.narrativeNode.findUnique({ where: { id: nodeId } });
      if (!node) throw new NotFoundError("NarrativeNode");
      if (node.campaignId !== campaignId) throw new ForbiddenError("Nó não pertence a esta campanha");

      return prisma.narrativeNode.delete({ where: { id: nodeId } });
    },

    async deleteSubtree(campaignId: string, nodeId: string, userId: string) {
      await verifyCampaignGM(campaignId, userId);

      const node = await prisma.narrativeNode.findUnique({ where: { id: nodeId } });
      if (!node) throw new NotFoundError("NarrativeNode");
      if (node.campaignId !== campaignId) throw new ForbiddenError("Nó não pertence a esta campanha");

      // BFS to collect all descendant node IDs
      const allEdges = await prisma.narrativeEdge.findMany({
        where: { campaignId },
        select: { sourceId: true, targetId: true },
      });

      const childMap = new Map<string, string[]>();
      for (const edge of allEdges) {
        const children = childMap.get(edge.sourceId) ?? [];
        children.push(edge.targetId);
        childMap.set(edge.sourceId, children);
      }

      const toDelete = new Set<string>([nodeId]);
      const queue = [nodeId];
      while (queue.length > 0) {
        const current = queue.shift()!;
        for (const child of childMap.get(current) ?? []) {
          if (!toDelete.has(child)) {
            toDelete.add(child);
            queue.push(child);
          }
        }
      }

      // Delete all nodes (edges cascade)
      await prisma.narrativeNode.deleteMany({
        where: { id: { in: [...toDelete] } },
      });

      return { deletedCount: toDelete.size };
    },

    async batchUpdateNodes(
      campaignId: string,
      userId: string,
      nodes: Array<{ id: string; positionX?: number; positionY?: number; status?: string }>,
    ) {
      await verifyCampaignGM(campaignId, userId);

      const updates = nodes.map((n) =>
        prisma.narrativeNode.update({
          where: { id: n.id },
          data: {
            ...(n.positionX !== undefined && { positionX: n.positionX }),
            ...(n.positionY !== undefined && { positionY: n.positionY }),
            ...(n.status !== undefined && { status: n.status }),
          },
        }),
      );

      return prisma.$transaction(updates);
    },

    // ─── Edges ─────────────────────────────────────────
    async createEdge(
      campaignId: string,
      userId: string,
      input: { sourceId: string; targetId: string; label?: string; status?: string },
    ) {
      await verifyCampaignGM(campaignId, userId);

      return prisma.narrativeEdge.create({
        data: {
          campaignId,
          sourceId: input.sourceId,
          targetId: input.targetId,
          label: input.label,
          status: input.status ?? "pending",
        },
      });
    },

    async updateEdge(
      campaignId: string,
      edgeId: string,
      userId: string,
      input: Record<string, unknown>,
    ) {
      await verifyCampaignGM(campaignId, userId);

      const edge = await prisma.narrativeEdge.findUnique({ where: { id: edgeId } });
      if (!edge) throw new NotFoundError("NarrativeEdge");
      if (edge.campaignId !== campaignId) throw new ForbiddenError("Edge não pertence a esta campanha");

      return prisma.narrativeEdge.update({ where: { id: edgeId }, data: input });
    },

    async deleteEdge(campaignId: string, edgeId: string, userId: string) {
      await verifyCampaignGM(campaignId, userId);

      const edge = await prisma.narrativeEdge.findUnique({ where: { id: edgeId } });
      if (!edge) throw new NotFoundError("NarrativeEdge");
      if (edge.campaignId !== campaignId) throw new ForbiddenError("Edge não pertence a esta campanha");

      return prisma.narrativeEdge.delete({ where: { id: edgeId } });
    },

    // ─── Viewport ──────────────────────────────────────
    async saveViewport(
      campaignId: string,
      userId: string,
      input: { x: number; y: number; zoom: number },
    ) {
      await verifyCampaignMember(campaignId, userId);

      return prisma.narrativeViewport.upsert({
        where: { campaignId },
        update: { x: input.x, y: input.y, zoom: input.zoom },
        create: { campaignId, x: input.x, y: input.y, zoom: input.zoom },
      });
    },
  };
}

export type NarrativeService = ReturnType<typeof createNarrativeService>;
