import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createNarrativeService } from "./narrative.service.js";
import { createNarrativeController } from "./narrative.controller.js";

export async function narrativeRoutes(app: FastifyInstance) {
  const service = createNarrativeService(prisma);
  const controller = createNarrativeController(service);

  // Tree
  app.get("/campaigns/:campaignId/narrative", controller.getTree);
  app.get("/campaigns/:campaignId/narrative/player", controller.getPlayerTree);

  // Nodes
  app.post("/campaigns/:campaignId/narrative/nodes", controller.createNode);
  app.patch("/campaigns/:campaignId/narrative/nodes/batch", controller.batchUpdateNodes);
  app.patch("/campaigns/:campaignId/narrative/nodes/:nodeId", controller.updateNode);
  app.patch("/campaigns/:campaignId/narrative/nodes/:nodeId/status", controller.updateNodeStatus);
  app.delete("/campaigns/:campaignId/narrative/nodes/:nodeId", controller.deleteNode);
  app.delete("/campaigns/:campaignId/narrative/nodes/:nodeId/subtree", controller.deleteSubtree);

  // Edges
  app.post("/campaigns/:campaignId/narrative/edges", controller.createEdge);
  app.patch("/campaigns/:campaignId/narrative/edges/:edgeId", controller.updateEdge);
  app.delete("/campaigns/:campaignId/narrative/edges/:edgeId", controller.deleteEdge);

  // Viewport
  app.put("/campaigns/:campaignId/narrative/viewport", controller.saveViewport);
}
