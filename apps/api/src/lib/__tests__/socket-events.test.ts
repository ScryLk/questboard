// Testes do helper de socket-events. Como o helper engole erros
// quando `getIO()` não está inicializado, validamos esse comportamento
// (não derruba o caller) e também o roteamento secreto pra GM room.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockEmit = vi.fn();
const mockTo = vi.fn(() => ({ emit: mockEmit }));
const mockOf = vi.fn(() => ({ to: mockTo }));

vi.mock("../socket.js", () => ({
  getIO: vi.fn(() => ({ of: mockOf })),
}));

import {
  emitCombatHpChanged,
  emitDiceResult,
  emitPlayerConnected,
  emitPlayerDisconnected,
  emitSessionStatusChanged,
  emitSessionSettingsUpdated,
} from "../socket-events.js";
import * as socketModule from "../socket.js";

describe("socket-events — emit helpers", () => {
  beforeEach(() => {
    mockEmit.mockClear();
    mockTo.mockClear();
    mockOf.mockClear();
    (socketModule.getIO as ReturnType<typeof vi.fn>).mockReturnValue({
      of: mockOf,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emitSessionStatusChanged manda pra sala da sessão no namespace /session", () => {
    emitSessionStatusChanged({
      sessionId: "s_1",
      status: "LIVE",
      by: "u_1",
      at: "2026-04-29T10:00:00Z",
    });
    expect(mockOf).toHaveBeenCalledWith("/session");
    expect(mockTo).toHaveBeenCalledWith("session:s_1");
    expect(mockEmit).toHaveBeenCalledWith(
      "session:status-changed",
      expect.objectContaining({ status: "LIVE" }),
    );
  });

  it("emitSessionSettingsUpdated usa o evento canônico do CLAUDE.md §8", () => {
    emitSessionSettingsUpdated({
      sessionId: "s_1",
      settings: { name: "Nova" },
      by: "u_1",
      at: "2026-04-29T10:00:00Z",
    });
    expect(mockEmit).toHaveBeenCalledWith(
      "session:settings-updated",
      expect.any(Object),
    );
  });

  it("emitCombatHpChanged inclui delta + isDead", () => {
    emitCombatHpChanged({
      sessionId: "s_1",
      participantId: "p_1",
      tokenId: "t_1",
      hpCurrent: 0,
      hpMax: 30,
      hpTemp: 0,
      delta: -10,
      isDead: true,
      by: "u_1",
      at: "2026-04-29T10:00:00Z",
    });
    expect(mockEmit).toHaveBeenCalledWith(
      "combat:hp-changed",
      expect.objectContaining({ isDead: true, delta: -10 }),
    );
  });

  it("emitPlayerConnected emite player:connected", () => {
    emitPlayerConnected({
      sessionId: "s_1",
      userId: "u_1",
      at: "2026-04-29T10:00:00Z",
    });
    expect(mockEmit).toHaveBeenCalledWith(
      "player:connected",
      expect.objectContaining({ userId: "u_1" }),
    );
  });

  it("emitPlayerDisconnected emite player:disconnected", () => {
    emitPlayerDisconnected({
      sessionId: "s_1",
      userId: "u_1",
      at: "2026-04-29T10:00:00Z",
    });
    expect(mockEmit).toHaveBeenCalledWith(
      "player:disconnected",
      expect.objectContaining({ userId: "u_1" }),
    );
  });
});

describe("emitDiceResult — visibility routing", () => {
  beforeEach(() => {
    mockEmit.mockClear();
    mockTo.mockClear();
    mockOf.mockClear();
    (socketModule.getIO as ReturnType<typeof vi.fn>).mockReturnValue({
      of: mockOf,
    });
  });

  const basePayload = {
    sessionId: "s_1",
    rollId: "r_1",
    rolledBy: "u_1",
    formula: "1d20+5",
    rolls: [15],
    modifier: 5,
    total: 20,
    isNat20: false,
    isNat1: false,
    at: "2026-04-29T10:00:00Z",
  };

  it("rolagem pública vai pra sala da sessão", () => {
    emitDiceResult(
      { ...basePayload, visibility: "public" },
      { gmRoom: "session:s_1:gm" },
    );
    expect(mockTo).toHaveBeenCalledWith("session:s_1");
    expect(mockEmit).toHaveBeenCalledWith(
      "dice:result",
      expect.objectContaining({ visibility: "public" }),
    );
  });

  it("rolagem secreta vai só pra sala do GM", () => {
    emitDiceResult(
      { ...basePayload, visibility: "secret" },
      { gmRoom: "session:s_1:gm" },
    );
    expect(mockTo).toHaveBeenCalledWith("session:s_1:gm");
    expect(mockTo).not.toHaveBeenCalledWith("session:s_1");
    expect(mockEmit).toHaveBeenCalledWith(
      "dice:result",
      expect.objectContaining({ visibility: "secret" }),
    );
  });
});

describe("socket-events — resiliência sem IO inicializado", () => {
  beforeEach(() => {
    (socketModule.getIO as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("Socket.IO not initialized");
    });
  });

  it("não derruba caller quando getIO joga erro", () => {
    expect(() =>
      emitSessionStatusChanged({
        sessionId: "s_1",
        status: "LIVE",
        by: "u_1",
        at: "2026-04-29T10:00:00Z",
      }),
    ).not.toThrow();
    expect(() =>
      emitDiceResult({
        sessionId: "s_1",
        rollId: "r_1",
        rolledBy: "u_1",
        formula: "1d20",
        rolls: [10],
        modifier: 0,
        total: 10,
        visibility: "public",
        isNat20: false,
        isNat1: false,
        at: "2026-04-29T10:00:00Z",
      }),
    ).not.toThrow();
  });
});
