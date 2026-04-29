// Testes do fluxo scripted do NpcService. Mock de Prisma é leve —
// in-memory, suficiente pra cobrir os caminhos críticos. Quando o
// CI tiver test container Postgres, migrar pra integration test
// completo.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createNpcService } from "../npc.service.js";
import { BadRequestError, NotFoundError } from "../../../errors/app-error.js";

vi.mock("../../../lib/socket.js", () => ({
  getIO: vi.fn(() => {
    throw new Error("test");
  }),
}));

interface InMemoryDb {
  characters: Map<string, {
    id: string;
    userId: string;
    dialogueEnabled: boolean;
    dialogueGreeting: string | null;
    dialogueFarewell: string | null;
  }>;
  branches: Map<string, {
    id: string;
    characterId: string;
    trigger: string;
    response: string;
    isFinal: boolean;
    order: number;
  }>;
  conversations: Map<string, {
    id: string;
    sessionId: string | null;
    npcId: string;
    initiatorId: string;
    mode: "SCRIPTED" | "AI" | "HYBRID";
    isOpen: boolean;
    startedAt: Date;
    endedAt: Date | null;
  }>;
  messages: Map<string, {
    id: string;
    conversationId: string;
    speaker: "NPC" | "PLAYER" | "GM_OVERRIDE";
    text: string;
    branchId: string | null;
    createdAt: Date;
  }>;
}

let nextId = 1;
function makeId(prefix: string): string {
  return `${prefix}_${nextId++}`;
}

function buildPrismaMock(db: InMemoryDb): unknown {
  return {
    character: {
      findUnique: ({ where, select }: { where: { id: string }; select?: unknown }) => {
        const c = db.characters.get(where.id);
        if (!c) return Promise.resolve(null);
        // Apenas retorna os campos pedidos (mock cru — testa lógica não Prisma).
        void select;
        return Promise.resolve(c);
      },
    },
    npcDialogueBranch: {
      findMany: ({ where }: { where: { characterId: string } }) =>
        Promise.resolve(
          [...db.branches.values()]
            .filter((b) => b.characterId === where.characterId)
            .sort((a, b) => a.order - b.order),
        ),
      findUnique: ({ where }: { where: { id: string } }) =>
        Promise.resolve(db.branches.get(where.id) ?? null),
      create: ({ data }: { data: Omit<NonNullable<ReturnType<InMemoryDb["branches"]["get"]>>, "id"> }) => {
        const id = makeId("br");
        const branch = { id, ...data };
        db.branches.set(id, branch);
        return Promise.resolve(branch);
      },
      update: ({ where, data }: { where: { id: string }; data: Partial<NonNullable<ReturnType<InMemoryDb["branches"]["get"]>>> }) => {
        const cur = db.branches.get(where.id)!;
        const next = { ...cur, ...data };
        db.branches.set(where.id, next);
        return Promise.resolve(next);
      },
      delete: ({ where }: { where: { id: string } }) => {
        const cur = db.branches.get(where.id)!;
        db.branches.delete(where.id);
        return Promise.resolve(cur);
      },
      updateMany: ({ where, data }: { where: { id: string; characterId: string }; data: { order: number } }) => {
        const cur = db.branches.get(where.id);
        if (cur && cur.characterId === where.characterId) {
          db.branches.set(where.id, { ...cur, ...data });
          return Promise.resolve({ count: 1 });
        }
        return Promise.resolve({ count: 0 });
      },
    },
    conversation: {
      findUnique: ({ where, include }: { where: { id: string }; include?: { npc?: unknown } }) => {
        const c = db.conversations.get(where.id);
        if (!c) return Promise.resolve(null);
        if (include?.npc) {
          const npc = db.characters.get(c.npcId);
          return Promise.resolve({ ...c, npc });
        }
        return Promise.resolve(c);
      },
      findMany: ({ where }: { where: { sessionId: string } }) =>
        Promise.resolve(
          [...db.conversations.values()].filter((c) => c.sessionId === where.sessionId),
        ),
      create: ({ data }: { data: Omit<NonNullable<ReturnType<InMemoryDb["conversations"]["get"]>>, "id" | "isOpen" | "startedAt" | "endedAt" | "mode"> & Partial<{ mode: "SCRIPTED" | "AI" | "HYBRID" }> }) => {
        const id = makeId("conv");
        const conv = {
          id,
          ...data,
          mode: data.mode ?? "SCRIPTED",
          isOpen: true,
          startedAt: new Date(),
          endedAt: null,
        };
        db.conversations.set(id, conv);
        return Promise.resolve(conv);
      },
      update: ({ where, data }: { where: { id: string }; data: Partial<NonNullable<ReturnType<InMemoryDb["conversations"]["get"]>>> }) => {
        const cur = db.conversations.get(where.id)!;
        const next = { ...cur, ...data };
        db.conversations.set(where.id, next);
        return Promise.resolve(next);
      },
    },
    conversationMessage: {
      create: ({ data }: { data: { conversationId: string; speaker: "NPC" | "PLAYER" | "GM_OVERRIDE"; text: string; branchId?: string | null } }) => {
        const id = makeId("msg");
        const msg = {
          id,
          conversationId: data.conversationId,
          speaker: data.speaker,
          text: data.text,
          branchId: data.branchId ?? null,
          createdAt: new Date(),
        };
        db.messages.set(id, msg);
        return Promise.resolve(msg);
      },
    },
    $transaction: (ops: Promise<unknown>[]) => Promise.all(ops),
  };
}

