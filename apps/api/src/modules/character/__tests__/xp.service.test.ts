// Testes do XpService — mocka prisma + cache + socket.
// Cobre: validação de delta zero, reason obrigatório em negativo,
// auto-level-up, bulk award, history.

import { afterEach, describe, expect, it, vi } from "vitest";
import { createXpService } from "../xp.service.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../../errors/app-error.js";

const emitCharacterXpChanged = vi.fn();
vi.mock("../../../lib/socket-events.js", () => ({
  emitCharacterXpChanged: (...args: unknown[]) =>
    emitCharacterXpChanged(...args),
}));

vi.mock("../../../lib/cache.js", () => ({
  getOrSet: vi.fn(),
  invalidate: vi.fn(),
  invalidateKey: vi.fn(),
}));

vi.mock("../../campaign/dashboard.service.js", () => ({
  invalidateCampaignDashboardCache: vi.fn(),
  createDashboardService: vi.fn(),
}));

interface FakeChar {
  id: string;
  userId: string;
  campaignId: string | null;
  level: number;
  currentXp: number;
  deletedAt: Date | null;
}

interface FakeAward {
  id: string;
  characterId: string;
  delta: number;
  reason: string | null;
  sessionId: string | null;
  awardedById: string;
  createdAt: Date;
}

interface FakeSession {
  id: string;
  campaignId: string | null;
}

interface FakeMember {
  campaignId: string;
  userId: string;
  role: "GM" | "CO_GM" | "PLAYER" | "SPECTATOR";
  leftAt: Date | null;
}

let nextAwardId = 1;

function buildPrismaMock(seed: {
  characters?: FakeChar[];
  sessions?: FakeSession[];
  members?: FakeMember[];
}) {
  const characters = new Map(
    (seed.characters ?? []).map((c) => [c.id, { ...c }]),
  );
  const sessions = new Map(
    (seed.sessions ?? []).map((s) => [s.id, { ...s }]),
  );
  const members = seed.members ?? [];
  const awards: FakeAward[] = [];

  let awardCreatedAtCounter = 0;
  const txClient = {
    character: {
      findUnique: ({ where }: { where: { id: string } }) => {
        // Retorna cópia — a service mantém referência pro `char` enquanto
        // chama `update`. Se devolvermos a ref, mutações via update
        // contaminam `previousLevel`/`previousXp`.
        const c = characters.get(where.id);
        return Promise.resolve(c ? { ...c } : null);
      },
      update: ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<FakeChar>;
      }) => {
        const c = characters.get(where.id);
        if (!c) throw new Error("not found");
        Object.assign(c, data);
        return Promise.resolve(c);
      },
      findMany: ({
        where,
      }: {
        where: {
          campaignId: string;
          userId: { in: string[] };
          deletedAt: null;
        };
      }) => {
        const filtered = [...characters.values()].filter(
          (c) =>
            c.campaignId === where.campaignId &&
            where.userId.in.includes(c.userId) &&
            c.deletedAt === null,
        );
        return Promise.resolve(filtered);
      },
    },
    xpAward: {
      create: ({ data }: { data: Omit<FakeAward, "id" | "createdAt"> }) => {
        const id = `aw_${nextAwardId++}`;
        // Garante ordem estável: cada award subsequente tem timestamp
        // estritamente maior que o anterior.
        awardCreatedAtCounter += 1;
        const award: FakeAward = {
          ...data,
          id,
          createdAt: new Date(Date.now() + awardCreatedAtCounter),
        };
        awards.push(award);
        return Promise.resolve(award);
      },
      findMany: ({
        where,
        take,
      }: {
        where: { characterId: string };
        take?: number;
      }) => {
        const filtered = awards
          .filter((a) => a.characterId === where.characterId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, take ?? 20);
        return Promise.resolve(filtered);
      },
    },
    session: {
      findUnique: ({ where }: { where: { id: string } }) =>
        Promise.resolve(sessions.get(where.id) ?? null),
    },
    campaignMember: {
      findMany: ({
        where,
      }: {
        where: { campaignId: string; leftAt: null; role: string };
      }) => {
        const filtered = members.filter(
          (m) =>
            m.campaignId === where.campaignId &&
            m.leftAt === null &&
            m.role === where.role,
        );
        return Promise.resolve(filtered);
      },
    },
  };

  const prisma = {
    ...txClient,
    $transaction: async <T,>(fn: (tx: typeof txClient) => Promise<T>) => fn(txClient),
  };

  return prisma as unknown as Parameters<typeof createXpService>[0];
}

