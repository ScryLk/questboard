// Testes da lógica de Handle (Name#TAG). Mocka Prisma in-memory pra
// validar: geração de tag, cooldowns, reserved names e busca.

import { describe, expect, it, vi } from "vitest";
import { createUserService } from "../user.service.js";
import { BadRequestError, NotFoundError } from "../../../errors/app-error.js";

vi.mock("../../../lib/r2.js", () => ({
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
}));

interface FakeUser {
  id: string;
  externalId: string;
  email: string;
  username: string;
  tag: string;
  displayName: string;
  avatarUrl: string | null;
  usernameChangedAt: Date | null;
  tagChangedAt: Date | null;
  tagRerollsUsed: number;
  isActive: boolean;
  deletedAt: Date | null;
}

function makeUser(over: Partial<FakeUser> = {}): FakeUser {
  return {
    id: over.id ?? "u1",
    externalId: over.externalId ?? "ext_u1",
    email: over.email ?? "u1@test.dev",
    username: over.username ?? "lucas",
    tag: over.tag ?? "AB12",
    displayName: over.displayName ?? "Lucas",
    avatarUrl: over.avatarUrl ?? null,
    usernameChangedAt: over.usernameChangedAt ?? null,
    tagChangedAt: over.tagChangedAt ?? null,
    tagRerollsUsed: over.tagRerollsUsed ?? 0,
    isActive: over.isActive ?? true,
    deletedAt: over.deletedAt ?? null,
  };
}

function buildPrismaMock(seed: FakeUser[]) {
  const db = new Map<string, FakeUser>(seed.map((u) => [u.id, u]));

  function matchInsensitive(
    a: string,
    cmp: { equals?: string; startsWith?: string; mode?: "insensitive" },
  ): boolean {
    if (cmp.equals !== undefined) {
      return cmp.mode === "insensitive"
        ? a.toLowerCase() === cmp.equals.toLowerCase()
        : a === cmp.equals;
    }
    if (cmp.startsWith !== undefined) {
      return cmp.mode === "insensitive"
        ? a.toLowerCase().startsWith(cmp.startsWith.toLowerCase())
        : a.startsWith(cmp.startsWith);
    }
    return false;
  }

  function rowMatches(u: FakeUser, where: Record<string, unknown>): boolean {
    for (const [key, val] of Object.entries(where)) {
      if (key === "NOT") {
        if (rowMatches(u, val as Record<string, unknown>)) return false;
        continue;
      }
      if (key === "OR") {
        const ors = val as Array<Record<string, unknown>>;
        if (!ors.some((o) => rowMatches(u, o))) return false;
        continue;
      }
      if (val === null) {
        if ((u as unknown as Record<string, unknown>)[key] !== null) return false;
        continue;
      }
      if (typeof val === "object") {
        const v = val as { equals?: string; startsWith?: string; mode?: "insensitive" };
        const field = (u as unknown as Record<string, unknown>)[key];
        if (typeof field !== "string") return false;
        if (!matchInsensitive(field, v)) return false;
        continue;
      }
      if ((u as unknown as Record<string, unknown>)[key] !== val) return false;
    }
    return true;
  }

  return {
    user: {
      findUnique: ({ where }: { where: { id?: string; externalId?: string } }) => {
        if (where.id) return Promise.resolve(db.get(where.id) ?? null);
        if (where.externalId) {
          const u = [...db.values()].find((x) => x.externalId === where.externalId);
          return Promise.resolve(u ?? null);
        }
        return Promise.resolve(null);
      },
      findFirst: ({ where }: { where: Record<string, unknown> }) => {
        const u = [...db.values()].find((x) => rowMatches(x, where));
        return Promise.resolve(u ?? null);
      },
      findMany: ({
        where,
        take,
      }: {
        where: Record<string, unknown>;
        take?: number;
      }) => {
        const filtered = [...db.values()].filter((x) => rowMatches(x, where));
        return Promise.resolve(filtered.slice(0, take ?? 10));
      },
      update: ({
        where,
        data,
      }: {
        where: { id: string };
        data: Record<string, unknown>;
      }) => {
        const u = db.get(where.id);
        if (!u) throw new Error("not found");
        const next: FakeUser = { ...u };
        for (const [k, v] of Object.entries(data)) {
          if (
            v &&
            typeof v === "object" &&
            "increment" in (v as Record<string, unknown>)
          ) {
            const inc = (v as { increment: number }).increment;
            (next as unknown as Record<string, unknown>)[k] =
              ((next as unknown as Record<string, unknown>)[k] as number) + inc;
          } else {
            (next as unknown as Record<string, unknown>)[k] = v;
          }
        }
        db.set(where.id, next);
        return Promise.resolve(next);
      },
    },
  } as unknown as Parameters<typeof createUserService>[0];
}

