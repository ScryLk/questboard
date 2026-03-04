import { getModifier } from "@questboard/utils";
import type { AbilityKey } from "@questboard/types";
import { DND5E_SKILLS } from "./dnd5e-data";
import type { SkillDefinition } from "./dnd5e-data";
import type {
  FullCharacter,
  CharacterAbility,
  CharacterSkill,
  SkillProficiency,
} from "./character-types";

// ─── Helpers ────────────────────────────────────────────

function makeAbility(score: number, save: boolean): CharacterAbility {
  return { score, modifier: getModifier(score), saveProficiency: save };
}

function makeSkills(
  abilities: Record<AbilityKey, CharacterAbility>,
  profBonus: number,
  proficient: Record<string, SkillProficiency>,
): CharacterSkill[] {
  return DND5E_SKILLS.map((def: SkillDefinition) => {
    const prof = proficient[def.name] ?? "none";
    const abilityMod = abilities[def.ability].modifier;
    let mod = abilityMod;
    if (prof === "proficient") mod += profBonus;
    else if (prof === "expertise") mod += profBonus * 2;
    return { name: def.name, ability: def.ability, proficiency: prof, modifier: mod };
  });
}

function getProfBonus(level: number): number {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
}

// ─── Eldrin — Elfo Mago Nível 5 ─────────────────────────

const eldrinAbilities: Record<AbilityKey, CharacterAbility> = {
  str: makeAbility(10, false),
  dex: makeAbility(16, false),
  con: makeAbility(13, false),
  int: makeAbility(16, true),
  wis: makeAbility(12, true),
  cha: makeAbility(8, false),
};

