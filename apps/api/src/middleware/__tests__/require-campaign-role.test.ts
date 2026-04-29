// Testes do middleware `requireCampaignRole` + variante via resource.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../errors/app-error.js";

const { mockCampaignFind, mockMemberFindFirst } = vi.hoisted(() => ({
  mockCampaignFind: vi.fn(),
  mockMemberFindFirst: vi.fn(),
}));

vi.mock("@questboard/db", () => ({
  prisma: {
    campaign: { findUnique: mockCampaignFind },
    campaignMember: { findFirst: mockMemberFindFirst },
  },
}));

import {
  requireCampaignGm,
  requireCampaignMember,
  requireCampaignRoleViaResource,
} from "../require-campaign-role.js";

type LooseHandler = (
  req: FastifyRequest,
  reply: FastifyReply,
) => Promise<unknown>;

const gmHandler = requireCampaignGm as unknown as LooseHandler;
const memberHandler = requireCampaignMember as unknown as LooseHandler;
const fakeReply = {} as FastifyReply;

function makeReq(opts: {
  campaignId?: string;
  id?: string;
  userId?: string;
  bodyCampaignId?: string;
}): FastifyRequest {
  const params: Record<string, string> = {};
  if (opts.campaignId) params.campaignId = opts.campaignId;
  if (opts.id) params.id = opts.id;
  return {
    params,
    body: opts.bodyCampaignId ? { campaignId: opts.bodyCampaignId } : {},
    user: { id: opts.userId ?? "u_actor", plan: "FREE", role: "USER" },
  } as unknown as FastifyRequest;
}

describe("requireCampaignGm", () => {
  beforeEach(() => {
    mockCampaignFind.mockReset();
    mockMemberFindFirst.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("400 quando params/body sem campaignId", async () => {
    await expect(gmHandler(makeReq({}), fakeReply)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it("404 quando campanha não existe", async () => {
    mockCampaignFind.mockResolvedValue(null);
    await expect(
      gmHandler(makeReq({ campaignId: "missing" }), fakeReply),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("permite OWNER (Campaign.ownerId)", async () => {
    mockCampaignFind.mockResolvedValue({ ownerId: "u_owner" });
    await expect(
      gmHandler(makeReq({ campaignId: "c1", userId: "u_owner" }), fakeReply),
    ).resolves.toBeUndefined();
  });

  it("permite CO_GM via CampaignMember", async () => {
    mockCampaignFind.mockResolvedValue({ ownerId: "u_other" });
    mockMemberFindFirst.mockResolvedValue({ role: "CO_GM" });
    await expect(
      gmHandler(makeReq({ campaignId: "c1", userId: "u_co" }), fakeReply),
    ).resolves.toBeUndefined();
  });

  it("rejeita PLAYER pra rota GM", async () => {
    mockCampaignFind.mockResolvedValue({ ownerId: "u_other" });
    mockMemberFindFirst.mockResolvedValue({ role: "PLAYER" });
    await expect(
      gmHandler(makeReq({ campaignId: "c1", userId: "u_p" }), fakeReply),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("body.campaignId é fallback quando params não tem", async () => {
    mockCampaignFind.mockResolvedValue({ ownerId: "u_owner" });
    await expect(
      gmHandler(
        makeReq({ bodyCampaignId: "c1", userId: "u_owner" }),
        fakeReply,
      ),
    ).resolves.toBeUndefined();
  });
});

describe("requireCampaignMember (visualização)", () => {
  beforeEach(() => {
    mockCampaignFind.mockReset();
    mockMemberFindFirst.mockReset();
  });

  it("permite SPECTATOR", async () => {
    mockCampaignFind.mockResolvedValue({ ownerId: "u_other" });
    mockMemberFindFirst.mockResolvedValue({ role: "SPECTATOR" });
    await expect(
      memberHandler(
        makeReq({ campaignId: "c1", userId: "u_spec" }),
        fakeReply,
      ),
    ).resolves.toBeUndefined();
  });

  it("rejeita outsider (não-membro)", async () => {
    mockCampaignFind.mockResolvedValue({ ownerId: "u_other" });
    mockMemberFindFirst.mockResolvedValue(null);
    await expect(
      memberHandler(
        makeReq({ campaignId: "c1", userId: "u_outside" }),
        fakeReply,
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("requireCampaignRoleViaResource", () => {
  beforeEach(() => {
    mockCampaignFind.mockReset();
    mockMemberFindFirst.mockReset();
  });

  it("400 quando param não está presente", async () => {
    const lookup = vi.fn();
    const handler = requireCampaignRoleViaResource(
      "id",
      lookup,
      ["OWNER"],
    ) as unknown as LooseHandler;
    await expect(handler(makeReq({}), fakeReply)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(lookup).not.toHaveBeenCalled();
  });

  it("404 quando lookup retorna null", async () => {
    const lookup = vi.fn().mockResolvedValue(null);
    const handler = requireCampaignRoleViaResource(
      "id",
      lookup,
      ["OWNER"],
    ) as unknown as LooseHandler;
    await expect(
      handler(makeReq({ id: "missing" }), fakeReply),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("delega resolução ao lookup → resolveCampaignRole", async () => {
    const lookup = vi.fn().mockResolvedValue("c_resolved");
    mockCampaignFind.mockResolvedValue({ ownerId: "u_owner" });
    const handler = requireCampaignRoleViaResource(
      "id",
      lookup,
      ["OWNER", "CO_GM"],
    ) as unknown as LooseHandler;
    await expect(
      handler(makeReq({ id: "note_1", userId: "u_owner" }), fakeReply),
    ).resolves.toBeUndefined();
    expect(lookup).toHaveBeenCalledWith("note_1");
  });
});
