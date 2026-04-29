// Testes do WorldService — mock leve. Foca em:
//  - filtragem por kind.
//  - bloqueio de location/disposition em kind incompatível.
//  - linkCharacter respeita kind=NPC.
//  - soft delete (deletedAt).

import { beforeEach, describe, expect, it } from "vitest";
import { createWorldService } from "../world.service.js";
import { NotFoundError } from "../../../errors/app-error.js";

interface FakeEntity {
  id: string;
  campaignId: string;
  authorId: string;
  kind: "NPC" | "LOCATION" | "FACTION" | "LORE";
  name: string;
  description: string;
  subtitle?: string | null;
  location?: string | null;
  disposition?: "FRIENDLY" | "NEUTRAL" | "HOSTILE" | "UNKNOWN" | null;
  notes?: string | null;
  characterId?: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

let nextId = 1;

function buildPrismaMock(seed: FakeEntity[]) {
  const db = new Map<string, FakeEntity>(seed.map((e) => [e.id, e]));
  return {
    worldEntity: {
      findMany: ({ where }: { where: Record<string, unknown> }) => {
        const filtered = [...db.values()].filter((e) => {
          if (e.campaignId !== where.campaignId) return false;
          if (where.deletedAt === null && e.deletedAt !== null) return false;
          if (where.kind && e.kind !== where.kind) return false;
          return true;
        });
        return Promise.resolve(filtered);
      },
      findFirst: ({ where }: { where: Record<string, unknown> }) => {
        const v = [...db.values()].find((e) => {
          if (e.id !== where.id) return false;
          if (where.deletedAt === null && e.deletedAt !== null) return false;
          return true;
        });
        return Promise.resolve(v ?? null);
      },
      findUnique: ({ where }: { where: { id: string } }) =>
        Promise.resolve(db.get(where.id) ?? null),
      create: ({ data }: { data: Omit<FakeEntity, "id" | "createdAt" | "updatedAt" | "deletedAt"> }) => {
        const id = `we_${nextId++}`;
        const now = new Date();
        const e: FakeEntity = {
          id,
          ...data,
          deletedAt: null,
          createdAt: now,
          updatedAt: now,
        };
        db.set(id, e);
        return Promise.resolve(e);
      },
      update: ({ where, data }: { where: { id: string }; data: Partial<FakeEntity> }) => {
        const cur = db.get(where.id)!;
        const next = { ...cur, ...data, updatedAt: new Date() };
        db.set(where.id, next);
        return Promise.resolve(next);
      },
    },
  };
}

describe("WorldService — list", () => {
  beforeEach(() => {
    nextId = 1;
  });

  it("filtra por kind quando query.kind setado", async () => {
    const prisma = buildPrismaMock([
      makeEntity({ id: "a", kind: "NPC", name: "Brom" }),
      makeEntity({ id: "b", kind: "LOCATION", name: "Vila" }),
      makeEntity({ id: "c", kind: "NPC", name: "Eldrith" }),
    ]);
    const service = createWorldService(
      prisma as unknown as Parameters<typeof createWorldService>[0],
    );
    const list = await service.list("c1", { kind: "NPC" });
    expect(list.map((e) => e.name)).toEqual(["Brom", "Eldrith"]);
  });

  it("retorna tudo quando kind ausente", async () => {
    const prisma = buildPrismaMock([
      makeEntity({ id: "a", kind: "NPC", name: "Brom" }),
      makeEntity({ id: "b", kind: "LORE", name: "Profecia" }),
    ]);
    const service = createWorldService(
      prisma as unknown as Parameters<typeof createWorldService>[0],
    );
    const list = await service.list("c1");
    expect(list).toHaveLength(2);
  });

  it("ignora soft-deleted", async () => {
    const prisma = buildPrismaMock([
      { ...makeEntity({ id: "x", kind: "NPC", name: "Apagado" }), deletedAt: new Date() },
    ]);
    const service = createWorldService(
      prisma as unknown as Parameters<typeof createWorldService>[0],
    );
    const list = await service.list("c1");
    expect(list).toHaveLength(0);
  });
});

describe("WorldService — create kind-aware", () => {
  beforeEach(() => {
    nextId = 1;
  });

  it("salva location e disposition quando kind=NPC", async () => {
    const prisma = buildPrismaMock([]);
    const service = createWorldService(
      prisma as unknown as Parameters<typeof createWorldService>[0],
    );
    const created = await service.create("c1", "u1", {
      kind: "NPC",
      name: "Garuk",
      description: "Bandido",
      location: "Montanhas",
      disposition: "HOSTILE",
    });
    expect(created.location).toBe("Montanhas");
    expect(created.disposition).toBe("HOSTILE");
  });

  it("ignora location/disposition quando kind=LORE", async () => {
    const prisma = buildPrismaMock([]);
    const service = createWorldService(
      prisma as unknown as Parameters<typeof createWorldService>[0],
    );
    const created = await service.create("c1", "u1", {
      kind: "LORE",
      name: "Profecia da Lua Negra",
      description: "...",
      location: "ignorado",
      disposition: "HOSTILE",
    });
    expect(created.location).toBeUndefined();
    expect(created.disposition).toBeUndefined();
  });
});

describe("WorldService — linkCharacter", () => {
  beforeEach(() => {
    nextId = 1;
  });

  it("vincula characterId quando kind=NPC", async () => {
    const prisma = buildPrismaMock([
      makeEntity({ id: "n1", kind: "NPC", name: "Brom" }),
    ]);
    const service = createWorldService(
      prisma as unknown as Parameters<typeof createWorldService>[0],
    );
    const updated = await service.linkCharacter("n1", "char_1");
    expect(updated?.characterId).toBe("char_1");
  });

  it("noop em kind=LORE", async () => {
    const prisma = buildPrismaMock([
      makeEntity({ id: "l1", kind: "LORE", name: "X" }),
    ]);
    const service = createWorldService(
      prisma as unknown as Parameters<typeof createWorldService>[0],
    );
    const updated = await service.linkCharacter("l1", "char_1");
    expect(updated?.characterId).toBeFalsy();
  });
});

describe("WorldService — delete (soft)", () => {
  beforeEach(() => {
    nextId = 1;
  });

  it("seta deletedAt em vez de remover", async () => {
    const prisma = buildPrismaMock([
      makeEntity({ id: "x", kind: "NPC", name: "Apagar" }),
    ]);
    const service = createWorldService(
      prisma as unknown as Parameters<typeof createWorldService>[0],
    );
    await service.delete("x");
    const list = await service.list("c1");
    expect(list).toHaveLength(0);
  });

  it("404 quando id inexistente", async () => {
    const prisma = buildPrismaMock([]);
    const service = createWorldService(
      prisma as unknown as Parameters<typeof createWorldService>[0],
    );
    await expect(service.delete("missing")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});

function makeEntity(
  partial: Partial<FakeEntity> & { id: string; kind: FakeEntity["kind"]; name: string },
): FakeEntity {
  return {
    id: partial.id,
    campaignId: "c1",
    authorId: "u1",
    kind: partial.kind,
    name: partial.name,
    description: partial.description ?? "",
    subtitle: partial.subtitle ?? null,
    location: partial.location ?? null,
    disposition: partial.disposition ?? null,
    notes: partial.notes ?? null,
    characterId: partial.characterId ?? null,
    deletedAt: partial.deletedAt ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