const ELDRIN: FullCharacter = {
  id: "char-1",
  name: "Eldrin, o Andarilho",
  playerName: "Maria",
  system: "dnd5e",
  avatarIcon: "wand",
  avatarUrl: null,

  raceId: "elf",
  raceName: "Elfo",
  classId: "wizard",
  className: "Mago",
  level: 5,
  xp: 6500,
  alignment: "NN",

  hp: { current: 32, max: 32, temp: 0 },
  ac: 15,
  initiative: 3,
  speed: 30,
  proficiencyBonus: 3,
  hitDice: { current: 5, max: 5, die: 6 },

  abilities: eldrinAbilities,
  skills: makeSkills(eldrinAbilities, 3, {
    Arcanismo: "proficient",
    "História": "proficient",
    "Investigação": "proficient",
    "Percepção": "proficient",
  }),

  proficiencies: {
    armor: ["Nenhuma"],
    weapons: ["Adagas", "Dardos", "Fundas", "Bordões", "Bestas leves"],
    tools: [],
    languages: ["Comum", "Élfico", "Dracônico"],
  },

  features: [
    {
      id: "feat-1",
      name: "Visão no Escuro",
      source: "race",
      description: "Enxerga 60 pés no escuro em tons de cinza.",
      uses: null,
    },
    {
      id: "feat-2",
      name: "Ancestralidade Feérica",
      source: "race",
      description: "Vantagem em testes de resistência contra encantamento e imunidade a sono mágico.",
      uses: null,
    },
    {
      id: "feat-3",
      name: "Transe",
      source: "race",
      description: "4 horas de meditação equivalem a 8 horas de descanso.",
      uses: null,
    },
    {
      id: "feat-4",
      name: "Recuperação Arcana",
      source: "class",
      description: "Uma vez por dia, durante um descanso curto, recupera slots de magia cujo total de níveis seja igual a metade do nível de mago (arredondado para cima).",
      uses: { current: 1, max: 1, reset: "long" },
    },
    {
      id: "feat-5",
      name: "Tradição: Escola de Evocação",
      source: "class",
      description: "Especialista em magias de evocação que moldam energia destrutiva.",
      uses: null,
    },
    {
      id: "feat-6",
      name: "Esculpir Magias",
      source: "class",
      description: "Ao conjurar uma magia de evocação, pode escolher criaturas para proteger automaticamente do efeito.",
      uses: null,
    },
  ],

  spellcasting: { ability: "int", saveDC: 14, attackBonus: 6 },
  spellSlots: [
    { level: 1, total: 4, used: 0 },
    { level: 2, total: 3, used: 0 },
    { level: 3, total: 2, used: 0 },
  ],
  spells: [
    // Cantrips
    { id: "spell-1", name: "Raio de Fogo", level: 0, school: "Evocação", castingTime: "1 ação", range: "120 pés", components: "V, S", duration: "Instantânea", description: "Arremessa uma porção de fogo em uma criatura. Ataque à distância com magia. Causa 2d10 de dano de fogo.", prepared: true },
    { id: "spell-2", name: "Mão Mágica", level: 0, school: "Conjuração", castingTime: "1 ação", range: "30 pés", components: "V, S", duration: "1 minuto", description: "Uma mão espectral e flutuante aparece para manipular objetos.", prepared: true },
    { id: "spell-3", name: "Luz", level: 0, school: "Evocação", castingTime: "1 ação", range: "Toque", components: "V, M", duration: "1 hora", description: "Um objeto tocado emite luz clara em um raio de 20 pés.", prepared: true },
    { id: "spell-4", name: "Prestidigitação", level: 0, school: "Transmutação", castingTime: "1 ação", range: "10 pés", components: "V, S", duration: "Até 1 hora", description: "Truque mágico menor para efeitos sensoriais.", prepared: true },
    // Level 1
    { id: "spell-5", name: "Mísseis Mágicos", level: 1, school: "Evocação", castingTime: "1 ação", range: "120 pés", components: "V, S", duration: "Instantânea", description: "Três dardos de energia mágica atingem automaticamente, causando 1d4+1 de dano de força cada.", prepared: true },
    { id: "spell-6", name: "Escudo Arcano", level: 1, school: "Abjuração", castingTime: "1 reação", range: "Pessoal", components: "V, S", duration: "1 rodada", description: "+5 na CA até o início do próximo turno, incluindo contra o ataque que ativou.", prepared: true },
    { id: "spell-7", name: "Detectar Magia", level: 1, school: "Adivinhação", castingTime: "1 ação (ritual)", range: "Pessoal", components: "V, S", duration: "Concentração, 10 min", description: "Detecta a presença de magia em 30 pés.", prepared: true },
    { id: "spell-8", name: "Mãos Flamejantes", level: 1, school: "Evocação", castingTime: "1 ação", range: "Pessoal (cone 15 pés)", components: "V, S", duration: "Instantânea", description: "Cone de chamas causa 3d6 de dano de fogo. Teste de resistência DEX para metade.", prepared: true },
    // Level 2
    { id: "spell-9", name: "Invisibilidade", level: 2, school: "Ilusão", castingTime: "1 ação", range: "Toque", components: "V, S, M", duration: "Concentração, 1 hora", description: "A criatura tocada fica invisível até atacar ou conjurar uma magia.", prepared: true },
    { id: "spell-10", name: "Teias", level: 2, school: "Conjuração", castingTime: "1 ação", range: "60 pés", components: "V, S, M", duration: "Concentração, 1 hora", description: "Teias pegajosas preenchem um cubo de 20 pés, restringindo criaturas.", prepared: true },
    { id: "spell-11", name: "Passo Nebuloso", level: 2, school: "Conjuração", castingTime: "1 ação bônus", range: "Pessoal", components: "V", duration: "Instantânea", description: "Teleporta até 30 pés para um espaço desocupado visível.", prepared: true },
    // Level 3
    { id: "spell-12", name: "Bola de Fogo", level: 3, school: "Evocação", castingTime: "1 ação", range: "150 pés", components: "V, S, M", duration: "Instantânea", description: "Esfera de chamas explode em um raio de 20 pés, causando 8d6 de dano de fogo.", prepared: true },
    { id: "spell-13", name: "Voo", level: 3, school: "Transmutação", castingTime: "1 ação", range: "Toque", components: "V, S, M", duration: "Concentração, 10 min", description: "A criatura tocada ganha velocidade de voo de 60 pés.", prepared: true },
  ],

  coins: { cp: 15, sp: 30, ep: 0, gp: 145, pp: 0 },
  inventory: [
    { id: "item-1", name: "Cajado Arcano", category: "weapon", quantity: 1, weight: 4, equipped: true, description: "Foco arcano integrado.", damage: "1d6+3 concussão", attackBonus: 6, properties: ["Versátil (1d8)"] },
    { id: "item-2", name: "Adaga", category: "weapon", quantity: 1, weight: 1, equipped: false, description: "Lâmina curta e leve.", damage: "1d4+3 perfurante", attackBonus: 6, properties: ["Acuidade", "Leve", "Arremesso (20/60)"] },
    { id: "item-3", name: "Mochila do Explorador", category: "gear", quantity: 1, weight: 5, equipped: true, description: "Contém suprimentos básicos de aventura." },
    { id: "item-4", name: "Livro de Magias", category: "gear", quantity: 1, weight: 3, equipped: true, description: "Contém todas as magias conhecidas do mago." },
    { id: "item-5", name: "Foco Arcano (cristal)", category: "gear", quantity: 1, weight: 1, equipped: true, description: "Usado para canalizar magias arcanas." },
    { id: "item-6", name: "Poção de Cura", category: "consumable", quantity: 2, weight: 0.5, equipped: false, description: "Restaura 2d4+2 pontos de vida." },
  ],
  carryCapacity: 150,

  backstory: {
    backgroundId: "sage",
    backgroundName: "Sábio",
    personalityTraits: [
      "Sempre tenho um plano para quando as coisas dão errado.",
      "Uso palavras polissílabas para impressionar.",
    ],
    ideal: "Conhecimento. O caminho para o poder é através do conhecimento.",
    bond: "Busco um livro antigo que contém um segredo terrível.",
    flaw: "Não resisto a um mistério \u2014 mesmo quando é perigoso demais.",
    backstory: "Eldrin cresceu nas torres arcanas de Silverymoon, onde desde jovem demonstrou talento excepcional para as artes arcanas. Filho de um bibliotecário élfico e uma maga humana, herdou de ambos o amor pelo conhecimento e a curiosidade insaciável. Após um incidente envolvendo um portal dimensional que quase destruiu a biblioteca principal, Eldrin foi enviado para estudar sob a tutela de Magister Valeris, um evocador recluso que vivia nas Montanhas da Espinha do Mundo. Durante cinco anos de estudo rigoroso, Eldrin aperfeiçoou suas habilidades de evocação e descobriu referências a um livro chamado 'O Codex das Sombras Primordiais', que supostamente contém o segredo para manipular a fronteira entre os planos Material e Shadowfell.",
    appearance: "Alto e esguio, com cabelos prateados longos e olhos violeta típicos dos altos elfos. Usa vestes azul-escuras com runas bordadas em fio de prata. Carrega sempre seu cajado arcano, encimado por um cristal azulado.",
    age: "127",
    height: "1,80m",
    weight: "65kg",
    eyes: "Violeta",
    hair: "Prateado",
    skin: "Pálida",
  },

  notes: "Investigar a biblioteca do castelo sobre o Codex das Sombras Primordiais.\nO NPC da taverna (Maren) pode ser um espião do Culto da Sombra.\nPróxima sessão: explorar as ruínas sob a cidade.",

  createdAt: "2025-01-15T10:00:00Z",
  updatedAt: "2025-03-01T18:30:00Z",
};

