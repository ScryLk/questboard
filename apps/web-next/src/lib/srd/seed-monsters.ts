// ── Seed mock de monstros do SRD 5.1 ──
//
// 8 monstros cobrindo CR 1/8 a 13 pra testar filtros de Challenge
// Rating e variedade de tipos. SRD 5.1 (CC-BY 4.0).

import type { SrdMonster } from "@/types/srd";
import { makeOfficialSrdAttribution } from "./attribution";

const ATTR = makeOfficialSrdAttribution("SRD 5.1 §6");

export const SEED_MONSTERS: SrdMonster[] = [
  {
    slug: "goblin",
    name: "Goblin",
    nameEn: "Goblin",
    size: "small",
    type: "humanoid (goblinoide)",
    alignment: "neutro mau",
    armorClass: 15,
    armorClassDescription: "armadura de couro, escudo",
    hitPoints: 7,
    hitDice: "2d6",
    speed: { walk: 9 },
    attributes: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    skills: { stealth: 6 },
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    damageVulnerabilities: [],
    senses: { darkvision: 18, passivePerception: 9 },
    languages: ["Comum", "Goblinoide"],
    challengeRating: 0.25,
    experiencePoints: 50,
    specialAbilities: [
      {
        name: "Fuga Ágil",
        description:
          "O goblin pode realizar a ação Disparar ou Esconder como ação bônus em cada um de seus turnos.",
      },
    ],
    actions: [
      {
        name: "Cimitarra",
        description:
          "Ataque Corpo a Corpo com Arma: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 1d6+2 de dano cortante.",
        damageDice: "1d6+2",
        attackBonus: 4,
      },
      {
        name: "Arco Curto",
        description:
          "Ataque à Distância com Arma: +4 para acertar, alcance 24/96 m, um alvo. Acerto: 1d6+2 de dano perfurante.",
        damageDice: "1d6+2",
        attackBonus: 4,
      },
    ],
    attribution: ATTR,
  },
  {
    slug: "orc",
    name: "Orc",
    nameEn: "Orc",
    size: "medium",
    type: "humanoid (orc)",
    alignment: "caótico mau",
    armorClass: 13,
    armorClassDescription: "peles",
    hitPoints: 15,
    hitDice: "2d8+6",
    speed: { walk: 9 },
    attributes: { str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10 },
    skills: { intimidation: 2 },
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    damageVulnerabilities: [],
    senses: { darkvision: 18, passivePerception: 10 },
    languages: ["Comum", "Orc"],
    challengeRating: 0.5,
    experiencePoints: 100,
    specialAbilities: [
      {
        name: "Agressivo",
        description:
          "Como ação bônus, o orc pode mover-se até sua velocidade na direção de uma criatura hostil que possa ver.",
      },
    ],
    actions: [
      {
        name: "Machado Grande",
        description:
          "Ataque Corpo a Corpo com Arma: +5 para acertar, alcance 1,5 m, um alvo. Acerto: 1d12+3 de dano cortante.",
        damageDice: "1d12+3",
        attackBonus: 5,
      },
      {
        name: "Azagaia",
        description:
          "Ataque Corpo a Corpo ou à Distância com Arma: +5 para acertar, alcance 1,5 m ou 9/36 m, um alvo. Acerto: 1d6+3 de dano perfurante.",
        damageDice: "1d6+3",
        attackBonus: 5,
      },
    ],
    attribution: ATTR,
  },
  {
    slug: "skeleton",
    name: "Esqueleto",
    nameEn: "Skeleton",
    size: "medium",
    type: "morto-vivo",
    alignment: "leal mau",
    armorClass: 13,
    armorClassDescription: "armadura sucateada",
    hitPoints: 13,
    hitDice: "2d8+4",
    speed: { walk: 9 },
    attributes: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 },
    damageResistances: [],
    damageImmunities: ["veneno"],
    conditionImmunities: ["envenenado", "exausto"],
    damageVulnerabilities: ["concussão"],
    senses: { darkvision: 18, passivePerception: 9 },
    languages: ["entende todas as línguas que falava em vida, mas não fala"],
    challengeRating: 0.25,
    experiencePoints: 50,
    actions: [
      {
        name: "Espada Curta",
        description:
          "Ataque Corpo a Corpo com Arma: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 1d6+2 de dano perfurante.",
        damageDice: "1d6+2",
        attackBonus: 4,
      },
      {
        name: "Arco Curto",
        description:
          "Ataque à Distância com Arma: +4 para acertar, alcance 24/96 m, um alvo. Acerto: 1d6+2 de dano perfurante.",
        damageDice: "1d6+2",
        attackBonus: 4,
      },
    ],
    attribution: ATTR,
  },
  {
    slug: "wolf",
    name: "Lobo",
    nameEn: "Wolf",
    size: "medium",
    type: "besta",
    alignment: "neutro",
    armorClass: 13,
    armorClassDescription: "armadura natural",
    hitPoints: 11,
    hitDice: "2d8+2",
    speed: { walk: 12 },
    attributes: { str: 12, dex: 15, con: 12, int: 3, wis: 12, cha: 6 },
    skills: { perception: 3, stealth: 4 },
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    damageVulnerabilities: [],
    senses: { passivePerception: 13 },
    languages: [],
    challengeRating: 0.25,
    experiencePoints: 50,
    specialAbilities: [
      {
        name: "Audição e Olfato Apurados",
        description:
          "O lobo tem vantagem em testes de Sabedoria (Percepção) que dependam de audição ou olfato.",
      },
      {
        name: "Táticas de Matilha",
        description:
          "O lobo tem vantagem em jogadas de ataque contra uma criatura se ao menos um aliado seu estiver a 1,5 m da criatura e não estiver incapacitado.",
      },
    ],
    actions: [
      {
        name: "Mordida",
        description:
          "Ataque Corpo a Corpo com Arma: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 2d4+2 de dano perfurante. Se o alvo for uma criatura, deve ser bem-sucedido em um teste de resistência de Força CD 11 ou ser derrubado.",
        damageDice: "2d4+2",
        attackBonus: 4,
      },
    ],
    attribution: ATTR,
  },
  {
    slug: "owlbear",
    name: "Coruja-urso",
    nameEn: "Owlbear",
    size: "large",
    type: "monstruosidade",
    alignment: "neutro",
    armorClass: 13,
    armorClassDescription: "armadura natural",
    hitPoints: 59,
    hitDice: "7d10+21",
    speed: { walk: 12 },
    attributes: { str: 20, dex: 12, con: 17, int: 3, wis: 12, cha: 7 },
    skills: { perception: 3 },
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    damageVulnerabilities: [],
    senses: { darkvision: 18, passivePerception: 13 },
    languages: [],
    challengeRating: 3,
    experiencePoints: 700,
    specialAbilities: [
      {
        name: "Visão Apurada e Olfato Apurado",
        description:
          "A coruja-urso tem vantagem em testes de Sabedoria (Percepção) que dependam de visão ou olfato.",
      },
    ],
    actions: [
      {
        name: "Multiataque",
        description: "A coruja-urso faz dois ataques: um com seu bico e um com suas garras.",
      },
      {
        name: "Bico",
        description:
          "Ataque Corpo a Corpo com Arma: +7 para acertar, alcance 1,5 m, uma criatura. Acerto: 1d10+5 de dano perfurante.",
        damageDice: "1d10+5",
        attackBonus: 7,
      },
      {
        name: "Garras",
        description:
          "Ataque Corpo a Corpo com Arma: +7 para acertar, alcance 1,5 m, um alvo. Acerto: 2d8+5 de dano cortante.",
        damageDice: "2d8+5",
        attackBonus: 7,
      },
    ],
    attribution: ATTR,
  },
  {
    slug: "ogre",
    name: "Ogro",
    nameEn: "Ogre",
    size: "large",
    type: "gigante",
    alignment: "caótico mau",
    armorClass: 11,
    armorClassDescription: "peles",
    hitPoints: 59,
    hitDice: "7d10+21",
    speed: { walk: 12 },
    attributes: { str: 19, dex: 8, con: 16, int: 5, wis: 7, cha: 7 },
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    damageVulnerabilities: [],
    senses: { darkvision: 18, passivePerception: 8 },
    languages: ["Comum", "Gigante"],
    challengeRating: 2,
    experiencePoints: 450,
    actions: [
      {
        name: "Maça Grande",
        description:
          "Ataque Corpo a Corpo com Arma: +6 para acertar, alcance 1,5 m, um alvo. Acerto: 2d8+4 de dano de concussão.",
        damageDice: "2d8+4",
        attackBonus: 6,
      },
      {
        name: "Azagaia",
        description:
          "Ataque Corpo a Corpo ou à Distância com Arma: +6 para acertar, alcance 1,5 m ou 9/36 m, um alvo. Acerto: 2d6+4 de dano perfurante.",
        damageDice: "2d6+4",
        attackBonus: 6,
      },
    ],
    attribution: ATTR,
  },
  {
    slug: "young-red-dragon",
    name: "Dragão Vermelho Jovem",
    nameEn: "Young Red Dragon",
    size: "large",
    type: "dragão",
    alignment: "caótico mau",
    armorClass: 18,
    armorClassDescription: "armadura natural",
    hitPoints: 178,
    hitDice: "17d10+85",
    speed: { walk: 12, climb: 12, fly: 24 },
    attributes: { str: 23, dex: 10, con: 21, int: 14, wis: 11, cha: 19 },
    savingThrows: { dex: 4, con: 9, wis: 4, cha: 8 },
    skills: { perception: 8, stealth: 4 },
    damageResistances: [],
    damageImmunities: ["fogo"],
    conditionImmunities: [],
    damageVulnerabilities: [],
    senses: { blindsight: 9, darkvision: 36, passivePerception: 18 },
    languages: ["Comum", "Dracônico"],
    challengeRating: 10,
    experiencePoints: 5900,
    actions: [
      {
        name: "Multiataque",
        description: "O dragão faz três ataques: um com sua mordida e dois com suas garras.",
      },
      {
        name: "Mordida",
        description:
          "Ataque Corpo a Corpo com Arma: +10 para acertar, alcance 3 m, um alvo. Acerto: 2d10+6 perfurante mais 1d6 de fogo.",
        damageDice: "2d10+6",
        attackBonus: 10,
      },
      {
        name: "Garra",
        description:
          "Ataque Corpo a Corpo com Arma: +10 para acertar, alcance 1,5 m, um alvo. Acerto: 2d6+6 cortante.",
        damageDice: "2d6+6",
        attackBonus: 10,
      },
      {
        name: "Sopro de Fogo (Recarga 5-6)",
        description:
          "O dragão exala fogo em um cone de 9 metros. Cada criatura na área deve realizar um teste de resistência de Destreza CD 17, sofrendo 16d6 de dano de fogo em uma falha ou metade em sucesso.",
      },
    ],
    attribution: ATTR,
  },
  {
    slug: "lich",
    name: "Lich",
    nameEn: "Lich",
    size: "medium",
    type: "morto-vivo",
    alignment: "qualquer mal",
    armorClass: 17,
    armorClassDescription: "armadura natural",
    hitPoints: 135,
    hitDice: "18d8+54",
    speed: { walk: 9 },
    attributes: { str: 11, dex: 16, con: 16, int: 20, wis: 14, cha: 16 },
    savingThrows: { con: 10, int: 12, wis: 9 },
    skills: { arcana: 19, history: 12, insight: 9, perception: 9 },
    damageResistances: ["frio", "elétrico", "necrótico"],
    damageImmunities: ["veneno", "concussão/perfurante/cortante de armas não-mágicas"],
    conditionImmunities: ["enfeitiçado", "exausto", "amedrontado", "paralisado", "envenenado"],
    damageVulnerabilities: [],
    senses: { truesight: 36, passivePerception: 19 },
    languages: ["Comum", "+ até 5 outras"],
    challengeRating: 21,
    experiencePoints: 33000,
    specialAbilities: [
      {
        name: "Resistência Lendária (3/Dia)",
        description:
          "Se o lich falhar em um teste de resistência, ele pode escolher ter sucesso.",
      },
      {
        name: "Conjurador",
        description:
          "O lich é um conjurador de 18º nível. Inteligência é seu atributo de conjuração (CD 20, +12 ataque mágico). Ele tem magias de mago preparadas.",
      },
    ],
    actions: [
      {
        name: "Toque Paralisante",
        description:
          "Ataque Corpo a Corpo com Magia: +12 para acertar, alcance 1,5 m, uma criatura. Acerto: 3d6 de dano frio. O alvo deve ser bem-sucedido em um teste de resistência de Constituição CD 18 ou ficar Paralisado por 1 minuto.",
        damageDice: "3d6",
        attackBonus: 12,
      },
    ],
    attribution: ATTR,
  },
];
