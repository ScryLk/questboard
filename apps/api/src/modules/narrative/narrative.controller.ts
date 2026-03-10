import type { FastifyRequest, FastifyReply } from "fastify";
import type { NarrativeService } from "./narrative.service.js";
import { createSuccessResponse } from "@questboard/shared";

export function createNarrativeController(service: NarrativeService) {
  function getUserId(request: FastifyRequest): string {
    return request.user?.id ?? (request.headers["x-user-id"] as string) ?? "";
  }

  return {
    // ─── Tree ──────────────────────────────────────────
    async getTree(
      request: FastifyRequest<{ Params: { campaignId: string } }>,
      reply: FastifyReply,
    ) {
      const tree = await service.getTree(request.params.campaignId, getUserId(request));
      return reply.send(createSuccessResponse(tree));
    },

    async getPlayerTree(
      request: FastifyRequest<{ Params: { campaignId: string } }>,
      reply: FastifyReply,
    ) {
      const tree = await service.getPlayerTree(request.params.campaignId, getUserId(request));
      return reply.send(createSuccessResponse(tree));
    },

    // ─── Nodes ─────────────────────────────────────────
    async createNode(
      request: FastifyRequest<{ Params: { campaignId: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as Record<string, unknown>;
      const node = await service.createNode(
        request.params.campaignId,
        getUserId(request),
        body as Parameters<NarrativeService["createNode"]>[2],
      );
      return reply.status(201).send(createSuccessResponse(node));
    },

    async updateNode(
      request: FastifyRequest<{ Params: { campaignId: string; nodeId: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as Record<string, unknown>;
      const node = await service.updateNode(
        request.params.campaignId,
        request.params.nodeId,
        getUserId(request),
        body,
      );
      return reply.send(createSuccessResponse(node));
    },

    async updateNodeStatus(
      request: FastifyRequest<{ Params: { campaignId: string; nodeId: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as { status: string };
      const node = await service.updateNodeStatus(
        request.params.campaignId,
        request.params.nodeId,
        getUserId(request),
        body.status,
      );
      return reply.send(createSuccessResponse(node));
    },

    async deleteNode(
      request: FastifyRequest<{ Params: { campaignId: string; nodeId: string } }>,
      reply: FastifyReply,
    ) {
      await service.deleteNode(request.params.campaignId, request.params.nodeId, getUserId(request));
      return reply.status(204).send();
    },

    async deleteSubtree(
      request: FastifyRequest<{ Params: { campaignId: string; nodeId: string } }>,
      reply: FastifyReply,
    ) {
      const result = await service.deleteSubtree(
        request.params.campaignId,
        request.params.nodeId,
        getUserId(request),
      );
      return reply.send(createSuccessResponse(result));
    },

    async batchUpdateNodes(
      request: FastifyRequest<{ Params: { campaignId: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as { nodes: Array<{ id: string; positionX?: number; positionY?: number; status?: string }> };
      const nodes = await service.batchUpdateNodes(
        request.params.campaignId,
        getUserId(request),
        body.nodes,
      );
      return reply.send(createSuccessResponse(nodes));
    },

    // ─── Edges ─────────────────────────────────────────
    async createEdge(
      request: FastifyRequest<{ Params: { campaignId: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as { sourceId: string; targetId: string; label?: string; status?: string };
      const edge = await service.createEdge(request.params.campaignId, getUserId(request), body);
      return reply.status(201).send(createSuccessResponse(edge));
    },

    async updateEdge(
      request: FastifyRequest<{ Params: { campaignId: string; edgeId: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as Record<string, unknown>;
      const edge = await service.updateEdge(
        request.params.campaignId,
        request.params.edgeId,
        getUserId(request),
        body,
      );
      return reply.send(createSuccessResponse(edge));
    },

    async deleteEdge(
      request: FastifyRequest<{ Params: { campaignId: string; edgeId: string } }>,
      reply: FastifyReply,
    ) {
      await service.deleteEdge(request.params.campaignId, request.params.edgeId, getUserId(request));
      return reply.status(204).send();
    },

    // ─── Viewport ──────────────────────────────────────
    async saveViewport(
      request: FastifyRequest<{ Params: { campaignId: string } }>,
      reply: FastifyReply,
    ) {
      const body = request.body as { x: number; y: number; zoom: number };
      const viewport = await service.saveViewport(request.params.campaignId, getUserId(request), body);
      return reply.send(createSuccessResponse(viewport));
    },
  };
}