describe("XpService.awardSingle", () => {
  it("rejeita delta zero", async () => {
    const prisma = buildPrismaMock({
      characters: [
        { id: "c1", userId: "u1", campaignId: "camp1", level: 1, currentXp: 0, deletedAt: null },
      ],
    });
    const svc = createXpService(prisma);
    await expect(
      svc.awardSingle({
        characterId: "c1",
        delta: 0,
        awardedById: "gm1",
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("rejeita subtração sem razão (>=3 chars)", async () => {
    const prisma = buildPrismaMock({
      characters: [
        { id: "c1", userId: "u1", campaignId: "camp1", level: 1, currentXp: 100, deletedAt: null },
      ],
    });
    const svc = createXpService(prisma);
    await expect(
      svc.awardSingle({
        characterId: "c1",
        delta: -10,
        awardedById: "gm1",
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    await expect(
      svc.awardSingle({
        characterId: "c1",
        delta: -10,
        reason: "ab",
        awardedById: "gm1",
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("404 quando personagem não existe", async () => {
    const prisma = buildPrismaMock({});
    const svc = createXpService(prisma);
    await expect(
      svc.awardSingle({
        characterId: "missing",
        delta: 100,
        awardedById: "gm1",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("aplica delta positivo + recalcula level (auto-level-up)", async () => {
    const prisma = buildPrismaMock({
      characters: [
        { id: "c1", userId: "u1", campaignId: "camp1", level: 1, currentXp: 50, deletedAt: null },
      ],
    });
    const svc = createXpService(prisma);
    // 50 + 300 = 350 → level 3 (threshold = 300)
    const r = await svc.awardSingle({
      characterId: "c1",
      delta: 300,
      awardedById: "gm1",
    });
    expect(r.previousLevel).toBe(1);
    expect(r.newLevel).toBe(3);
    expect(r.newXp).toBe(350);
    expect(r.leveledUp).toBe(true);
  });

  it("aplica delta sem level-up quando insuficiente", async () => {
    const prisma = buildPrismaMock({
      characters: [
        { id: "c1", userId: "u1", campaignId: "camp1", level: 2, currentXp: 150, deletedAt: null },
      ],
    });
    const svc = createXpService(prisma);
    // 150 + 50 = 200 → ainda level 2 (300 pra subir pro 3)
    const r = await svc.awardSingle({
      characterId: "c1",
      delta: 50,
      awardedById: "gm1",
    });
    expect(r.newLevel).toBe(2);
    expect(r.leveledUp).toBe(false);
  });

  it("subtração com razão válida aplica e pode rebaixar level", async () => {
    const prisma = buildPrismaMock({
      characters: [
        { id: "c1", userId: "u1", campaignId: "camp1", level: 3, currentXp: 350, deletedAt: null },
      ],
    });
    const svc = createXpService(prisma);
    const r = await svc.awardSingle({
      characterId: "c1",
      delta: -200,
      reason: "Erro de cálculo na sessão anterior",
      awardedById: "gm1",
    });
    // 350 - 200 = 150 → level 2 (precisa 300 pro 3, 100 pro 2)
    expect(r.newXp).toBe(150);
    expect(r.newLevel).toBe(2);
  });

  it("não permite XP negativo (clamp em 0)", async () => {
    const prisma = buildPrismaMock({
      characters: [
        { id: "c1", userId: "u1", campaignId: "camp1", level: 1, currentXp: 50, deletedAt: null },
      ],
    });
    const svc = createXpService(prisma);
    const r = await svc.awardSingle({
      characterId: "c1",
      delta: -200,
      reason: "Reset por motivo de teste",
      awardedById: "gm1",
    });
    expect(r.newXp).toBe(0);
    expect(r.newLevel).toBe(1);
  });

  it("emit socket quando sessionId presente", async () => {
    const prisma = buildPrismaMock({
      characters: [
        { id: "c1", userId: "u1", campaignId: "camp1", level: 1, currentXp: 0, deletedAt: null },
      ],
    });
    const svc = createXpService(prisma);
    emitCharacterXpChanged.mockReset();
    await svc.awardSingle({
      characterId: "c1",
      delta: 100,
      awardedById: "gm1",
      sessionId: "s1",
    });
    expect(emitCharacterXpChanged).toHaveBeenCalledTimes(1);
    expect(emitCharacterXpChanged).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "s1",
        characterId: "c1",
        delta: 100,
        leveledUp: true,
      }),
    );
  });

  it("não emite socket sem sessionId", async () => {
    const prisma = buildPrismaMock({
      characters: [
        { id: "c1", userId: "u1", campaignId: "camp1", level: 1, currentXp: 0, deletedAt: null },
      ],
    });
    const svc = createXpService(prisma);
    emitCharacterXpChanged.mockReset();
    await svc.awardSingle({
      characterId: "c1",
      delta: 100,
      awardedById: "gm1",
    });
    expect(emitCharacterXpChanged).not.toHaveBeenCalled();
  });
});

describe("XpService.awardBulkSession", () => {
  it("404 quando sessão não existe", async () => {
    const prisma = buildPrismaMock({});
    const svc = createXpService(prisma);
    await expect(
      svc.awardBulkSession("missing", "gm1", { amount: 100 }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("BadRequest quando sessão sem campanha", async () => {
    const prisma = buildPrismaMock({
      sessions: [{ id: "s1", campaignId: null }],
    });
    const svc = createXpService(prisma);
    await expect(
      svc.awardBulkSession("s1", "gm1", { amount: 100 }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("distribui amount pra todos PLAYERS com personagem na campanha", async () => {
    const prisma = buildPrismaMock({
      sessions: [{ id: "s1", campaignId: "camp1" }],
      members: [
        { campaignId: "camp1", userId: "p1", role: "PLAYER", leftAt: null },
        { campaignId: "camp1", userId: "p2", role: "PLAYER", leftAt: null },
        // GM não recebe XP via bulk
        { campaignId: "camp1", userId: "gm1", role: "GM", leftAt: null },
      ],
      characters: [
        { id: "char_p1", userId: "p1", campaignId: "camp1", level: 1, currentXp: 0, deletedAt: null },
        { id: "char_p2", userId: "p2", campaignId: "camp1", level: 1, currentXp: 0, deletedAt: null },
        // NPC do GM — não conta
        { id: "char_gm", userId: "gm1", campaignId: "camp1", level: 1, currentXp: 0, deletedAt: null },
      ],
    });
    const svc = createXpService(prisma);
    const results = await svc.awardBulkSession("s1", "gm1", {
      amount: 200,
    });
    expect(results.length).toBe(2);
    expect(results.every((r) => r.newXp === 200)).toBe(true);
  });

  it("aplica bônus individual em cima do amount", async () => {
    const prisma = buildPrismaMock({
      sessions: [{ id: "s1", campaignId: "camp1" }],
      members: [
        { campaignId: "camp1", userId: "p1", role: "PLAYER", leftAt: null },
        { campaignId: "camp1", userId: "p2", role: "PLAYER", leftAt: null },
      ],
      characters: [
        { id: "char_p1", userId: "p1", campaignId: "camp1", level: 1, currentXp: 0, deletedAt: null },
        { id: "char_p2", userId: "p2", campaignId: "camp1", level: 1, currentXp: 0, deletedAt: null },
      ],
    });
    const svc = createXpService(prisma);
    const results = await svc.awardBulkSession("s1", "gm1", {
      amount: 100,
      perCharacter: { char_p1: 50 },
    });
    const p1 = results.find((r) => r.characterId === "char_p1")!;
    const p2 = results.find((r) => r.characterId === "char_p2")!;
    expect(p1.newXp).toBe(150);
    expect(p2.newXp).toBe(100);
  });
});

describe("XpService.history", () => {
  it("retorna awards ordenados mais recente primeiro", async () => {
    const prisma = buildPrismaMock({
      characters: [
        { id: "c1", userId: "u1", campaignId: "camp1", level: 1, currentXp: 0, deletedAt: null },
      ],
    });
    const svc = createXpService(prisma);
    await svc.awardSingle({ characterId: "c1", delta: 100, awardedById: "gm1" });
    await svc.awardSingle({
      characterId: "c1",
      delta: -50,
      reason: "Penalidade por trapaça",
      awardedById: "gm1",
    });
    const history = await svc.history("c1");
    expect(history.length).toBe(2);
    expect(history[0]!.delta).toBe(-50);
    expect(history[1]!.delta).toBe(100);
  });
});

afterEach(() => {
  vi.clearAllMocks();
});
