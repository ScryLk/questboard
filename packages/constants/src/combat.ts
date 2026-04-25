// ═══ Combat Tracker — Constantes compartilhadas ═══
//
// Honra o sistema existente:
//  - alignment (não "faction") com valores lowercase: player/hostile/neutral/ally
//  - 15 conditions lowercase já definidas em apps/web-next (D&D 5e)
//    + "custom" para extensões do GM
//  - cores do design system (brand-accent #6C5CE7, brand-success #00B894, etc.)

import type { CombatConditionId } from "@questboard/types";

export const COMBAT_CONDITION_IDS = [
  "blinded",
  "charmed",
  "concentrating",
  "deafened",
  "frightened",
  "grappled",
  "incapacitated",
  "invisible",
  "paralyzed",
  "petrified",
  "poisoned",
  "prone",
  "restrained",
  "stunned",
  "unconscious",
  "custom",
] as const satisfies readonly CombatConditionId[];

export type { CombatConditionId };

export interface CombatConditionMeta {
  id: CombatConditionId;
  label: string; // pt-BR display
  icon: string; // Lucide icon name (works in lucide-react)
  color: string; // hex
  description: string; // pt-BR tooltip
  /** Default rounds at apply-time. null = "until removed manually". GM
   *  pode editar livremente no popover. Não há efeito mecânico (dano de
   *  veneno por turno etc.) ainda — fatia 3C. */
  defaultDurationRounds: number | null;
}

// Metadata para render visual das 15 conditions + custom.
// Cores escolhidas pra contrastar com brand-surface (#111116).
export const COMBAT_CONDITIONS: Record<CombatConditionId, CombatConditionMeta> = {
  blinded:       { id: "blinded",       label: "Cego",           icon: "EyeOff",     color: "#64748b", description: "Não enxerga, falha em checks de visão.",                                       defaultDurationRounds: null },
  charmed:       { id: "charmed",       label: "Enfeitiçado",    icon: "Heart",      color: "#f472b6", description: "Sob efeito de encantamento, não ataca o encantador.",                          defaultDurationRounds: 3 },
  concentrating: { id: "concentrating", label: "Concentrando",   icon: "Brain",      color: "#2dd4bf", description: "Mantendo magia ativa; dano exige teste de concentração.",                      defaultDurationRounds: null },
  deafened:      { id: "deafened",      label: "Surdo",          icon: "VolumeX",    color: "#94a3b8", description: "Não ouve, falha em checks auditivos.",                                         defaultDurationRounds: null },
  frightened:    { id: "frightened",    label: "Amedrontado",    icon: "Ghost",      color: "#7c3aed", description: "Medo intenso; desvantagem em checks e ataques.",                               defaultDurationRounds: 2 },
  grappled:      { id: "grappled",      label: "Agarrado",       icon: "Link",       color: "#fb923c", description: "Preso por outro combatente; deslocamento 0.",                                 defaultDurationRounds: null },
  incapacitated: { id: "incapacitated", label: "Incapacitado",   icon: "OctagonX",   color: "#eab308", description: "Não pode tomar ações nem reações.",                                            defaultDurationRounds: 1 },
  invisible:     { id: "invisible",     label: "Invisível",      icon: "Eye",        color: "#22d3ee", description: "Não pode ser visto sem magia ou habilidade especial.",                          defaultDurationRounds: null },
  paralyzed:     { id: "paralyzed",     label: "Paralisado",     icon: "Snowflake",  color: "#60a5fa", description: "Incapacitado; falha automática em testes de Força e Destreza.",                  defaultDurationRounds: 1 },
  petrified:     { id: "petrified",     label: "Petrificado",    icon: "Mountain",   color: "#78716c", description: "Transformado em pedra; incapacitado e resistente a dano.",                       defaultDurationRounds: null },
  poisoned:      { id: "poisoned",      label: "Envenenado",     icon: "Droplets",   color: "#4ade80", description: "Desvantagem em ataques e checks de atributo.",                                  defaultDurationRounds: 3 },
  prone:         { id: "prone",         label: "Caído",          icon: "ArrowDown",  color: "#a78bfa", description: "No chão; movimento custa o dobro, desvantagem em ataques.",                     defaultDurationRounds: null },
  restrained:    { id: "restrained",    label: "Contido",        icon: "Lock",       color: "#f87171", description: "Deslocamento 0; desvantagem em ataques e Destreza.",                            defaultDurationRounds: null },
  stunned:       { id: "stunned",       label: "Atordoado",      icon: "Sparkles",   color: "#facc15", description: "Incapacitado; falha em testes de Força e Destreza.",                            defaultDurationRounds: 1 },
  unconscious:   { id: "unconscious",   label: "Inconsciente",   icon: "Moon",       color: "#475569", description: "Caído e indefeso; ataques de perto são críticos.",                              defaultDurationRounds: null },
  custom:        { id: "custom",        label: "Personalizado",  icon: "Circle",     color: "#9090A0", description: "Condição definida pelo mestre.",                                                defaultDurationRounds: null },
};

// Visibilidade de HP inimigo quando GM não mostra números.
// Proporção (hpCurrent/hpMax) → texto descritivo em pt-BR.
// Ordenar DESC: find pega o primeiro limiar que bate.
export const COMBAT_HP_LABELS: readonly { minPct: number; label: string }[] = [
  { minPct: 0.75, label: "Saudável" },
  { minPct: 0.5, label: "Ferido" },
  { minPct: 0.25, label: "Gravemente ferido" },
  { minPct: 0.01, label: "Quase morto" },
  { minPct: 0, label: "Morto" },
] as const;

export const COMBAT_TURN_TIMERS = [
  { value: 0, label: "Sem limite" },
  { value: 60, label: "60 segundos" },
  { value: 90, label: "90 segundos" },
] as const;

export type CombatTurnTimerValue = (typeof COMBAT_TURN_TIMERS)[number]["value"];

// Atalhos de teclado do GM. Listener global checa target não-editável.
export const COMBAT_SHORTCUTS = {
  NEXT_TURN: " ",
  PREVIOUS_TURN: "Shift+ ",
  ROLL_ALL_INITIATIVE: "i",
  END_COMBAT: "r",
} as const;
