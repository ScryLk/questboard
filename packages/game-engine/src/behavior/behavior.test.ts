// Testes do engine de behavior (puro). Cobertura:
//  - buildEffectiveWallSet: paredes sempre bloqueiam; portas
//    dependem de state e behaviorType.
//  - findDoorsOnPath: detecta portas no trajeto.
//  - stepToward / stepAway / centroid / manhattan / euclid.

import { describe, expect, it } from "vitest";
import {
  buildEffectiveWallSet,
  centroid,
  euclid,
  findDoorsOnPath,
  manhattan,
  stepAway,
  stepToward,
  type Door,
  type Wall,
} from "./index";

describe("buildEffectiveWallSet", () => {
  const walls: Wall[] = [
    { cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }] },
  ];
  const closedDoor: Door = { id: "d1", x: 5, y: 5, state: "CLOSED" };
  const openDoor: Door = { id: "d2", x: 6, y: 5, state: "OPEN" };
  const lockedDoor: Door = { id: "d3", x: 7, y: 5, state: "LOCKED" };
  const magicalLocked: Door = {
    id: "dm",
    x: 8,
    y: 5,
    state: "LOCKED",
    isMagical: true,
  };
  const destroyed: Door = { id: "dd", x: 9, y: 5, state: "DESTROYED" };

  it("paredes sempre bloqueiam (qualquer behavior)", () => {
    const set = buildEffectiveWallSet({
      walls,
      doors: [],
      behaviorType: "PATROL",
    });
    expect(set.has("0,0")).toBe(true);
    expect(set.has("0,1")).toBe(true);
  });

  it("OPEN nunca bloqueia", () => {
    const set = buildEffectiveWallSet({
      walls: [],
      doors: [openDoor],
      behaviorType: "GUARD",
    });
    expect(set.has("6,5")).toBe(false);
  });

  it("DESTROYED nunca bloqueia", () => {
    const set = buildEffectiveWallSet({
      walls: [],
      doors: [destroyed],
      behaviorType: "GUARD",
    });
    expect(set.has("9,5")).toBe(false);
  });

  it("CLOSED bloqueia em behaviors normais", () => {
    const set = buildEffectiveWallSet({
      walls: [],
      doors: [closedDoor],
      behaviorType: "PATROL",
    });
    expect(set.has("5,5")).toBe(true);
  });

  it("PANIC passa por CLOSED como se fosse aberta", () => {
    const set = buildEffectiveWallSet({
      walls: [],
      doors: [closedDoor, lockedDoor],
      behaviorType: "PANIC",
    });
    expect(set.has("5,5")).toBe(false);
    expect(set.has("7,5")).toBe(false);
  });

  it("RIOT arromba portas não-mágicas mas respeita as mágicas", () => {
    const set = buildEffectiveWallSet({
      walls: [],
      doors: [closedDoor, lockedDoor, magicalLocked],
      behaviorType: "RIOT",
    });
    expect(set.has("5,5")).toBe(false); // arrombada
    expect(set.has("7,5")).toBe(false); // arrombada
    expect(set.has("8,5")).toBe(true); // mágica permanece bloqueada
  });
});

describe("findDoorsOnPath", () => {
  it("retorna portas presentes nas células do path", () => {
    const doors: Door[] = [
      { id: "d1", x: 1, y: 1, state: "CLOSED" },
      { id: "d2", x: 5, y: 5, state: "CLOSED" },
    ];
    const path = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    const found = findDoorsOnPath(path, doors);
    expect(found).toHaveLength(1);
    expect(found[0]!.id).toBe("d1");
  });

  it("retorna vazio quando path não cruza porta nenhuma", () => {
    const found = findDoorsOnPath(
      [{ x: 0, y: 0 }],
      [{ id: "d1", x: 9, y: 9, state: "CLOSED" }],
    );
    expect(found).toHaveLength(0);
  });

  it("retorna vazio com inputs vazios", () => {
    expect(findDoorsOnPath([], [])).toEqual([]);
  });
});

describe("steering", () => {
  it("stepToward avança 1 célula em direção ao alvo", () => {
    expect(stepToward({ position: { x: 0, y: 0 }, target: { x: 5, y: 0 } }))
      .toEqual({ x: 1, y: 0 });
    expect(stepToward({ position: { x: 0, y: 0 }, target: { x: 5, y: 5 } }))
      .toEqual({ x: 1, y: 1 });
  });

  it("stepToward retorna posição atual quando já no alvo", () => {
    expect(stepToward({ position: { x: 3, y: 3 }, target: { x: 3, y: 3 } }))
      .toEqual({ x: 3, y: 3 });
  });

  it("stepToward respeita speed", () => {
    expect(
      stepToward({ position: { x: 0, y: 0 }, target: { x: 10, y: 0 }, speed: 3 }),
    ).toEqual({ x: 3, y: 0 });
  });

  it("stepAway afasta da fonte de ameaça", () => {
    expect(stepAway({ position: { x: 5, y: 5 }, target: { x: 5, y: 0 } }))
      .toEqual({ x: 5, y: 6 });
  });

  it("centroid de pontos retorna média", () => {
    expect(centroid([{ x: 0, y: 0 }, { x: 4, y: 4 }])).toEqual({ x: 2, y: 2 });
  });

  it("centroid vazio retorna 0,0", () => {
    expect(centroid([])).toEqual({ x: 0, y: 0 });
  });

  it("manhattan calcula distância em grid", () => {
    expect(manhattan({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7);
  });

  it("euclid calcula distância contínua", () => {
    expect(euclid({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});
