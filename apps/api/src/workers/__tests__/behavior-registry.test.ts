// Testes do BehaviorRegistry — tick loop, lifecycle, FLEE.
//
// Mock do socket-events: cada emit adiciona em arrays globais
// pra inspeção. Vitest fake timers controlam o tempo.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { tickEvents, escapedEvents, trappedEvents } = vi.hoisted(() => ({
  tickEvents: [] as Array<unknown>,
  escapedEvents: [] as Array<unknown>,
  trappedEvents: [] as Array<unknown>,
}));

vi.mock("../../lib/socket-events.js", () => ({
  emitBehaviorTick: (p: unknown) => tickEvents.push(p),
  emitNpcEscaped: (p: unknown) => escapedEvents.push(p),
  emitNpcTrapped: (p: unknown) => trappedEvents.push(p),
  emitBehaviorStarted: vi.fn(),
  emitBehaviorEnded: vi.fn(),
  emitDoorNpcOpened: vi.fn(),
  emitDoorNpcBroken: vi.fn(),
}));

import { behaviorRegistry } from "../behavior-registry.js";

describe("BehaviorRegistry — lifecycle", () => {
  beforeEach(() => {
    tickEvents.length = 0;
    escapedEvents.length = 0;
    trappedEvents.length = 0;
    vi.useFakeTimers();
  });

  afterEach(() => {
    behaviorRegistry.shutdown();
    vi.useRealTimers();
  });

  it("register inicia tick loop e emite eventos", () => {
    behaviorRegistry.register({
      id: "b1",
      sessionId: "s1",
      type: "IDLE",
      tokenIds: ["t1", "t2"],
      params: { tickIntervalMs: 100 },
    });
    vi.advanceTimersByTime(250);
    expect(tickEvents.length).toBeGreaterThanOrEqual(2);
    const first = tickEvents[0] as { positions: unknown[] };
    expect(first.positions).toHaveLength(2);
  });

  it("pause interrompe ticks; resume retoma", () => {
    behaviorRegistry.register({
      id: "b2",
      sessionId: "s1",
      type: "IDLE",
      tokenIds: ["t1"],
      params: { tickIntervalMs: 100 },
    });
    vi.advanceTimersByTime(150); // 1 tick
    const before = tickEvents.length;

    behaviorRegistry.pause("b2");
    vi.advanceTimersByTime(500);
    expect(tickEvents.length).toBe(before); // sem novos ticks

    behaviorRegistry.resume("b2");
    vi.advanceTimersByTime(150);
    expect(tickEvents.length).toBeGreaterThan(before);
  });

  it("unregister para o tick e limpa state", () => {
    behaviorRegistry.register({
      id: "b3",
      sessionId: "s1",
      type: "IDLE",
      tokenIds: ["t1"],
      params: { tickIntervalMs: 100 },
    });
    vi.advanceTimersByTime(150);
    behaviorRegistry.unregister("b3");
    const before = tickEvents.length;
    vi.advanceTimersByTime(500);
    expect(tickEvents.length).toBe(before);
    expect(behaviorRegistry.snapshot("b3")).toBeNull();
  });

  it("re-register é idempotente — atualiza params", () => {
    behaviorRegistry.register({
      id: "b4",
      sessionId: "s1",
      type: "IDLE",
      tokenIds: ["t1"],
      params: { tickIntervalMs: 100 },
    });
    behaviorRegistry.register({
      id: "b4",
      sessionId: "s1",
      type: "IDLE",
      tokenIds: ["t1", "t2"],
      params: { tickIntervalMs: 100, alertRadius: 7 },
    });
    const snap = behaviorRegistry.snapshot("b4");
    expect(snap).not.toBeNull();
  });
});

describe("BehaviorRegistry — FLEE escape", () => {
  beforeEach(() => {
    tickEvents.length = 0;
    escapedEvents.length = 0;
    trappedEvents.length = 0;
    vi.useFakeTimers();
  });

  afterEach(() => {
    behaviorRegistry.shutdown();
    vi.useRealTimers();
  });

  it("token afastando-se do fleeTarget eventualmente escapa", () => {
    behaviorRegistry.register({
      id: "b_flee",
      sessionId: "s1",
      type: "FLEE",
      tokenIds: ["runner"],
      // Token nasce em (0,0) (seedPositions com i=0). fleeTarget
      // logo atrás → stepAway move pra direção oposta (positiva)
      // 1 célula por tick em x e y. Manhattan cresce ~2 por tick.
      params: { tickIntervalMs: 50, fleeTarget: { x: -1, y: -1 } },
    });
    // 100 ticks × 5000ms / 50 = 100 advances. Manhattan ~ 200.
    // Escape exige > 30 ticks E manhattan >= 50 — passa.
    vi.advanceTimersByTime(5000);
    expect(escapedEvents.length).toBeGreaterThan(0);
    const ev = escapedEvents[0] as { tokenId: string; behaviorId: string };
    expect(ev.tokenId).toBe("runner");
    expect(ev.behaviorId).toBe("b_flee");
  });
});
