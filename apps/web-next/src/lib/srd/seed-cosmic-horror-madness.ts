// ── Estados de loucura ──
//
// Tabela canônica do QuestBoard pra surtos (bouts), fobias, manias,
// loucura indefinida e permanente. Texto original — não copia tabelas
// de produtos comerciais.

import type { CosmicHorrorMadness } from "@/types/cosmic-horror-srd";
import { makeQuestboardOriginalAttribution } from "./cosmic-horror-attribution";

const ATTR = makeQuestboardOriginalAttribution();

export const SEED_COSMIC_HORROR_MADNESS: CosmicHorrorMadness[] = [
  // ── Surtos (bouts) — perda de 5+ SAN numa cena ──
  {
    slug: "amnesia",
    name: "Amnésia",
    category: "BOUT",
    duration: "1d10 horas",
    description:
      "O investigador acorda em local desconhecido sem lembrar do ocorrido. " +
      "GM rouba 1d4 itens do inventário e narra consequências em segredo.",
    attribution: ATTR,
  },
  {
    slug: "unbridled-panic",
    name: "Pânico Incontrolável",
    category: "BOUT",
    duration: "1d10 rodadas",
    description:
      "O personagem foge na direção oposta da fonte do horror, ignorando " +
      "aliados, perigos e o próprio bom senso.",
    attribution: ATTR,
  },
  {
    slug: "violent-outburst",
    name: "Acesso de Violência",
    category: "BOUT",
    duration: "1d10 rodadas",
    description:
      "Ataca freneticamente o alvo mais próximo — frequentemente um aliado. " +
      "Não distingue amigo de inimigo até a SAN se estabilizar.",
    attribution: ATTR,
  },
  {
    slug: "catatonia",
    name: "Catatonia",
    category: "BOUT",
    duration: "1d10 rodadas",
    description:
      "Paralisia total. Olhos abertos, respiração rasa, ignora estímulos. " +
      "Aliado pode tirar do estado com FOR difícil + 1 minuto de cuidado.",
    attribution: ATTR,
  },
  {
    slug: "hysteria",
    name: "Histeria ou Desmaio",
    category: "BOUT",
    duration: "1d10 minutos",
    description:
      "Riso descontrolado, choro convulsivo ou desmaio. Ataques a essa " +
      "vítima recebem dado de bônus.",
    attribution: ATTR,
  },
  {
    slug: "delusions",
    name: "Delírios",
    category: "BOUT",
    duration: "1d10 horas",
    description:
      "Acredita firmemente em algo falso — que aliado é cultista, que está " +
      "morto, que vê parentes na multidão. GM define a delusão.",
    attribution: ATTR,
  },
  {
    slug: "dramatic-act",
    name: "Ato Bizarro",
    category: "BOUT",
    duration: "1d4 horas",
    description:
      "Faz algo dramaticamente fora do personagem: tira a roupa em público, " +
      "queima a própria caderneta de pistas, declama Shakespeare ao vento.",
    attribution: ATTR,
  },

  // ── Fobias adquiridas (loucura indefinida) ──
  {
    slug: "phobia-water",
    name: "Hidrofobia",
    category: "PHOBIA",
    description:
      "Aversão patológica a corpos d'água. Em presença de poça/oceano, " +
      "dado de penalidade em todos os testes até afastar-se.",
    attribution: ATTR,
  },
  {
    slug: "phobia-dark",
    name: "Niquetofobia",
    category: "PHOBIA",
    description:
      "Pavor da escuridão. Sem fonte de luz, dado de penalidade e teste " +
      "automático de pânico a cada cena.",
    attribution: ATTR,
  },
  {
    slug: "phobia-confined-spaces",
    name: "Claustrofobia",
    category: "PHOBIA",
    description:
      "Espaços fechados (quartos pequenos, túneis, porões) provocam ataque " +
      "de pânico. Fugir é a única ação clara.",
    attribution: ATTR,
  },
  {
    slug: "phobia-heights",
    name: "Acrofobia",
    category: "PHOBIA",
    description:
      "Pavor de alturas. Precipícios, telhados e escadas longas exigem POD " +
      "difícil pra prosseguir.",
    attribution: ATTR,
  },

  // ── Manias adquiridas ──
  {
    slug: "mania-rituals",
    name: "Mania Ritualística",
    category: "MANIA",
    description:
      "Investigador acumula gestos repetitivos: contar passos, tocar maçanetas " +
      "três vezes, sussurrar orações. Gasta 1 ação extra por cena em rituais.",
    attribution: ATTR,
  },
  {
    slug: "mania-collecting",
    name: "Coleciomania",
    category: "MANIA",
    description:
      "Compulsão por colecionar objetos específicos relacionados ao trauma — " +
      "moedas, recortes de jornal, espelhos quebrados.",
    attribution: ATTR,
  },
  {
    slug: "mania-megalomania",
    name: "Megalomania",
    category: "MANIA",
    description:
      "Acredita ter sido escolhido para missão cósmica. Toma decisões " +
      "imprudentes confiante de invulnerabilidade.",
    attribution: ATTR,
  },

  // ── Loucura indefinida (cura: terapia + tempo) ──
  {
    slug: "indefinite-melancholia",
    name: "Melancolia Profunda",
    category: "INDEFINITE",
    duration: "1d6 meses",
    description:
      "Apatia profunda, episódios de choro, falta de interesse pela " +
      "investigação. Cura requer terapia mensal e SAN positivo.",
    attribution: ATTR,
  },
  {
    slug: "indefinite-paranoia",
    name: "Paranoia",
    category: "INDEFINITE",
    duration: "1d6 meses",
    description:
      "Desconfia de aliados, autoridades e estranhos. Vê padrões e cultos " +
      "onde não há. Falsamente, às vezes corretamente.",
    attribution: ATTR,
  },

  // ── Loucura permanente (SAN = 0) ──
  {
    slug: "permanent-vegetative",
    name: "Estado Vegetativo",
    category: "PERMANENT",
    description:
      "Investigador é levado a sanatório, mente fragmentada além de recuperação. " +
      "Personagem sai de jogo. Família acende velas; amigos visitam menos com o tempo.",
    attribution: ATTR,
  },
  {
    slug: "permanent-cult-conversion",
    name: "Convertido ao Culto",
    category: "PERMANENT",
    description:
      "A mente quebrou — mas o que sobrou abraçou o horror. Personagem vira " +
      "NPC do GM, devoto fervoroso da entidade que o destruiu.",
    attribution: ATTR,
  },
];