describe("NpcService — branches CRUD", () => {
  let db: InMemoryDb;
  let service: ReturnType<typeof createNpcService>;

  beforeEach(() => {
    nextId = 1;
    db = {
      characters: new Map([
        ["npc_1", { id: "npc_1", userId: "u_owner", dialogueEnabled: true, dialogueGreeting: "Olá, viajante.", dialogueFarewell: "Vá com cautela." }],
        ["npc_other", { id: "npc_other", userId: "u_other", dialogueEnabled: false, dialogueGreeting: null, dialogueFarewell: null }],
      ]),
      branches: new Map(),
      conversations: new Map(),
      messages: new Map(),
    };
    service = createNpcService(buildPrismaMock(db) as Parameters<typeof createNpcService>[0]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("createBranch persiste e retorna com order 0", async () => {
    const branch = await service.createBranch("npc_1", "u_owner", {
      trigger: "Quem é você?",
      response: "Sou Brom, taverneiro.",
      isFinal: false,
      order: 0,
    });
    expect(branch.id).toBeDefined();
    expect(branch.trigger).toBe("Quem é você?");
    expect(db.branches.size).toBe(1);
  });

  it("createBranch bloqueia user que não é dono do NPC", async () => {
    await expect(
      service.createBranch("npc_1", "u_other", {
        trigger: "x",
        response: "y",
        isFinal: false,
        order: 0,
      }),
    ).rejects.toThrow(/dono do NPC/);
  });

  it("listBranches retorna em ordem", async () => {
    db.branches.set("b1", { id: "b1", characterId: "npc_1", trigger: "B", response: "...", isFinal: false, order: 1 });
    db.branches.set("b2", { id: "b2", characterId: "npc_1", trigger: "A", response: "...", isFinal: false, order: 0 });
    const list = await service.listBranches("npc_1");
    expect(list.map((b) => b.id)).toEqual(["b2", "b1"]);
  });

  it("deleteBranch checa ownership e remove", async () => {
    db.branches.set("b1", { id: "b1", characterId: "npc_1", trigger: "x", response: "y", isFinal: false, order: 0 });
    await service.deleteBranch("npc_1", "b1", "u_owner");
    expect(db.branches.has("b1")).toBe(false);
  });

  it("reorderBranches atualiza order conforme array", async () => {
    db.branches.set("b1", { id: "b1", characterId: "npc_1", trigger: "x", response: "y", isFinal: false, order: 0 });
    db.branches.set("b2", { id: "b2", characterId: "npc_1", trigger: "x", response: "y", isFinal: false, order: 1 });
    await service.reorderBranches("npc_1", "u_owner", { ids: ["b2", "b1"] });
    expect(db.branches.get("b2")!.order).toBe(0);
    expect(db.branches.get("b1")!.order).toBe(1);
  });
});

describe("NpcService — conversation flow (SCRIPTED)", () => {
  let db: InMemoryDb;
  let service: ReturnType<typeof createNpcService>;

  beforeEach(() => {
    nextId = 1;
    db = {
      characters: new Map([
        ["npc_1", { id: "npc_1", userId: "u_owner", dialogueEnabled: true, dialogueGreeting: "Olá, viajante.", dialogueFarewell: "Vá com cautela." }],
        ["npc_disabled", { id: "npc_disabled", userId: "u_owner", dialogueEnabled: false, dialogueGreeting: null, dialogueFarewell: null }],
      ]),
      branches: new Map([
        ["br_normal", { id: "br_normal", characterId: "npc_1", trigger: "Notícias?", response: "Algumas.", isFinal: false, order: 0 }],
        ["br_final", { id: "br_final", characterId: "npc_1", trigger: "Adeus", response: "Volte sempre.", isFinal: true, order: 1 }],
      ]),
      conversations: new Map(),
      messages: new Map(),
    };
    service = createNpcService(buildPrismaMock(db) as Parameters<typeof createNpcService>[0]);
  });

  it("openConversation com greeting registra primeira mensagem do NPC", async () => {
    const conv = await service.openConversation("s_1", "u_player", {
      npcId: "npc_1",
      mode: "SCRIPTED",
    });
    expect(conv.id).toBeDefined();
    expect(conv.isOpen).toBe(true);
    const msgs = [...db.messages.values()].filter((m) => m.conversationId === conv.id);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]!.speaker).toBe("NPC");
    expect(msgs[0]!.text).toBe("Olá, viajante.");
  });

  it("openConversation rejeita NPC com diálogo desabilitado", async () => {
    await expect(
      service.openConversation("s_1", "u_player", {
        npcId: "npc_disabled",
        mode: "SCRIPTED",
      }),
    ).rejects.toThrow(/desabilitado/i);
  });

  it("openConversation rejeita modo AI no MVP", async () => {
    await expect(
      service.openConversation("s_1", "u_player", {
        npcId: "npc_1",
        mode: "AI",
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("sendMessage empilha trigger + response no log", async () => {
    const conv = await service.openConversation("s_1", "u_player", {
      npcId: "npc_1",
      mode: "SCRIPTED",
    });
    const result = await service.sendMessage(conv.id, "u_player", {
      branchId: "br_normal",
    });
    expect(result.finished).toBe(false);
    expect(result.playerMessage.text).toBe("Notícias?");
    expect(result.playerMessage.speaker).toBe("PLAYER");
    expect(result.npcMessage.text).toBe("Algumas.");
    expect(result.npcMessage.speaker).toBe("NPC");
  });

  it("sendMessage com branch isFinal encerra a conversa e anexa farewell", async () => {
    const conv = await service.openConversation("s_1", "u_player", {
      npcId: "npc_1",
      mode: "SCRIPTED",
    });
    const result = await service.sendMessage(conv.id, "u_player", {
      branchId: "br_final",
    });
    expect(result.finished).toBe(true);
    const updated = db.conversations.get(conv.id)!;
    expect(updated.isOpen).toBe(false);
    const msgs = [...db.messages.values()].filter((m) => m.conversationId === conv.id);
    // greeting + player + npc + farewell = 4
    expect(msgs).toHaveLength(4);
    expect(msgs[3]!.text).toBe("Vá com cautela.");
  });

  it("sendMessage rejeita branch de outro NPC", async () => {
    const conv = await service.openConversation("s_1", "u_player", {
      npcId: "npc_1",
      mode: "SCRIPTED",
    });
    db.branches.set("br_other", { id: "br_other", characterId: "npc_disabled", trigger: "x", response: "y", isFinal: false, order: 0 });
    await expect(
      service.sendMessage(conv.id, "u_player", { branchId: "br_other" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("sendMessage em conversa fechada falha", async () => {
    const conv = await service.openConversation("s_1", "u_player", {
      npcId: "npc_1",
      mode: "SCRIPTED",
    });
    await service.finishConversation(conv.id, "u_player");
    await expect(
      service.sendMessage(conv.id, "u_player", { branchId: "br_normal" }),
    ).rejects.toThrow(/encerrada/i);
  });

  it("gmOverride registra mensagem com speaker GM_OVERRIDE", async () => {
    const conv = await service.openConversation("s_1", "u_player", {
      npcId: "npc_1",
      mode: "SCRIPTED",
    });
    const msg = await service.gmOverride(conv.id, "u_gm", {
      text: "GM digitou: 'Volte na próxima lua.'",
    });
    expect(msg.speaker).toBe("GM_OVERRIDE");
    expect(msg.text).toContain("Volte na próxima lua");
  });
});
