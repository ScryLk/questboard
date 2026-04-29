// ── Ocupações do Horror Investigativo ──
//
// Conjunto reduzido de 16 ocupações iconográficas para investigação
// cósmica. Skills referenciam slugs de `@questboard/constants`.

import type { CosmicHorrorOccupationEntry } from "@/types/cosmic-horror-srd";
import { makeQuestboardOriginalAttribution } from "./cosmic-horror-attribution";

const ATTR = makeQuestboardOriginalAttribution();

export const SEED_COSMIC_HORROR_OCCUPATIONS: CosmicHorrorOccupationEntry[] = [
  {
    slug: "antiquarian",
    name: "Antiquário",
    description:
      "Estudioso de relíquias e civilizações antigas. Vive entre tomos empoeirados " +
      "e leilões discretos — a ocupação clássica do investigador acidental.",
    skillPointsFormula: "EDU × 4",
    creditRating: { min: 30, max: 70 },
    skills: [
      "appraise",
      "history",
      "library-use",
      "language-other",
      "spot-hidden",
      "navigate",
    ],
    optionalSkillsCount: 2,
    recommendedAttributes: ["EDU", "INT"],
    attribution: ATTR,
  },
  {
    slug: "professor",
    name: "Professor (Acadêmico)",
    description:
      "Docente em universidade — geralmente Miskatonic ou similar. Acessa " +
      "bibliotecas restritas, mas paga em sanidade pelo conhecimento errado.",
    skillPointsFormula: "EDU × 4",
    creditRating: { min: 20, max: 70 },
    skills: [
      "library-use",
      "language-own",
      "language-other",
      "history",
      "psychology",
      "occult",
    ],
    optionalSkillsCount: 2,
    recommendedAttributes: ["EDU", "INT"],
    attribution: ATTR,
  },
  {
    slug: "private-investigator",
    name: "Detetive Particular",
    description:
      "Olho-de-vidro em escritório encardido. Especialista em vigilância, " +
      "interrogatório e quebrar a regra quando preciso.",
    skillPointsFormula: "EDU × 2 + (DES ou FOR) × 2",
    creditRating: { min: 9, max: 30 },
    skills: [
      "disguise",
      "law",
      "library-use",
      "psychology",
      "spot-hidden",
      "firearms-handgun",
      "fast-talk",
    ],
    optionalSkillsCount: 1,
    recommendedAttributes: ["INT", "EDU", "APA"],
    attribution: ATTR,
  },
  {
    slug: "police-officer",
    name: "Policial",
    description:
      "Detetive ou patrulheiro da polícia. Acesso oficial a delegacias, mas " +
      "vinculado a hierarquia e protocolo.",
    skillPointsFormula: "EDU × 2 + (DES ou FOR) × 2",
    creditRating: { min: 9, max: 30 },
    skills: [
      "fighting-brawl",
      "firearms-handgun",
      "first-aid",
      "law",
      "listen",
      "psychology",
      "spot-hidden",
    ],
    optionalSkillsCount: 1,
    recommendedAttributes: ["FOR", "DES", "EDU"],
    attribution: ATTR,
  },
  {
    slug: "doctor",
    name: "Médico",
    description:
      "Clínico, cirurgião ou patologista. O membro do grupo que mantém os " +
      "outros vivos — quando entende o que está vendo.",
    skillPointsFormula: "EDU × 4",
    creditRating: { min: 30, max: 80 },
    skills: [
      "first-aid",
      "medicine",
      "language-other",
      "psychology",
      "science-biology",
      "science-chemistry",
    ],
    optionalSkillsCount: 1,
    recommendedAttributes: ["EDU", "INT"],
    attribution: ATTR,
  },
  {
    slug: "journalist",
    name: "Jornalista",
    description:
      "Repórter de jornal ou revista. Caça a história — e às vezes a história " +
      "caça de volta.",
    skillPointsFormula: "EDU × 4",
    creditRating: { min: 9, max: 30 },
    skills: [
      "history",
      "library-use",
      "language-own",
      "psychology",
      "fast-talk",
      "persuade",
      "spot-hidden",
    ],
    optionalSkillsCount: 1,
    recommendedAttributes: ["EDU", "APA"],
    attribution: ATTR,
  },
  {
    slug: "occultist",
    name: "Ocultista",
    description:
      "Estudioso de magia, esoterismo e tradições proibidas. O único que " +
      "tinha alguma ideia do que estava por vir.",
    skillPointsFormula: "EDU × 4",
    creditRating: { min: 9, max: 65 },
    skills: [
      "anthropology",
      "history",
      "library-use",
      "language-other",
      "occult",
      "psychology",
    ],
    optionalSkillsCount: 2,
    recommendedAttributes: ["EDU", "INT", "POD"],
    attribution: ATTR,
  },
  {
    slug: "soldier",
    name: "Soldado",
    description:
      "Ex-combatente ou ainda em serviço. Veterano com cicatrizes — algumas " +
      "delas mentais.",
    skillPointsFormula: "EDU × 2 + (DES ou FOR) × 2",
    creditRating: { min: 9, max: 30 },
    skills: [
      "fighting-brawl",
      "firearms-handgun",
      "firearms-rifle",
      "first-aid",
      "navigate",
      "stealth",
      "swim",
    ],
    optionalSkillsCount: 1,
    recommendedAttributes: ["FOR", "CON", "DES"],
    attribution: ATTR,
  },
  {
    slug: "criminal",
    name: "Criminoso",
    description:
      "Ladrão, contrabandista ou capanga reformado. Conhece submundo e portas " +
      "que abrem na surdina.",
    skillPointsFormula: "EDU × 2 + (DES ou APA) × 2",
    creditRating: { min: 5, max: 65 },
    skills: [
      "fast-talk",
      "fighting-brawl",
      "stealth",
      "lockpicking",
      "spot-hidden",
      "psychology",
    ],
    optionalSkillsCount: 4,
    recommendedAttributes: ["DES", "APA"],
    attribution: ATTR,
  },
  {
    slug: "engineer",
    name: "Engenheiro",
    description:
      "Mecânico, civil ou elétrico. Resolve problemas com máquinas, e às vezes " +
      "com explosivos.",
    skillPointsFormula: "EDU × 4",
    creditRating: { min: 30, max: 60 },
    skills: [
      "electrical-repair",
      "library-use",
      "mechanical-repair",
      "operate-heavy-machinery",
      "science-physics",
    ],
    optionalSkillsCount: 3,
    recommendedAttributes: ["EDU", "INT"],
    attribution: ATTR,
  },
  {
    slug: "lawyer",
    name: "Advogado",
    description:
      "Profissional do Direito. Útil quando o investigador precisa sair em " +
      "liberdade — ou processar uma sociedade secreta.",
    skillPointsFormula: "EDU × 4",
    creditRating: { min: 30, max: 80 },
    skills: [
      "accounting",
      "law",
      "library-use",
      "language-own",
      "persuade",
      "psychology",
    ],
    optionalSkillsCount: 2,
    recommendedAttributes: ["EDU", "INT", "APA"],
    attribution: ATTR,
  },
  {
    slug: "artist",
    name: "Artista",
    description:
      "Pintor, escritor, músico, fotógrafo. Sensibilidade aguçada — e a " +
      "maldição de ver demais.",
    skillPointsFormula: "EDU × 2 + (DES ou POD) × 2",
    creditRating: { min: 9, max: 50 },
    skills: [
      "art-craft",
      "history",
      "natural-world",
      "psychology",
      "spot-hidden",
      "language-other",
    ],
    optionalSkillsCount: 3,
    recommendedAttributes: ["DES", "POD", "INT"],
    attribution: ATTR,
  },
  {
    slug: "clergyman",
    name: "Clérigo",
    description:
      "Sacerdote, pastor ou rabi. A fé pode ser escudo — ou véu sobre o " +
      "verdadeiro horror cósmico.",
    skillPointsFormula: "EDU × 4",
    creditRating: { min: 9, max: 60 },
    skills: [
      "accounting",
      "history",
      "language-other",
      "library-use",
      "occult",
      "psychology",
      "persuade",
    ],
    optionalSkillsCount: 1,
    recommendedAttributes: ["EDU", "POD"],
    attribution: ATTR,
  },
  {
    slug: "athlete",
    name: "Atleta",
    description:
      "Boxeador, corredor, alpinista. Quando precisa correr ou pular pra fora " +
      "de uma janela, é o investigador certo.",
    skillPointsFormula: "EDU × 2 + DES × 2",
    creditRating: { min: 9, max: 30 },
    skills: [
      "climb",
      "jump",
      "fighting-brawl",
      "ride",
      "swim",
      "throw",
      "first-aid",
    ],
    optionalSkillsCount: 1,
    recommendedAttributes: ["FOR", "DES", "CON"],
    attribution: ATTR,
  },
  {
    slug: "dilettante",
    name: "Diletante",
    description:
      "Herdeiro entediado de família rica. Curioso, social — e financiando " +
      "expedições com despreocupação fatal.",
    skillPointsFormula: "EDU × 2 + APA × 2",
    creditRating: { min: 50, max: 99 },
    skills: ["art-craft", "firearms-handgun", "language-other", "ride"],
    optionalSkillsCount: 3,
    recommendedAttributes: ["APA", "EDU"],
    attribution: ATTR,
  },
  {
    slug: "scholar",
    name: "Estudante / Pesquisador",
    description:
      "Pós-graduando ou bolsista. Faz a maior parte do trabalho de pesquisa " +
      "do mestre — e às vezes paga o preço.",
    skillPointsFormula: "EDU × 4",
    creditRating: { min: 5, max: 10 },
    skills: [
      "language-own",
      "language-other",
      "library-use",
      "history",
      "science-biology",
      "psychology",
    ],
    optionalSkillsCount: 2,
    recommendedAttributes: ["EDU", "INT"],
    attribution: ATTR,
  },
];