// ─── Kira — Humana Ranger Nível 5 ───────────────────────

const kiraAbilities: Record<AbilityKey, CharacterAbility> = {
  str: makeAbility(14, true),
  dex: makeAbility(16, true),
  con: makeAbility(14, false),
  int: makeAbility(10, false),
  wis: makeAbility(14, false),
  cha: makeAbility(10, false),
};

const KIRA: FullCharacter = {
  id: "char-2",
  name: "Kira Ironfist",
  playerName: "Pedro",
  system: "dnd5e",
  avatarIcon: "sword",
  avatarUrl: null,

  raceId: "human",
  raceName: "Humana",
  classId: "ranger",
  className: "Ranger",
  level: 5,
  xp: 6500,
  alignment: "NB",

  hp: { current: 62, max: 62, temp: 0 },
  ac: 16,
  initiative: 3,
  speed: 30,
  proficiencyBonus: 3,
  hitDice: { current: 5, max: 5, die: 10 },

  abilities: kiraAbilities,
  skills: makeSkills(kiraAbilities, 3, {
    "Sobrevivência": "proficient",
    "Percepção": "proficient",
    Furtividade: "proficient",
    Natureza: "proficient",
    Atletismo: "proficient",
  }),

  proficiencies: {
    armor: ["Leve", "Média", "Escudo"],
    weapons: ["Simples", "Marciais"],
    tools: [],
    languages: ["Comum", "Goblin"],
  },

  features: [
    { id: "feat-k1", name: "Inimigo Favorecido", source: "class", description: "Mortos-vivos: +2 em dano e vantagem em testes para rastrear.", uses: null },
    { id: "feat-k2", name: "Explorador Natural", source: "class", description: "Vantagem em testes de sobrevivência em florestas. Não é retardado por terreno difícil.", uses: null },
    { id: "feat-k3", name: "Ataque Extra", source: "class", description: "Pode atacar duas vezes ao usar a ação de Ataque.", uses: null },
    { id: "feat-k4", name: "Cura Primordial", source: "class", description: "Restaura pontos de vida via toque. Total: 5 × nível de ranger por dia.", uses: { current: 25, max: 25, reset: "long" } },
  ],

  spellcasting: null,
  spellSlots: [],
  spells: [],

  coins: { cp: 0, sp: 50, ep: 0, gp: 230, pp: 5 },
  inventory: [
    { id: "item-k1", name: "Arco Longo", category: "weapon", quantity: 1, weight: 2, equipped: true, description: "Arco de combate de longo alcance.", damage: "1d8+3 perfurante", attackBonus: 6, properties: ["Munição (150/600)", "Pesada", "Duas mãos"] },
    { id: "item-k2", name: "Espadas Curtas (par)", category: "weapon", quantity: 2, weight: 2, equipped: true, description: "Lâminas rápidas para combate corpo a corpo.", damage: "1d6+3 perfurante", attackBonus: 6, properties: ["Acuidade", "Leve"] },
    { id: "item-k3", name: "Cota de Malha", category: "armor", quantity: 1, weight: 20, equipped: true, description: "Armadura média feita de anéis metálicos entrelaçados.", armorClass: 16 },
    { id: "item-k4", name: "Aljava", category: "gear", quantity: 1, weight: 1, equipped: true, description: "Contém 20 flechas." },
    { id: "item-k5", name: "Mochila do Explorador", category: "gear", quantity: 1, weight: 5, equipped: true, description: "Suprimentos de aventura." },
    { id: "item-k6", name: "Corda de Seda (50 pés)", category: "gear", quantity: 1, weight: 5, equipped: false, description: "Corda fina e resistente." },
  ],
  carryCapacity: 210,

  backstory: {
    backgroundId: "outlander",
    backgroundName: "Forasteira",
    personalityTraits: [
      "Observo tudo ao meu redor, sempre alerta para perigos.",
    ],
    ideal: "Liberdade. Ninguém deve ser escravizado ou aprisionado.",
    bond: "Minha família foi dizimada por mortos-vivos. Juro proteger os vivos.",
    flaw: "Confio demais em meus instintos e ignoro conselhos dos outros.",
    backstory: "Kira cresceu em uma vila na fronteira, treinada desde cedo para defender sua comunidade contra ameaças da floresta selvagem.",
    appearance: "Mulher forte e ágil, com cabelos castanhos curtos e cicatrizes de batalha nos braços.",
    age: "28",
    height: "1,72m",
    weight: "70kg",
    eyes: "Castanhos",
    hair: "Castanho curto",
    skin: "Bronzeada",
  },

  notes: "Rastrear o bando de goblins que atacou a caravana.",

  createdAt: "2025-02-01T14:00:00Z",
  updatedAt: "2025-03-01T18:30:00Z",
};

