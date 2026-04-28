// ── D&D 5e Character schema (Zod) ──
//
// Valida o estado bruto da ficha — o que o usuário preenche e o que
// é persistido em `Character.data` (JSON). Cálculos derivados (CA, mods,
// slots) são responsabilidade do motor (`packages/game-engine/dnd5e`).
// Não há referência a SRD aqui — as referências são por slug, validadas
// na resolução (lookup contra `SrdItem`/`SrdSpell`).

import { z } from "zod";

const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;
const RECHARGE_TYPES = [
  "SHORT_REST",
  "LONG_REST",
  "DAWN",
  "MANUAL",
] as const;

const abilityScoreSchema = z.number().int().min(1).max(30);

const equipmentItemSchema = z.object({
  itemSlug: z.string(),
  quantity: z.number().int().min(1).default(1),
  equipped: z.boolean().default(false),
  attuned: z.boolean().default(false),
  notes: z.string().optional(),
});

const spellEntrySchema = z.object({
  spellSlug: z.string(),
  prepared: z.boolean().default(true),
});

const resourceSchema = z.object({
  name: z.string().min(1).max(60),
  current: z.number().int().min(0),
  max: z.number().int().min(0),
  rechargeOn: z.enum(RECHARGE_TYPES),
});

export const dnd5eCharacterSchema = z
  .object({
    // Identidade
    level: z.number().int().min(1).max(20),
    classSlug: z.string().min(1),
    subclassSlug: z.string().optional(),
    raceSlug: z.string().min(1),
    subraceSlug: z.string().optional(),
    background: z.string().min(1),
    alignment: z.string().optional(),

    // Atributos finais (já com bônus de raça aplicados pelo wizard).
    attributes: z.object({
      str: abilityScoreSchema,
      dex: abilityScoreSchema,
      con: abilityScoreSchema,
      int: abilityScoreSchema,
      wis: abilityScoreSchema,
      cha: abilityScoreSchema,
    }),

    // Pontos de vida
    hpMax: z.number().int().min(1),
    hpCurrent: z.number().int().min(0),
    hpTemp: z.number().int().min(0).default(0),
    hitDiceUsed: z.number().int().min(0).default(0),

    // Proficiências
    skillProficiencies: z.array(z.string()).default([]),
    expertiseSkills: z.array(z.string()).default([]),
    savingThrowProficiencies: z.array(z.enum(ABILITY_KEYS)).default([]),
    toolProficiencies: z.array(z.string()).default([]),
    languages: z.array(z.string()).default([]),

    // Inventário e magias
    equipment: z.array(equipmentItemSchema).default([]),
    spells: z.array(spellEntrySchema).default([]),
    /** `{ "1": 2, "3": 1 }` — slots GASTOS por nível. Disponíveis = base
     *  - gastos. Engine de slots calcula a base; ficha rastreia o gasto. */
    spellSlotsExpended: z.record(z.string(), z.number().int().min(0)).default({}),

    // Recursos de classe
    resources: z.array(resourceSchema).default([]),

    // Salvação contra morte
    deathSavesSuccesses: z.number().int().min(0).max(3).default(0),
    deathSavesFailures: z.number().int().min(0).max(3).default(0),

    // Roleplay
    personalityTraits: z.string().max(500).optional(),
    ideals: z.string().max(500).optional(),
    bonds: z.string().max(500).optional(),
    flaws: z.string().max(500).optional(),
    notes: z.string().max(5000).optional(),
  })
  .superRefine((data, ctx) => {
    // HP atual não pode passar do max. (Temp é separado, OK.)
    if (data.hpCurrent > data.hpMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hpCurrent"],
        message: "HP atual não pode passar do máximo.",
      });
    }
    // Hit dice gastos não passam do nível.
    if (data.hitDiceUsed > data.level) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hitDiceUsed"],
        message: "Mais hit dice gastos do que o nível permite.",
      });
    }
    // Expertise exige proficiência prévia.
    const profSet = new Set(data.skillProficiencies);
    for (const expertise of data.expertiseSkills) {
      if (!profSet.has(expertise)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expertiseSkills"],
          message: `Especialização em '${expertise}' exige proficiência prévia.`,
        });
        break;
      }
    }
    // Slots gastos não excedem o nível 9.
    for (const key of Object.keys(data.spellSlotsExpended)) {
      const lvl = parseInt(key, 10);
      if (Number.isNaN(lvl) || lvl < 1 || lvl > 9) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["spellSlotsExpended"],
          message: "Nível de slot deve estar entre 1 e 9.",
        });
        break;
      }
    }
  });

export type Dnd5eCharacterInput = z.infer<typeof dnd5eCharacterSchema>;
