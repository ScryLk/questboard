import type { PrismaClient } from "@questboard/db";
import { env } from "../../config/env.js";
import { NotFoundError, BadRequestError } from "../../errors/app-error.js";

const MP_API = "https://api.mercadopago.com";

async function mpFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${MP_API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
      ...opts?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new BadRequestError(`Mercado Pago error: ${res.status} ${text}`);
  }
  return res.json();
}

const PLAN_PRICES: Record<string, { monthly: number; annual: number; reason: string }> = {
  ADVENTURER: { monthly: 1990, annual: 19900, reason: "QuestBoard Aventureiro" },
  LEGENDARY: { monthly: 3990, annual: 39900, reason: "QuestBoard Lendário" },
  PLAYER_PLUS: { monthly: 990, annual: 9900, reason: "QuestBoard Player+" },
};

export function createBillingService(prisma: PrismaClient) {
  return {
    getPlans() {
      return Object.entries(PLAN_PRICES).map(([key, val]) => ({
        id: key,
        name: val.reason,
        monthlyPrice: val.monthly,
        annualPrice: val.annual,
      }));
    },

    async getSubscription(userId: string) {
      return prisma.subscription.findUnique({
        where: { userId },
      });
    },

    async subscribe(userId: string, plan: string, cycle: "MONTHLY" | "ANNUAL") {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, mpCustomerId: true } });
      if (!user) throw new NotFoundError("User");

      const prices = PLAN_PRICES[plan];
      if (!prices) throw new BadRequestError(`Plano inválido: ${plan}`);

      const amount = cycle === "ANNUAL" ? prices.annual : prices.monthly;
      const frequency = cycle === "ANNUAL" ? 12 : 1;

      // Create Mercado Pago preapproval
      const preapproval = await mpFetch("/preapproval", {
        method: "POST",
        body: JSON.stringify({
          reason: prices.reason,
          auto_recurring: {
            frequency,
            frequency_type: "months",
            transaction_amount: amount / 100,
            currency_id: "BRL",
          },
          payer_email: user.email,
          back_url: `${env.CORS_ORIGIN.split(",")[0]}/billing/callback`,
          status: "pending",
        }),
      }) as { id: string; init_point: string };

      // Upsert subscription
      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan: plan as "ADVENTURER" | "LEGENDARY" | "PLAYER_PLUS",
          billingCycle: cycle,
          mpPreapprovalId: preapproval.id,
          status: "PENDING",
        },
        update: {
          plan: plan as "ADVENTURER" | "LEGENDARY" | "PLAYER_PLUS",
          billingCycle: cycle,
          mpPreapprovalId: preapproval.id,
          status: "PENDING",
          cancelAtPeriodEnd: false,
          canceledAt: null,
        },
      });

      return { initPoint: preapproval.init_point };
    },

    async cancel(userId: string) {
      const sub = await prisma.subscription.findUnique({ where: { userId } });
      if (!sub) throw new NotFoundError("Subscription");

      if (sub.mpPreapprovalId) {
        await mpFetch(`/preapproval/${sub.mpPreapprovalId}`, {
          method: "PUT",
          body: JSON.stringify({ status: "cancelled" }),
        }).catch(() => {}); // best effort
      }

      return prisma.subscription.update({
        where: { userId },
        data: { cancelAtPeriodEnd: true, canceledAt: new Date() },
      });
    },

    async handleWebhook(body: Record<string, unknown>) {
      const type = body.type as string | undefined;
      const dataId = (body.data as { id?: string })?.id;

      if (!dataId) return;

      // Log billing event
      await prisma.billingEvent.create({
        data: {
          userId: "",
          type: type ?? "unknown",
          mpEventId: String(body.id ?? dataId),
          payload: body as Record<string, unknown>,
        },
      });

      if (type === "subscription_preapproval") {
        const preapproval = await mpFetch(`/preapproval/${dataId}`) as {
          id: string;
          status: string;
          payer_id: string;
          date_created: string;
          next_payment_date?: string;
        };

        const sub = await prisma.subscription.findFirst({
          where: { mpPreapprovalId: preapproval.id },
          include: { user: { select: { id: true } } },
        });
        if (!sub) return;

        const statusMap: Record<string, "ACTIVE" | "PAUSED" | "CANCELLED" | "PENDING"> = {
          authorized: "ACTIVE",
          paused: "PAUSED",
          cancelled: "CANCELLED",
          pending: "PENDING",
        };
        const newStatus = statusMap[preapproval.status] ?? "PENDING";

        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: newStatus,
            currentPeriodStart: new Date(preapproval.date_created),
            currentPeriodEnd: preapproval.next_payment_date ? new Date(preapproval.next_payment_date) : undefined,
          },
        });

        // Update billing event with userId
        await prisma.billingEvent.updateMany({
          where: { mpEventId: String(body.id ?? dataId) },
          data: { userId: sub.user.id, subscriptionId: sub.id },
        });

        // Update user plan
        if (newStatus === "ACTIVE") {
          await prisma.user.update({
            where: { id: sub.user.id },
            data: {
              plan: sub.plan,
              planExpiresAt: preapproval.next_payment_date ? new Date(preapproval.next_payment_date) : null,
            },
          });
        } else if (newStatus === "CANCELLED") {
          await prisma.user.update({
            where: { id: sub.user.id },
            data: { plan: "FREE", planExpiresAt: null },
          });
        }
      }
    },
  };
}

export type BillingService = ReturnType<typeof createBillingService>;
