import type { GameToken, TokenAlignment } from "./gameplay-mock-data";
import { TOKEN_TO_CHARACTER_MAP, MOCK_FULL_CHARACTERS } from "./character-mock-data";
import { rollD20, parseDiceFormula } from "./dice";

// ── Types ──

export interface PendingReaction {
  id: string;
  trigger: "opportunity-attack";
  reactorTokenId: string;
  triggerTokenId: string;
  triggerDescription: string;
  weaponOptions: OAWeaponOption[];
  timeoutMs: number;
  createdAt: number;
}

export interface OAWeaponOption {
  weaponId: string;
  weaponName: string;
  attackBonus: number;
  damage: string;
}

export interface OAResult {
  attackRoll: number;
  attackDetails: string;
  isHit: boolean;
  isCrit: boolean;
  isFumble: boolean;
  damageTotal: number;
  damageDetails: string;
  damageType: string;
}

// ── Helpers ──

export function areHostile(a: TokenAlignment, b: TokenAlignment): boolean {
  const aIsPlayer = a === "player" || a === "ally";
  const bIsPlayer = b === "player" || b === "ally";
  const aIsHostile = a === "hostile";
  const bIsHostile = b === "hostile";
  return (aIsPlayer && bIsHostile) || (aIsHostile && bIsPlayer);
}

export function isWithinReach(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  reachFt: number = 5,
  cellSizeFt: number = 5,
): boolean {
  const reachCells = reachFt / cellSizeFt;
  const dist = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  return dist <= reachCells;
}

// ── Melee Weapons ──

export function getMeleeWeaponsForToken(tokenId: string): OAWeaponOption[] {
  const characterId = TOKEN_TO_CHARACTER_MAP[tokenId];
  if (!characterId) return [];

  const character = MOCK_FULL_CHARACTERS[characterId];
  if (!character) return [];

  const weapons: OAWeaponOption[] = [];

  for (const item of character.inventory) {
    if (item.category !== "weapon" || !item.equipped) continue;
    // Skip ranged-only weapons (they have Munição/Ammunition but NOT melee properties)
    const isRangedOnly = item.properties?.some(
      (p) =>
        (p.toLowerCase().includes("munição") || p.toLowerCase().includes("ammunition")) &&
        p.toLowerCase().includes("duas mãos"),
    );
    if (isRangedOnly) continue;

    weapons.push({
      weaponId: item.id,
      weaponName: item.name,
      attackBonus: item.attackBonus ?? 0,
      damage: item.damage ?? "1d4",
    });
  }

  // Fallback: unarmed strike
  if (weapons.length === 0) {
    const strMod = character.abilities.str.modifier;
    weapons.push({
      weaponId: "unarmed",
      weaponName: "Ataque Desarmado",
      attackBonus: strMod + character.proficiencyBonus,
      damage: `1+${strMod} concussão`,
    });
  }

  return weapons;
}

// ── Detection ──

export function detectOpportunityAttacks(
  movedTokenId: string,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  allTokens: GameToken[],
  reactionUsedMap: Record<string, boolean>,
  isDisengaging: boolean,
  cellSizeFt: number,
): PendingReaction[] {
  if (isDisengaging) return [];

  const movedToken = allTokens.find((t) => t.id === movedTokenId);
  if (!movedToken) return [];

  const reactions: PendingReaction[] = [];
  const reachFt = 5; // Standard melee reach

  for (const reactor of allTokens) {
    if (reactor.id === movedTokenId) continue;
    if (!reactor.onMap || reactor.hp <= 0) continue;
    if (!areHostile(reactor.alignment, movedToken.alignment)) continue;
    if (reactionUsedMap[reactor.id]) continue;

    const wasInReach = isWithinReach(reactor.x, reactor.y, fromX, fromY, reachFt, cellSizeFt);
    const stillInReach = isWithinReach(reactor.x, reactor.y, toX, toY, reachFt, cellSizeFt);

    if (wasInReach && !stillInReach) {
      const weaponOptions = getMeleeWeaponsForToken(reactor.id);
      if (weaponOptions.length === 0) continue;

      reactions.push({
        id: `oa_${reactor.id}_${Date.now()}`,
        trigger: "opportunity-attack",
        reactorTokenId: reactor.id,
        triggerTokenId: movedTokenId,
        triggerDescription: `${movedToken.name} saiu do alcance de ${reactor.name}!`,
        weaponOptions,
        timeoutMs: 5000,
        createdAt: Date.now(),
      });
    }
  }

  return reactions;
}

