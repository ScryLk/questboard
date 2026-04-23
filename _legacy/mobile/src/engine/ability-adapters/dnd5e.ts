import type { FullCharacter } from "../../lib/character-types";
import type {
  CharacterSpell,
  InventoryItem,
  CharacterFeature,
  SpellSlot,
} from "../../lib/character-types";
import type {
  GameAbility,
  ActionCostType,
  AbilityDiceFormula,
  ResourceCost,
  AutoEffect,
  TargetType,
} from "../../types/ability";

// ─── Helpers ──────────────────────────────────────────────

function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

function formatBonus(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

function hasProperty(item: InventoryItem, prop: string): boolean {
  return item.properties?.some((p) => p.toLowerCase().includes(prop)) ?? false;
}

function getAvailableSlot(
  slots: SpellSlot[],
  minLevel: number,
): SpellSlot | null {
  return (
    slots.find((s) => s.level >= minLevel && s.used < s.total) ?? null
  );
}

function mapCastingTimeToAction(castingTime: string): ActionCostType {
  const ct = castingTime.toLowerCase();
  if (ct.includes("bonus")) return "bonus_action";
  if (ct.includes("reaction") || ct.includes("reação")) return "reaction";
  if (ct.includes("action") || ct.includes("ação") || ct === "1 action" || ct === "1 ação")
    return "action";
  return "action";
}

function inferTargetType(spell: CharacterSpell): TargetType {
  const range = spell.range.toLowerCase();
  const desc = spell.description.toLowerCase();
  if (range === "self" || range === "pessoal") return "self";
  if (desc.includes("area") || desc.includes("cone") || desc.includes("esfera") || desc.includes("cubo"))
    return "area";
  if (desc.includes("criaturas") || desc.includes("alvos")) return "multi";
  return "single";
}

function inferWeaponIcon(item: InventoryItem): string {
  const name = item.name.toLowerCase();
  if (name.includes("arco") || name.includes("bow")) return "bow";
  if (name.includes("adaga") || name.includes("dagger")) return "dagger";
  if (name.includes("machado") || name.includes("axe")) return "axe";
  if (name.includes("martelo") || name.includes("hammer") || name.includes("maul")) return "hammer";
  if (name.includes("lança") || name.includes("spear") || name.includes("javelin")) return "spear";
  if (name.includes("bastão") || name.includes("staff") || name.includes("quarterstaff")) return "staff";
  return "sword";
}

function inferSpellIcon(spell: CharacterSpell): string {
  const school = spell.school.toLowerCase();
  const desc = spell.description.toLowerCase();
  if (desc.includes("fogo") || desc.includes("fire") || desc.includes("chama")) return "fire";
  if (desc.includes("gelo") || desc.includes("cold") || desc.includes("frio")) return "snowflake";
  if (desc.includes("relâmpago") || desc.includes("lightning") || desc.includes("trovão")) return "lightning";
  if (desc.includes("cura") || desc.includes("heal") || desc.includes("restaur")) return "heart";
  if (school.includes("necromancy") || school.includes("necromancia")) return "skull";
  if (school.includes("illusion") || school.includes("ilusão")) return "eye";
  if (school.includes("abjuration") || school.includes("abjuração")) return "shield";
  if (school.includes("divination") || school.includes("adivinhação")) return "eye";
  return "wand";
}

// ─── Weapon Extraction ────────────────────────────────────

function extractWeapons(char: FullCharacter): GameAbility[] {
  const weapons = char.inventory.filter(
    (i) => i.equipped && i.category === "weapon",
  );

  return weapons.map((weapon) => {
    const isFinesse = hasProperty(weapon, "finesse");
    const isRanged =
      hasProperty(weapon, "ranged") ||
      hasProperty(weapon, "alcance") ||
      hasProperty(weapon, "ammunition");

    // Use DEX for ranged/finesse (if DEX > STR), STR otherwise
    const strMod = char.abilities.str.modifier;
    const dexMod = char.abilities.dex.modifier;
    let attackMod: number;
    if (isRanged) {
      attackMod = dexMod;
    } else if (isFinesse) {
      attackMod = Math.max(strMod, dexMod);
    } else {
      attackMod = strMod;
    }

    const totalAttack = attackMod + char.proficiencyBonus + (weapon.attackBonus ?? 0);

    const rolls: AbilityDiceFormula[] = [
      { formula: `1d20${formatBonus(totalAttack)}`, label: "Ataque" },
    ];

    if (weapon.damage) {
      const damageMod = (isRanged ? dexMod : isFinesse ? Math.max(strMod, dexMod) : strMod) + (weapon.attackBonus ?? 0);
      rolls.push({
        formula: `${weapon.damage}${damageMod !== 0 ? formatBonus(damageMod) : ""}`,
        label: "Dano",
        damageType: isRanged ? "piercing" : "slashing",
      });
    }

    const tags: string[] = [];
    if (isRanged) tags.push("ranged");
    else tags.push("melee");
    if (isFinesse) tags.push("finesse");
    if (hasProperty(weapon, "versatile") || hasProperty(weapon, "versátil")) tags.push("versatile");
    if (hasProperty(weapon, "two-handed") || hasProperty(weapon, "duas mãos")) tags.push("two-handed");
    if (hasProperty(weapon, "light") || hasProperty(weapon, "leve")) tags.push("light");

    return {
      id: `weapon-${weapon.id}`,
      sourceId: weapon.id,
      name: weapon.name,
      category: "weapon" as const,
      iconKey: inferWeaponIcon(weapon),
      description: weapon.description,
      actionCost: "action" as const,
      resourceCosts: [],
      rolls,
      autoEffects: [],
      range: isRanged ? "Alcance" : "Corpo a corpo",
      targetType: "single" as const,
      tags,
      available: true,
      system: "dnd5e" as const,
      source: weapon.name,
    };
  });
}

// ─── Spell Extraction ─────────────────────────────────────

function extractSpells(char: FullCharacter): GameAbility[] {
  const preparedSpells = char.spells.filter(
    (s) => s.prepared || s.level === 0,
  );

  return preparedSpells.map((spell) => {
    const isCantrip = spell.level === 0;
    const isConcentration =
      spell.duration.toLowerCase().includes("concentration") ||
      spell.duration.toLowerCase().includes("concentração");
    const isRitual =
      spell.description.toLowerCase().includes("ritual");

    // Check slot availability
    const slot = isCantrip ? null : getAvailableSlot(char.spellSlots, spell.level);
    const available = isCantrip || slot !== null;
    const unavailableReason = !available
      ? `Sem slots de nível ${spell.level}+`
      : undefined;

    // Resource cost
    const resourceCosts: ResourceCost[] = [];
    if (!isCantrip) {
      resourceCosts.push({
        type: "spell_slot",
        level: spell.level,
        amount: 1,
      });
    }

    // Rolls (use spellcasting info if available)
    const rolls: AbilityDiceFormula[] = [];
    const attackBonus = char.spellcasting?.attackBonus ?? 0;
    const desc = spell.description.toLowerCase();

    // Detect attack spells
    if (
      desc.includes("ataque") ||
      desc.includes("attack") ||
      desc.includes("spell attack")
    ) {
      rolls.push({
        formula: `1d20${formatBonus(attackBonus)}`,
        label: "Ataque Magico",
      });
    }

    // Try to extract damage dice from description (common patterns like "3d8", "2d6")
    const dmgMatch = spell.description.match(/(\d+d\d+)/);
    if (dmgMatch) {
      rolls.push({
        formula: dmgMatch[1],
        label: "Dano/Efeito",
      });
    }

    // Auto effects
    const autoEffects: AutoEffect[] = [];
    if (isConcentration) {
      autoEffects.push({
        type: "concentration",
        spellId: spell.id,
      });
    }

    const tags: string[] = [];
    if (isConcentration) tags.push("concentration");
    if (isRitual) tags.push("ritual");
    if (isCantrip) tags.push("cantrip");
    tags.push(spell.school.toLowerCase());

    // Upcastable: any non-cantrip spell below max slot level
    const maxSlotLevel = char.spellSlots.length > 0
      ? Math.max(...char.spellSlots.map((s) => s.level))
      : 0;
    const upcastable = !isCantrip && spell.level < maxSlotLevel;

    return {
      id: `spell-${spell.id}`,
      sourceId: spell.id,
      name: spell.name,
      category: "spell" as const,
      iconKey: inferSpellIcon(spell),
      description: spell.description,
      actionCost: mapCastingTimeToAction(spell.castingTime),
      resourceCosts,
      rolls,
      autoEffects,
      range: spell.range,
      targetType: inferTargetType(spell),
      tags,
      spellLevel: spell.level,
      upcastable,
      available,
      unavailableReason,
      system: "dnd5e" as const,
      source: spell.name,
    };
  });
}

// ─── Feature Extraction ───────────────────────────────────

function extractFeatures(char: FullCharacter): GameAbility[] {
  // Only features with limited uses are actionable
  const usableFeatures = char.features.filter((f) => f.uses !== null);

  return usableFeatures.map((feature) => {
    const available = feature.uses !== null && feature.uses.current > 0;
    const unavailableReason = !available
      ? `0/${feature.uses?.max ?? 0} usos restantes`
      : undefined;

    const resourceCosts: ResourceCost[] = [];
    if (feature.uses) {
      resourceCosts.push({
        type: "feature_use",
        amount: 1,
        resourceId: feature.id,
      });
    }

    return {
      id: `feature-${feature.id}`,
      sourceId: feature.id,
      name: feature.name,
      category: "feature" as const,
      iconKey: "sparkles",
      description: feature.description,
      actionCost: "action" as const,
      resourceCosts,
      rolls: [],
      autoEffects: [],
      range: "Variável",
      targetType: "none" as const,
      tags: [feature.source, feature.uses?.reset ?? "manual"],
      available,
      unavailableReason,
      system: "dnd5e" as const,
      source: feature.name,
    };
  });
}

// ─── Item Extraction ──────────────────────────────────────

function extractItems(char: FullCharacter): GameAbility[] {
  const consumables = char.inventory.filter(
    (i) => i.category === "consumable" && i.quantity > 0,
  );

  return consumables.map((item) => {
    // Try to detect healing potions
    const desc = item.description.toLowerCase();
    const isHealing =
      desc.includes("cura") || desc.includes("heal") || desc.includes("poção de cura");

    const rolls: AbilityDiceFormula[] = [];
    const autoEffects: AutoEffect[] = [];

    // Extract dice from description
    const dmgMatch = item.description.match(/(\d+d\d+(?:[+-]\d+)?)/);
    if (dmgMatch) {
      rolls.push({
        formula: dmgMatch[1],
        label: isHealing ? "Cura" : "Efeito",
        damageType: isHealing ? "healing" : undefined,
      });
      if (isHealing) {
        autoEffects.push({ type: "healing", value: dmgMatch[1] });
      }
    }

    return {
      id: `item-${item.id}`,
      sourceId: item.id,
      name: item.name,
      category: "item" as const,
      iconKey: isHealing ? "potion" : "scroll",
      description: item.description,
      actionCost: "action" as const,
      resourceCosts: [{ type: "item_charge" as const, amount: 1, resourceId: item.id }],
      rolls,
      autoEffects,
      range: "Toque",
      targetType: isHealing ? ("self" as const) : ("single" as const),
      tags: ["consumable"],
      available: item.quantity > 0,
      unavailableReason: item.quantity <= 0 ? "Sem estoque" : undefined,
      system: "dnd5e" as const,
      source: item.name,
    };
  });
}

// ─── Main Builder ─────────────────────────────────────────

export function buildDnd5eAbilities(char: FullCharacter): GameAbility[] {
  const weapons = extractWeapons(char);
  const spells = extractSpells(char);
  const features = extractFeatures(char);
  const items = extractItems(char);

  // Order: weapons first, then spells (cantrips, then by level), then features, then items
  const sortedSpells = [...spells].sort((a, b) => {
    const la = a.spellLevel ?? 0;
    const lb = b.spellLevel ?? 0;
    return la - lb;
  });

  return [...weapons, ...sortedSpells, ...features, ...items];
}
