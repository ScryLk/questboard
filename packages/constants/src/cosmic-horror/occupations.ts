// ── Horror Investigativo — ocupações ──
//
// Subset do PHB de horror investigativo (~30 ocupações). Cada uma tem
// fórmula de skill points baseada em atributos primários, lista de
// perícias profissionais e crédito (baseline social).

export type OccupationCreditRange = [min: number, max: number];

export interface CosmicHorrorOccupation {
  slug: string;
  name: string;
  /** Fórmula de skill points: lista de atributos cujos valores somam.
   *  Geralmente EDU × 4, mas algumas ocupações trocam EDU por outro
   *  (ex: detetive: EDU×2 + (DES×2 ou FOR×2)). */
  skillPointsFormula: {
    /** Atributos que sempre entram. */
    base: Array<{ attr: "edu" | "for" | "des" | "apa" | "con" | "pod" | "int" | "tam"; multiplier: 2 | 4 }>;
    /** Atributos que o jogador escolhe entre. */
    choice?: {
      pickCount: number;
      options: Array<{ attr: "edu" | "for" | "des" | "apa" | "con" | "pod" | "int" | "tam"; multiplier: 2 | 4 }>;
    };
  };
  /** Perícias profissionais (fixas + escolhas). */
  skills: {
    fixed: string[];
    /** Perícias adicionais escolhidas dentro de uma lista. */
    choice?: { count: number; options: string[] };
  };
  /** Faixa de Crédito (Credit Rating). */
  credit: OccupationCreditRange;
  description: string;
}

