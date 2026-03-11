import type { FastifyRequest, FastifyReply } from "fastify";
import { PLAN_LIMITS, type PlanFeature, getMinPlanForFeature } from "../config/plan-limits.js";
import { ForbiddenError } from "../errors/app-error.js";

type PlanKey = keyof typeof PLAN_LIMITS;

export function planGate(feature: PlanFeature) {
  return async function checkPlan(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const plan = request.user.plan as PlanKey;
    const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;
    const value = limits[feature];

    const allowed = typeof value === "boolean" ? value : value !== 0;

    if (!allowed) {
      const requiredPlan = getMinPlanForFeature(feature);
      throw new ForbiddenError(
        JSON.stringify({
          code: "PLAN_LIMIT_REACHED",
          feature,
          requiredPlan,
          message: `Recurso "${feature}" requer plano ${requiredPlan}`,
        }),
      );
    }
  };
}
