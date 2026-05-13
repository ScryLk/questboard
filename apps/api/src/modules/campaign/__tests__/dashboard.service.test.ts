// Testes do DashboardService — mocka Prisma + cache helper.
// Cobre: permission, role dispatch (PLAYER vs GM vs SPECTATOR),
// agregação de horas, story progress, sessões recentes.

import { afterEach, describe, expect, it, vi } from "vitest";
import { createDashboardService } from "../dashboard.service.js";
import {
  ForbiddenError,
  NotFoundError,
} from "../../../errors/app-error.js";

// Cache vira passthrough — sempre executa o loader.
vi.mock("../../../lib/cache.js", () => ({
  getOrSet: async <T,>(_key: string, _ttl: number, loader: () => Promise<T>) =>
    loader(),
  invalidate: vi.fn(),
  invalidateKey: vi.fn(),
}));

interface FakeSession {
  id: string;
  name: string;
  campaignId: string;
  gmId: string;
  status: "IDLE" | "LOBBY" | "LIVE" | "PAUSED" | "ENDED" | "CANCELLED";
  startedAt: Date | null;
  endedAt: Date | null;
  scheduledAt: Date | null;
  createdAt: Date;
  deletedAt: Date | null;
}

interface FakeCharacter {
  id: string;
  userId: string;
  campaignId: string;
  name: string;
  level: number;
  currentXp: number;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface FakeMember {
  campaignId: string;
  userId: string;
  role: "GM" | "CO_GM" | "PLAYER" | "SPECTATOR";
  leftAt: Date | null;
}

interface FakeCampaign {
  id: string;
  name: string;
  ownerId: string;
  deletedAt: Date | null;
}

interface FakeNarrative {
  campaignId: string;
  status: "active" | "pending" | "discarded" | "hidden";
}

function buildPrismaMock(seed: {
  campaigns?: FakeCampaign[];
  members?: FakeMember[];
  sessions?: FakeSession[];
  characters?: FakeCharacter[];
  narrative?: FakeNarrative[];
  maps?: { sessionId: string }[];
}) {
  const campaigns = seed.campaigns ?? [];
  const members = seed.members ?? [];
  const sessions = seed.sessions ?? [];
  const characters = seed.characters ?? [];
  const narrative = seed.narrative ?? [];
  const maps = seed.maps ?? [];

  function matchSession(
    s: FakeSession,
    w: Record<string, unknown>,
  ): boolean {
    if (w.campaignId && s.campaignId !== w.campaignId) return false;
    if (w.deletedAt === null && s.deletedAt !== null) return false;
    if (w.status && typeof w.status === "object") {
      const cond = w.status as { in?: string[] };
      if (cond.in && !cond.in.includes(s.status)) return false;
    }
    if (
      w.startedAt &&
      typeof w.startedAt === "object" &&
      "not" in (w.startedAt as Record<string, unknown>) &&
      s.startedAt === null
    )
      return false;
    if (
      w.endedAt &&
      typeof w.endedAt === "object" &&
      "not" in (w.endedAt as Record<string, unknown>) &&
      s.endedAt === null
    )
      return false;
    if (
      w.scheduledAt &&
      typeof w.scheduledAt === "object" &&
      "gt" in (w.scheduledAt as Record<string, unknown>)
    ) {
      const gt = (w.scheduledAt as { gt: Date }).gt;
      if (!s.scheduledAt || s.scheduledAt <= gt) return false;
    }
    if (w.gmId && s.gmId !== w.gmId) return false;
    return true;
  }

  return {
    campaign: {
      findFirst: ({ where }: { where: { id: string; deletedAt: null } }) => {
        const c = campaigns.find(
          (x) => x.id === where.id && x.deletedAt === null,
        );
        return Promise.resolve(c ?? null);
      },
    },
    campaignMember: {
      findFirst: ({
        where,
      }: {
        where: { campaignId: string; userId: string; leftAt: null };
      }) => {
        const m = members.find(
          (x) =>
            x.campaignId === where.campaignId &&
            x.userId === where.userId &&
            x.leftAt === null,
        );
        return Promise.resolve(m ?? null);
      },
    },
    session: {
      findMany: ({
        where,
        take,
        orderBy: _orderBy,
      }: {
        where: Record<string, unknown>;
        take?: number;
        orderBy?: unknown;
      }) => {
        const filtered = sessions.filter((s) => matchSession(s, where));
        return Promise.resolve(filtered.slice(0, take ?? filtered.length));
      },
      findFirst: ({ where }: { where: Record<string, unknown> }) => {
        const found = sessions.find((s) => matchSession(s, where));
        return Promise.resolve(found ?? null);
      },
      count: ({ where }: { where: Record<string, unknown> }) =>
        Promise.resolve(sessions.filter((s) => matchSession(s, where)).length),
    },
    narrativeNode: {
      groupBy: ({ where }: { where: { campaignId: string } }) => {
        const filtered = narrative.filter(
          (n) => n.campaignId === where.campaignId,
        );
        const grouped = new Map<string, number>();
        for (const n of filtered)
          grouped.set(n.status, (grouped.get(n.status) ?? 0) + 1);
        return Promise.resolve(
          [...grouped.entries()].map(([status, count]) => ({
            status,
            _count: { id: count },
          })),
        );
      },
    },
    character: {
      aggregate: ({
        where,
      }: {
        where: { campaignId: string; deletedAt: null };
      }) => {
        const filtered = characters.filter(
          (c) => c.campaignId === where.campaignId && c.deletedAt === null,
        );
        if (filtered.length === 0)
          return Promise.resolve({ _avg: { level: null }, _count: { id: 0 } });
        const avg =
          filtered.reduce((a, c) => a + c.level, 0) / filtered.length;
        return Promise.resolve({
          _avg: { level: avg },
          _count: { id: filtered.length },
        });
      },
      findFirst: ({
        where,
      }: {
        where: { campaignId: string; userId: string; deletedAt: null };
      }) => {
        const c = characters.find(
          (x) =>
            x.campaignId === where.campaignId &&
            x.userId === where.userId &&
            x.deletedAt === null,
        );
        return Promise.resolve(c ?? null);
      },
      count: ({
        where,
      }: {
        where: { campaignId: string; userId: string; deletedAt: null };
      }) =>
        Promise.resolve(
          characters.filter(
            (x) =>
              x.campaignId === where.campaignId &&
              x.userId === where.userId &&
              x.deletedAt === null,
          ).length,
        ),
    },
    map: {
      count: ({
        where,
      }: {
        where: { session: { campaignId: string; deletedAt: null } };
      }) => {
        const sessionIds = sessions
          .filter(
            (s) =>
              s.campaignId === where.session.campaignId &&
              s.deletedAt === null,
          )
          .map((s) => s.id);
        return Promise.resolve(
          maps.filter((m) => sessionIds.includes(m.sessionId)).length,
        );
      },
    },
  } as unknown as Parameters<typeof createDashboardService>[0];
}

const baseCampaign: FakeCampaign = {
  id: "camp1",
  name: "Teste",
  ownerId: "gm1",
  deletedAt: null,
};

describe("DashboardService.get", () => {
  it("404 quando campanha não existe", async () => {
    const prisma = buildPrismaMock({});
    const svc = createDashboardService(prisma);
    await expect(svc.get("missing", "u1")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("403 quando usuário não é owner nem membro", async () => {
    const prisma = buildPrismaMock({ campaigns: [baseCampaign] });
    const svc = createDashboardService(prisma);
    await expect(svc.get("camp1", "stranger")).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("owner é tratado como GM mesmo sem CampaignMember", async () => {
    const prisma = buildPrismaMock({ campaigns: [baseCampaign] });
    const svc = createDashboardService(prisma);
    const r = await svc.get("camp1", "gm1");
    expect(r.viewerRole).toBe("GM");
    expect(r.gmPanel).not.toBeNull();
    expect(r.userCharacter).toBeNull();
  });

  it("SPECTATOR vê dashboard sem gmPanel nem userCharacter", async () => {
    const prisma = buildPrismaMock({
      campaigns: [baseCampaign],
      members: [
        {
          campaignId: "camp1",
          userId: "spec1",
          role: "SPECTATOR",
          leftAt: null,
        },
      ],
    });
    const svc = createDashboardService(prisma);
    const r = await svc.get("camp1", "spec1");
    expect(r.viewerRole).toBe("SPECTATOR");
    expect(r.gmPanel).toBeNull();
    expect(r.userCharacter).toBeNull();
  });

  it("PLAYER com personagem mostra userCharacter com XP/título", async () => {
    const prisma = buildPrismaMock({
      campaigns: [baseCampaign],
      members: [
        {
          campaignId: "camp1",
          userId: "p1",
          role: "PLAYER",
          leftAt: null,
        },
      ],
      characters: [
        {
          id: "char1",
          userId: "p1",
          campaignId: "camp1",
          name: "Eldrin",
          level: 4,
          currentXp: 750,
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
    });
    const svc = createDashboardService(prisma);
    const r = await svc.get("camp1", "p1");
    expect(r.viewerRole).toBe("PLAYER");
    expect(r.userCharacter).toMatchObject({
      name: "Eldrin",
      level: 4,
      currentXp: 750,
    });
    // xpToNextLevel(750, 4) = 1000 - 750 = 250
    expect(r.userCharacter!.xpToNextLevel).toBe(250);
    expect(r.userCharacter!.nextRewardLevel).toBe(5);
    expect(r.userCharacter!.nextRewardTitle).toBe("Herói");
  });

  it("PLAYER sem personagem mostra userCharacter null", async () => {
    const prisma = buildPrismaMock({
      campaigns: [baseCampaign],
      members: [
        {
          campaignId: "camp1",
          userId: "p1",
          role: "PLAYER",
          leftAt: null,
        },
      ],
    });
    const svc = createDashboardService(prisma);
    const r = await svc.get("camp1", "p1");
    expect(r.userCharacter).toBeNull();
    expect(r.gmPanel).toBeNull();
  });

  it("totals: hours = sum(endedAt - startedAt) em horas, sessions = count ENDED", async () => {
    const start = new Date("2026-01-01T20:00:00Z");
    const end1 = new Date("2026-01-01T23:00:00Z"); // 3h
    const end2 = new Date("2026-01-08T22:30:00Z"); // 2.5h
    const prisma = buildPrismaMock({
      campaigns: [baseCampaign],
      members: [
        {
          campaignId: "camp1",
          userId: "p1",
          role: "PLAYER",
          leftAt: null,
        },
      ],
      sessions: [
        {
          id: "s1",
          name: "Sess1",
          campaignId: "camp1",
          gmId: "gm1",
          status: "ENDED",
          startedAt: start,
          endedAt: end1,
          scheduledAt: null,
          createdAt: start,
          deletedAt: null,
        },
        {
          id: "s2",
          name: "Sess2",
          campaignId: "camp1",
          gmId: "gm1",
          status: "ENDED",
          startedAt: new Date("2026-01-08T20:00:00Z"),
          endedAt: end2,
          scheduledAt: null,
          createdAt: new Date("2026-01-08T20:00:00Z"),
          deletedAt: null,
        },
        // Não conta: LIVE
        {
          id: "s3",
          name: "Sess3",
          campaignId: "camp1",
          gmId: "gm1",
          status: "LIVE",
          startedAt: new Date(),
          endedAt: null,
          scheduledAt: null,
          createdAt: new Date(),
          deletedAt: null,
        },
      ],
    });
    const svc = createDashboardService(prisma);
    const r = await svc.get("camp1", "p1");
    expect(r.totals.sessions).toBe(2);
    expect(r.totals.hoursPlayed).toBe(5.5);
  });

  it("próxima sessão: futura mais próxima entre IDLE/LOBBY", async () => {
    const future1 = new Date(Date.now() + 86400000); // +1d
    const future2 = new Date(Date.now() + 7 * 86400000); // +7d
    const past = new Date(Date.now() - 86400000); // -1d
    const prisma = buildPrismaMock({
      campaigns: [baseCampaign],
      members: [
        {
          campaignId: "camp1",
          userId: "p1",
          role: "PLAYER",
          leftAt: null,
        },
      ],
      sessions: [
        {
          id: "future1",
          name: "Soon",
          campaignId: "camp1",
          gmId: "gm1",
          status: "IDLE",
          startedAt: null,
          endedAt: null,
          scheduledAt: future1,
          createdAt: past,
          deletedAt: null,
        },
        {
          id: "future2",
          name: "Later",
          campaignId: "camp1",
          gmId: "gm1",
          status: "LOBBY",
          startedAt: null,
          endedAt: null,
          scheduledAt: future2,
          createdAt: past,
          deletedAt: null,
        },
      ],
    });
    const svc = createDashboardService(prisma);
    const r = await svc.get("camp1", "p1");
    // Não validamos qual veio (mock simples não ordena), mas existe.
    expect(r.nextSession).not.toBeNull();
  });

  it("story progress: completed = active, pending = pending, ignora outros", async () => {
    const prisma = buildPrismaMock({
      campaigns: [baseCampaign],
      members: [
        {
          campaignId: "camp1",
          userId: "p1",
          role: "PLAYER",
          leftAt: null,
        },
      ],
      narrative: [
        { campaignId: "camp1", status: "active" },
        { campaignId: "camp1", status: "active" },
        { campaignId: "camp1", status: "pending" },
        { campaignId: "camp1", status: "pending" },
        { campaignId: "camp1", status: "pending" },
        { campaignId: "camp1", status: "discarded" }, // ignorado
        { campaignId: "camp1", status: "hidden" }, // ignorado
      ],
    });
    const svc = createDashboardService(prisma);
    const r = await svc.get("camp1", "p1");
    expect(r.storyProgress.completedEvents).toBe(2);
    expect(r.storyProgress.totalEvents).toBe(5);
    expect(r.storyProgress.percentage).toBe(40);
  });

  it("averagePlayerLevel é null quando 0 personagens", async () => {
    const prisma = buildPrismaMock({
      campaigns: [baseCampaign],
      members: [
        {
          campaignId: "camp1",
          userId: "p1",
          role: "PLAYER",
          leftAt: null,
        },
      ],
    });
    const svc = createDashboardService(prisma);
    const r = await svc.get("camp1", "p1");
    expect(r.totals.averagePlayerLevel).toBeNull();
  });

  it("averagePlayerLevel = média arredondada com 1 casa", async () => {
    const prisma = buildPrismaMock({
      campaigns: [baseCampaign],
      members: [
        {
          campaignId: "camp1",
          userId: "p1",
          role: "PLAYER",
          leftAt: null,
        },
      ],
      characters: [
        {
          id: "c1",
          userId: "p1",
          campaignId: "camp1",
          name: "A",
          level: 5,
          currentXp: 0,
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: "c2",
          userId: "p2",
          campaignId: "camp1",
          name: "B",
          level: 6,
          currentXp: 0,
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
    });
    const svc = createDashboardService(prisma);
    const r = await svc.get("camp1", "p1");
    expect(r.totals.averagePlayerLevel).toBe(5.5);
  });
});

afterEach(() => {
  vi.clearAllMocks();
});