export const COSMIC_HORROR_OCCUPATIONS: CosmicHorrorOccupation[] = [
  {
    slug: "detective",
    name: "Detetive",
    skillPointsFormula: {
      base: [{ attr: "edu", multiplier: 2 }],
      choice: {
        pickCount: 1,
        options: [
          { attr: "for", multiplier: 2 },
          { attr: "des", multiplier: 2 },
        ],
      },
    },
    skills: {
      fixed: ["spot-hidden", "listen", "psychology", "law", "firearms-handgun"],
      choice: {
        count: 3,
        options: [
          "stealth",
          "intimidate",
          "fast-talk",
          "library-use",
          "drive-auto",
          "track",
          "first-aid",
        ],
      },
    },
    credit: [20, 50],
    description: "Investigador de polícia ou particular. Mistura de pesquisa, intuição e força.",
  },
  {
    slug: "professor",
    name: "Professor",
    skillPointsFormula: { base: [{ attr: "edu", multiplier: 4 }] },
    skills: {
      fixed: ["library-use", "language-own", "language-other", "history", "psychology", "occult"],
      choice: { count: 2, options: ["anthropology", "archaeology", "natural-world", "law", "medicine"] },
    },
    credit: [20, 70],
    description: "Acadêmico universitário. Acesso a bibliotecas, contatos eruditos.",
  },
  {
    slug: "journalist",
    name: "Jornalista",
    skillPointsFormula: { base: [{ attr: "edu", multiplier: 4 }] },
    skills: {
      fixed: ["library-use", "psychology", "language-own", "history", "fast-talk"],
      choice: { count: 3, options: ["persuade", "charm", "spot-hidden", "law", "drive-auto"] },
    },
    credit: [9, 30],
    description: "Reporta o real e o estranho. Acesso fácil a arquivos públicos.",
  },
  {
    slug: "doctor",
    name: "Médico",
    skillPointsFormula: { base: [{ attr: "edu", multiplier: 4 }] },
    skills: {
      fixed: ["medicine", "first-aid", "psychology", "language-other", "natural-world", "language-own"],
      choice: { count: 2, options: ["history", "library-use", "persuade"] },
    },
    credit: [30, 80],
    description: "Cirurgião, clínico ou psiquiatra. Vê demais o pior do corpo humano.",
  },
  {
    slug: "police-officer",
    name: "Policial",
    skillPointsFormula: {
      base: [
        { attr: "edu", multiplier: 2 },
        { attr: "for", multiplier: 2 },
      ],
    },
    skills: {
      fixed: ["firearms-handgun", "law", "spot-hidden", "psychology", "drive-auto", "first-aid"],
      choice: { count: 2, options: ["intimidate", "fast-talk", "track", "brawl", "stealth"] },
    },
    credit: [9, 30],
    description: "Patrulheiro ou investigador uniformizado.",
  },
  {
    slug: "scholar",
    name: "Erudito",
    skillPointsFormula: { base: [{ attr: "edu", multiplier: 4 }] },
    skills: {
      fixed: ["library-use", "history", "occult", "language-own", "language-other"],
      choice: { count: 3, options: ["anthropology", "archaeology", "natural-world", "psychology", "medicine"] },
    },
    credit: [9, 40],
    description: "Estudioso autodidata. Vasculha alfarrábios em busca da verdade — e a encontra.",
  },
  {
    slug: "private-investigator",
    name: "Detetive Particular",
    skillPointsFormula: {
      base: [{ attr: "edu", multiplier: 2 }],
      choice: {
        pickCount: 1,
        options: [
          { attr: "for", multiplier: 2 },
          { attr: "des", multiplier: 2 },
        ],
      },
    },
    skills: {
      fixed: ["spot-hidden", "psychology", "stealth", "library-use", "fast-talk"],
      choice: { count: 3, options: ["disguise", "track", "drive-auto", "first-aid", "law", "firearms-handgun"] },
    },
    credit: [9, 30],
    description: "Investigador autônomo. Sem placa, mas com táticas mais sujas.",
  },
  {
    slug: "antiquarian",
    name: "Antiquário",
    skillPointsFormula: { base: [{ attr: "edu", multiplier: 4 }] },
    skills: {
      fixed: ["accounting", "appraise", "history", "library-use", "language-other", "spot-hidden"],
      choice: { count: 2, options: ["archaeology", "navigate", "ride", "drive-auto"] },
    },
    credit: [30, 70],
    description: "Comerciante de relíquias. Sabe demais sobre o que pessoas escondiam.",
  },
  {
    slug: "soldier",
    name: "Soldado",
    skillPointsFormula: {
      base: [
        { attr: "edu", multiplier: 2 },
        { attr: "des", multiplier: 2 },
      ],
    },
    skills: {
      fixed: ["firearms-rifle", "firearms-handgun", "first-aid", "stealth", "survival", "navigate"],
      choice: { count: 2, options: ["climb", "swim", "throw", "drive-auto", "operate-heavy-machinery"] },
    },
    credit: [9, 30],
    description: "Veterano ou soldado ativo.",
  },
  {
    slug: "criminal",
    name: "Criminoso",
    skillPointsFormula: {
      base: [{ attr: "edu", multiplier: 2 }],
      choice: {
        pickCount: 1,
        options: [
          { attr: "des", multiplier: 2 },
          { attr: "apa", multiplier: 2 },
        ],
      },
    },
    skills: {
      fixed: ["fast-talk", "stealth", "spot-hidden", "psychology", "disguise"],
      choice: { count: 3, options: ["locksmith", "sleight-of-hand", "intimidate", "brawl", "firearms-handgun", "drive-auto"] },
    },
    credit: [5, 65],
    description: "Vive das margens. Conhece truques que pessoas honestas não querem aprender.",
  },
  {
    slug: "occultist",
    name: "Ocultista",
    skillPointsFormula: { base: [{ attr: "edu", multiplier: 4 }] },
    skills: {
      fixed: ["library-use", "occult", "history", "anthropology", "language-other"],
      choice: { count: 3, options: ["psychology", "natural-world", "archaeology", "persuade", "language-own"] },
    },
    credit: [9, 65],
    description: "Estudioso do oculto. Sabe que o nosso mundo não é o único.",
  },
  {
    slug: "engineer",
    name: "Engenheiro",
    skillPointsFormula: { base: [{ attr: "edu", multiplier: 4 }] },
    skills: {
      fixed: ["mechanical-repair", "electrical-repair", "operate-heavy-machinery", "drive-auto", "library-use"],
      choice: { count: 3, options: ["electronics", "computer-use", "history", "language-other", "natural-world"] },
    },
    credit: [30, 60],
    description: "Constrói e conserta. Vê o mundo como sistemas — até quando os sistemas falham.",
  },
  {
    slug: "lawyer",
    name: "Advogado",
    skillPointsFormula: { base: [{ attr: "edu", multiplier: 4 }] },
    skills: {
      fixed: ["law", "library-use", "psychology", "language-own", "accounting", "persuade"],
      choice: { count: 2, options: ["fast-talk", "history", "charm", "intimidate"] },
    },
    credit: [30, 80],
    description: "Acesso a tribunais, processos antigos, segredos contratuais.",
  },
  {
    slug: "artist",
    name: "Artista",
    skillPointsFormula: {
      base: [{ attr: "edu", multiplier: 2 }],
      choice: {
        pickCount: 1,
        options: [
          { attr: "pod", multiplier: 2 },
          { attr: "des", multiplier: 2 },
        ],
      },
    },
    skills: {
      fixed: ["history", "natural-world", "psychology", "spot-hidden", "language-other"],
      choice: { count: 3, options: ["library-use", "anthropology", "archaeology", "language-own", "occult"] },
    },
    credit: [9, 50],
    description: "Pintor, escultor, escritor. Sensível demais a coisas que outros não veem.",
  },
];

export const COSMIC_HORROR_DEFAULT_OCCUPATIONS = COSMIC_HORROR_OCCUPATIONS.map(
  (o) => o.slug,
);
