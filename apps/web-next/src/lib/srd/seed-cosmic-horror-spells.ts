// ── Feitiços do Mythos ──
//
// 10 feitiços icônicos do horror investigativo. Custos em MP/SAN (e às
// vezes HP) refletem a economia de magia: poder cobra preço alto.
// Descrições são parafraseadas de obras Lovecraft em domínio público.

import type { CosmicHorrorMythosSpell } from "@/types/cosmic-horror-srd";
import { makeLovecraftAttribution } from "./cosmic-horror-attribution";

export const SEED_COSMIC_HORROR_MYTHOS_SPELLS: CosmicHorrorMythosSpell[] = [
  {
    slug: "contact-cthulhu",
    name: "Contatar Cthulhu",
    mpCost: "1d10",
    sanityCost: "1d10",
    castingTime: "1d20 minutos",
    description:
      "Conjurador entra em transe lúcido enquanto sua mente atravessa a " +
      "extensão oceânica até R'lyeh. Ouve fragmentos das visões do Sumo " +
      "Sacerdote — fragmentos que jamais devem ser ouvidos.",
    requirements: ["Estar próximo ao mar", "Lua nova"],
    source: "Lovecraft, 'O Chamado de Cthulhu' (1928)",
    attribution: makeLovecraftAttribution("'O Chamado de Cthulhu' (1928)"),
  },
  {
    slug: "summon-byakhee",
    name: "Convocar/Vincular Byakhee",
    mpCost: "1 por POD do alvo",
    sanityCost: "1d3",
    castingTime: "1 turno",
    description:
      "Conjurador apita uma flauta peculiar — entoando notas inumanas. " +
      "Um Byakhee atravessa o vácuo e desce. Vinculá-lo exige opposed POD.",
    requirements: ["Flauta de Yog", "Céu noturno aberto", "Voltar antes do amanhecer"],
    source: "Lovecraft, 'O Festival' (1925)",
    attribution: makeLovecraftAttribution("'O Festival' (1925)"),
  },
  {
    slug: "elder-sign",
    name: "Sinal dos Antigos",
    mpCost: "5",
    sanityCost: "1d3",
    castingTime: "1 rodada",
    description:
      "Conjurador desenha o Sinal sobre limiar, porta ou objeto. Criaturas " +
      "Mythos perdem 1d10 SAN para atravessá-lo e devem ter sucesso em " +
      "POD difícil para tentar.",
    requirements: ["Memorizar a forma exata do sigilo"],
    source: "Lovecraft, 'A Cidadela Sem Nome' e usos posteriores",
    attribution: makeLovecraftAttribution("Mitos públicos de Lovecraft"),
  },
  {
    slug: "summon-servitor",
    name: "Convocar Servidor Menor",
    mpCost: "1d6",
    sanityCost: "1d6",
    castingTime: "10 minutos",
    description:
      "Conjurador chama uma criatura subordinada de uma das Casas Externas. " +
      "Vinculá-la requer opposed POD; o que vier não obedece além do contrato.",
    requirements: ["Sangue do conjurador (1 HP)", "Local profanado"],
    source: "Genérico — tradição Lovecraft",
    attribution: makeLovecraftAttribution("Mitos públicos de Lovecraft"),
  },
  {
    slug: "voorish-sign",
    name: "Sinal de Voor",
    mpCost: "1",
    sanityCost: "0",
    castingTime: "1 ação",
    description:
      "Gesto manual antiquíssimo. Torna o invisível visível — pelo próximo " +
      "1d10 minutos o conjurador enxerga criaturas do Mythos camufladas, " +
      "portais e marcas espirituais.",
    requirements: [],
    source: "Lovecraft, 'O Horror de Dunwich' (1929)",
    attribution: makeLovecraftAttribution("'O Horror de Dunwich' (1929)"),
  },
  {
    slug: "powder-of-ibn-ghazi",
    name: "Pó de Ibn-Ghazi",
    mpCost: "5",
    sanityCost: "1d3",
    castingTime: "1d6 horas (preparo)",
    description:
      "Pó cinzento alquímico que torna entidades invisíveis visíveis quando " +
      "soprado. Efeito dura 1d6 turnos. Usado para revelar abominações.",
    requirements: ["Componentes raros (custo: 1d10×100 moedas)"],
    source: "Lovecraft, 'O Horror de Dunwich' (1929)",
    attribution: makeLovecraftAttribution("'O Horror de Dunwich' (1929)"),
  },
  {
    slug: "shrivel",
    name: "Encolhimento",
    mpCost: "1d4",
    sanityCost: "1d6",
    castingTime: "1 rodada",
    description:
      "Conjurador toca o alvo. Opposed POD: se vencer, o alvo perde 1d6 CON " +
      "permanente — pele resseca, ossos rangem.",
    requirements: ["Toque físico"],
    source: "Genérico — magia Mythos",
    attribution: makeLovecraftAttribution("Mitos públicos de Lovecraft"),
  },
  {
    slug: "speak-with-dead",
    name: "Falar com os Mortos",
    mpCost: "1d6",
    sanityCost: "1d4",
    hpCost: "1",
    castingTime: "1 hora",
    description:
      "Conjurador anima brevemente a alma de um cadáver recente (até 7 dias). " +
      "Faz até 3 perguntas — o morto responde com ressentimento ou tristeza.",
    requirements: ["Corpo intacto", "Componente: terra do túmulo"],
    source: "Genérico — necromancia Mythos",
    attribution: makeLovecraftAttribution("Mitos públicos de Lovecraft"),
  },
  {
    slug: "seal-portal",
    name: "Selar Portal",
    mpCost: "10",
    sanityCost: "1d4",
    castingTime: "1 hora",
    description:
      "Fecha um portal interdimensional. Requer Sinal dos Antigos no umbral. " +
      "Selo dura 1d10 anos antes de enfraquecer — não é permanente.",
    requirements: ["Conhecer a configuração exata do portal", "Sinal dos Antigos"],
    source: "Genérico — tradição Lovecraft",
    attribution: makeLovecraftAttribution("Mitos públicos de Lovecraft"),
  },
  {
    slug: "dread-curse-of-azathoth",
    name: "Maldição Atroz de Azathoth",
    mpCost: "1d10",
    sanityCost: "1d10",
    hpCost: "1d6",
    castingTime: "1 minuto",
    description:
      "Conjurador grita o Nome em direção ao alvo. Opposed POD: vencer drena " +
      "1d6 POD do alvo permanentemente. Cada uso atrai a atenção do Sultão " +
      "Demoníaco.",
    requirements: ["Conhecer 5+ feitiços Mythos", "Lua minguante"],
    source: "Lovecraft, 'Os Sonhos na Casa da Bruxa' (1933)",
    attribution: makeLovecraftAttribution("'Os Sonhos na Casa da Bruxa' (1933)"),
  },
];
