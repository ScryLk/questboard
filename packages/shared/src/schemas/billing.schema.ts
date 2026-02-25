import { z } from "zod";
import { Plan, BillingCycle } from "../types/enums.js";

export const subscribeSchema = z.object({
  plan: z.enum([Plan.ADVENTURER, Plan.LEGENDARY, Plan.PLAYER_PLUS]),
  billingCycle: z.nativeEnum(BillingCycle).default(BillingCycle.MONTHLY),
});

export const changePlanSchema = z.object({
  plan: z.enum([Plan.ADVENTURER, Plan.LEGENDARY, Plan.PLAYER_PLUS]),
  billingCycle: z.nativeEnum(BillingCycle).optional(),
});

export const cancelSubscriptionSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type ChangePlanInput = z.infer<typeof changePlanSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;
