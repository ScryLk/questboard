// ── Raças do SRD 5.1 ──

import type { SrdRace } from "@/types/srd";
import { makeOfficialSrdAttribution } from "./attribution";

const ATTR = makeOfficialSrdAttribution("SRD 5.1 §2");

export const SEED_RACES: SrdRace[] = [
  {
    slug: "human",
    name: "Humano",
    nameEn: "Human",
    size: "medium",
    speed: 9,
    abilityBonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    age: "Maduro aos 20, vive em torno de 80 anos.",
    alignment: "Tendem para nenhum alinhamento; são adaptáveis.",
    languages: ["Comum", "+ um idioma à escolha"],
    traits: [
      {
        name: "Versátil",
        description:
          "Humanos recebem +1 em todos os atributos. Aprendem rapidamente e são versáteis em qualquer caminho.",
      },
    ],
    description:
      "A raça mais comum em Faerûn e em muitos outros mundos. Adaptáveis, ambiciosos, presentes em quase todos os reinos.",
    attribution: ATTR,
  },
  {
    slug: "elf",
    name: "Elfo",
    nameEn: "Elf",
    size: "medium",
    speed: 9,
    abilityBonuses: { dex: 2 },
    age: "Maduro aos 100, vive em torno de 750 anos.",
    alignment: "Caóticos, geralmente bons.",
    languages: ["Comum", "Élfico"],
    traits: [
      { name: "Visão no Escuro", description: "Você vê em luz fraca como se fosse luz plena, até 18 metros." },
      { name: "Sentidos Apurados", description: "Proficiência em Percepção." },
      { name: "Ancestralidade Feérica", description: "Vantagem em testes contra Encantamento; magia não pode te fazer dormir." },
      { name: "Transe", description: "Não dorme; medita 4 horas por dia para os benefícios de 8 horas de sono." },
    ],
    description: "Povo místico de elegância sobrenatural, vive em harmonia com a natureza.",
    attribution: ATTR,
  },
  {
    slug: "dwarf",
    name: "Anão",
    nameEn: "Dwarf",
    size: "medium",
    speed: 7.5,
    abilityBonuses: { con: 2 },
    age: "Maduro aos 50, vive em torno de 350 anos.",
    alignment: "Tendem a leais.",
    languages: ["Comum", "Anão"],
    traits: [
      { name: "Visão no Escuro", description: "Vê em luz fraca como se fosse luz plena, até 18 metros." },
      { name: "Resiliência Anã", description: "Vantagem em testes contra veneno e resistência contra dano de veneno." },
      { name: "Treinamento de Combate Anão", description: "Proficiência com machado de batalha, machadinha, martelo leve e martelo de guerra." },
      { name: "Versatilidade com Ferramentas", description: "Proficiência com uma ferramenta de artesão à escolha." },
    ],
    description: "Robustos artesãos das montanhas. Cultura ancestral e clãs unidos por honra.",
    attribution: ATTR,
  },
  {
    slug: "halfling",
    name: "Halfling",
    nameEn: "Halfling",
    size: "small",
    speed: 7.5,
    abilityBonuses: { dex: 2 },
    age: "Maduro aos 20, vive em torno de 150 anos.",
    alignment: "Leais e bons.",
    languages: ["Comum", "Halfling"],
    traits: [
      { name: "Sortudo", description: "Quando rola 1 num d20 de ataque, habilidade ou resistência, pode rerolar e usar o novo." },
      { name: "Bravo", description: "Vantagem em testes contra ser amedrontado." },
      { name: "Agilidade Halfling", description: "Pode mover-se através do espaço de criaturas maiores que você." },
    ],
    description: "Povo discreto, alegre, com afinidade especial pela vida pastoril e por confortos do lar.",
    attribution: ATTR,
  },
  {
    slug: "tiefling",
    name: "Tiefling",
    nameEn: "Tiefling",
    size: "medium",
    speed: 9,
    abilityBonuses: { int: 1, cha: 2 },
    age: "Como humanos.",
    alignment: "Tendem ao caótico.",
    languages: ["Comum", "Infernal"],
    traits: [
      { name: "Visão no Escuro", description: "Vê em luz fraca como luz plena, até 18 metros." },
      { name: "Resistência Infernal", description: "Resistência contra dano de fogo." },
      { name: "Legado Infernal", description: "Conhece o truque Taumaturgia. No 3º nível pode conjurar Ato Hediondo 1×/dia. No 5º, Escuridão 1×/dia." },
    ],
    description: "Descendentes de pactos com diabos. Carregam marcas físicas de seu legado infernal.",
    attribution: ATTR,
  },
  {
    slug: "half-orc",
    name: "Meio-orc",
    nameEn: "Half-Orc",
    size: "medium",
    speed: 9,
    abilityBonuses: { str: 2, con: 1 },
    age: "Maduro aos 14, vive em torno de 75 anos.",
    alignment: "Tendem ao caótico.",
    languages: ["Comum", "Orc"],
    traits: [
      { name: "Visão no Escuro", description: "Vê em luz fraca como luz plena, até 18 metros." },
      { name: "Aspecto Ameaçador", description: "Proficiência em Intimidação." },
      { name: "Resistência Implacável", description: "Quando reduzido a 0 PV, pode permanecer com 1 PV ao invés. 1×/descanso longo." },
      { name: "Ataques Selvagens", description: "Acertos críticos com armas corpo a corpo rolam um dado adicional do dano da arma." },
    ],
    description: "Bipartidos entre humanidade e ferocidade orc. Comuns em fronteiras e cidades cosmopolitas.",
    attribution: ATTR,
  },
];
