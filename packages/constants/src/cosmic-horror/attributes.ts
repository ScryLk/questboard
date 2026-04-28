// ── Horror Investigativo (d100) — atributos ──
//
// 8 atributos diferentes do d20: vão de ~15 a 90 (percentuais). Não
// confundir com os 6 do D&D. Slug do sistema: `cosmic-horror`.

export const COSMIC_HORROR_SYSTEM_SLUG = "cosmic-horror";

export const COSMIC_HORROR_ATTRIBUTES = [
  "for",
  "con",
  "tam",
  "des",
  "apa",
  "int",
  "pod",
  "edu",
] as const;

export type CosmicHorrorAttributeKey =
  (typeof COSMIC_HORROR_ATTRIBUTES)[number];

export const COSMIC_HORROR_ATTRIBUTE_LABELS: Record<
  CosmicHorrorAttributeKey,
  { short: string; full: string; description: string }
> = {
  for: {
    short: "FOR",
    full: "Força",
    description: "Capacidade muscular",
  },
  con: {
    short: "CON",
    full: "Constituição",
    description: "Resistência física, saúde",
  },
  tam: {
    short: "TAM",
    full: "Tamanho",
    description: "Volume corporal, massa",
  },
  des: {
    short: "DES",
    full: "Destreza",
    description: "Coordenação, agilidade",
  },
  apa: {
    short: "APA",
    full: "Aparência",
    description: "Atratividade física, presença",
  },
  int: {
    short: "INT",
    full: "Inteligência",
    description: "Capacidade analítica, memória",
  },
  pod: {
    short: "POD",
    full: "Poder",
    description: "Força de vontade, espiritual",
  },
  edu: {
    short: "EDU",
    full: "Educação",
    description: "Conhecimento adquirido",
  },
};

/** Faixas de geração (rolagem de criação). FOR/CON/DES/APA/POD usam
 *  3d6×5 (15-90); TAM/INT/EDU usam (2d6+6)×5 (40-90). Mantemos o
 *  range max em 99 pra acomodar improvement. */
export const COSMIC_HORROR_ATTRIBUTE_RANGES: Record<
  CosmicHorrorAttributeKey,
  { min: number; max: number; gen: { dice: string; multiplier: number } }
> = {
  for: { min: 15, max: 99, gen: { dice: "3d6", multiplier: 5 } },
  con: { min: 15, max: 99, gen: { dice: "3d6", multiplier: 5 } },
  tam: { min: 40, max: 99, gen: { dice: "2d6+6", multiplier: 5 } },
  des: { min: 15, max: 99, gen: { dice: "3d6", multiplier: 5 } },
  apa: { min: 15, max: 99, gen: { dice: "3d6", multiplier: 5 } },
  int: { min: 40, max: 99, gen: { dice: "2d6+6", multiplier: 5 } },
  pod: { min: 15, max: 99, gen: { dice: "3d6", multiplier: 5 } },
  edu: { min: 40, max: 99, gen: { dice: "2d6+6", multiplier: 5 } },
};