describe("UserService.getMyHandle", () => {
  it("retorna handle formatado + flags de cooldown", async () => {
    const prisma = buildPrismaMock([makeUser({ username: "lucas", tag: "AB12" })]);
    const svc = createUserService(prisma);
    const r = await svc.getMyHandle("u1");
    expect(r.handle).toBe("Lucas#AB12".replace("Lucas", "lucas"));
    expect(r.username).toBe("lucas");
    expect(r.tag).toBe("AB12");
    expect(r.freeRerollsLeft).toBe(1);
  });

  it("404 quando user não existe", async () => {
    const prisma = buildPrismaMock([]);
    const svc = createUserService(prisma);
    await expect(svc.getMyHandle("missing")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("UserService.updateUsername", () => {
  it("rejeita nome reservado", async () => {
    const prisma = buildPrismaMock([makeUser()]);
    const svc = createUserService(prisma);
    await expect(svc.updateUsername("u1", "admin")).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it("rejeita formato inválido", async () => {
    const prisma = buildPrismaMock([makeUser()]);
    const svc = createUserService(prisma);
    await expect(svc.updateUsername("u1", "ab")).rejects.toBeInstanceOf(
      BadRequestError,
    );
    await expect(svc.updateUsername("u1", "x".repeat(20))).rejects.toBeInstanceOf(
      BadRequestError,
    );
    await expect(svc.updateUsername("u1", "with space")).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it("muda nome e gera novo tag", async () => {
    const prisma = buildPrismaMock([makeUser()]);
    const svc = createUserService(prisma);
    const before = await svc.getMyHandle("u1");
    const r = await svc.updateUsername("u1", "newname");
    expect(r.username).toBe("newname");
    expect(r.tag).not.toBe(before.tag);
    expect(r.tag).toMatch(/^[A-HJ-NP-Z2-9]{4,5}$/);
  });

  it("aplica cooldown de 30 dias", async () => {
    const recentChange = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5d atrás
    const prisma = buildPrismaMock([
      makeUser({ usernameChangedAt: recentChange }),
    ]);
    const svc = createUserService(prisma);
    await expect(svc.updateUsername("u1", "newname")).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it("permite mudar pra mesmo nome (no-op) sem aplicar cooldown", async () => {
    const recentChange = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const prisma = buildPrismaMock([
      makeUser({ username: "lucas", usernameChangedAt: recentChange }),
    ]);
    const svc = createUserService(prisma);
    const r = await svc.updateUsername("u1", "Lucas");
    expect(r.username).toBe("lucas");
  });
});

describe("UserService.rerollTag", () => {
  it("primeiro reroll é grátis (sem cooldown)", async () => {
    const prisma = buildPrismaMock([makeUser({ tagRerollsUsed: 0 })]);
    const svc = createUserService(prisma);
    const before = await svc.getMyHandle("u1");
    const r = await svc.rerollTag("u1");
    expect(r.tag).not.toBe(before.tag);
    expect(r.freeRerollsLeft).toBe(0);
  });

  it("segundo reroll dentro do cooldown é bloqueado", async () => {
    const prisma = buildPrismaMock([
      makeUser({
        tagRerollsUsed: 1,
        tagChangedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      }),
    ]);
    const svc = createUserService(prisma);
    await expect(svc.rerollTag("u1")).rejects.toBeInstanceOf(BadRequestError);
  });

  it("segundo reroll após cooldown passa", async () => {
    const prisma = buildPrismaMock([
      makeUser({
        tagRerollsUsed: 1,
        tagChangedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
      }),
    ]);
    const svc = createUserService(prisma);
    const r = await svc.rerollTag("u1");
    expect(r.tag).toMatch(/^[A-HJ-NP-Z2-9]{4,5}$/);
  });
});

describe("UserService.searchByHandle", () => {
  it("retorna vazio quando query tem menos de 2 chars", async () => {
    const prisma = buildPrismaMock([makeUser()]);
    const svc = createUserService(prisma);
    expect(await svc.searchByHandle("l")).toEqual([]);
    expect(await svc.searchByHandle("")).toEqual([]);
  });

  it("encontra usuários por prefixo de username (case-insensitive)", async () => {
    const prisma = buildPrismaMock([
      makeUser({ id: "u1", username: "lucas", tag: "AB12" }),
      makeUser({ id: "u2", username: "lucia", tag: "CD34", email: "u2@x" }),
      makeUser({ id: "u3", username: "maria", tag: "EF56", email: "u3@x" }),
    ]);
    const svc = createUserService(prisma);
    const r = await svc.searchByHandle("LUC");
    expect(r.length).toBe(2);
    expect(r.map((u) => u.username).sort()).toEqual(["lucas", "lucia"]);
  });

  it("ignora usuários inativos/deletados", async () => {
    const prisma = buildPrismaMock([
      makeUser({ id: "u1", username: "lucas" }),
      makeUser({ id: "u2", username: "lucia", isActive: false, email: "u2@x" }),
      makeUser({
        id: "u3",
        username: "lulu",
        deletedAt: new Date(),
        email: "u3@x",
      }),
    ]);
    const svc = createUserService(prisma);
    const r = await svc.searchByHandle("lu");
    expect(r.length).toBe(1);
    expect(r[0]!.username).toBe("lucas");
  });
});

describe("UserService.resolveHandle", () => {
  it("resolve username + tag (case-insensitive)", async () => {
    const prisma = buildPrismaMock([
      makeUser({ username: "Lucas", tag: "AB12" }),
    ]);
    const svc = createUserService(prisma);
    const r = await svc.resolveHandle("lucas", "ab12");
    expect(r.id).toBe("u1");
    expect(r.handle).toBe("Lucas#AB12");
  });

  it("404 quando combinação não existe", async () => {
    const prisma = buildPrismaMock([
      makeUser({ username: "lucas", tag: "AB12" }),
    ]);
    const svc = createUserService(prisma);
    await expect(svc.resolveHandle("lucas", "ZZ99")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
