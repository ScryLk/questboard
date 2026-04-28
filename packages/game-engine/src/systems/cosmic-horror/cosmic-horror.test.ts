import { describe, expect, it } from "vitest";
import {
  calculateBuild,
  calculateDamageBonus,
  calculateDodgeBase,
  calculateHitPoints,
  calculateMagicPoints,
  calculateMaxSanity,
  calculateMoveRate,
} from "./derived";
import {
  evaluateSkillCheck,
  resolveOpposed,
  rollWithBonusDie,
  rollWithPenaltyDie,
} from "./skill-check";
import {
  applySanityLoss,
  effectiveMaxSanity,
  gainMythosKnowledge,
  parseSanityLossNotation,
  restoreSanity,
  type SanityState,
} from "./sanity";

describe("derived", () => {
  it("damage bonus brackets canônicos", () => {
    expect(calculateDamageBonus({ for: 30, tam: 30 })).toBe("-2"); // 60
    expect(calculateDamageBonus({ for: 40, tam: 40 })).toBe("-1"); // 80
    expect(calculateDamageBonus({ for: 50, tam: 60 })).toBe("+0"); // 110
    expect(calculateDamageBonus({ for: 70, tam: 80 })).toBe("+1d4"); // 150
    expect(calculateDamageBonus({ for: 90, tam: 90 })).toBe("+1d6"); // 180
    expect(calculateDamageBonus({ for: 130, tam: 130 })).toBe("+2d6"); // 260
  });

  it("build acompanha damage bonus", () => {
    expect(calculateBuild({ for: 30, tam: 30 })).toBe(-2);
    expect(calculateBuild({ for: 50, tam: 60 })).toBe(0);
    expect(calculateBuild({ for: 70, tam: 80 })).toBe(1);
    expect(calculateBuild({ for: 130, tam: 130 })).toBe(3);
  });

  it("hit points = (CON+TAM)/10 truncado", () => {
    expect(calculateHitPoints({ con: 60, tam: 50 })).toBe(11);
    expect(calculateHitPoints({ con: 50, tam: 50 })).toBe(10);
    expect(calculateHitPoints({ con: 99, tam: 99 })).toBe(19);
  });

  it("magic points = POD/5 truncado", () => {
    expect(calculateMagicPoints(50)).toBe(10);
    expect(calculateMagicPoints(54)).toBe(10);
    expect(calculateMagicPoints(99)).toBe(19);
  });

  it("max sanity reduz pelo mythos knowledge", () => {
    expect(calculateMaxSanity(70, 0)).toBe(70);
    expect(calculateMaxSanity(70, 5)).toBe(65);
    expect(calculateMaxSanity(70, 100)).toBe(0);
  });

  it("move rate por idade e atributos", () => {
    // Jovem com FOR/DES altos > TAM
    expect(
      calculateMoveRate({
        attrs: { for: 70, des: 70, tam: 50, con: 50, apa: 50, int: 50, pod: 50, edu: 50 },
        age: 25,
      }),
    ).toBe(9);
    // Velho — penalidade por idade
    expect(
      calculateMoveRate({
        attrs: { for: 70, des: 70, tam: 50, con: 50, apa: 50, int: 50, pod: 50, edu: 50 },
        age: 65,
      }),
    ).toBe(6); // 9 - 3
    // Atributos baixos < TAM
    expect(
      calculateMoveRate({
        attrs: { for: 30, des: 30, tam: 80, con: 50, apa: 50, int: 50, pod: 50, edu: 50 },
        age: 25,
      }),
    ).toBe(7);
  });

  it("dodge = DES/2", () => {
    expect(calculateDodgeBase(60)).toBe(30);
    expect(calculateDodgeBase(75)).toBe(37);
  });
});

