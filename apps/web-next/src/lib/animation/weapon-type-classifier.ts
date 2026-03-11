import type { AnimationType } from "./combat-animation-types";

// ── Weapon Name → AnimationType ──
// Case-insensitive matching. Supports PT-BR and English weapon names.

const WEAPON_NAME_MAP: [RegExp, AnimationType][] = [
  // Swords
  [/espada|sword|rapier|rapieira|cimitarra|scimitar|glaive|gládio|montante|greatsword|longsword/i, "sword_slash"],
  // Axes
  [/machado|axe|alabarda|halberd/i, "axe_slam"],
  // Blunt
  [/maça|mace|martelo|hammer|warhammer|mornstar|morgenstern|clava|greatclub|bastão|quarterstaff|flail/i, "blunt_smash"],
  // Spears / polearms
  [/lança|spear|javelin|dardo|tridente|trident|pike|pique/i, "spear_thrust"],
  // Daggers
  [/adaga|dagger|punhal/i, "dagger_stab"],
  // Unarmed
  [/desarmado|unarmed|soco|punch|garra|claw|mordida|bite/i, "unarmed_strike"],
  // Bows
  [/arco longo|longbow|arco curto|shortbow|arco/i, "bow_arrow"],
  // Crossbows
  [/besta|crossbow|balestra/i, "crossbow_bolt"],
  // Magic missile
  [/míssil mágico|missil magico|magic missile/i, "magic_missile"],
];

const DAMAGE_TYPE_MAP: Record<string, AnimationType> = {
  // Fire
  fogo: "fire_bolt",
  fire: "fire_bolt",
  // Ice / Cold
  gelo: "ice_ray",
  frio: "ice_ray",
  cold: "ice_ray",
  ice: "ice_ray",
  // Lightning / Thunder
  relâmpago: "lightning_bolt",
  relampago: "lightning_bolt",
  lightning: "lightning_bolt",
  trovão: "lightning_bolt",
  trovao: "lightning_bolt",
  thunder: "lightning_bolt",
  // Necrotic
  necrótico: "dark_necrotic",
  necrotico: "dark_necrotic",
  necrotic: "dark_necrotic",
  // Radiant / healing
  radiante: "heal_holy",
  radiant: "heal_holy",
  // Force (magic missile)
  força: "magic_missile",
  forca: "magic_missile",
  force: "magic_missile",
};

/**
 * Classify a weapon (from OAWeaponOption) into an AnimationType.
 * Checks weapon name first, then damage string for type keywords.
 */
export function classifyWeapon(weapon: {
  weaponName: string;
  damage: string;
}): AnimationType {
  // 1. Match by weapon name
  const name = weapon.weaponName.toLowerCase();
  for (const [pattern, animType] of WEAPON_NAME_MAP) {
    if (pattern.test(name)) return animType;
  }

  // 2. Match by damage type in damage string (e.g. "1d8 + 3 fogo")
  const dmg = weapon.damage.toLowerCase();
  for (const [keyword, animType] of Object.entries(DAMAGE_TYPE_MAP)) {
    if (dmg.includes(keyword)) return animType;
  }

  // 3. Fallback
  return "sword_slash";
}

/**
 * Classify by damage type string alone (for spells or generic attacks).
 */
export function classifyByDamageType(damageType: string): AnimationType {
  const dt = damageType.toLowerCase();
  return DAMAGE_TYPE_MAP[dt] ?? "magic_missile";
}
