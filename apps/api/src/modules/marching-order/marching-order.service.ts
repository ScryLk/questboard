import type { PrismaClient } from "@questboard/db";
import type { SetMarchingOrderInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createMarchingOrderService(prisma: PrismaClient) {
  return {
    async get(sessionId: string) {
      const order = await prisma.marchingOrder.findFirst({
        where: { sessionId },
        orderBy: { updatedAt: "desc" },
      });

      if (!order) {
        return {
          sessionId,
          formation: [],
          isActive: false,
          rules: {},
          updatedAt: new Date().toISOString(),
        };
      }

      return this.format(order);
    },

    async set(sessionId: string, role: string, input: SetMarchingOrderInput) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem definir a ordem de marcha");
      }

      // Upsert the marching order for this session
      const existing = await prisma.marchingOrder.findFirst({
        where: { sessionId },
      });

      let order;
      if (existing) {
        order = await prisma.marchingOrder.update({
          where: { id: existing.id },
          data: {
            formation: input.formation as any,
            isActive: input.isActive ?? existing.isActive,
            rules: input.rules as any ?? existing.rules,
          },
        });
      } else {
        order = await prisma.marchingOrder.create({
          data: {
            sessionId,
            formation: input.formation as any,
            isActive: input.isActive ?? true,
            rules: input.rules as any ?? {},
          },
        });
      }

      return this.format(order);
    },

    async toggle(sessionId: string, role: string, isActive: boolean) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem ativar/desativar ordem de marcha");
      }

      const existing = await prisma.marchingOrder.findFirst({
        where: { sessionId },
      });

      if (!existing) throw new NotFoundError("Marching order");

      const order = await prisma.marchingOrder.update({
        where: { id: existing.id },
        data: { isActive },
      });

      return this.format(order);
    },

    format(order: any) {
      return {
        id: order.id,
        sessionId: order.sessionId,
        formation: order.formation ?? [],
        isActive: order.isActive,
        rules: order.rules ?? {},
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      };
    },
  };
}
