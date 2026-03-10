import { getModifier, formatModifier } from "@questboard/utils";

// ── Types ────────────────────────────────────────────

export type CreatureType =
  | "aberration" | "beast" | "celestial" | "construct" | "dragon"
  | "elemental" | "fey" | "fiend" | "giant" | "humanoid"
  | "monstrosity" | "ooze" | "plant" | "undead";

export type CreatureSize = "tiny" | "small" | "medium" | "large" | "huge" | "gargantuan";

export interface Creature {
  id: string;
  name: string;
  nameEn: string;
  type: CreatureType;
  size: CreatureSize;
  alignment: string;
  cr: string;
  xp: number;
  ac: number;
  acDesc: string;
  hp: number;
  hpFormula: string;
  speed: string;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  skills: Array<{ name: string; bonus: number }>;
  damageVulnerabilities?: string;
  damageResistances?: string;
  damageImmunities?: string;
  conditionImmunities?: string;
  senses: string;
  languages: string;
  abilities: Array<{ name: string; desc: string }>;
  actions: Array<{ name: string; desc: string }>;
  reactions?: Array<{ name: string; desc: string }>;
  legendaryActions?: Array<{ name: string; desc: string }>;
  icon: string;
  color: string;
  tags: string[];
}

// ── Helpers ──────────────────────────────────────────

export function parseCR(cr: string): number {
  if (cr.includes("/")) {
    const [num, den] = cr.split("/");
    return parseInt(num) / parseInt(den);
  }
  return parseFloat(cr);
}

export function sizeToGrid(size: CreatureSize): number {
  switch (size) {
    case "tiny": case "small": case "medium": return 1;
    case "large": return 2;
    case "huge": return 3;
    case "gargantuan": return 4;
  }
}

export function getAbilityMod(score: number): string {
  return formatModifier(getModifier(score));
}

export function getCRColor(cr: string): string {
  const n = parseCR(cr);
  if (n <= 0.5) return "#4ADE80";
  if (n <= 2) return "#60A5FA";
  if (n <= 5) return "#FBBF24";
  if (n <= 10) return "#F97316";
  return "#EF4444";
}

// ── Filter Labels ────────────────────────────────────

export const CREATURE_TYPE_LABELS: Record<CreatureType, string> = {
  aberration: "Aberracao",
  beast: "Besta",
  celestial: "Celestial",
  construct: "Constructo",
  dragon: "Dragao",
  elemental: "Elemental",
  fey: "Fada",
  fiend: "Corruptor",
  giant: "Gigante",
  humanoid: "Humanoide",
  monstrosity: "Monstruosidade",
  ooze: "Gosma",
  plant: "Planta",
  undead: "Morto-vivo",
};

export const CREATURE_SIZE_LABELS: Record<CreatureSize, string> = {
  tiny: "Minusculo",
  small: "Pequeno",
  medium: "Medio",
  large: "Grande",
  huge: "Enorme",
  gargantuan: "Colossal",
};

export const CR_FILTER_OPTIONS: Array<{ label: string; min: number; max: number }> = [
  { label: "ND 0-1/4", min: 0, max: 0.25 },
  { label: "ND 1/2-1", min: 0.5, max: 1 },
  { label: "ND 2-4", min: 2, max: 4 },
  { label: "ND 5-10", min: 5, max: 10 },
  { label: "ND 11+", min: 11, max: 30 },
];

// ── Creature Compendium ──────────────────────────────