describe("skill check", () => {
  it("falha quando rola acima da skill", () => {
    expect(evaluateSkillCheck(60, 50)).toBe("FAILURE");
  });
  it("regular success quando ≤ skill mas > skill/2", () => {
    expect(evaluateSkillCheck(40, 50)).toBe("REGULAR_SUCCESS");
  });
  it("hard success quando ≤ skill/2", () => {
    expect(evaluateSkillCheck(25, 50)).toBe("HARD_SUCCESS");
  });
  it("extreme success quando ≤ skill/5", () => {
    expect(evaluateSkillCheck(10, 50)).toBe("EXTREME_SUCCESS");
  });
  it("fumble quando skill < 50 e roll 96-100", () => {
    expect(evaluateSkillCheck(96, 30)).toBe("FUMBLE");
    expect(evaluateSkillCheck(100, 30)).toBe("FUMBLE");
    expect(evaluateSkillCheck(95, 30)).toBe("FAILURE");
  });
  it("fumble apenas em 100 quando skill ≥ 50", () => {
    expect(evaluateSkillCheck(100, 60)).toBe("FUMBLE");
    expect(evaluateSkillCheck(96, 60)).toBe("FAILURE");
  });

  it("opposed: nível mais alto vence", () => {
    // A=hard, B=regular → A vence
    expect(resolveOpposed(25, 60, 40, 60)).toBe("A_WINS");
  });
  it("opposed: empate vai pra maior skill", () => {
    // ambos regular, B tem skill maior → B vence
    expect(resolveOpposed(30, 50, 40, 70)).toBe("B_WINS");
  });
  it("opposed: empate total = TIE", () => {
    expect(resolveOpposed(30, 50, 30, 50)).toBe("TIE");
  });

  it("bonus die pega menor das dezenas", () => {
    // d100=73 (tens 70, units 3); bonus=40 → menor = 40 → 43
    expect(rollWithBonusDie(73, 40)).toBe(43);
    // d100=12 (tens 10, units 2); bonus=70 → menor = 10 → 12
    expect(rollWithBonusDie(12, 70)).toBe(12);
  });
  it("penalty die pega maior das dezenas", () => {
    expect(rollWithPenaltyDie(13, 60)).toBe(63);
    expect(rollWithPenaltyDie(85, 30)).toBe(85);
  });
});

describe("sanity", () => {
  function freshSanity(startingMax: number, mythos = 0): SanityState {
    return {
      current: startingMax - mythos,
      max: startingMax - mythos,
      startingMax,
      mythosKnowledge: mythos,
      madness: "SANE",
    };
  }

  it("effectiveMaxSanity respeita teto 99 - mythos e startingMax", () => {
    expect(effectiveMaxSanity(70, 0)).toBe(70);
    expect(effectiveMaxSanity(70, 30)).toBe(69); // min(70, 99-30=69)
    expect(effectiveMaxSanity(70, 50)).toBe(49); // min(70, 49)
  });

  it("applySanityLoss perda pequena → SANE permanece", () => {
    const r = applySanityLoss(freshSanity(70), 2);
    expect(r.lost).toBe(2);
    expect(r.nextCurrent).toBe(68);
    expect(r.nextMadness).toBe("SANE");
    expect(r.triggers.bout).toBe(false);
  });

  it("applySanityLoss perda ≥5 numa cena → bouts of madness", () => {
    const r = applySanityLoss(freshSanity(70), 6);
    expect(r.triggers.bout).toBe(true);
    expect(r.nextMadness).toBe("TEMPORARY");
  });

  it("applySanityLoss soma ≥1/5 da max em 24h → indefinite", () => {
    // startingMax 70 → 1/5 = 14. Já perdeu 10, perde mais 5 = 15.
    const r = applySanityLoss(freshSanity(70), 5, { lossLast24h: 10 });
    expect(r.triggers.indefinite).toBe(true);
    expect(r.nextMadness).toBe("INDEFINITE");
  });

  it("applySanityLoss SAN chega a 0 → permanent", () => {
    const r = applySanityLoss(
      { ...freshSanity(70), current: 3 },
      5,
    );
    expect(r.nextCurrent).toBe(0);
    expect(r.triggers.permanent).toBe(true);
    expect(r.nextMadness).toBe("PERMANENT");
  });

  it("gainMythosKnowledge derruba teto e clampa atual", () => {
    const initial: SanityState = {
      current: 70,
      max: 70,
      startingMax: 70,
      mythosKnowledge: 0,
      madness: "SANE",
    };
    const after = gainMythosKnowledge(initial, 10);
    expect(after.mythosKnowledge).toBe(10);
    expect(after.max).toBe(60);
    expect(after.current).toBe(60); // clamp
  });

  it("restoreSanity nunca passa do max e tira de PERMANENT quando >0", () => {
    const broken: SanityState = {
      current: 0,
      max: 70,
      startingMax: 70,
      mythosKnowledge: 0,
      madness: "PERMANENT",
    };
    const after = restoreSanity(broken, 5);
    expect(after.current).toBe(5);
    expect(after.madness).toBe("INDEFINITE");
    // cap pelo max
    expect(restoreSanity({ ...broken, current: 65 }, 100).current).toBe(70);
  });

  it("parseSanityLossNotation extrai notação 1/1d6", () => {
    expect(parseSanityLossNotation("1/1d6")).toEqual({
      onSuccess: "1",
      onFailure: "1d6",
    });
    expect(parseSanityLossNotation("0/1d4+1")).toEqual({
      onSuccess: "0",
      onFailure: "1d4+1",
    });
    expect(parseSanityLossNotation("invalido")).toBeNull();
  });
});
