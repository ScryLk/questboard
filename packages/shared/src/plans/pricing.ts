import { Plan } from "../types/enums.js";

export interface PlanPricing {
  monthlyPrice: number; // in BRL cents
  yearlyPrice: number; // in BRL cents (total for the year)
  trialDays: number;
}

export const PLAN_PRICING: Record<Plan, PlanPricing> = {
  [Plan.FREE]: {
    monthlyPrice: 0,
    yearlyPrice: 0,
    trialDays: 0,
  },
  [Plan.ADVENTURER]: {
    monthlyPrice: 1990, // R$19,90
    yearlyPrice: 19900, // R$199,00 (2 months free)
    trialDays: 7,
  },
  [Plan.LEGENDARY]: {
    monthlyPrice: 3990, // R$39,90
    yearlyPrice: 39900, // R$399,00 (2 months free)
    trialDays: 0,
  },
} as const;

export const PLAN_LABELS: Record<Plan, string> = {
  [Plan.FREE]: "Gratuito",
  [Plan.ADVENTURER]: "Aventureiro",
  [Plan.LEGENDARY]: "Lendário",
} as const;

/**
 * Format a price in cents to BRL currency string.
 */
export function formatPriceBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/**
 * Calculate the monthly savings when choosing the yearly plan.
 */
export function calculateYearlySavings(plan: Plan): number {
  const pricing = PLAN_PRICING[plan];
  const yearlyAtMonthlyRate = pricing.monthlyPrice * 12;
  return yearlyAtMonthlyRate - pricing.yearlyPrice;
}
