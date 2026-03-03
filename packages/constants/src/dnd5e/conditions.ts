// ── D&D 5e Conditions ──

import type { DndCondition } from "@questboard/types";

export const DND5E_CONDITIONS: DndCondition[] = [
  {
    id: "frightened",
    name: "Amedrontado",
    icon: "AlertTriangle",
    description:
      "Desvantagem em testes de habilidade e ataques enquanto a fonte do medo estiver visível.",
  },
  {
    id: "stunned",
    name: "Atordoado",
    icon: "Zap",
    description:
      "Incapacitado, não pode se mover, e fala apenas de forma hesitante. Falha automática em salvaguardas de FOR e DES.",
  },
  {
    id: "prone",
    name: "Caído",
    icon: "ArrowDown",
    description:
      "Desvantagem em jogadas de ataque. Ataques corpo a corpo contra você têm vantagem.",
  },
  {
    id: "blinded",
    name: "Cego",
    icon: "EyeOff",
    description:
      "Falha automática em testes que requerem visão. Ataques contra você têm vantagem, seus ataques têm desvantagem.",
  },
  {
    id: "charmed",
    name: "Encantado",
    icon: "Sparkles",
    description:
      "Não pode atacar quem o encantou. O encantador tem vantagem em interações sociais.",
  },
  {
    id: "poisoned",
    name: "Envenenado",
    icon: "Skull",
    description: "Desvantagem em jogadas de ataque e testes de habilidade.",
  },
  {
    id: "incapacitated",
    name: "Incapacitado",
    icon: "Ban",
    description: "Não pode realizar ações ou reações.",
  },
  {
    id: "invisible",
    name: "Invisível",
    icon: "EyeOff",
    description:
      "Impossível de ser visto sem magia. Ataques têm vantagem, ataques contra você têm desvantagem.",
  },
  {
    id: "paralyzed",
    name: "Paralisado",
    icon: "Lock",
    description:
      "Incapacitado, não pode se mover ou falar. Falha automática em salvaguardas de FOR e DES. Ataques corpo a corpo são críticos automáticos.",
  },
  {
    id: "petrified",
    name: "Petrificado",
    icon: "Mountain",
    description:
      "Transformado em substância sólida. Incapacitado, resistência a todos os tipos de dano.",
  },
  {
    id: "restrained",
    name: "Restringido",
    icon: "Link",
    description:
      "Velocidade 0. Ataques contra você têm vantagem, seus ataques têm desvantagem. Desvantagem em salvaguardas de DES.",
  },
  {
    id: "deafened",
    name: "Surdo",
    icon: "EarOff",
    description:
      "Falha automática em testes que requerem audição.",
  },
];

export const CONDITIONS_MAP = Object.fromEntries(
  DND5E_CONDITIONS.map((c) => [c.id, c]),
) as Record<string, DndCondition>;
