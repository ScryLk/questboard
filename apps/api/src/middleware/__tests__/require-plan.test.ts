// Testes do middleware `requirePlan`. Como o middleware lê só
// `request.user` e a tabela `PLAN_LIMITS` (estática), não precisamos
// mockar Prisma. Faz `request` fake com `user.plan` e captura erros
// jogados pelo preHandler.

import { describe, expect, it } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { requirePlan } from "../require-plan.js";
import { ForbiddenError } from "../../errors/app-error.js";

interface FakeUser {
  id: string;
  plan: string;
  role: string;
  email: string;
  clerkId: string;
}

/** Wrapper que invoca o preHandler async sem precisar do `this` de
 *  FastifyInstance — testes não montam app completo. */
type LooseHandler = (req: FastifyRequest, reply: FastifyReply) => Promise<unknown>;
function makeHandler(opts: Parameters<typeof requirePlan>[0]): LooseHandler {
  return requirePlan(opts) as unknown as LooseHandler;
}

function fakeRequest(plan: string): FastifyRequest {
  return { user: fakeUser(plan) } as unknown as FastifyRequest;
}

function fakeUser(plan: string): FakeUser {
  return {
    id: "u_1",
    plan,
    role: "USER",
    email: "u@example.com",
    clerkId: "ck_1",
  };
}

const fakeReply = {} as FastifyReply;

describe("requirePlan — tier mínimo", () => {
  it("FREE pode bater requirePlan com nenhum tier mínimo (só feature)", async () => {
    const handler = makeHandler({ feature: "fogOfWar" });
    await expect(handler(fakeRequest("ADVENTURER"), fakeReply)).resolves.toBeUndefined();
  });

  it("rejeita FREE quando tier mínimo é ADVENTURER", async () => {
    const handler = makeHandler({ min: "ADVENTURER" });
    await expect(handler(fakeRequest("FREE"), fakeReply)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("permite ADVENTURER quando tier mínimo é ADVENTURER", async () => {
    const handler = makeHandler({ min: "ADVENTURER" });
    await expect(
      handler(fakeRequest("ADVENTURER"), fakeReply),
    ).resolves.toBeUndefined();
  });

  it("permite LEGENDARY quando tier mínimo é ADVENTURER (acima)", async () => {
    const handler = makeHandler({ min: "ADVENTURER" });
    await expect(
      handler(fakeRequest("LEGENDARY"), fakeReply),
    ).resolves.toBeUndefined();
  });

  it("rejeita PLAYER_PLUS quando tier mínimo é ADVENTURER (rank menor)", async () => {
    const handler = makeHandler({ min: "ADVENTURER" });
    await expect(
      handler(fakeRequest("PLAYER_PLUS"), fakeReply),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});

describe("requirePlan — feature gating", () => {
  it("rejeita FREE pra fogOfWar (feature locked)", async () => {
    const handler = makeHandler({ feature: "fogOfWar" });
    await expect(handler(fakeRequest("FREE"), fakeReply)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("permite ADVENTURER pra fogOfWar", async () => {
    const handler = makeHandler({ feature: "fogOfWar" });
    await expect(
      handler(fakeRequest("ADVENTURER"), fakeReply),
    ).resolves.toBeUndefined();
  });

  it("rejeita ADVENTURER pra dynamicLighting (só LEGENDARY)", async () => {
    const handler = makeHandler({ feature: "dynamicLighting" });
    await expect(
      handler(fakeRequest("ADVENTURER"), fakeReply),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("permite LEGENDARY pra dynamicLighting", async () => {
    const handler = makeHandler({ feature: "dynamicLighting" });
    await expect(
      handler(fakeRequest("LEGENDARY"), fakeReply),
    ).resolves.toBeUndefined();
  });

  it("aceita string atalho (sem opts wrapping)", async () => {
    const handler = requirePlan("fogOfWar") as unknown as LooseHandler;
    await expect(handler(fakeRequest("FREE"), fakeReply)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    await expect(
      handler(fakeRequest("ADVENTURER"), fakeReply),
    ).resolves.toBeUndefined();
  });
});

describe("requirePlan — payload de erro", () => {
  it("erro de tier traz código PLAN_TIER_REQUIRED com nome amigável", async () => {
    const handler = makeHandler({ min: "LEGENDARY" });
    try {
      await handler(fakeRequest("FREE"), fakeReply);
      expect.fail("deveria ter lançado");
    } catch (err) {
      expect(err).toBeInstanceOf(ForbiddenError);
      const payload = JSON.parse((err as ForbiddenError).message);
      expect(payload.code).toBe("PLAN_TIER_REQUIRED");
      expect(payload.requiredPlan).toBe("LEGENDARY");
      expect(payload.currentPlan).toBe("FREE");
      expect(payload.message).toContain("Lendário");
    }
  });

  it("erro de feature traz código PLAN_FEATURE_LOCKED + plano mínimo correto", async () => {
    const handler = makeHandler({ feature: "dynamicLighting" });
    try {
      await handler(fakeRequest("ADVENTURER"), fakeReply);
      expect.fail("deveria ter lançado");
    } catch (err) {
      const payload = JSON.parse((err as ForbiddenError).message);
      expect(payload.code).toBe("PLAN_FEATURE_LOCKED");
      expect(payload.feature).toBe("dynamicLighting");
      expect(payload.requiredPlan).toBe("LEGENDARY");
    }
  });

  it("FREE sem plan default cai em FREE silenciosamente", async () => {
    const handler = makeHandler({ feature: "fogOfWar" });
    const r = { user: { ...fakeUser("FREE"), plan: undefined as unknown as string } };
    await expect(
      handler(r as unknown as Parameters<typeof handler>[0], fakeReply),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
