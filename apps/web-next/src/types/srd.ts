// ── Frontend SRD content types ──
//
// Espelham `SrdSpell`/`SrdMonster`/`SrdItem`/etc do schema Prisma do
// prompt (apps/api/prisma futuro). Por ora vivem só no frontend com
// seed mock — quando o backend subir, esses types serão substituídos
// pelos do `@questboard/types` direto. A flag `source` segue o enum
// `SrdContentSource` do prompt.
//
// Tudo SRD 5.1 oficial: licenciado CC-BY 4.0. Cada entry deve ter
// `attribution` preenchida. UI deve mostrar a footer de atribuição.

export type SrdContentSource =
  | "OFFICIAL_SRD"
  | "HOMEBREW_PUBLIC"
  | "HOMEBREW_CAMPAIGN"
  | "HOMEBREW_PRIVATE";

export interface SrdAttribution {
  source: SrdContentSource;
  /** String visível no rodapé do card. SRD oficial usa o texto canônico. */
  text: string;
  /** Ref dentro do SRD (ex: "SRD 5.1 §A.B"). Opcional, só pra OFFICIAL_SRD. */
  reference?: string;
}

// ── Spell ──

export type SpellSchool =
  | "abjuration"
  | "conjuration"
  | "divination"
  | "enchantment"
  | "evocation"
  | "illusion"
  | "necromancy"
  | "transmutation";

export interface SrdSpell {
  slug: string;
  name: string;
  nameEn: string;
  level: number; // 0-9 (0 = truque/cantrip)
  school: SpellSchool;
  castingTime: string;
  range: string;
  components: string[]; // ["V", "S", "M"]
  materialComponent?: string;
  duration: string;
  description: string;
  higherLevels?: string;
  ritual: boolean;
  concentration: boolean;
  damageDice?: string;
  damageType?: string;
  saveAttribute?: "str" | "dex" | "con" | "int" | "wis" | "cha";
  attackType?: "ranged_spell" | "melee_spell" | "none";
  classes: string[]; // slugs
  attribution: SrdAttribution;
}

// ── Monster ──

export type MonsterSize =
  | "tiny"
  | "small"
  | "medium"
  | "large"
  | "huge"
  | "gargantuan";

export interface SrdMonster {
  slug: string;
  name: string;
  nameEn: string;
  size: MonsterSize;
  type: string; // "humanoid", "dragon", "fiend"
  alignment: string;
  armorClass: number;
  armorClassDescription?: string;
  hitPoints: number;
  hitDice: string;
  speed: { walk: number; fly?: number; swim?: number; climb?: number; burrow?: number };
  attributes: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  savingThrows?: Partial<Record<"str" | "dex" | "con" | "int" | "wis" | "cha", number>>;
  skills?: Record<string, number>;
  damageResistances: string[];
  damageImmunities: string[];
  conditionImmunities: string[];
  damageVulnerabilities: string[];
  senses: { darkvision?: number; blindsight?: number; tremorsense?: number; truesight?: number; passivePerception: number };
  languages: string[];
  challengeRating: number;
  experiencePoints: number;
  specialAbilities?: { name: string; description: string }[];
  actions?: { name: string; description: string; damageDice?: string; attackBonus?: number }[];
  legendaryActions?: { name: string; description: string }[];
  reactions?: { name: string; description: string }[];
  attribution: SrdAttribution;
}

// ── Item ──

export type ItemCategory =
  | "weapon"
  | "armor"
  | "adventuring-gear"
  | "magic-item"
  | "tool";

export type ItemRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "very-rare"
  | "legendary"
  | "artifact";

export interface SrdItem {
  slug: string;
  name: string;
  nameEn: string;
  category: ItemCategory;
  subcategory?: string; // "MARTIAL_MELEE", "MEDIUM_ARMOR"
  cost?: { quantity: number; unit: "cp" | "sp" | "ep" | "gp" | "pp" };
  weight?: number; // libras
  damageDice?: string;
  damageType?: string;
  weaponProperties?: string[];
  weaponRange?: { normal: number; long?: number };
  armorClass?: { base: number; dexBonus: boolean; maxDexBonus?: number };
  strengthRequirement?: number;
  stealthDisadvantage?: boolean;
  rarity?: ItemRarity;
  requiresAttunement?: boolean;
  description?: string;
  attribution: SrdAttribution;
}

// ── Race ──

export interface SrdRaceTrait {
  name: string;
  description: string;
}

export interface SrdRace {
  slug: string;
  name: string;
  nameEn: string;
  size: MonsterSize;
  speed: number;
  abilityBonuses: Partial<Record<"str" | "dex" | "con" | "int" | "wis" | "cha", number>>;
  age?: string;
  alignment?: string;
  languages: string[];
  traits: SrdRaceTrait[];
  description?: string;
  attribution: SrdAttribution;
}

// ── Class ──

export interface SrdClassEntry {
  slug: string;
  name: string;
  nameEn: string;
  hitDie: number;
  primaryAbility: string[];
  savingThrowProficiencies: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  skillChoiceCount: number;
  skillChoices: string[];
  spellcastingAbility?: "int" | "wis" | "cha";
  description?: string;
  attribution: SrdAttribution;
}

// ── Condition ──

export interface SrdCondition {
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  iconName?: string;
  attribution: SrdAttribution;
}

// ── System & content type ──

export type SrdContentType =
  | "spells"
  | "monsters"
  | "items"
  | "races"
  | "classes"
  | "conditions";

export interface SrdSystem {
  slug: string;
  name: string;
  shortName: string;
  edition?: string;
  publisher?: string;
  licenseType: "CC-BY-4.0" | "PROPRIETARY" | "NONE";
  hasContent: boolean;
  /** Texto curto pra landing do compêndio. */
  description: string;
}
