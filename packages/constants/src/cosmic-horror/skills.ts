// ── Horror Investigativo — perícias canônicas ──
//
// ~40 skills cobrindo investigação clássica + perícias de combate.
// Cada uma tem `base` (valor inicial sem treino) que é aplicado em
// criação ou derivado de atributo (ex: Esquivar = DES/2).
//
// Dynamic skills (calculadas): "Esquivar" e "Lutar (Briga)" dependem
// de DES e FOR — calc helpers no engine, não fixas aqui.
//
// Termos em pt-BR mas slugs neutros (sem palavra "Cthulhu" — somente
// "Mythos" como termo genérico de horror cósmico no domínio público).

export interface CosmicHorrorSkill {
  slug: string;
  name: string;
  /** Base inicial (sem treino). Algumas são derivadas de atributo —
   *  caller usa `derivesFrom` pra calcular. */
  base: number;
  /** Quando preenchido, base = atributo[derivesFrom] / divisor. */
  derivesFrom?: { attr: "for" | "des"; divisor: 1 | 2 | 5 };
  /** Categoria pra UI agrupar. */
  category:
    | "combat"
    | "investigation"
    | "social"
    | "physical"
    | "academic"
    | "technical"
    | "exploration";
  /** Marca skills cuja melhora exige circunstância especial. */
  rare?: boolean;
}

export const COSMIC_HORROR_SKILLS: CosmicHorrorSkill[] = [
  // Combate
  { slug: "dodge", name: "Esquivar", base: 0, derivesFrom: { attr: "des", divisor: 2 }, category: "combat" },
  { slug: "brawl", name: "Lutar (Briga)", base: 25, category: "combat" },
  { slug: "firearms-handgun", name: "Armas de Fogo (Pistola)", base: 20, category: "combat" },
  { slug: "firearms-rifle", name: "Armas de Fogo (Rifle/Espingarda)", base: 25, category: "combat" },
  { slug: "throw", name: "Arremessar", base: 20, category: "combat" },

  // Investigação
  { slug: "spot-hidden", name: "Notar", base: 25, category: "investigation" },
  { slug: "listen", name: "Ouvir", base: 20, category: "investigation" },
  { slug: "library-use", name: "Pesquisa Bibliográfica", base: 20, category: "investigation" },
  { slug: "track", name: "Rastrear", base: 10, category: "investigation" },
  { slug: "psychology", name: "Psicologia", base: 10, category: "investigation" },
  { slug: "first-aid", name: "Primeiros Socorros", base: 30, category: "investigation" },
  { slug: "medicine", name: "Medicina", base: 1, category: "investigation" },

  // Social
  { slug: "charm", name: "Lábia", base: 15, category: "social" },
  { slug: "fast-talk", name: "Persuadir", base: 5, category: "social" },
  { slug: "intimidate", name: "Intimidação", base: 15, category: "social" },
  { slug: "persuade", name: "Convencer", base: 10, category: "social" },
  { slug: "disguise", name: "Disfarçar", base: 5, category: "social" },

  // Físico
  { slug: "climb", name: "Escalar", base: 20, category: "physical" },
  { slug: "jump", name: "Saltar", base: 20, category: "physical" },
  { slug: "swim", name: "Nadar", base: 20, category: "physical" },
  { slug: "stealth", name: "Furtividade", base: 20, category: "physical" },
  { slug: "ride", name: "Cavalgar", base: 5, category: "physical" },

  // Acadêmico
  { slug: "history", name: "História", base: 5, category: "academic" },
  { slug: "occult", name: "Ocultismo", base: 5, category: "academic" },
  { slug: "anthropology", name: "Antropologia", base: 1, category: "academic" },
  { slug: "archaeology", name: "Arqueologia", base: 1, category: "academic" },
  { slug: "natural-world", name: "Mundo Natural", base: 10, category: "academic" },
  { slug: "law", name: "Direito", base: 5, category: "academic" },
  { slug: "accounting", name: "Contabilidade", base: 5, category: "academic" },
  { slug: "language-other", name: "Outra Língua", base: 1, category: "academic" },
  { slug: "language-own", name: "Língua Materna", base: 0, derivesFrom: { attr: "des", divisor: 1 }, category: "academic" },
  // Mythos: começa em 0. Aumentar reduz Sanidade Máxima.
  { slug: "mythos", name: "Conhecimento do Mythos", base: 0, category: "academic", rare: true },

  // Técnico
  { slug: "drive-auto", name: "Pilotar (Automóvel)", base: 20, category: "technical" },
  { slug: "mechanical-repair", name: "Reparos Mecânicos", base: 10, category: "technical" },
  { slug: "electrical-repair", name: "Reparos Elétricos", base: 10, category: "technical" },
  { slug: "electronics", name: "Eletrônica", base: 1, category: "technical" },
  { slug: "computer-use", name: "Uso de Computador", base: 5, category: "technical" },
  { slug: "operate-heavy-machinery", name: "Operar Maquinário Pesado", base: 1, category: "technical" },
  { slug: "locksmith", name: "Chaveiro", base: 1, category: "technical" },
  { slug: "sleight-of-hand", name: "Prestidigitação", base: 10, category: "technical" },

  // Exploração
  { slug: "navigate", name: "Navegação", base: 10, category: "exploration" },
  { slug: "survival", name: "Sobrevivência", base: 10, category: "exploration" },
];

export const SKILL_CATEGORY_LABELS: Record<
  CosmicHorrorSkill["category"],
  string
> = {
  combat: "Combate",
  investigation: "Investigação",
  social: "Social",
  physical: "Físico",
  academic: "Acadêmico",
  technical: "Técnico",
  exploration: "Exploração",
};