export const CREATURE_COMPENDIUM: Creature[] = [
  // ─── 1. Plebeu (Commoner) CR 0 ───
  {
    id: "commoner",
    name: "Plebeu",
    nameEn: "Commoner",
    type: "humanoid",
    size: "medium",
    alignment: "qualquer alinhamento",
    cr: "0",
    xp: 10,
    ac: 10,
    acDesc: "",
    hp: 4,
    hpFormula: "1d8",
    speed: "9 m",
    str: 10, dex: 10, con: 10,
    int: 10, wis: 10, cha: 10,
    skills: [],
    senses: "Percepcao passiva 10",
    languages: "qualquer idioma (geralmente Comum)",
    abilities: [],
    actions: [
      {
        name: "Clava",
        desc: "Ataque Corpo a Corpo com Arma: +2 para acertar, alcance 1,5 m, um alvo. Acerto: 2 (1d4) de dano de concussao.",
      },
    ],
    icon: "user",
    color: "#A0AEC0",
    tags: ["basico", "npc", "cidade", "vila"],
  },

  // ─── 2. Bandido (Bandit) CR 1/8 ───
  {
    id: "bandit",
    name: "Bandido",
    nameEn: "Bandit",
    type: "humanoid",
    size: "medium",
    alignment: "qualquer alinhamento nao-leal",
    cr: "1/8",
    xp: 25,
    ac: 12,
    acDesc: "armadura de couro",
    hp: 11,
    hpFormula: "2d8+2",
    speed: "9 m",
    str: 11, dex: 12, con: 12,
    int: 10, wis: 10, cha: 10,
    skills: [],
    senses: "Percepcao passiva 10",
    languages: "qualquer idioma (geralmente Comum)",
    abilities: [],
    actions: [
      {
        name: "Cimitarra",
        desc: "Ataque Corpo a Corpo com Arma: +3 para acertar, alcance 1,5 m, um alvo. Acerto: 4 (1d6+1) de dano cortante.",
      },
      {
        name: "Besta Leve",
        desc: "Ataque a Distancia com Arma: +3 para acertar, alcance 24/96 m, um alvo. Acerto: 5 (1d8+1) de dano perfurante.",
      },
    ],
    icon: "swords",
    color: "#8B4513",
    tags: ["npc", "combate", "estrada", "basico"],
  },

  // ─── 3. Cultista (Cultist) CR 1/8 ───
  {
    id: "cultist",
    name: "Cultista",
    nameEn: "Cultist",
    type: "humanoid",
    size: "medium",
    alignment: "qualquer alinhamento nao-bom",
    cr: "1/8",
    xp: 25,
    ac: 12,
    acDesc: "armadura de couro",
    hp: 9,
    hpFormula: "2d8",
    speed: "9 m",
    str: 11, dex: 12, con: 10,
    int: 10, wis: 11, cha: 10,
    skills: [
      { name: "Enganacao", bonus: 2 },
      { name: "Religiao", bonus: 2 },
    ],
    senses: "Percepcao passiva 10",
    languages: "qualquer idioma (geralmente Comum)",
    abilities: [
      {
        name: "Devocao Sombria",
        desc: "O cultista tem vantagem em testes de resistencia contra ser amedrontado ou encantado.",
      },
    ],
    actions: [
      {
        name: "Cimitarra",
        desc: "Ataque Corpo a Corpo com Arma: +3 para acertar, alcance 1,5 m, um alvo. Acerto: 4 (1d6+1) de dano cortante.",
      },
    ],
    icon: "eye",
    color: "#4A0E4E",
    tags: ["npc", "culto", "magia", "sombrio"],
  },

  // ─── 4. Guarda (Guard) CR 1/8 ───
  {
    id: "guard",
    name: "Guarda",
    nameEn: "Guard",
    type: "humanoid",
    size: "medium",
    alignment: "qualquer alinhamento",
    cr: "1/8",
    xp: 25,
    ac: 16,
    acDesc: "cota de malha, escudo",
    hp: 11,
    hpFormula: "2d8+2",
    speed: "9 m",
    str: 13, dex: 12, con: 12,
    int: 10, wis: 11, cha: 10,
    skills: [
      { name: "Percepcao", bonus: 2 },
    ],
    senses: "Percepcao passiva 12",
    languages: "qualquer idioma (geralmente Comum)",
    abilities: [],
    actions: [
      {
        name: "Lanca",
        desc: "Ataque Corpo a Corpo ou a Distancia com Arma: +3 para acertar, alcance 1,5 m ou distancia 6/18 m, um alvo. Acerto: 4 (1d6+1) de dano perfurante, ou 5 (1d8+1) de dano perfurante se usado com duas maos para um ataque corpo a corpo.",
      },
    ],
    icon: "shield",
    color: "#4A6FA5",
    tags: ["npc", "cidade", "patrulha", "basico"],
  },

  // ─── 5. Kobold CR 1/8 ───
  {
    id: "kobold",
    name: "Kobold",
    nameEn: "Kobold",
    type: "humanoid",
    size: "small",
    alignment: "leal maligno",
    cr: "1/8",
    xp: 25,
    ac: 12,
    acDesc: "",
    hp: 5,
    hpFormula: "2d6-2",
    speed: "9 m",
    str: 7, dex: 15, con: 9,
    int: 8, wis: 7, cha: 8,
    skills: [],
    senses: "Visao no escuro 18 m, Percepcao passiva 8",
    languages: "Comum, Draconico",
    abilities: [
      {
        name: "Sensibilidade a Luz Solar",
        desc: "Enquanto estiver na luz solar, o kobold tem desvantagem nas jogadas de ataque e nos testes de Sabedoria (Percepcao) que dependam da visao.",
      },
      {
        name: "Taticas de Bando",
        desc: "O kobold tem vantagem nas jogadas de ataque contra uma criatura se pelo menos um dos aliados do kobold estiver a 1,5 m da criatura e o aliado nao estiver incapacitado.",
      },
    ],
    actions: [
      {
        name: "Adaga",
        desc: "Ataque Corpo a Corpo com Arma: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 4 (1d4+2) de dano perfurante.",
      },
      {
        name: "Funda",
        desc: "Ataque a Distancia com Arma: +4 para acertar, alcance 9/36 m, um alvo. Acerto: 4 (1d4+2) de dano de concussao.",
      },
    ],
    icon: "footprints",
    color: "#CC5500",
    tags: ["masmorra", "bando", "armadilha", "reptiliano"],
  },

  // ─── 6. Goblin CR 1/4 ───
  {
    id: "goblin",
    name: "Goblin",
    nameEn: "Goblin",
    type: "humanoid",
    size: "small",
    alignment: "neutro maligno",
    cr: "1/4",
    xp: 50,
    ac: 15,
    acDesc: "armadura de couro, escudo",
    hp: 7,
    hpFormula: "2d6",
    speed: "9 m",
    str: 8, dex: 14, con: 10,
    int: 10, wis: 8, cha: 8,
    skills: [
      { name: "Furtividade", bonus: 6 },
    ],
    senses: "Visao no escuro 18 m, Percepcao passiva 9",
    languages: "Comum, Goblin",
    abilities: [
      {
        name: "Escape Agil",
        desc: "O goblin pode usar a acao de Desengajar ou Esconder como acao bonus em cada um de seus turnos.",
      },
    ],
    actions: [
      {
        name: "Cimitarra",
        desc: "Ataque Corpo a Corpo com Arma: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 5 (1d6+2) de dano cortante.",
      },
      {
        name: "Arco Curto",
        desc: "Ataque a Distancia com Arma: +4 para acertar, alcance 24/96 m, um alvo. Acerto: 5 (1d6+2) de dano perfurante.",
      },
    ],
    icon: "sword",
    color: "#2D5A27",
    tags: ["goblinoide", "emboscada", "bando", "masmorra"],
  },

  // ─── 7. Esqueleto (Skeleton) CR 1/4 ───
  {
    id: "skeleton",
    name: "Esqueleto",
    nameEn: "Skeleton",
    type: "undead",
    size: "medium",
    alignment: "leal maligno",
    cr: "1/4",
    xp: 50,
    ac: 13,
    acDesc: "restos de armadura",
    hp: 13,
    hpFormula: "2d8+4",
    speed: "9 m",
    str: 10, dex: 14, con: 15,
    int: 6, wis: 8, cha: 5,
    skills: [],
    damageVulnerabilities: "concussao",
    damageImmunities: "veneno",
    conditionImmunities: "envenenado, exaustao",
    senses: "Visao no escuro 18 m, Percepcao passiva 9",
    languages: "entende os idiomas que conhecia em vida, mas nao pode falar",
    abilities: [],
    actions: [
      {
        name: "Espada Curta",
        desc: "Ataque Corpo a Corpo com Arma: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 5 (1d6+2) de dano perfurante.",
      },
      {
        name: "Arco Curto",
        desc: "Ataque a Distancia com Arma: +4 para acertar, alcance 24/96 m, um alvo. Acerto: 5 (1d6+2) de dano perfurante.",
      },
    ],
    icon: "bone",
    color: "#D2C6A5",
    tags: ["morto-vivo", "masmorra", "necromancia"],
  },

  // ─── 8. Zumbi (Zombie) CR 1/4 ───
  {
    id: "zombie",
    name: "Zumbi",
    nameEn: "Zombie",
    type: "undead",
    size: "medium",
    alignment: "neutro maligno",
    cr: "1/4",
    xp: 50,
    ac: 8,
    acDesc: "",
    hp: 22,
    hpFormula: "3d8+9",
    speed: "6 m",
    str: 13, dex: 6, con: 16,
    int: 3, wis: 6, cha: 5,
    skills: [],
    damageImmunities: "veneno",
    conditionImmunities: "envenenado",
    senses: "Visao no escuro 18 m, Percepcao passiva 8",
    languages: "entende os idiomas que conhecia em vida, mas nao pode falar",
    abilities: [
      {
        name: "Fortitude Morta-Viva",
        desc: "Se o dano reduzir o zumbi a 0 pontos de vida, ele deve fazer um teste de resistencia de Constituicao com CD 5 + o dano recebido, a menos que o dano seja radiante ou de um acerto critico. Em um sucesso, o zumbi cai para 1 ponto de vida em vez disso.",
      },
    ],
    actions: [
      {
        name: "Pancada",
        desc: "Ataque Corpo a Corpo com Arma: +3 para acertar, alcance 1,5 m, um alvo. Acerto: 4 (1d6+1) de dano de concussao.",
      },
    ],
    icon: "skull",
    color: "#556B2F",
    tags: ["morto-vivo", "masmorra", "necromancia", "resistente"],
  },

  // ─── 9. Lobo (Wolf) CR 1/4 ───
  {
    id: "wolf",
    name: "Lobo",
    nameEn: "Wolf",
    type: "beast",
    size: "medium",
    alignment: "sem alinhamento",
    cr: "1/4",
    xp: 50,
    ac: 13,
    acDesc: "armadura natural",
    hp: 11,
    hpFormula: "2d8+2",
    speed: "12 m",
    str: 12, dex: 15, con: 12,
    int: 3, wis: 12, cha: 6,
    skills: [
      { name: "Percepcao", bonus: 3 },
      { name: "Furtividade", bonus: 4 },
    ],
    senses: "Percepcao passiva 13",
    languages: "\u2014",
    abilities: [
      {
        name: "Audicao e Faro Agucados",
        desc: "O lobo tem vantagem em testes de Sabedoria (Percepcao) que dependam de audicao ou faro.",
      },
      {
        name: "Taticas de Bando",
        desc: "O lobo tem vantagem nas jogadas de ataque contra uma criatura se pelo menos um dos aliados do lobo estiver a 1,5 m da criatura e o aliado nao estiver incapacitado.",
      },
    ],
    actions: [
      {
        name: "Mordida",
        desc: "Ataque Corpo a Corpo com Arma: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 7 (2d4+2) de dano perfurante. Se o alvo for uma criatura, ele deve ser bem-sucedido em um teste de resistencia de Forca CD 11 ou sera derrubado.",
      },
    ],
    icon: "paw-print",
    color: "#708090",
    tags: ["besta", "floresta", "bando", "selvagem"],
  },

  // ─── 10. Orc CR 1/2 ───
  {
    id: "orc",
    name: "Orc",
    nameEn: "Orc",
    type: "humanoid",
    size: "medium",
    alignment: "caotico maligno",
    cr: "1/2",
    xp: 100,
    ac: 13,
    acDesc: "armadura de peles",
    hp: 15,
    hpFormula: "2d8+6",
    speed: "9 m",
    str: 16, dex: 12, con: 16,
    int: 7, wis: 11, cha: 10,
    skills: [
      { name: "Intimidacao", bonus: 2 },
    ],
    senses: "Visao no escuro 18 m, Percepcao passiva 10",
    languages: "Comum, Orc",
    abilities: [
      {
        name: "Agressivo",
        desc: "Como acao bonus, o orc pode se mover ate sua velocidade em direcao a uma criatura hostil que ele possa ver.",
      },
    ],
    actions: [
      {
        name: "Machado Grande",
        desc: "Ataque Corpo a Corpo com Arma: +5 para acertar, alcance 1,5 m, um alvo. Acerto: 9 (1d12+3) de dano cortante.",
      },
      {
        name: "Azagaia",
        desc: "Ataque Corpo a Corpo ou a Distancia com Arma: +5 para acertar, alcance 1,5 m ou distancia 9/36 m, um alvo. Acerto: 6 (1d6+3) de dano perfurante.",
      },
    ],
    icon: "axe",
    color: "#5C6B3A",
    tags: ["combate", "bando", "agressivo", "selvagem"],
  },

  // ─── 11. Hobgoblin CR 1/2 ───
  {
    id: "hobgoblin",
    name: "Hobgoblin",
    nameEn: "Hobgoblin",
    type: "humanoid",
    size: "medium",
    alignment: "leal maligno",
    cr: "1/2",
    xp: 100,
    ac: 18,
    acDesc: "cota de malha, escudo",
    hp: 11,
    hpFormula: "2d8+2",
    speed: "9 m",
    str: 13, dex: 12, con: 12,
    int: 10, wis: 10, cha: 9,
    skills: [],
    senses: "Visao no escuro 18 m, Percepcao passiva 10",
    languages: "Comum, Goblin",
    abilities: [
      {
        name: "Vantagem Marcial",
        desc: "Uma vez por turno, o hobgoblin pode causar 7 (2d6) de dano extra a uma criatura que ele acertar com um ataque com arma se essa criatura estiver a 1,5 m de um aliado do hobgoblin que nao esteja incapacitado.",
      },
    ],
    actions: [
      {
        name: "Espada Longa",
        desc: "Ataque Corpo a Corpo com Arma: +3 para acertar, alcance 1,5 m, um alvo. Acerto: 5 (1d8+1) de dano cortante, ou 6 (1d10+1) de dano cortante se usado com duas maos.",
      },
      {
        name: "Arco Longo",
        desc: "Ataque a Distancia com Arma: +3 para acertar, alcance 45/180 m, um alvo. Acerto: 5 (1d8+1) de dano perfurante.",
      },
    ],
    icon: "shield-alert",
    color: "#8B0000",
    tags: ["goblinoide", "tatico", "organizado", "militar"],
  },

  // ─── 12. Bugbear CR 1 ───
  {
    id: "bugbear",
    name: "Bugbear",
    nameEn: "Bugbear",
    type: "humanoid",
    size: "medium",
    alignment: "caotico maligno",
    cr: "1",
    xp: 200,
    ac: 16,
    acDesc: "armadura de peles, escudo",
    hp: 27,
    hpFormula: "5d8+5",
    speed: "9 m",
    str: 15, dex: 14, con: 13,
    int: 8, wis: 11, cha: 9,
    skills: [
      { name: "Furtividade", bonus: 6 },
      { name: "Sobrevivencia", bonus: 2 },
    ],
    senses: "Visao no escuro 18 m, Percepcao passiva 10",
    languages: "Comum, Goblin",
    abilities: [
      {
        name: "Ataque Surpresa",
        desc: "Se o bugbear surpreender uma criatura e acerta-la com um ataque durante a primeira rodada de combate, o alvo sofre 7 (2d6) de dano extra do ataque.",
      },
      {
        name: "Bruto",
        desc: "Uma arma corpo a corpo causa um dado extra de seu dano quando o bugbear acerta com ela (ja incluido no ataque).",
      },
    ],
    actions: [
      {
        name: "Maca Matutina",
        desc: "Ataque Corpo a Corpo com Arma: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 11 (2d8+2) de dano perfurante.",
      },
      {
        name: "Azagaia",
        desc: "Ataque Corpo a Corpo ou a Distancia com Arma: +4 para acertar, alcance 1,5 m ou distancia 9/36 m, um alvo. Acerto: 9 (2d6+2) de dano perfurante.",
      },
    ],
    icon: "eye-off",
    color: "#6B4226",
    tags: ["goblinoide", "emboscada", "furtivo", "brutal"],
  },

  // ─── 13. Lobo Terrivel (Dire Wolf) CR 1 ───
  {
    id: "dire-wolf",
    name: "Lobo Terrivel",
    nameEn: "Dire Wolf",
    type: "beast",
    size: "large",
    alignment: "sem alinhamento",
    cr: "1",
    xp: 200,
    ac: 14,
    acDesc: "armadura natural",
    hp: 37,
    hpFormula: "5d10+10",
    speed: "15 m",
    str: 17, dex: 15, con: 15,
    int: 3, wis: 12, cha: 7,
    skills: [
      { name: "Percepcao", bonus: 3 },
      { name: "Furtividade", bonus: 4 },
    ],
    senses: "Percepcao passiva 13",
    languages: "\u2014",
    abilities: [
      {
        name: "Audicao e Faro Agucados",
        desc: "O lobo terrivel tem vantagem em testes de Sabedoria (Percepcao) que dependam de audicao ou faro.",
      },
      {
        name: "Taticas de Bando",
        desc: "O lobo terrivel tem vantagem nas jogadas de ataque contra uma criatura se pelo menos um dos aliados do lobo estiver a 1,5 m da criatura e o aliado nao estiver incapacitado.",
      },
    ],
    actions: [
      {
        name: "Mordida",
        desc: "Ataque Corpo a Corpo com Arma: +5 para acertar, alcance 1,5 m, um alvo. Acerto: 10 (2d6+3) de dano perfurante. Se o alvo for uma criatura, ele deve ser bem-sucedido em um teste de resistencia de Forca CD 13 ou sera derrubado.",
      },
    ],
    icon: "paw-print",
    color: "#4A4A4A",
    tags: ["besta", "floresta", "bando", "selvagem"],
  },

  // ─── 14. Carnicai (Ghoul) CR 1 ───
  {
    id: "ghoul",
    name: "Carnicai",
    nameEn: "Ghoul",
    type: "undead",
    size: "medium",
    alignment: "caotico maligno",
    cr: "1",
    xp: 200,
    ac: 12,
    acDesc: "",
    hp: 22,
    hpFormula: "5d8",
    speed: "9 m",
    str: 13, dex: 15, con: 10,
    int: 7, wis: 10, cha: 6,
    skills: [],
    damageImmunities: "veneno",
    conditionImmunities: "encantado, envenenado, exaustao",
    senses: "Visao no escuro 18 m, Percepcao passiva 10",
    languages: "Comum",
    abilities: [],
    actions: [
      {
        name: "Mordida",
        desc: "Ataque Corpo a Corpo com Arma: +2 para acertar, alcance 1,5 m, um alvo. Acerto: 9 (2d6+2) de dano perfurante.",
      },
      {
        name: "Garras",
        desc: "Ataque Corpo a Corpo com Arma: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 7 (2d4+2) de dano cortante. Se o alvo for uma criatura que nao seja um elfo ou morto-vivo, ele deve ser bem-sucedido em um teste de resistencia de Constituicao CD 10 ou ficara paralisado por 1 minuto. O alvo pode repetir o teste no final de cada um de seus turnos, encerrando o efeito em si mesmo em um sucesso.",
      },
    ],
    icon: "ghost",
    color: "#7B8D6A",
    tags: ["morto-vivo", "masmorra", "paralisar", "necromancia"],
  },

  // ─── 15. Aranha Gigante (Giant Spider) CR 1 ───
  {
    id: "giant-spider",
    name: "Aranha Gigante",
    nameEn: "Giant Spider",
    type: "beast",
    size: "large",
    alignment: "sem alinhamento",
    cr: "1",
    xp: 200,
    ac: 14,
    acDesc: "armadura natural",
    hp: 26,
    hpFormula: "4d10+4",
    speed: "9 m, escalar 9 m",
    str: 14, dex: 16, con: 12,
    int: 2, wis: 11, cha: 4,
    skills: [
      { name: "Furtividade", bonus: 7 },
    ],
    senses: "Sentido Cego 3 m, Visao no escuro 18 m, Percepcao passiva 10",
    languages: "\u2014",
    abilities: [
      {
        name: "Escalar Teias",
        desc: "A aranha pode escalar superficies dificeis, incluindo tetos de cabeca para baixo, sem precisar fazer testes de habilidade.",
      },
      {
        name: "Sentir Teias",
        desc: "Enquanto estiver em contato com uma teia, a aranha sabe a localizacao exata de qualquer outra criatura em contato com a mesma teia.",
      },
      {
        name: "Andar nas Teias",
        desc: "A aranha ignora restricoes de movimento causadas por teias.",
      },
    ],
    actions: [
      {
        name: "Mordida",
        desc: "Ataque Corpo a Corpo com Arma: +5 para acertar, alcance 1,5 m, um alvo. Acerto: 7 (1d8+3) de dano perfurante, e o alvo deve fazer um teste de resistencia de Constituicao CD 11, sofrendo 9 (2d8) de dano de veneno em uma falha, ou metade desse dano em um sucesso. Se o dano de veneno reduzir o alvo a 0 pontos de vida, o alvo fica estavel mas envenenado por 1 hora, mesmo apos recuperar pontos de vida, e esta paralisado enquanto envenenado dessa forma.",
      },
      {
        name: "Teia (Recarrega 5\u20136)",
        desc: "Ataque a Distancia com Arma: +5 para acertar, alcance 9/18 m, um alvo. Acerto: O alvo fica contido pela teia. Como uma acao, o alvo contido pode fazer um teste de Forca CD 12, rompendo a teia em um sucesso. A teia tambem pode ser atacada e destruida (CA 10; PV 5; vulnerabilidade a dano de fogo; imunidade a dano de concussao, veneno e psiquico).",
      },
    ],
    icon: "bug",
    color: "#2F4F4F",
    tags: ["besta", "masmorra", "veneno", "teia"],
  },

  // ─── 16. Goblin Chefe (Goblin Boss) CR 1 ───
  {
    id: "goblin-boss",
    name: "Goblin Chefe",
    nameEn: "Goblin Boss",
    type: "humanoid",
    size: "small",
    alignment: "neutro maligno",
    cr: "1",
    xp: 200,
    ac: 17,
    acDesc: "cota de malha, escudo",
    hp: 21,
    hpFormula: "6d6",
    speed: "9 m",
    str: 10, dex: 14, con: 10,
    int: 10, wis: 8, cha: 10,
    skills: [
      { name: "Furtividade", bonus: 6 },
    ],
    senses: "Visao no escuro 18 m, Percepcao passiva 9",
    languages: "Comum, Goblin",
    abilities: [
      {
        name: "Escape Agil",
        desc: "O goblin pode usar a acao de Desengajar ou Esconder como acao bonus em cada um de seus turnos.",
      },
    ],
    actions: [
      {
        name: "Ataques Multiplos",
        desc: "O goblin chefe faz dois ataques com sua cimitarra. O segundo ataque tem desvantagem.",
      },
      {
        name: "Cimitarra",
        desc: "Ataque Corpo a Corpo com Arma: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 5 (1d6+2) de dano cortante.",
      },
      {
        name: "Azagaia",
        desc: "Ataque Corpo a Corpo ou a Distancia com Arma: +2 para acertar, alcance 1,5 m ou distancia 9/36 m, um alvo. Acerto: 3 (1d6) de dano perfurante.",
      },
    ],
    reactions: [
      {
        name: "Redirecionar Ataque",
        desc: "Quando uma criatura que o goblin chefe pode ver o atinge com um ataque, o chefe escolhe outro goblin a 1,5 m dele. Os dois trocam de lugar, e o goblin escolhido se torna o alvo do ataque em vez disso.",
      },
    ],
    icon: "crown",
    color: "#3A7D32",
    tags: ["goblinoide", "lider", "bando", "tatico"],
  },

  // ─── 17. Ogro (Ogre) CR 2 ───
  {
    id: "ogre",
    name: "Ogro",
    nameEn: "Ogre",
    type: "giant",
    size: "large",
    alignment: "caotico maligno",
    cr: "2",
    xp: 450,
    ac: 11,
    acDesc: "armadura de peles",
    hp: 59,
    hpFormula: "7d10+21",
    speed: "12 m",
    str: 19, dex: 8, con: 16,
    int: 5, wis: 7, cha: 7,
    skills: [],
    senses: "Visao no escuro 18 m, Percepcao passiva 8",
    languages: "Comum, Gigante",
    abilities: [],
    actions: [
      {
        name: "Clava Grande",
        desc: "Ataque Corpo a Corpo com Arma: +6 para acertar, alcance 1,5 m, um alvo. Acerto: 13 (2d8+4) de dano de concussao.",
      },
      {
        name: "Azagaia",
        desc: "Ataque Corpo a Corpo ou a Distancia com Arma: +6 para acertar, alcance 1,5 m ou distancia 9/36 m, um alvo. Acerto: 11 (2d6+4) de dano perfurante.",
      },
    ],
    icon: "hammer",
    color: "#8B7355",
    tags: ["gigante", "brutal", "forca"],
  },

  // ─── 18. Mimico (Mimic) CR 2 ───
  {
    id: "mimic",
    name: "Mimico",
    nameEn: "Mimic",
    type: "monstrosity",
    size: "medium",
    alignment: "neutro",
    cr: "2",
    xp: 450,
    ac: 12,
    acDesc: "armadura natural",
    hp: 58,
    hpFormula: "9d8+18",
    speed: "4,5 m",
    str: 17, dex: 12, con: 15,
    int: 5, wis: 13, cha: 8,
    skills: [
      { name: "Furtividade", bonus: 5 },
    ],
    damageImmunities: "acido",
    conditionImmunities: "derrubado",
    senses: "Visao no escuro 18 m, Percepcao passiva 11",
    languages: "\u2014",
    abilities: [
      {
        name: "Metamorfo",
        desc: "O mimico pode usar sua acao para se transformar em um objeto ou voltar a sua forma amorfa verdadeira. Suas estatisticas sao as mesmas em cada forma. Qualquer equipamento que ele esteja vestindo ou carregando nao e transformado. Ele reverte a sua forma verdadeira se morrer.",
      },
      {
        name: "Adesivo (Forma de Objeto Apenas)",
        desc: "O mimico adere a qualquer coisa que o toque. Uma criatura Grande ou menor aderida ao mimico tambem esta agarrada por ele (CD de escape 13). Testes de habilidade feitos para escapar dessa agarrada tem desvantagem.",
      },
      {
        name: "Emboscador Falso",
        desc: "Enquanto o mimico permanece imovel, ele e indistinguivel de um objeto comum.",
      },
    ],
    actions: [
      {
        name: "Pseudopode",
        desc: "Ataque Corpo a Corpo com Arma: +5 para acertar, alcance 1,5 m, um alvo. Acerto: 7 (1d8+3) de dano de concussao. Se o mimico estiver em forma de objeto, o alvo fica sujeito ao traco Adesivo.",
      },
      {
        name: "Mordida",
        desc: "Ataque Corpo a Corpo com Arma: +5 para acertar, alcance 1,5 m, um alvo. Acerto: 7 (1d8+3) de dano perfurante mais 4 (1d8) de dano de acido.",
      },
    ],
    icon: "box",
    color: "#8B6914",
    tags: ["emboscada", "metamorfo", "masmorra", "armadilha"],
  },

  // ─── 19. Urso-coruja (Owlbear) CR 3 ───
  {
    id: "owlbear",
    name: "Urso-coruja",
    nameEn: "Owlbear",
    type: "monstrosity",
    size: "large",
    alignment: "sem alinhamento",
    cr: "3",
    xp: 700,
    ac: 13,
    acDesc: "armadura natural",
    hp: 59,
    hpFormula: "7d10+21",
    speed: "12 m",
    str: 20, dex: 12, con: 17,
    int: 3, wis: 12, cha: 7,
    skills: [
      { name: "Percepcao", bonus: 3 },
    ],
    senses: "Visao no escuro 18 m, Percepcao passiva 13",
    languages: "\u2014",
    abilities: [
      {
        name: "Visao e Faro Agucados",
        desc: "O urso-coruja tem vantagem em testes de Sabedoria (Percepcao) que dependam de visao ou faro.",
      },
    ],
    actions: [
      {
        name: "Ataques Multiplos",
        desc: "O urso-coruja faz dois ataques: um com seu bico e um com suas garras.",
      },
      {
        name: "Bico",
        desc: "Ataque Corpo a Corpo com Arma: +7 para acertar, alcance 1,5 m, um alvo. Acerto: 10 (1d10+5) de dano perfurante.",
      },
      {
        name: "Garras",
        desc: "Ataque Corpo a Corpo com Arma: +7 para acertar, alcance 1,5 m, um alvo. Acerto: 14 (2d8+5) de dano cortante.",
      },
    ],
    icon: "bird",
    color: "#6B4423",
    tags: ["monstro", "floresta", "agressivo", "selvagem"],
  },

  // ─── 20. Minotauro (Minotaur) CR 3 ───
  {
    id: "minotaur",
    name: "Minotauro",
    nameEn: "Minotaur",
    type: "monstrosity",
    size: "large",
    alignment: "caotico maligno",
    cr: "3",
    xp: 700,
    ac: 14,
    acDesc: "armadura natural",
    hp: 76,
    hpFormula: "9d10+27",
    speed: "12 m",
    str: 18, dex: 11, con: 16,
    int: 6, wis: 16, cha: 9,
    skills: [
      { name: "Percepcao", bonus: 7 },
    ],
    senses: "Visao no escuro 18 m, Percepcao passiva 17",
    languages: "Abissal",
    abilities: [
      {
        name: "Investida",
        desc: "Se o minotauro se mover pelo menos 3 metros em linha reta em direcao a um alvo e entao acerta-lo com um ataque de chifrada no mesmo turno, o alvo sofre 9 (2d8) de dano perfurante extra. Se o alvo for uma criatura, ele deve ser bem-sucedido em um teste de resistencia de Forca CD 14 ou sera empurrado ate 3 metros e derrubado.",
      },
      {
        name: "Memoria de Labirinto",
        desc: "O minotauro pode lembrar perfeitamente qualquer caminho que tenha percorrido.",
      },
      {
        name: "Ataque Imprudente",
        desc: "No inicio de seu turno, o minotauro pode ganhar vantagem em todas as jogadas de ataque corpo a corpo que fizer durante aquele turno, mas jogadas de ataque contra ele tem vantagem ate o inicio de seu proximo turno.",
      },
    ],
    actions: [
      {
        name: "Machado Grande",
        desc: "Ataque Corpo a Corpo com Arma: +6 para acertar, alcance 1,5 m, um alvo. Acerto: 17 (2d12+4) de dano cortante.",
      },
      {
        name: "Chifrada",
        desc: "Ataque Corpo a Corpo com Arma: +6 para acertar, alcance 1,5 m, um alvo. Acerto: 13 (2d8+4) de dano perfurante.",
      },
    ],
    icon: "target",
    color: "#8B4513",
    tags: ["monstro", "labirinto", "investida", "brutal"],
  },

  // ─── 21. Cavaleiro (Knight) CR 3 ───
  {
    id: "knight",
    name: "Cavaleiro",
    nameEn: "Knight",
    type: "humanoid",
    size: "medium",
    alignment: "qualquer alinhamento",
    cr: "3",
    xp: 700,
    ac: 18,
    acDesc: "placas",
    hp: 52,
    hpFormula: "8d8+16",
    speed: "9 m",
    str: 16, dex: 11, con: 14,
    int: 11, wis: 11, cha: 15,
    skills: [],
    senses: "Percepcao passiva 10",
    languages: "qualquer idioma (geralmente Comum)",
    abilities: [
      {
        name: "Bravura",
        desc: "O cavaleiro tem vantagem em testes de resistencia contra ser amedrontado.",
      },
    ],
    actions: [
      {
        name: "Ataques Multiplos",
        desc: "O cavaleiro faz dois ataques corpo a corpo.",
      },
      {
        name: "Espada Larga",
        desc: "Ataque Corpo a Corpo com Arma: +5 para acertar, alcance 1,5 m, um alvo. Acerto: 10 (2d6+3) de dano cortante.",
      },
      {
        name: "Besta Pesada",
        desc: "Ataque a Distancia com Arma: +2 para acertar, alcance 30/120 m, um alvo. Acerto: 5 (1d10) de dano perfurante.",
      },
    ],
    reactions: [
      {
        name: "Aparar",
        desc: "O cavaleiro adiciona 2 a sua CA contra um ataque corpo a corpo que o acertaria. Para fazer isso, o cavaleiro deve ver o atacante e estar empunhando uma arma corpo a corpo.",
      },
    ],
    icon: "shield-check",
    color: "#C0C0C0",
    tags: ["npc", "combate", "leal", "protetor"],
  },

  // ─── 22. Troll CR 5 ───
  {
    id: "troll",
    name: "Troll",
    nameEn: "Troll",
    type: "giant",
    size: "large",
    alignment: "caotico maligno",
    cr: "5",
    xp: 1800,
    ac: 15,
    acDesc: "armadura natural",
    hp: 84,
    hpFormula: "8d10+40",
    speed: "9 m",
    str: 18, dex: 13, con: 20,
    int: 7, wis: 9, cha: 7,
    skills: [
      { name: "Percepcao", bonus: 2 },
    ],
    senses: "Visao no escuro 18 m, Percepcao passiva 12",
    languages: "Gigante",
    abilities: [
      {
        name: "Faro Agucado",
        desc: "O troll tem vantagem em testes de Sabedoria (Percepcao) que dependam de faro.",
      },
      {
        name: "Regeneracao",
        desc: "O troll recupera 10 pontos de vida no inicio de seu turno. Se o troll receber dano de acido ou fogo, esse traco nao funciona no inicio do proximo turno do troll. O troll morre apenas se comecar seu turno com 0 pontos de vida e nao regenerar.",
      },
    ],
    actions: [
      {
        name: "Ataques Multiplos",
        desc: "O troll faz tres ataques: um com sua mordida e dois com suas garras.",
      },
      {
        name: "Mordida",
        desc: "Ataque Corpo a Corpo com Arma: +7 para acertar, alcance 1,5 m, um alvo. Acerto: 7 (1d6+4) de dano perfurante.",
      },
      {
        name: "Garras",
        desc: "Ataque Corpo a Corpo com Arma: +7 para acertar, alcance 1,5 m, um alvo. Acerto: 11 (2d6+4) de dano cortante.",
      },
    ],
    icon: "heart-pulse",
    color: "#3B5323",
    tags: ["gigante", "regeneracao", "brutal", "perigoso"],
  },

  // ─── 23. Mago NPC (Mage) CR 6 ───
  {
    id: "mage",
    name: "Mago NPC",
    nameEn: "Mage",
    type: "humanoid",
    size: "medium",
    alignment: "qualquer alinhamento",
    cr: "6",
    xp: 2300,
    ac: 12,
    acDesc: "15 com armadura arcana",
    hp: 40,
    hpFormula: "9d8",
    speed: "9 m",
    str: 9, dex: 14, con: 11,
    int: 17, wis: 12, cha: 11,
    skills: [
      { name: "Arcanismo", bonus: 6 },
      { name: "Historia", bonus: 6 },
    ],
    senses: "Percepcao passiva 11",
    languages: "qualquer quatro idiomas",
    abilities: [
      {
        name: "Conjuracao",
        desc: "O mago e um conjurador de 9.\u00B0 nivel. Sua habilidade de conjuracao e Inteligencia (CD de resistencia 14, +6 para acertar com ataques magicos). O mago tem as seguintes magias de mago preparadas: Truques (a vontade): rajada de fogo, luz, mao arcana, prestidigitacao. 1.\u00B0 nivel (4 espacos): detectar magia, armadura arcana, misseis magicos, escudo. 2.\u00B0 nivel (3 espacos): passo nebuloso, sugestao. 3.\u00B0 nivel (3 espacos): contramagica, bola de fogo, voar. 4.\u00B0 nivel (3 espacos): invisibilidade maior, escudo de fogo. 5.\u00B0 nivel (1 espaco): cone de frio.",
      },
    ],
    actions: [
      {
        name: "Adaga",
        desc: "Ataque Corpo a Corpo ou a Distancia com Arma: +5 para acertar, alcance 1,5 m ou distancia 6/18 m, um alvo. Acerto: 4 (1d4+2) de dano perfurante.",
      },
    ],
    icon: "sparkles",
    color: "#4169E1",
    tags: ["npc", "magia", "conjurador", "arcano"],
  },

  // ─── 24. Devorador de Mentes (Mind Flayer) CR 7 ───
  {
    id: "mind-flayer",
    name: "Devorador de Mentes",
    nameEn: "Mind Flayer",
    type: "aberration",
    size: "medium",
    alignment: "leal maligno",
    cr: "7",
    xp: 2900,
    ac: 15,
    acDesc: "couraca",
    hp: 71,
    hpFormula: "13d8+13",
    speed: "9 m",
    str: 11, dex: 12, con: 12,
    int: 19, wis: 17, cha: 17,
    skills: [
      { name: "Arcanismo", bonus: 7 },
      { name: "Enganacao", bonus: 6 },
      { name: "Intuicao", bonus: 6 },
      { name: "Percepcao", bonus: 6 },
      { name: "Persuasao", bonus: 6 },
      { name: "Furtividade", bonus: 4 },
    ],
    senses: "Visao no escuro 36 m, Percepcao passiva 16",
    languages: "Subcomum, Telepatico 36 m",
    abilities: [
      {
        name: "Resistencia a Magia",
        desc: "O devorador de mentes tem vantagem em testes de resistencia contra magias e outros efeitos magicos.",
      },
      {
        name: "Conjuracao Inata",
        desc: "A habilidade de conjuracao inata do devorador de mentes e Inteligencia (CD de resistencia 15). Ele pode conjurar inatamente as seguintes magias, sem necessidade de componentes: A vontade: detectar pensamentos, levitacao. 1/dia cada: dominar monstro, projecao planar (apenas em si mesmo).",
      },
    ],
    actions: [
      {
        name: "Tentaculos",
        desc: "Ataque Corpo a Corpo com Arma: +7 para acertar, alcance 1,5 m, uma criatura. Acerto: 15 (2d10+4) de dano psiquico. Se o alvo for Medio ou menor, ele fica agarrado (CD de escape 15) e deve ser bem-sucedido em um teste de resistencia de Inteligencia CD 15 ou ficara atordoado ate que essa agarrada termine.",
      },
      {
        name: "Extrair Cerebro",
        desc: "Ataque Corpo a Corpo com Arma: +7 para acertar, alcance 1,5 m, uma criatura incapacitada agarrada pelo devorador de mentes. Acerto: O ataque constitui um acerto critico contra o alvo. Se esse dano reduzir o alvo a 0 pontos de vida, o devorador de mentes mata o alvo extraindo e devorando seu cerebro.",
      },
      {
        name: "Explosao Mental (Recarrega 5\u20136)",
        desc: "O devorador de mentes emite energia psiquica em um cone de 18 metros. Cada criatura nessa area deve ser bem-sucedida em um teste de resistencia de Inteligencia CD 15 ou sofre 22 (4d8+4) de dano psiquico e fica atordoada por 1 minuto. Uma criatura pode repetir o teste no final de cada um de seus turnos, encerrando o efeito em si mesma em um sucesso.",
      },
    ],
    icon: "brain",
    color: "#6A0DAD",
    tags: ["aberracao", "psiquico", "telepatico", "boss"],
  },

  // ─── 25. Assassino (Assassin) CR 8 ───
  {
    id: "assassin",
    name: "Assassino",
    nameEn: "Assassin",
    type: "humanoid",
    size: "medium",
    alignment: "qualquer alinhamento nao-bom",
    cr: "8",
    xp: 3900,
    ac: 15,
    acDesc: "armadura cravejada de couro",
    hp: 78,
    hpFormula: "12d8+24",
    speed: "9 m",
    str: 11, dex: 16, con: 14,
    int: 13, wis: 11, cha: 10,
    skills: [
      { name: "Acrobacia", bonus: 6 },
      { name: "Enganacao", bonus: 3 },
      { name: "Percepcao", bonus: 3 },
      { name: "Furtividade", bonus: 9 },
    ],
    damageResistances: "veneno",
    senses: "Percepcao passiva 13",
    languages: "Ladrao, mais dois outros idiomas",
    abilities: [
      {
        name: "Assassinar",
        desc: "Durante seu primeiro turno, o assassino tem vantagem nas jogadas de ataque contra qualquer criatura que ainda nao tenha agido. Qualquer acerto que o assassino marcar contra uma criatura surpresa e um acerto critico.",
      },
      {
        name: "Evasao",
        desc: "Se o assassino for submetido a um efeito que permita um teste de resistencia de Destreza para sofrer metade do dano, o assassino nao sofre nenhum dano se for bem-sucedido no teste, e apenas metade do dano se falhar.",
      },
      {
        name: "Ataque Furtivo",
        desc: "Uma vez por turno, o assassino causa 14 (4d6) de dano extra quando acerta um alvo com um ataque com arma e tem vantagem na jogada de ataque, ou quando o alvo esta a 1,5 m de um aliado do assassino que nao esta incapacitado e o assassino nao tem desvantagem na jogada de ataque.",
      },
    ],
    actions: [
      {
        name: "Ataques Multiplos",
        desc: "O assassino faz dois ataques com espada curta.",
      },
      {
        name: "Espada Curta",
        desc: "Ataque Corpo a Corpo com Arma: +6 para acertar, alcance 1,5 m, um alvo. Acerto: 6 (1d6+3) de dano perfurante, e o alvo deve fazer um teste de resistencia de Constituicao CD 15, sofrendo 24 (7d6) de dano de veneno em uma falha, ou metade desse dano em um sucesso.",
      },
      {
        name: "Besta Leve",
        desc: "Ataque a Distancia com Arma: +6 para acertar, alcance 24/96 m, um alvo. Acerto: 7 (1d8+3) de dano perfurante, e o alvo deve fazer um teste de resistencia de Constituicao CD 15, sofrendo 24 (7d6) de dano de veneno em uma falha, ou metade desse dano em um sucesso.",
      },
    ],
    icon: "crosshair",
    color: "#1C1C1C",
    tags: ["npc", "furtivo", "veneno", "assassino", "perigoso"],
  },

  // ─── 26. Dragao Vermelho Jovem (Young Red Dragon) CR 10 ───
  {
    id: "young-red-dragon",
    name: "Dragao Vermelho Jovem",
    nameEn: "Young Red Dragon",
    type: "dragon",
    size: "large",
    alignment: "caotico maligno",
    cr: "10",
    xp: 5900,
    ac: 18,
    acDesc: "armadura natural",
    hp: 178,
    hpFormula: "17d10+85",
    speed: "12 m, escalar 12 m, voar 24 m",
    str: 23, dex: 10, con: 21,
    int: 14, wis: 11, cha: 19,
    skills: [
      { name: "Percepcao", bonus: 8 },
      { name: "Furtividade", bonus: 4 },
    ],
    damageImmunities: "fogo",
    senses: "Sentido Cego 9 m, Visao no escuro 36 m, Percepcao passiva 18",
    languages: "Comum, Draconico",
    abilities: [],
    actions: [
      {
        name: "Ataques Multiplos",
        desc: "O dragao faz tres ataques: um com sua mordida e dois com suas garras.",
      },
      {
        name: "Mordida",
        desc: "Ataque Corpo a Corpo com Arma: +10 para acertar, alcance 3 m, um alvo. Acerto: 17 (2d10+6) de dano perfurante mais 3 (1d6) de dano de fogo.",
      },
      {
        name: "Garras",
        desc: "Ataque Corpo a Corpo com Arma: +10 para acertar, alcance 1,5 m, um alvo. Acerto: 13 (2d6+6) de dano cortante.",
      },
      {
        name: "Sopro de Fogo (Recarrega 5\u20136)",
        desc: "O dragao exala fogo em um cone de 9 metros. Cada criatura nessa area deve fazer um teste de resistencia de Destreza CD 17, sofrendo 56 (16d6) de dano de fogo em uma falha, ou metade desse dano em um sucesso.",
      },
    ],
    icon: "flame",
    color: "#CC0000",
    tags: ["dragao", "fogo", "voar", "boss", "perigoso"],
  },
];
