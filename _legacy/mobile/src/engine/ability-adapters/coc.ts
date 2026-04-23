import type { FullCharacter } from "../../lib/character-types";
import type { GameAbility, AbilityDiceFormula } from "../../types/ability";

// ─── CoC Skill Check Extraction ───────────────────────────

function extractSkillChecks(char: FullCharacter): GameAbility[] {
  return char.skills.map((skill) => {
    const rolls: AbilityDiceFormula[] = [
      { formula: "1d100", label: `${skill.name} (${skill.modifier}%)` },
    ];

    return {
      id: `skill-${skill.name.toLowerCase().replace(/\s/g, "-")}`,
      sourceId: skill.name,
      name: skill.name,
      category: "skill_check" as const,
      iconKey: "search",
      description: `Teste de ${skill.name}: sucesso se <= ${skill.modifier}`,
      actionCost: "action" as const,
      resourceCosts: [],
      rolls,
      autoEffects: [],
      range: "Variável",
      targetType: "none" as const,
      tags: ["skill", skill.ability],
      available: true,
      system: "coc" as const,
      source: skill.name,
    };
  });
}

// ─── CoC Weapon Extraction ────────────────────────────────

function extractWeapons(char: FullCharacter): GameAbility[] {
  const weapons = char.inventory.filter(
    (i) => i.equipped && i.category === "weapon",
  );

  return weapons.map((weapon) => {
    const rolls: AbilityDiceFormula[] = [];

    // CoC weapons use skill-based attack (typically 1d100 vs skill value)
    rolls.push({ formula: "1d100", label: "Ataque" });

    if (weapon.damage) {
      rolls.push({
        formula: weapon.damage,
        label: "Dano",
      });
    }

    const isRanged =
      weapon.properties?.some(
        (p) =>
          p.toLowerCase().includes("ranged") ||
          p.toLowerCase().includes("alcance") ||
          p.toLowerCase().includes("firearm"),
      ) ?? false;

    return {
      id: `weapon-${weapon.id}`,
      sourceId: weapon.id,
      name: weapon.name,
      category: "weapon" as const,
      iconKey: isRanged ? "bow" : "sword",
      description: weapon.description,
      actionCost: "action" as const,
      resourceCosts: [],
      rolls,
      autoEffects: [],
      range: isRanged ? "Alcance" : "Corpo a corpo",
      targetType: "single" as const,
      tags: [isRanged ? "ranged" : "melee"],
      available: true,
      system: "coc" as const,
      source: weapon.name,
    };
  });
}

// ─── CoC Item Extraction ──────────────────────────────────

function extractItems(char: FullCharacter): GameAbility[] {
  const consumables = char.inventory.filter(
    (i) => i.category === "consumable" && i.quantity > 0,
  );

  return consumables.map((item) => ({
    id: `item-${item.id}`,
    sourceId: item.id,
    name: item.name,
    category: "item" as const,
    iconKey: "scroll",
    description: item.description,
    actionCost: "action" as const,
    resourceCosts: [{ type: "item_charge" as const, amount: 1, resourceId: item.id }],
    rolls: [],
    autoEffects: [],
    range: "Toque",
    targetType: "self" as const,
    tags: ["consumable"],
    available: item.quantity > 0,
    system: "coc" as const,
    source: item.name,
  }));
}

// ─── Main Builder ─────────────────────────────────────────

export function buildCocAbilities(char: FullCharacter): GameAbility[] {
  const weapons = extractWeapons(char);
  const skills = extractSkillChecks(char);
  const items = extractItems(char);

  return [...weapons, ...skills, ...items];
}
