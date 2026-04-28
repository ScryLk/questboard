// ── Condições do SRD 5.1 ──

import type { SrdCondition } from "@/types/srd";
import { makeOfficialSrdAttribution } from "./attribution";

const ATTR = makeOfficialSrdAttribution("SRD 5.1 §A");

export const SEED_CONDITIONS: SrdCondition[] = [
  {
    slug: "blinded",
    name: "Cego",
    nameEn: "Blinded",
    description:
      "Uma criatura cega não consegue ver e falha automaticamente em qualquer teste de habilidade que requer visão. As jogadas de ataque contra a criatura têm vantagem, e suas próprias jogadas de ataque têm desvantagem.",
    iconName: "EyeOff",
    attribution: ATTR,
  },
  {
    slug: "charmed",
    name: "Enfeitiçado",
    nameEn: "Charmed",
    description:
      "Uma criatura enfeitiçada não pode atacar quem a enfeitiçou ou tê-lo como alvo de habilidades ou efeitos mágicos prejudiciais. Quem enfeitiçou tem vantagem em testes de habilidade para interagir socialmente com a criatura.",
    iconName: "Heart",
    attribution: ATTR,
  },
  {
    slug: "deafened",
    name: "Surdo",
    nameEn: "Deafened",
    description:
      "Uma criatura surda não consegue ouvir e falha automaticamente em qualquer teste de habilidade que requer audição.",
    iconName: "EarOff",
    attribution: ATTR,
  },
  {
    slug: "frightened",
    name: "Amedrontado",
    nameEn: "Frightened",
    description:
      "Uma criatura amedrontada tem desvantagem em testes de habilidade e jogadas de ataque enquanto a fonte do medo estiver à vista. A criatura não pode se mover voluntariamente para mais perto da fonte de seu medo.",
    iconName: "Skull",
    attribution: ATTR,
  },
  {
    slug: "grappled",
    name: "Agarrado",
    nameEn: "Grappled",
    description:
      "A velocidade de uma criatura agarrada se torna 0, e ela não pode se beneficiar de bônus em sua velocidade. A condição termina se quem está agarrando ficar incapacitado, ou se um efeito remover a criatura agarrada do alcance do agarrador.",
    iconName: "Hand",
    attribution: ATTR,
  },
  {
    slug: "incapacitated",
    name: "Incapacitado",
    nameEn: "Incapacitated",
    description: "Uma criatura incapacitada não pode realizar ações ou reações.",
    iconName: "XCircle",
    attribution: ATTR,
  },
  {
    slug: "invisible",
    name: "Invisível",
    nameEn: "Invisible",
    description:
      "Uma criatura invisível é impossível de ver sem o auxílio de magia ou um sentido especial. As jogadas de ataque contra a criatura têm desvantagem, e suas próprias jogadas de ataque têm vantagem.",
    iconName: "Eye",
    attribution: ATTR,
  },
  {
    slug: "paralyzed",
    name: "Paralisado",
    nameEn: "Paralyzed",
    description:
      "Uma criatura paralisada está incapacitada e não pode se mover ou falar. Falha automaticamente em testes de Força e Destreza. As jogadas de ataque contra a criatura têm vantagem. Qualquer ataque que acerte a criatura é um acerto crítico se o atacante estiver a até 1,5m dela.",
    iconName: "Snowflake",
    attribution: ATTR,
  },
  {
    slug: "petrified",
    name: "Petrificado",
    nameEn: "Petrified",
    description:
      "Uma criatura petrificada é transformada em uma substância sólida inanimada. Seu peso aumenta em dez vezes, e ela deixa de envelhecer. A criatura está incapacitada, não pode se mover ou falar, e não tem consciência do que a rodeia.",
    iconName: "Mountain",
    attribution: ATTR,
  },
  {
    slug: "poisoned",
    name: "Envenenado",
    nameEn: "Poisoned",
    description:
      "Uma criatura envenenada tem desvantagem em jogadas de ataque e testes de habilidade.",
    iconName: "FlaskConical",
    attribution: ATTR,
  },
  {
    slug: "prone",
    name: "Caído",
    nameEn: "Prone",
    description:
      "A única opção de movimento de uma criatura caída é engatinhar, a menos que se levante e dessa forma encerre a condição. A criatura tem desvantagem em jogadas de ataque. Uma jogada de ataque contra a criatura tem vantagem se o atacante estiver a até 1,5m, caso contrário tem desvantagem.",
    iconName: "ArrowDown",
    attribution: ATTR,
  },
  {
    slug: "restrained",
    name: "Restringido",
    nameEn: "Restrained",
    description:
      "A velocidade de uma criatura restringida se torna 0, e ela não pode se beneficiar de bônus em sua velocidade. As jogadas de ataque contra a criatura têm vantagem, e suas próprias jogadas de ataque têm desvantagem. A criatura tem desvantagem em testes de resistência de Destreza.",
    iconName: "Lock",
    attribution: ATTR,
  },
  {
    slug: "stunned",
    name: "Atordoado",
    nameEn: "Stunned",
    description:
      "Uma criatura atordoada está incapacitada, não pode se mover, e só pode falar com dificuldade. Falha automaticamente em testes de Força e Destreza. As jogadas de ataque contra a criatura têm vantagem.",
    iconName: "Zap",
    attribution: ATTR,
  },
  {
    slug: "unconscious",
    name: "Inconsciente",
    nameEn: "Unconscious",
    description:
      "Uma criatura inconsciente está incapacitada, não pode se mover ou falar e não tem consciência do que a rodeia. Solta tudo que está segurando e cai prone. Falha automaticamente em testes de Força e Destreza. As jogadas de ataque contra a criatura têm vantagem. Qualquer ataque que acerte é crítico se o atacante estiver a até 1,5m.",
    iconName: "Moon",
    attribution: ATTR,
  },
];
