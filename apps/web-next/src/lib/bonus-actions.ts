import type { FullCharacter, CharacterSpell, InventoryItem } from "./character-types";
import type { GameToken } from "./gameplay-mock-data";
import type { TurnActions } from "./gameplay-store";

// ── Types ──

export type BonusActionSource = "combat" | "class" | "spell" | "feat" | "race";

export interface BonusActionDef {
  id: string;
  name: string;
  icon: string;
  source: BonusActionSource;
  description: string;
  available: boolean;
  unavailableReason?: string;
  /** If this is a spell-based bonus action */
  spell?: CharacterSpell;
  /** If this is a weapon-based bonus action */
  weapon?: InventoryItem;
  /** Resource label like "Slots nv.2: 2/3" or "Ki: 3/4" */
  resourceLabel?: string;
  /** For quickened spell — opens spell selector */
  isQuickenedSpell?: boolean;
}

// ── Engine ──

/**
 * Determine all bonus actions available (and unavailable with reasons)
 * for the current character in the current turn state.
 */
export function getAvailableBonusActions(
  character: FullCharacter | undefined,
  turnActions: TurnActions,
): BonusActionDef[] {
  if (!character) return [];

  const actions: BonusActionDef[] = [];

  // 1. Offhand Attack (Two-Weapon Fighting / Dual Wield)
  checkOffhandAttack(character, turnActions, actions);

  // 2. Bonus Action Spells (prepared spells with castingTime "bônus")
  checkBonusSpells(character, actions);

  // 3. Quickened Spell (Sorcerer Metamagic)
  checkQuickenedSpell(character, actions);

  // 4. Class Features (extensible — add more as needed)
  // Future: Rage, Bardic Inspiration, Cunning Action, Second Wind, etc.
  // Each would be a function call here checking class/level/resources.

  return actions;
}

// ── Checks ──

function checkOffhandAttack(
  character: FullCharacter,
  turnActions: TurnActions,
  actions: BonusActionDef[],
) {
  // Find equipped light weapons
  const lightWeapons = character.inventory.filter(
    (item) =>
      item.category === "weapon" &&
      item.equipped &&
      item.properties?.some((p) => p.toLowerCase().includes("leve") || p.toLowerCase().includes("light")),
  );

  // Need at least 2 light weapons (or 1 with quantity >= 2)
  const hasDualWield =
    lightWeapons.length >= 2 ||
    lightWeapons.some((w) => w.quantity >= 2);

  if (!hasDualWield) return;

  // Pick the offhand weapon (second weapon, or same if quantity >= 2)
  const offhand = lightWeapons.length >= 2 ? lightWeapons[1] : lightWeapons[0];
  const damageFormula = offhand.damage?.split(" ")[0] ?? "1d4";
  const damageType = offhand.damage?.split(" ").slice(1).join(" ") ?? "";

  // Available only if attacked this turn
  const available = turnActions.attackedThisTurn;

  actions.push({
    id: "offhand-attack",
    name: "Ataque Mao Inabil",
    icon: "Sword",
    source: "combat",
    description: `${damageFormula} ${damageType} (sem modificador de dano)`,
    available,
    unavailableReason: available ? undefined : "Precisa atacar com mao habil primeiro (use Acao \u2192 Atacar)",
    weapon: offhand,
  });
}

function checkBonusSpells(
  character: FullCharacter,
  actions: BonusActionDef[],
) {
  const bonusSpells = character.spells.filter(
    (s) =>
      s.prepared &&
      (s.castingTime.toLowerCase().includes("bônus") ||
        s.castingTime.toLowerCase().includes("bonus")),
  );

  for (const spell of bonusSpells) {
    // Check if slot available (cantrips always available)
    let available = true;
    let resourceLabel: string | undefined;

    if (spell.level > 0) {
      const slot = character.spellSlots.find((s) => s.level === spell.level);
      if (!slot || slot.used >= slot.total) {
        available = false;
      }
      if (slot) {
        const remaining = slot.total - slot.used;
        const dots = Array.from({ length: slot.total }, (_, i) =>
          i < remaining ? "\u25CF" : "\u25CB",
        ).join("");
        resourceLabel = `Slots nv.${spell.level}: ${dots}`;
      }
    }

    actions.push({
      id: `bonus-spell-${spell.id}`,
      name: spell.name,
      icon: "Wand2",
      source: "spell",
      description: `Nv.${spell.level} \u00B7 ${spell.range} \u00B7 ${spell.duration}`,
      available,
      unavailableReason: available ? undefined : `Sem slots de nivel ${spell.level}`,
      spell,
      resourceLabel,
    });
  }
}

function checkQuickenedSpell(
  character: FullCharacter,
  actions: BonusActionDef[],
) {
  // Check if character has Metamagia feature that mentions "Acelerada" or "Quickened"
  const hasQuickened = character.features.some(
    (f) =>
      f.name.toLowerCase().includes("metamagia") ||
      f.name.toLowerCase().includes("metamagic"),
  );

  if (!hasQuickened) return;

  // Check sorcery points
  const sorceryFeature = character.features.find(
    (f) =>
      f.name.toLowerCase().includes("feitiçaria") ||
      f.name.toLowerCase().includes("feiticaria") ||
      f.name.toLowerCase().includes("sorcery"),
  );

  const sorceryPoints = sorceryFeature?.uses;
  if (!sorceryPoints) return;

  const available = sorceryPoints.current >= 2;
  const resourceLabel = `Pontos: ${sorceryPoints.current}/${sorceryPoints.max}`;

  actions.push({
    id: "quickened-spell",
    name: "Magia Acelerada",
    icon: "Zap",
    source: "class",
    description: "Conjurar uma magia de 1 acao como bonus (2 pontos)",
    available,
    unavailableReason: available ? undefined : "Precisa de 2+ pontos de feiticaria",
    resourceLabel,
    isQuickenedSpell: true,
  });
}
