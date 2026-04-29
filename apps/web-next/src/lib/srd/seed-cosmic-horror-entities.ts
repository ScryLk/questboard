// ── Bestiário Mythos Lovecraftiano (domínio público) ──
//
// Entidades narradas em obras de H.P. Lovecraft (†1937), em domínio
// público nos EUA. Stats originais do QuestBoard — não copiamos
// estatísticas de produtos comerciais. Descrições parafraseadas a
// partir do material público das obras.

import type { CosmicHorrorEntity } from "@/types/cosmic-horror-srd";
import {
  makeLovecraftAttribution,
  makeQuestboardOriginalAttribution,
} from "./cosmic-horror-attribution";

export const SEED_COSMIC_HORROR_ENTITIES: CosmicHorrorEntity[] = [
  // ── Grandes Antigos & Outros Deuses ──
  {
    slug: "cthulhu",
    name: "Cthulhu",
    nameEn: "Cthulhu",
    category: "GREAT_OLD_ONE",
    dread: "INCOMPREHENSIBLE",
    sanityCost: "1d10/1d100",
    description:
      "Vasto sacerdote adormecido sob o oceano, em R'lyeh. Lovecraftiana descrição: " +
      "polvo, dragão e caricatura humana fundidos em forma ciclópica. Sua presença " +
      "telepática invade sonhos e é capaz de quebrar mentes pela mera percepção.",
    source: "Lovecraft, 'O Chamado de Cthulhu' (1928)",
    attributes: { for: 250, con: 200, tam: 320, des: 75, int: 200, pod: 240 },
    hitPoints: 520,
    moveRate: 12,
    damageBonus: "+11d6",
    build: 19,
    fightingSkill: 100,
    armor: 25,
    weapons: [
      { name: "Tentáculos", skill: 100, damage: "Garra + Engolimento" },
    ],
    abilities: [
      {
        name: "Visão impossível",
        description:
          "Investigadores que enxerguem Cthulhu inteiro perdem 1d10/1d100 de SAN sem chance de defesa.",
      },
      {
        name: "Regeneração",
        description:
          "Recompõe seu corpo continuamente — danos demoram horas para se manifestar.",
      },
    ],
    spells: [],
    attribution: makeLovecraftAttribution("'O Chamado de Cthulhu' (1928)"),
  },
  {
    slug: "dagon",
    name: "Dagon",
    nameEn: "Dagon",
    category: "GREAT_OLD_ONE",
    dread: "ELDRITCH",
    sanityCost: "1d6/1d20",
    description:
      "Entidade primordial de profundezas marinhas. Forma colossal de homem-peixe " +
      "que emerge em ilhas perdidas para venerar deuses ainda mais antigos.",
    source: "Lovecraft, 'Dagon' (1919)",
    attributes: { for: 200, con: 150, tam: 280, des: 50, int: 80, pod: 120 },
    hitPoints: 215,
    moveRate: 10,
    damageBonus: "+8d6",
    build: 14,
    fightingSkill: 80,
    armor: 12,
    weapons: [{ name: "Garra", skill: 80, damage: "1d10+8d6" }],
    abilities: [
      {
        name: "Comandar Profundos",
        description:
          "Convoca cardumes de Profundos em qualquer corpo d'água conectado ao oceano.",
      },
    ],
    attribution: makeLovecraftAttribution("'Dagon' (1919)"),
  },
  {
    slug: "azathoth",
    name: "Azathoth",
    nameEn: "Azathoth",
    category: "OUTER_GOD",
    dread: "INCOMPREHENSIBLE",
    sanityCost: "1d20/instalouca",
    description:
      "O Sultão Demoníaco entronado no centro do caos cósmico. Massa amorfa " +
      "borbulhante embalada por flautas idiotas. Vê-lo significa enlouquecer.",
    source: "Lovecraft, 'Azathoth' (1922) e 'Os Sonhos na Casa da Bruxa' (1933)",
    attributes: { pod: 600 },
    hitPoints: 999,
    moveRate: 0,
    abilities: [
      {
        name: "Presença insuportável",
        description:
          "Qualquer mente humana exposta ao olhar de Azathoth perde toda a SAN restante.",
      },
    ],
    attribution: makeLovecraftAttribution("'Azathoth' (1922)"),
  },
  {
    slug: "nyarlathotep",
    name: "Nyarlathotep",
    nameEn: "Nyarlathotep",
    category: "OUTER_GOD",
    dread: "ELDRITCH",
    sanityCost: "1d10/1d100",
    description:
      "O Caos Rastejante. Mensageiro dos Outros Deuses com mil formas — pode " +
      "aparecer como faraó negro, profeta carismático ou horror inumano.",
    source: "Lovecraft, 'Nyarlathotep' (1920)",
    attributes: { for: 100, con: 200, tam: 150, des: 150, int: 250, pod: 300 },
    hitPoints: 175,
    moveRate: 12,
    fightingSkill: 95,
    armor: 10,
    weapons: [{ name: "Toque entrópico", skill: 95, damage: "1d6 + dreno de SAN" }],
    abilities: [
      {
        name: "Mil Máscaras",
        description:
          "Manifesta-se em formas humanas plausíveis. Detectar requer Psicologia Difícil.",
      },
      {
        name: "Conhecimento proibido",
        description:
          "Pode ensinar feitiços do Mythos a um culto em troca de devoção.",
      },
    ],
    attribution: makeLovecraftAttribution("'Nyarlathotep' (1920)"),
  },
  {
    slug: "yog-sothoth",
    name: "Yog-Sothoth",
    nameEn: "Yog-Sothoth",
    category: "OUTER_GOD",
    dread: "INCOMPREHENSIBLE",
    sanityCost: "1d20/1d100",
    description:
      "O Tudo-em-Um. Conglomerado de globos iridescentes coexistindo fora do " +
      "tempo. Conhece todo o passado e todo o futuro simultaneamente.",
    source: "Lovecraft, 'O Caso Charles Dexter Ward' (1927) e 'O Horror de Dunwich' (1929)",
    attributes: { pod: 500, int: 400 },
    hitPoints: 999,
    moveRate: 0,
    abilities: [
      {
        name: "Portal vivo",
        description:
          "Quem invoca Yog-Sothoth pode atravessar dimensões — mas ele exige preço alto.",
      },
    ],
    attribution: makeLovecraftAttribution("'O Horror de Dunwich' (1929)"),
  },
  {
    slug: "shub-niggurath",
    name: "Shub-Niggurath",
    nameEn: "Shub-Niggurath",
    category: "OUTER_GOD",
    dread: "ELDRITCH",
    sanityCost: "1d10/1d100",
    description:
      "A Cabra Negra dos Bosques com Mil Filhotes. Manifestação de fertilidade " +
      "obscena que pare horrores menores em cultos pagãos.",
    source: "Lovecraft, 'O Sussurrador nas Trevas' (1931)",
    attributes: { for: 200, con: 250, tam: 240, des: 100, int: 200, pod: 300 },
    hitPoints: 245,
    moveRate: 9,
    damageBonus: "+9d6",
    fightingSkill: 90,
    armor: 15,
    abilities: [
      {
        name: "Filhotes",
        description:
          "Gera 1d6 servos menores por rodada em ritual prolongado. GM cria stats narrativamente.",
      },
    ],
    attribution: makeLovecraftAttribution("'O Sussurrador nas Trevas' (1931)"),
  },

  // ── Raças alienígenas ──
  {
    slug: "deep-one",
    name: "Profundo",
    nameEn: "Deep One",
    category: "ALIEN_RACE",
    dread: "TERRIFYING",
    sanityCost: "0/1d6",
    description:
      "Anfíbio inteligente com escamas iridescentes, olhos esbugalhados e guelras. " +
      "Imortais até a morte violenta — vivem em cidades submarinas como Y'ha-nthlei.",
    source: "Lovecraft, 'A Sombra sobre Innsmouth' (1936)",
    attributes: { for: 75, con: 65, tam: 65, des: 50, int: 65, pod: 50 },
    hitPoints: 13,
    moveRate: 8,
    damageBonus: "+1d4",
    build: 1,
    fightingSkill: 50,
    dodgeSkill: 25,
    armor: 1,
    weapons: [
      { name: "Garras", skill: 50, damage: "1d6+1d4" },
      { name: "Tridente", skill: 50, damage: "1d6+1+1d4" },
    ],
    attribution: makeLovecraftAttribution("'A Sombra sobre Innsmouth' (1936)"),
  },
  {
    slug: "deep-one-hybrid",
    name: "Híbrido de Profundo",
    nameEn: "Deep One Hybrid",
    category: "HUMAN_CORRUPTED",
    dread: "UNNATURAL",
    sanityCost: "0/1d6",
    description:
      "Filho de humano e Profundo. Nasce com aparência humana mas degenera " +
      "lentamente — olhos saltados, pele escamada — até descer ao mar.",
    source: "Lovecraft, 'A Sombra sobre Innsmouth' (1936)",
    attributes: { for: 60, con: 60, tam: 65, des: 55, int: 60, pod: 55 },
    hitPoints: 12,
    moveRate: 8,
    fightingSkill: 45,
    dodgeSkill: 22,
    weapons: [{ name: "Soco", skill: 45, damage: "1d3" }],
    attribution: makeLovecraftAttribution("'A Sombra sobre Innsmouth' (1936)"),
  },
  {
    slug: "shoggoth",
    name: "Shoggoth",
    nameEn: "Shoggoth",
    category: "ALIEN_RACE",
    dread: "ELDRITCH",
    sanityCost: "1d6/1d20",
    description:
      "Massa protoplásmica negra criada pelas Coisas Antigas como serva. Forma " +
      "olhos e bocas pulsantes a vontade. Tekeli-li.",
    source: "Lovecraft, 'Nas Montanhas da Loucura' (1936)",
    attributes: { for: 350, con: 200, tam: 350, des: 60, int: 50, pod: 75 },
    hitPoints: 55,
    moveRate: 10,
    damageBonus: "+13d6",
    build: 19,
    fightingSkill: 60,
    armor: 0,
    weapons: [
      { name: "Esmagar", skill: 60, damage: "Build + 1d10" },
      { name: "Engolir", skill: 50, damage: "1d6 por rodada (digestão ácida)" },
    ],
    abilities: [
      {
        name: "Imune a armas convencionais",
        description:
          "Apenas fogo intenso, eletricidade ou explosivos causam dano consistente.",
      },
    ],
    attribution: makeLovecraftAttribution("'Nas Montanhas da Loucura' (1936)"),
  },
  {
    slug: "elder-thing",
    name: "Coisa Antiga",
    nameEn: "Elder Thing",
    category: "ALIEN_RACE",
    dread: "ELDRITCH",
    sanityCost: "1/1d10",
    description:
      "Vegetal-animal alienígena com asas membranosas e cabeça-estrela. " +
      "Construtores antigos da Antártica, anteriores à humanidade.",
    source: "Lovecraft, 'Nas Montanhas da Loucura' (1936)",
    attributes: { for: 75, con: 70, tam: 80, des: 60, int: 100, pod: 100 },
    hitPoints: 15,
    moveRate: 8,
    fightingSkill: 50,
    dodgeSkill: 30,
    armor: 3,
    weapons: [{ name: "Tentáculos", skill: 50, damage: "1d6+1d4" }],
    abilities: [
      {
        name: "Voo planado",
        description: "Pode planar quando ressuscitado de hibernação.",
      },
    ],
    attribution: makeLovecraftAttribution("'Nas Montanhas da Loucura' (1936)"),
  },
  {
    slug: "mi-go",
    name: "Mi-Go (Fungos de Yuggoth)",
    nameEn: "Mi-Go",
    category: "ALIEN_RACE",
    dread: "TERRIFYING",
    sanityCost: "1/1d8",
    description:
      "Fungos crustáceos voadores de Plutão. Coletam cérebros humanos em " +
      "cilindros de metal pra estudo. Cirurgiões cósmicos.",
    source: "Lovecraft, 'O Sussurrador nas Trevas' (1931)",
    attributes: { for: 50, con: 60, tam: 50, des: 80, int: 100, pod: 90 },
    hitPoints: 11,
    moveRate: 7,
    fightingSkill: 50,
    dodgeSkill: 40,
    armor: 4,
    weapons: [
      { name: "Garras", skill: 50, damage: "1d6" },
      { name: "Arma alienígena", skill: 50, damage: "Variável (1d10 elétrico)" },
    ],
    abilities: [
      {
        name: "Voo interplanetário",
        description:
          "Asas membranosas funcionam no éter — viajam entre Plutão e a Terra.",
      },
      {
        name: "Cilindro de cérebro",
        description:
          "Removem cérebros humanos cirurgicamente, mantém vivos em containers.",
      },
    ],
    attribution: makeLovecraftAttribution("'O Sussurrador nas Trevas' (1931)"),
  },
  {
    slug: "yithian",
    name: "Grande Raça de Yith",
    nameEn: "Yithian",
    category: "ALIEN_RACE",
    dread: "TERRIFYING",
    sanityCost: "1/1d6",
    description:
      "Cones rugosos de matéria viva, com tentáculos terminando em garras, " +
      "olhos compostos e bocas em forma de flor. Mestres da projeção temporal.",
    source: "Lovecraft, 'A Sombra Vinda do Tempo' (1936)",
    attributes: { for: 110, con: 90, tam: 120, des: 50, int: 120, pod: 100 },
    hitPoints: 21,
    moveRate: 7,
    damageBonus: "+1d6",
    fightingSkill: 60,
    armor: 4,
    weapons: [{ name: "Tentáculo", skill: 60, damage: "1d6+1d6" }],
    abilities: [
      {
        name: "Troca de mentes",
        description:
          "Em cerimônia ritual, projeta sua consciência para o corpo de uma vítima através do tempo.",
      },
    ],
    attribution: makeLovecraftAttribution("'A Sombra Vinda do Tempo' (1936)"),
  },
  {
    slug: "flying-polyp",
    name: "Pólipo Voador",
    nameEn: "Flying Polyp",
    category: "ALIEN_RACE",
    dread: "ELDRITCH",
    sanityCost: "1d6/1d20",
    description:
      "Pólipos translúcidos parcialmente fora do espaço-tempo. Antigos " +
      "inimigos da Grande Raça de Yith, presos no subterrâneo terrestre.",
    source: "Lovecraft, 'A Sombra Vinda do Tempo' (1936)",
    attributes: { for: 200, con: 150, tam: 200, des: 90, int: 100, pod: 120 },
    hitPoints: 35,
    moveRate: 10,
    damageBonus: "+5d6",
    fightingSkill: 70,
    dodgeSkill: 35,
    armor: 5,
    weapons: [{ name: "Vento ácido", skill: 70, damage: "2d6 dano + cegueira" }],
    abilities: [
      {
        name: "Parcialmente intangível",
        description:
          "Recebe dano apenas de armas elétricas ou ataques mágicos consagrados.",
      },
    ],
    attribution: makeLovecraftAttribution("'A Sombra Vinda do Tempo' (1936)"),
  },
  {
    slug: "ghoul",
    name: "Carniçal",
    nameEn: "Ghoul",
    category: "ALIEN_RACE",
    dread: "TERRIFYING",
    sanityCost: "1/1d6",
    description:
      "Humanoide degenerado com características caninas. Habita catacumbas " +
      "e cemitérios — alimenta-se de cadáveres. Alguns foram humanos.",
    source: "Lovecraft, 'O Modelo de Pickman' (1927)",
    attributes: { for: 75, con: 65, tam: 65, des: 65, int: 65, pod: 65 },
    hitPoints: 13,
    moveRate: 9,
    damageBonus: "+1d4",
    build: 1,
    fightingSkill: 50,
    dodgeSkill: 32,
    armor: 0,
    weapons: [
      { name: "Garras", skill: 50, damage: "1d6+1d4" },
      { name: "Mordida", skill: 30, damage: "1d4+1d4" },
    ],
    abilities: [
      {
        name: "Visão na escuridão",
        description: "Enxerga em escuridão total como em luz plena.",
      },
    ],
    attribution: makeLovecraftAttribution("'O Modelo de Pickman' (1927)"),
  },
  {
    slug: "night-gaunt",
    name: "Magro Noturno",
    nameEn: "Night-gaunt",
    category: "DREAM_LANDS",
    dread: "TERRIFYING",
    sanityCost: "0/1d6",
    description:
      "Criatura negra esguia com asas membranosas, chifres curvos e cauda farpada. " +
      "Não tem rosto. Carrega vítimas para abismos do Reino dos Sonhos.",
    source: "Lovecraft, 'A Busca Onírica de Kadath Desconhecida' (escrita 1926-27)",
    attributes: { for: 70, con: 70, tam: 70, des: 100, int: 80, pod: 70 },
    hitPoints: 14,
    moveRate: 10,
    fightingSkill: 50,
    dodgeSkill: 50,
    armor: 0,
    weapons: [{ name: "Garras", skill: 50, damage: "1d6" }],
    abilities: [
      {
        name: "Cócegas paralisantes",
        description:
          "Vítima agarrada testa CON difícil — falha = paralisia por 1d6 rodadas.",
      },
      { name: "Voo silencioso", description: "Aparece sem som ou aviso." },
    ],
    attribution: makeLovecraftAttribution("'A Busca Onírica de Kadath' (1926-27)"),
  },
  {
    slug: "moon-beast",
    name: "Besta Lunar",
    nameEn: "Moon-beast",
    category: "DREAM_LANDS",
    dread: "TERRIFYING",
    sanityCost: "1/1d8",
    description:
      "Sapo branco-acinzentado de tamanho humano com tentáculos rosados " +
      "no focinho. Comerciantes cruéis dos mares oníricos.",
    source: "Lovecraft, 'A Busca Onírica de Kadath Desconhecida'",
    attributes: { for: 90, con: 75, tam: 100, des: 60, int: 70, pod: 70 },
    hitPoints: 17,
    moveRate: 7,
    damageBonus: "+1d6",
    fightingSkill: 45,
    armor: 2,
    weapons: [
      { name: "Garras", skill: 45, damage: "1d6+1d6" },
      { name: "Chicote", skill: 35, damage: "1d6+1d6" },
    ],
    attribution: makeLovecraftAttribution("'A Busca Onírica de Kadath'"),
  },
  {
    slug: "gug",
    name: "Gug",
    nameEn: "Gug",
    category: "DREAM_LANDS",
    dread: "ELDRITCH",
    sanityCost: "1d3/1d10",
    description:
      "Gigante coberto de pelo negro, com boca vertical no rosto e " +
      "braços bifurcados terminando em duas mãos cada. Habita cavernas oníricas.",
    source: "Lovecraft, 'A Busca Onírica de Kadath Desconhecida'",
    attributes: { for: 250, con: 130, tam: 280, des: 60, int: 50, pod: 70 },
    hitPoints: 41,
    moveRate: 9,
    damageBonus: "+8d6",
    build: 14,
    fightingSkill: 50,
    armor: 6,
    weapons: [{ name: "Garras (4)", skill: 50, damage: "1d10+8d6" }],
    attribution: makeLovecraftAttribution("'A Busca Onírica de Kadath'"),
  },
  {
    slug: "byakhee",
    name: "Byakhee",
    nameEn: "Byakhee",
    category: "LESSER_SERVITOR",
    dread: "TERRIFYING",
    sanityCost: "1/1d6",
    description:
      "Híbrido alado de inseto, abutre e formiga. Servo dos Outros Deuses " +
      "convocado por feitiços específicos para voos interestelares.",
    source: "Lovecraft, 'O Festival' (1925)",
    attributes: { for: 90, con: 90, tam: 100, des: 80, int: 80, pod: 70 },
    hitPoints: 19,
    moveRate: 8,
    damageBonus: "+1d6",
    fightingSkill: 50,
    armor: 2,
    weapons: [
      { name: "Garras", skill: 50, damage: "1d6+1d6" },
      { name: "Tromba sugadora", skill: 30, damage: "1d6 dreno de sangue" },
    ],
    attribution: makeLovecraftAttribution("'O Festival' (1925)"),
  },
  {
    slug: "color-out-of-space",
    name: "Cor que Caiu do Céu",
    nameEn: "Colour out of Space",
    category: "ANOMALY",
    dread: "ELDRITCH",
    sanityCost: "1d6/1d6",
    description:
      "Anomalia visível como matiz que não existe no espectro humano. " +
      "Drena vida de plantas, animais e mentes — corrompe ecossistemas inteiros.",
    source: "Lovecraft, 'A Cor que Caiu do Céu' (1927)",
    attributes: { pod: 100 },
    hitPoints: 0,
    moveRate: 8,
    abilities: [
      {
        name: "Drenagem vital",
        description:
          "Toda criatura na área perde 1d6 CON por noite. Plantas e animais ficam cinzentos e quebradiços.",
      },
      {
        name: "Imune a violência física",
        description:
          "Não há corpo a ferir — apenas selo mágico ou abandono da área salva.",
      },
    ],
    attribution: makeLovecraftAttribution("'A Cor que Caiu do Céu' (1927)"),
  },
  {
    slug: "brown-jenkin",
    name: "Coisa-Rato (Jenkin Pardo)",
    nameEn: "Brown Jenkin",
    category: "LESSER_SERVITOR",
    dread: "UNNATURAL",
    sanityCost: "0/1d6",
    description:
      "Rato de tamanho excessivo com mãozinhas humanas e rosto barbado " +
      "minúsculo. Familiar da Bruxa de Arkham.",
    source: "Lovecraft, 'Os Sonhos na Casa da Bruxa' (1933)",
    attributes: { for: 5, con: 30, tam: 5, des: 90, int: 60, pod: 60 },
    hitPoints: 4,
    moveRate: 9,
    fightingSkill: 50,
    dodgeSkill: 60,
    weapons: [{ name: "Mordida", skill: 50, damage: "1d3 + veneno" }],
    abilities: [
      {
        name: "Falar idiomas",
        description: "Sussurra em latim, inglês e árabe distorcido.",
      },
    ],
    attribution: makeLovecraftAttribution("'Os Sonhos na Casa da Bruxa' (1933)"),
  },

  // ── Cultistas humanos genéricos ──
  {
    slug: "cultist-leader",
    name: "Líder de Culto",
    nameEn: "Cult Leader",
    category: "HUMAN",
    dread: "MUNDANE",
    sanityCost: "0/0",
    description:
      "Sumo-sacerdote ou matriarca de um culto Mythos. Conhecedor de feitiços, " +
      "geralmente já perdeu boa parte da humanidade.",
    source: "Genérico — QuestBoard",
    attributes: { for: 60, con: 65, tam: 70, des: 60, int: 80, pod: 80 },
    hitPoints: 13,
    moveRate: 8,
    fightingSkill: 50,
    dodgeSkill: 30,
    weapons: [
      { name: "Adaga ritualística", skill: 50, damage: "1d4+2" },
      { name: "Revólver", skill: 50, damage: "1d10" },
    ],
    spells: ["contact-cthulhu", "summon-servitor"],
    attribution: makeQuestboardOriginalAttribution("Tipo genérico de NPC"),
  },
  {
    slug: "cultist-follower",
    name: "Seguidor de Culto",
    nameEn: "Cult Follower",
    category: "HUMAN",
    dread: "MUNDANE",
    sanityCost: "0/0",
    description:
      "Devoto comum. Fanático mas inexperiente em magia. Útil em tropas.",
    source: "Genérico — QuestBoard",
    attributes: { for: 60, con: 60, tam: 65, des: 55, int: 60, pod: 60 },
    hitPoints: 12,
    moveRate: 8,
    fightingSkill: 35,
    dodgeSkill: 27,
    weapons: [
      { name: "Faca", skill: 35, damage: "1d4" },
      { name: "Cassetete", skill: 35, damage: "1d6" },
    ],
    attribution: makeQuestboardOriginalAttribution("Tipo genérico de NPC"),
  },
  {
    slug: "armed-thug",
    name: "Capanga Armado",
    nameEn: "Armed Thug",
    category: "HUMAN",
    dread: "MUNDANE",
    sanityCost: "0/0",
    description:
      "Mercenário ou criminoso a serviço do antagonista. Profissional, " +
      "mas humano comum.",
    source: "Genérico — QuestBoard",
    attributes: { for: 75, con: 70, tam: 70, des: 65, int: 50, pod: 50 },
    hitPoints: 14,
    moveRate: 8,
    damageBonus: "+1d4",
    fightingSkill: 50,
    dodgeSkill: 32,
    weapons: [
      { name: "Soco", skill: 50, damage: "1d3+1d4" },
      { name: "Pistola .38", skill: 50, damage: "1d10" },
      { name: "Cassetete", skill: 50, damage: "1d8" },
    ],
    attribution: makeQuestboardOriginalAttribution("Tipo genérico de NPC"),
  },
  {
    slug: "innsmouth-resident",
    name: "Residente de Innsmouth",
    nameEn: "Innsmouth Resident",
    category: "HUMAN_CORRUPTED",
    dread: "UNNATURAL",
    sanityCost: "0/1d4",
    description:
      "Habitante da cidade portuária amaldiçoada, em estágios variados de " +
      "transformação para Profundo. Olhar fixo, andar peculiar.",
    source: "Lovecraft, 'A Sombra sobre Innsmouth' (1936)",
    attributes: { for: 65, con: 65, tam: 65, des: 50, int: 60, pod: 55 },
    hitPoints: 13,
    moveRate: 7,
    fightingSkill: 40,
    dodgeSkill: 25,
    weapons: [
      { name: "Soco", skill: 40, damage: "1d3" },
      { name: "Faca de pesca", skill: 35, damage: "1d4+1" },
    ],
    attribution: makeLovecraftAttribution("'A Sombra sobre Innsmouth' (1936)"),
  },

  // ── Animais úteis ──
  {
    slug: "wolf",
    name: "Lobo",
    nameEn: "Wolf",
    category: "ANIMAL",
    dread: "MUNDANE",
    sanityCost: "0/0",
    description: "Predador comum de florestas frias.",
    source: "Genérico",
    attributes: { for: 50, con: 50, tam: 40, des: 70 },
    hitPoints: 9,
    moveRate: 12,
    fightingSkill: 35,
    dodgeSkill: 30,
    weapons: [{ name: "Mordida", skill: 35, damage: "1d8" }],
    attribution: makeQuestboardOriginalAttribution("Animal genérico"),
  },
  {
    slug: "guard-dog",
    name: "Cão de Guarda",
    nameEn: "Guard Dog",
    category: "ANIMAL",
    dread: "MUNDANE",
    sanityCost: "0/0",
    description: "Cão treinado para proteção, alta agressividade.",
    source: "Genérico",
    attributes: { for: 40, con: 50, tam: 35, des: 70 },
    hitPoints: 8,
    moveRate: 12,
    fightingSkill: 35,
    weapons: [{ name: "Mordida", skill: 35, damage: "1d8" }],
    attribution: makeQuestboardOriginalAttribution("Animal genérico"),
  },
];
