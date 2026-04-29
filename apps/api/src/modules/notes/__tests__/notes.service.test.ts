// Testes do NotesService — mock leve de Prisma. Foca em:
//  - filtragem `excludeGmOnly` na list/get.
//  - assertVisibility (helper).
//  - soft delete (deletedAt).

import { beforeEach, describe, expect, it } from "vitest";
import { createNotesService } from "../notes.service.js";
import { ForbiddenError, NotFoundError } from "../../../errors/app-error.js";

interface FakeNote {
  id: string;
  campaignId: string;
  authorId: string;
  title: string;
  content: string;
  category: "PLOT" | "ITEM" | "NPC" | "GENERAL" | "LOCATION";
  visibility: "PUBLIC" | "GM_ONLY" | "PRIVATE";
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

let nextId = 1;

function buildPrismaMock(seed: FakeNote[]) {
  const db = new Map<string, FakeNote>(seed.map((n) => [n.id, n]));
  return {
    note: {
      findMany: ({ where }: { where: Record<string, unknown> }) => {
        const filtered = [...db.values()].filter((n) => {
          if (n.campaignId !== where.campaignId) return false;
          if (where.deletedAt === null && n.deletedAt !== null) return false;
          if (
            where.visibility &&
            typeof where.visibility === "object" &&
            "not" in (where.visibility as Record<string, unknown>) &&
            n.visibility === (where.visibility as { not: string }).not
          ) {
            return false;
          }
          return true;
        });
        return Promise.resolve(filtered);
      },
      findFirst: ({ where }: { where: Record<string, unknown> }) => {
        const v = [...db.values()].find((n) => {
          if (n.id !== where.id) return false;
          if (where.deletedAt === null && n.deletedAt !== null) return false;
          if (
            where.visibility &&
            typeof where.visibility === "object" &&
            "not" in (where.visibility as Record<string, unknown>) &&
            n.visibility === (where.visibility as { not: string }).not
          ) {
            return false;
          }
          return true;
        });
        return Promise.resolve(v ?? null);
      },
      findUnique: ({ where }: { where: { id: string } }) =>
        Promise.resolve(db.get(where.id) ?? null),
      create: ({ data }: { data: Omit<FakeNote, "id" | "createdAt" | "updatedAt" | "deletedAt"> }) => {
        const id = `note_${nextId++}`;
        const now = new Date();
        const n: FakeNote = {
          id,
          ...data,
          deletedAt: null,
          createdAt: now,
          updatedAt: now,
        };
        db.set(id, n);
        return Promise.resolve(n);
      },
      update: ({ where, data }: { where: { id: string }; data: Partial<FakeNote> }) => {
        const cur = db.get(where.id)!;
        const next = { ...cur, ...data, updatedAt: new Date() };
        db.set(where.id, next);
        return Promise.resolve(next);
      },
    },
  };
}

describe("NotesService — list", () => {
  beforeEach(() => {
    nextId = 1;
  });

  it("retorna todas as notas ativas pra GM (excludeGmOnly=false)", async () => {
    const prisma = buildPrismaMock([
      {
        id: "n1",
        campaignId: "c1",
        authorId: "u1",
        title: "Plot secreto",
        content: "...",
        category: "PLOT",
        visibility: "GM_ONLY",
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "n2",
        campaignId: "c1",
        authorId: "u1",
        title: "Item público",
        content: "...",
        category: "ITEM",
        visibility: "PUBLIC",
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const service = createNotesService(prisma as unknown as Parameters<typeof createNotesService>[0]);
    const list = await service.list("c1");
    expect(list).toHaveLength(2);
  });

  it("filtra GM_ONLY pra player (excludeGmOnly=true)", async () => {
    const prisma = buildPrismaMock([
      {
        id: "n1",
        campaignId: "c1",
        authorId: "u1",
        title: "Plot secreto",
        content: "...",
        category: "PLOT",
        visibility: "GM_ONLY",
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "n2",
        campaignId: "c1",
        authorId: "u1",
        title: "Item público",
        content: "...",
        category: "ITEM",
        visibility: "PUBLIC",
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const service = createNotesService(prisma as unknown as Parameters<typeof createNotesService>[0]);
    const list = await service.list("c1", { excludeGmOnly: true });
    expect(list).toHaveLength(1);
    expect(list[0]!.id).toBe("n2");
  });

  it("ignora notas com deletedAt setado", async () => {
    const prisma = buildPrismaMock([
      {
        id: "n_deleted",
        campaignId: "c1",
        authorId: "u1",
        title: "Excluída",
        content: "...",
        category: "GENERAL",
        visibility: "PUBLIC",
        deletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const service = createNotesService(prisma as unknown as Parameters<typeof createNotesService>[0]);
    const list = await service.list("c1");
    expect(list).toHaveLength(0);
  });
});

describe("NotesService — assertVisibility", () => {
  const service = createNotesService(
    buildPrismaMock([]) as unknown as Parameters<typeof createNotesService>[0],
  );

  it("permite OWNER ver GM_ONLY", () => {
    expect(() => service.assertVisibility("OWNER", "GM_ONLY")).not.toThrow();
  });

  it("permite CO_GM ver GM_ONLY", () => {
    expect(() => service.assertVisibility("CO_GM", "GM_ONLY")).not.toThrow();
  });

  it("bloqueia PLAYER em GM_ONLY", () => {
    expect(() => service.assertVisibility("PLAYER", "GM_ONLY")).toThrow(
      ForbiddenError,
    );
  });

  it("permite qualquer um ver PUBLIC", () => {
    expect(() => service.assertVisibility("PLAYER", "PUBLIC")).not.toThrow();
    expect(() => service.assertVisibility("SPECTATOR", "PUBLIC")).not.toThrow();
  });
});

describe("NotesService — delete (soft)", () => {
  beforeEach(() => {
    nextId = 1;
  });

  it("seta deletedAt em vez de remover row", async () => {
    const seed: FakeNote[] = [
      {
        id: "n1",
        campaignId: "c1",
        authorId: "u1",
        title: "Vai sumir",
        content: "...",
        category: "GENERAL",
        visibility: "GM_ONLY",
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const prisma = buildPrismaMock(seed);
    const service = createNotesService(prisma as unknown as Parameters<typeof createNotesService>[0]);
    await service.delete("n1", "u1");
    const list = await service.list("c1");
    expect(list).toHaveLength(0);
  });

  it("404 quando nota não existe", async () => {
    const prisma = buildPrismaMock([]);
    const service = createNotesService(prisma as unknown as Parameters<typeof createNotesService>[0]);
    await expect(service.delete("missing", "u1")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
