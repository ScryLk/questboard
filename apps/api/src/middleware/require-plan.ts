// ── Middleware: tier de plano + feature gating ─────────────────
//
// Versão estendida do `planGate(feature)` que vive em `plan-gate.ts`.
// Aceita também um tier mínimo (`requirePlan("ADVENTURER")`) sem
// precisar passar uma feature específica.
//
// Mantém o erro estruturado em JSON dentro da mensagem (frontend
// parseia pra mostrar CTA de upgrade). Ver `plan-gate.ts` pro
// pattern original.

import type { FastifyRequest, FastifyReply, preHandlerHookHandler } from "fastify";
import { PLAN_LIMITS, type PlanFeature } from "../config/plan-limits.js";
import { ForbiddenError } from "../errors/app-error.js";

export type PlanTier = keyof typeof PLAN_LIMITS;

const TIER_RANK: Record<PlanTier, number> = {
  FREE: 0,
  PLAYER_PLUS: 1,
  ADVENTURER: 2,
  LEGENDARY: 3,
};

const TIER_LABEL: Record<PlanTier, string> = {
  FREE: "Free",
  PLAYER_PLUS: "Player Plus",
  ADVENTURER: "Aventureiro",
  LEGENDARY: "Lendário",
};

interface RequirePlanOptions {
  /** Tier mínimo. Se omitido, qualquer plano serve (a feature decide). */
  min?: PlanTier;
  /** Feature específica que precisa estar habilitada (mesma chave do
   *  `PLAN_LIMITS`). Quando presente, valida que o plano atual habilita
   *  a feature (boolean=true ou número!=0). */
  feature?: PlanFeature;
}

function isFeatureAllowed(plan: PlanTier, feature: PlanFeature): boolean {
  const value = PLAN_LIMITS[plan][feature];
  if (typeof value === "boolean") return value;
  return value !== 0;
}

function findMinTierForFeature(feature: PlanFeature): PlanTier {
  // Procura o tier mais barato que habilita a feature.
  const ordered: PlanTier[] = ["FREE", "PLAYER_PLUS", "ADVENTURER", "LEGENDARY"];
  for (const tier of ordered) {
    if (isFeatureAllowed(tier, feature)) return tier;
  }
  return "LEGENDARY";
}

/** Cria um preHandler Fastify que valida o plano do `request.user`. */
export function requirePlan(
  optsOrFeature: RequirePlanOptions | PlanFeature,
): preHandlerHookHandler {
  const opts: RequirePlanOptions =
    typeof optsOrFeature === "string"
      ? { feature: optsOrFeature }
      : optsOrFeature;

  return async function checkPlan(
    request: FastifyRequest,
    _reply: FastifyReply,
  ) {
    const plan = (request.user.plan as PlanTier) ?? "FREE";
    const planRank = TIER_RANK[plan] ?? 0;

    // 1. Tier mínimo
    if (opts.min) {
      const required = TIER_RANK[opts.min];
      if (planRank < required) {
        throw new ForbiddenError(
          JSON.stringify({
            code: "PLAN_TIER_REQUIRED",
            currentPlan: plan,
            requiredPlan: opts.min,
            message: `Esse recurso requer plano ${TIER_LABEL[opts.min]} ou superior. Atual: ${TIER_LABEL[plan]}.`,
          }),
        );
      }
    }

    // 2. Feature específica
    if (opts.feature && !isFeatureAllowed(plan, opts.feature)) {
      const requiredPlan = findMinTierForFeature(opts.feature);
      throw new ForbiddenError(
        JSON.stringify({
          code: "PLAN_FEATURE_LOCKED",
          currentPlan: plan,
          feature: opts.feature,
          requiredPlan,
          message: `Recurso "${opts.feature}" requer plano ${TIER_LABEL[requiredPlan]}. Atual: ${TIER_LABEL[plan]}.`,
        }),
      );
    }
  };
}