// ─── Zael — Tiefling Feiticeiro Nível 4 ─────────────────

const zaelAbilities: Record<AbilityKey, CharacterAbility> = {
  str: makeAbility(8, false),
  dex: makeAbility(14, false),
  con: makeAbility(14, true),
  int: makeAbility(10, false),
  wis: makeAbility(12, false),
  cha: makeAbility(18, true),
};

const ZAEL: FullCharacter = {
  id: "char-3",
  name: "Zael",
  playerName: "Ana",
  system: "dnd5e",
  avatarIcon: "crosshair",
  avatarUrl: null,

  raceId: "tiefling",
  raceName: "Tiefling",
  classId: "sorcerer",
  className: "Feiticeiro",
  level: 4,
  xp: 2700,
  alignment: "CN",

  hp: { current: 18, max: 28, temp: 0 },
  ac: 13,
  initiative: 2,
  speed: 30,
  proficiencyBonus: 2,
  hitDice: { current: 4, max: 4, die: 6 },

  abilities: zaelAbilities,
  skills: makeSkills(zaelAbilities, 2, {
    "Persuasão": "proficient",
    "Enganação": "proficient",
    Arcanismo: "proficient",
  }),

  proficiencies: {
    armor: ["Nenhuma"],
    weapons: ["Adagas", "Dardos", "Fundas", "Bordões", "Bestas leves"],
    tools: [],
    languages: ["Comum", "Infernal"],
  },

  features: [
    { id: "feat-z1", name: "Visão no Escuro", source: "race", description: "Enxerga 60 pés no escuro.", uses: null },
    { id: "feat-z2", name: "Resistência Infernal", source: "race", description: "Resistência a dano de fogo.", uses: null },
    { id: "feat-z3", name: "Origem Dracônica", source: "class", description: "Dragão Vermelho \u2014 resistência a fogo, escamas dracônicas (+1 CA sem armadura).", uses: null },
    { id: "feat-z4", name: "Pontos de Feitiçaria", source: "class", description: "Usa pontos para metamagia e converter slots.", uses: { current: 3, max: 4, reset: "long" } },
    { id: "feat-z5", name: "Metamagia", source: "class", description: "Magia Acelerada (2 pontos), Magia Sutil (1 ponto).", uses: null },
  ],

  spellcasting: { ability: "cha", saveDC: 14, attackBonus: 6 },
  spellSlots: [
    { level: 1, total: 4, used: 1 },
    { level: 2, total: 3, used: 0 },
  ],
  spells: [
    { id: "spell-z1", name: "Rajada de Fogo", level: 0, school: "Evocação", castingTime: "1 ação", range: "120 pés", components: "V, S", duration: "Instantânea", description: "Arremessa fogo. 2d10 dano de fogo.", prepared: true },
    { id: "spell-z2", name: "Toque Chocante", level: 0, school: "Evocação", castingTime: "1 ação", range: "Toque", components: "V, S", duration: "Instantânea", description: "Relâmpago no toque. 1d8 dano elétrico.", prepared: true },
    { id: "spell-z3", name: "Mãos Flamejantes", level: 1, school: "Evocação", castingTime: "1 ação", range: "Pessoal (cone 15 pés)", components: "V, S", duration: "Instantânea", description: "Cone de chamas: 3d6 dano de fogo.", prepared: true },
    { id: "spell-z4", name: "Escudo Arcano", level: 1, school: "Abjuração", castingTime: "1 reação", range: "Pessoal", components: "V, S", duration: "1 rodada", description: "+5 CA até o próximo turno.", prepared: true },
    { id: "spell-z5", name: "Lufada de Vento", level: 2, school: "Evocação", castingTime: "1 ação", range: "Pessoal (linha 60 pés)", components: "V, S, M", duration: "Concentração, 1 min", description: "Rajada de vento em linha. Empurra criaturas e apaga chamas.", prepared: true },
    { id: "spell-z6", name: "Espelho Arcano", level: 2, school: "Ilusão", castingTime: "1 ação", range: "Pessoal", components: "V, S", duration: "1 minuto", description: "Três duplicatas ilusórias aparecem. Ataques podem acertar as duplicatas.", prepared: true },
  ],

  coins: { cp: 5, sp: 10, ep: 0, gp: 78, pp: 0 },
  inventory: [
    { id: "item-z1", name: "Adaga", category: "weapon", quantity: 2, weight: 1, equipped: true, description: "Lâminas leves para combate rápido.", damage: "1d4+2 perfurante", attackBonus: 4, properties: ["Acuidade", "Leve", "Arremesso (20/60)"] },
    { id: "item-z2", name: "Foco Arcano (orbe)", category: "gear", quantity: 1, weight: 1, equipped: true, description: "Orbe cristalino pulsante com energia interior." },
    { id: "item-z3", name: "Mochila do Explorador", category: "gear", quantity: 1, weight: 5, equipped: true, description: "Suprimentos básicos de aventura." },
    { id: "item-z4", name: "Poção de Cura", category: "consumable", quantity: 1, weight: 0.5, equipped: false, description: "Restaura 2d4+2 PV." },
  ],
  carryCapacity: 120,

  backstory: {
    backgroundId: "charlatan",
    backgroundName: "Charlatão",
    personalityTraits: [
      "Sempre tenho um sorriso no rosto, mesmo quando tudo está desmoronando.",
    ],
    ideal: "Independência. Ninguém me diz o que fazer.",
    bond: "Devo uma dívida perigosa a um poderoso feiticeiro.",
    flaw: "Minto compulsivamente, mesmo quando não é necessário.",
    backstory: "Zael nasceu nas ruas de Baldur's Gate, descobrindo seus poderes arcanos durante um golpe que deu errado. O sangue infernal corre forte em suas veias.",
    appearance: "Pele avermelhada, chifres curvados para trás, olhos dourados brilhantes. Veste roupas escuras com detalhes em vermelho.",
    age: "23",
    height: "1,75m",
    weight: "68kg",
    eyes: "Dourados",
    hair: "Negro",
    skin: "Avermelhada",
  },

  notes: "Descobrir quem é o feiticeiro que cobra minha dívida.",

  createdAt: "2025-02-15T09:00:00Z",
  updatedAt: "2025-03-01T18:30:00Z",
};

// ─── Export ─────────────────────────────────────────────

export const MOCK_FULL_CHARACTERS: Record<string, FullCharacter> = {
  "char-1": ELDRIN,
  "char-2": KIRA,
  "char-3": ZAEL,
};

// Maps gameplay token IDs to character IDs
export const TOKEN_TO_CHARACTER_MAP: Record<string, string> = {
  "tok_eldrin": "char-1",
  "tok_kira": "char-2",
  "tok_zael": "char-3",
};