// ── Preview (for drag overlay) ──

export function getOAThreateningTokens(
  draggedTokenId: string,
  originX: number,
  originY: number,
  destX: number,
  destY: number,
  allTokens: GameToken[],
  reactionUsedMap: Record<string, boolean>,
  isDisengaging: boolean,
  cellSizeFt: number,
): string[] {
  if (isDisengaging) return [];

  const draggedToken = allTokens.find((t) => t.id === draggedTokenId);
  if (!draggedToken) return [];

  const reachFt = 5;
  const threatening: string[] = [];

  for (const reactor of allTokens) {
    if (reactor.id === draggedTokenId) continue;
    if (!reactor.onMap || reactor.hp <= 0) continue;
    if (!areHostile(reactor.alignment, draggedToken.alignment)) continue;
    if (reactionUsedMap[reactor.id]) continue;

    const inReachAtOrigin = isWithinReach(reactor.x, reactor.y, originX, originY, reachFt, cellSizeFt);
    const inReachAtDest = isWithinReach(reactor.x, reactor.y, destX, destY, reachFt, cellSizeFt);

    if (inReachAtOrigin && !inReachAtDest) {
      threatening.push(reactor.id);
    }
  }

  return threatening;
}

// ── Execution ──

export function executeOpportunityAttack(
  attackerTokenId: string,
  targetTokenId: string,
  weapon: OAWeaponOption,
  targetAC: number,
): OAResult {
  const attackResult = rollD20(weapon.attackBonus);
  const isCrit = attackResult.isNat20 ?? false;
  const isFumble = attackResult.isNat1 ?? false;
  const isHit = isCrit || (!isFumble && attackResult.total >= targetAC);

  let damageTotal = 0;
  let damageDetails = "";

  const damageParts = weapon.damage.split(" ");
  const damageFormula = damageParts[0]; // "1d6+3" or "1+2"
  const damageType = damageParts.slice(1).join(" ") || "";

  if (isHit) {
    // Check if it's a dice formula or flat damage
    if (damageFormula.includes("d")) {
      if (isCrit) {
        const match = damageFormula.match(/^(\d+)d(\d+)([+-]\d+)?$/);
        if (match) {
          const count = parseInt(match[1], 10);
          const sides = parseInt(match[2], 10);
          const mod = match[3] ? parseInt(match[3], 10) : 0;
          const critDmg = parseDiceFormula(`${count * 2}d${sides}+${mod}`);
          damageTotal = critDmg.total;
          damageDetails = critDmg.details;
        } else {
          const dmg = parseDiceFormula(damageFormula);
          damageTotal = dmg.total;
          damageDetails = dmg.details;
        }
      } else {
        const dmg = parseDiceFormula(damageFormula);
        damageTotal = dmg.total;
        damageDetails = dmg.details;
      }
    } else {
      // Flat damage like "1+2"
      const parts = damageFormula.split("+").map(Number);
      damageTotal = parts.reduce((a, b) => a + b, 0);
      damageDetails = damageFormula;
    }
  }

  const attackDetails = `d20[${attackResult.rolls[0]}]${weapon.attackBonus >= 0 ? "+" : ""}${weapon.attackBonus}`;

  return {
    attackRoll: attackResult.total,
    attackDetails,
    isHit,
    isCrit,
    isFumble,
    damageTotal,
    damageDetails,
    damageType,
  };
}
