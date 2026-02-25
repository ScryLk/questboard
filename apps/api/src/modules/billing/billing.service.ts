import type { PrismaClient } from "@questboard/db";
import type { SubscribeInput, ChangePlanInput, CancelSubscriptionInput } from "@questboard/shared";
import { NotFoundError, BadRequestError } from "../../errors/app-error.js";

const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  ADVENTURER: { monthly: 1990, yearly: 19900 },
  LEGENDARY: { monthly: 3990, yearly: 39900 },
  PLAYER_PLUS: { monthly: 990, yearly: 9900 },
};

const PLAN_NAMES: Record<string, string> = {
  FREE: "Gratuito",
  ADVENTURER: "Aventureiro",
  LEGENDARY: "Lendário",
  PLAYER_PLUS: "Player Plus",
};

export function createBillingService(prisma: PrismaClient) {
  return {
    async listPlans() {
      const limits = await prisma.planLimit.findMany();
      return limits.map((limit) => ({
        plan: limit.plan,
        name: PLAN_NAMES[limit.plan] ?? limit.plan,
        priceMonthly: PLAN_PRICES[limit.plan]?.monthly ?? 0,
        priceYearly: PLAN_PRICES[limit.plan]?.yearly ?? 0,
        limits: {
          maxActiveSessions: limit.maxActiveSessions,
          maxPlayersPerSession: limit.maxPlayersPerSession,
          allowPublicSessions: limit.allowPublicSessions,
          allowAsyncSessions: limit.allowAsyncSessions,
          maxMapUploadMb: limit.maxMapUploadMb,
          maxAiMapsPerMonth: limit.maxAiMapsPerMonth,
          allowFogOfWar: limit.allowFogOfWar,
          allowDynamicLighting: limit.allowDynamicLighting,
          allowLineOfSight: limit.allowLineOfSight,
          allowWhisper: limit.allowWhisper,
          allowSecretNotes: limit.allowSecretNotes,
          allowSoundtrack: limit.allowSoundtrack,
          allowNpcAssistant: limit.allowNpcAssistant,
          allowInitiativeTracker: limit.allowInitiativeTracker,
          maxStorageMb: limit.maxStorageMb,
          maxCharactersPerPlayer: limit.maxCharactersPerPlayer,
          allowPdfExport: limit.allowPdfExport,
          maxFriends: limit.maxFriends,
        },
      }));
    },

    async getSubscription(userId: string) {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });
      return subscription;
    },

    async subscribe(userId: string, input: SubscribeInput) {
      const existing = await prisma.subscription.findUnique({
        where: { userId },
      });
      if (existing && existing.status === "ACTIVE") {
        throw new BadRequestError("Já possui uma assinatura ativa. Use change-plan para alterar.");
      }

      const prices = PLAN_PRICES[input.plan];
      if (!prices) throw new BadRequestError("Plano inválido");

      const priceAmountCents = input.billingCycle === "YEARLY" ? prices.yearly : prices.monthly;

      // TODO: Create Mercado Pago preapproval and get mpPreapprovalId
      // const mpPreapproval = await mercadoPago.createPreapproval({ ... });

      const now = new Date();
      const periodEnd = new Date(now);
      if (input.billingCycle === "YEARLY") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      const subscription = await prisma.subscription.upsert({
        where: { userId },
        update: {
          plan: input.plan,
          status: "ACTIVE",
          billingCycle: input.billingCycle,
          priceAmountCents,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelledAt: null,
          cancelReason: null,
        },
        create: {
          userId,
          plan: input.plan,
          status: "ACTIVE",
          billingCycle: input.billingCycle,
          priceAmountCents,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });

      // Update user plan
      await prisma.user.update({
        where: { id: userId },
        data: { plan: input.plan, planExpiresAt: periodEnd },
      });

      return subscription;
    },

    async cancelSubscription(userId: string, input: CancelSubscriptionInput) {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });
      if (!subscription) throw new NotFoundError("Assinatura");
      if (subscription.status === "CANCELLED") {
        throw new BadRequestError("Assinatura já cancelada");
      }

      // TODO: Cancel on Mercado Pago
      // await mercadoPago.cancelPreapproval(subscription.mpPreapprovalId);

      const updated = await prisma.subscription.update({
        where: { userId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelReason: input.reason,
        },
      });

      // Plan remains active until period end
      return updated;
    },

    async changePlan(userId: string, input: ChangePlanInput) {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });
      if (!subscription || subscription.status !== "ACTIVE") {
        throw new BadRequestError("Nenhuma assinatura ativa encontrada");
      }
      if (subscription.plan === input.plan) {
        throw new BadRequestError("Já está neste plano");
      }

      const prices = PLAN_PRICES[input.plan];
      if (!prices) throw new BadRequestError("Plano inválido");

      const billingCycle = input.billingCycle ?? subscription.billingCycle;
      const priceAmountCents = billingCycle === "YEARLY" ? prices.yearly : prices.monthly;

      // TODO: Update on Mercado Pago

      const updated = await prisma.subscription.update({
        where: { userId },
        data: {
          previousPlan: subscription.plan,
          plan: input.plan,
          billingCycle,
          priceAmountCents,
          planChangedAt: new Date(),
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { plan: input.plan },
      });

      return updated;
    },

    async listPayments(userId: string, page: number, pageSize: number) {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!subscription) return { payments: [], pagination: { page, pageSize, total: 0, totalPages: 0 } };

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where: { subscriptionId: subscription.id },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.payment.count({
          where: { subscriptionId: subscription.id },
        }),
      ]);

      return {
        payments,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    },

    async handleMpWebhook(body: { action: string; data: { id: string } }) {
      // TODO: Implement Mercado Pago webhook processing
      // Handle payment.created, payment.updated, preapproval.updated events
      // Update subscription status, record payments, etc.
      return { received: true };
    },
  };
}

export type BillingService = ReturnType<typeof createBillingService>;
