// Testes do middleware `requireConversationGm`. Resolve sessionId
// a partir de Conversation.sessionId, depois delega pra
// resolveSessionRole (Session.ownerId/gmId ou SessionPlayer.role).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../errors/app-error.js";

const { mockConversationFind, mockSessionFind, mockPlayerFindFirst } =
  vi.hoisted(() => ({
    mockConversationFind: vi.fn(),
    mockSessionFind: vi.fn(),
    mockPlayerFindFirst: vi.fn(),
  }));

vi.mock("@questboard/db", () => ({
  prisma: {
    conversation: { findUnique: mockConversationFind },
    session: { findUnique: mockSessionFind },
    sessionPlayer: { findFirst: mockPlayerFindFirst },
  },
}));

import { requireConversationGm } from "../require-session-role.js";

type LooseHandler = (
  req: FastifyRequest,
  reply: FastifyReply,
) => Promise<unknown>;

const handler = requireConversationGm as unknown as LooseHandler;

function makeReq(opts: {
  cId?: string;
  userId?: string;
}): FastifyRequest {
  return {
    params: opts.cId !== undefined ? { cId: opts.cId } : {},
    user: { id: opts.userId ?? "u_actor", plan: "FREE", role: "USER" },
  } as unknown as FastifyRequest;
}

const fakeReply = {} as FastifyReply;

describe("requireConversationGm", () => {
  beforeEach(() => {
    mockConversationFind.mockReset();
    mockSessionFind.mockReset();
    mockPlayerFindFirst.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rejeita request sem `cId` no params", async () => {
    await expect(handler(makeReq({}), fakeReply)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it("404 quando conversa não existe", async () => {
    mockConversationFind.mockResolvedValue(null);
    await expect(
      handler(makeReq({ cId: "c_missing" }), fakeReply),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("permite quando conversa não tem sessão (NPC standalone do GM)", async () => {
    mockConversationFind.mockResolvedValue({ sessionId: null });
    await expect(
      handler(makeReq({ cId: "c_1", userId: "u_owner" }), fakeReply),
    ).resolves.toBeUndefined();
  });

  it("404 quando user não pertence à sessão linkada", async () => {
    mockConversationFind.mockResolvedValue({ sessionId: "s_1" });
    mockSessionFind.mockResolvedValue({ ownerId: "u_other_gm", gmId: "u_other_gm" });
    mockPlayerFindFirst.mockResolvedValue(null);
    await expect(
      handler(makeReq({ cId: "c_1", userId: "u_outsider" }), fakeReply),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("permite GM titular da sessão", async () => {
    mockConversationFind.mockResolvedValue({ sessionId: "s_1" });
    mockSessionFind.mockResolvedValue({ ownerId: "u_gm", gmId: "u_gm" });
    await expect(
      handler(makeReq({ cId: "c_1", userId: "u_gm" }), fakeReply),
    ).resolves.toBeUndefined();
  });

  it("permite CO_GM cadastrado em SessionPlayer", async () => {
    mockConversationFind.mockResolvedValue({ sessionId: "s_1" });
    mockSessionFind.mockResolvedValue({ ownerId: "u_other", gmId: "u_other" });
    mockPlayerFindFirst.mockResolvedValue({ role: "CO_GM" });
    await expect(
      handler(makeReq({ cId: "c_1", userId: "u_co" }), fakeReply),
    ).resolves.toBeUndefined();
  });

  it("rejeita PLAYER comum com 403", async () => {
    mockConversationFind.mockResolvedValue({ sessionId: "s_1" });
    mockSessionFind.mockResolvedValue({ ownerId: "u_other", gmId: "u_other" });
    mockPlayerFindFirst.mockResolvedValue({ role: "PLAYER" });
    await expect(
      handler(makeReq({ cId: "c_1", userId: "u_player" }), fakeReply),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("anexa request.sessionId e request.sessionRole quando passa", async () => {
    mockConversationFind.mockResolvedValue({ sessionId: "s_1" });
    mockSessionFind.mockResolvedValue({ ownerId: "u_gm", gmId: "u_gm" });
    const req = makeReq({ cId: "c_1", userId: "u_gm" });
    await handler(req, fakeReply);
    expect(req.sessionId).toBe("s_1");
    expect(req.sessionRole).toBe("GM");
  });
});
