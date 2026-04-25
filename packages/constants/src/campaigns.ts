// ═══ Campaigns — Constantes compartilhadas ═══
//
// Limites por plano, tags da controlled vocabulary, content warnings
// e razões de report. Os enums (visibility/status/frequency/...) vivem
// em @questboard/types — aqui ficam só listas e mapeamentos.

import type {
  AgeRating,
  CampaignFrequency,
  CampaignLength,
  CampaignVisibility,
  SafetyTool,
} from "@questboard/types";

// ── Limites por plano ──

export const MAX_CAMPAIGNS_BY_PLAN = {
  FREE: 2,
  AVENTUREIRO: 10,
  LENDARIO: Infinity,
} as const;

export const MAX_PLAYERS_BY_PLAN = {
  FREE: 5,
  AVENTUREIRO: 10,
  LENDARIO: Infinity,
} as const;

// ── Join code ──

export const JOIN_CODE_LENGTH = 8;
// Sem 0/O/1/I/L pra evitar ambiguidade visual quando lido em voz/print.
export const JOIN_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

// ── Sistemas suportados ──
//
// IDs lowercase pra honrar o convention existente (gameplay-mock-data
// e schema.prisma usam `system: String`). Engine define o tipo de
// resolução usada (d20 = ataque/CA/saving throws, freeform = narrativo).

export const CAMPAIGN_SYSTEMS = [
  { value: "dnd5e",       label: "D&D 5e",            engine: "d20" },
  { value: "tormenta20",  label: "Tormenta20",        engine: "d20" },
  { value: "ordempar",    label: "Ordem Paranormal",  engine: "d20" },
  { value: "coc7",        label: "Call of Cthulhu",   engine: "freeform" },
  { value: "freeform",    label: "Sistema Livre",     engine: "freeform" },
] as const;

export type CampaignSystemId = (typeof CAMPAIGN_SYSTEMS)[number]["value"];

// ── Tags da campanha (controlled vocabulary) ──

export const CAMPAIGN_TAGS = [
  "dark-fantasy", "high-fantasy", "horror", "investigacao", "politico",
  "sandbox", "linear", "comedia", "guerra", "exploracao", "intriga",
  "sobrenatural", "ficcao-cientifica", "post-apocaliptico", "urbano-moderno",
] as const;

export type CampaignTag = (typeof CAMPAIGN_TAGS)[number];

export const CAMPAIGN_TAG_LABELS: Record<CampaignTag, string> = {
  "dark-fantasy": "Dark Fantasy",
  "high-fantasy": "High Fantasy",
  horror: "Horror",
  investigacao: "Investigação",
  politico: "Político",
  sandbox: "Sandbox",
  linear: "Linear",
  comedia: "Comédia",
  guerra: "Guerra",
  exploracao: "Exploração",
  intriga: "Intriga",
  sobrenatural: "Sobrenatural",
  "ficcao-cientifica": "Ficção Científica",
  "post-apocaliptico": "Pós-apocalíptico",
  "urbano-moderno": "Urbano Moderno",
};

// ── Content warnings ──

export const CONTENT_WARNINGS = [
  "graphic-violence", "horror", "body-horror", "drugs", "sexual-themes",
  "torture", "child-harm", "religious-themes", "mental-illness",
  "self-harm", "death", "gore",
] as const;

export type ContentWarning = (typeof CONTENT_WARNINGS)[number];

export const CONTENT_WARNING_LABELS: Record<ContentWarning, string> = {
  "graphic-violence": "Violência gráfica",
  horror: "Horror",
  "body-horror": "Body horror",
  drugs: "Drogas",
  "sexual-themes": "Temas sexuais",
  torture: "Tortura",
  "child-harm": "Dano a crianças",
  "religious-themes": "Temas religiosos",
  "mental-illness": "Saúde mental",
  "self-harm": "Auto-mutilação",
  death: "Morte",
  gore: "Gore",
};

// ── Report reasons ──

export const REPORT_REASONS = [
  "inappropriate-content",
  "spam",
  "harassment",
  "copyright",
  "underage-content",
  "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  "inappropriate-content": "Conteúdo impróprio",
  spam: "Spam",
  harassment: "Assédio",
  copyright: "Violação de direitos autorais",
  "underage-content": "Conteúdo envolvendo menores",
  other: "Outro",
};

// Limite de auto-hide do catálogo público quando atinge N reports
// pendentes. Owner mantém acesso; só some do listing.
export const REPORTS_TO_HIDE = 5;
// Anti-spam: max reports do mesmo usuário pra mesma campanha.
export const REPORTS_PER_USER_PER_CAMPAIGN = 3;

// ── Labels pt-BR dos enums (para UI) ──

export const CAMPAIGN_VISIBILITY_LABELS: Record<CampaignVisibility, string> = {
  PRIVATE: "Privada",
  CODE: "Por código",
  PUBLIC: "Pública",
};

export const CAMPAIGN_VISIBILITY_DESCRIPTIONS: Record<
  CampaignVisibility,
  string
> = {
  PRIVATE: "Só convidados diretos entram. Sem código nem catálogo.",
  CODE: "Qualquer um com o código de 8 caracteres entra.",
  PUBLIC: "Listada no catálogo público. Aceita aplicações de jogadores.",
};

export const CAMPAIGN_FREQUENCY_LABELS: Record<CampaignFrequency, string> = {
  WEEKLY: "Semanal",
  BIWEEKLY: "Quinzenal",
  MONTHLY: "Mensal",
  IRREGULAR: "Irregular",
  ONESHOT: "One-shot",
};

export const CAMPAIGN_LENGTH_LABELS: Record<CampaignLength, string> = {
  ONESHOT: "One-shot",
  SHORT_ARC: "Arco curto (3-6 sessões)",
  LONG: "Longa (10+ sessões)",
  INDEFINITE: "Indefinida",
};

export const AGE_RATING_LABELS: Record<AgeRating, string> = {
  ALL_AGES: "Livre",
  T14: "14+",
  T16: "16+",
  T18: "18+",
};

export const SAFETY_TOOL_LABELS: Record<SafetyTool, string> = {
  OPEN_DOOR: "Open Door (sair a qualquer momento)",
  X_CARD: "X-Card (interromper cena pesada)",
  LINES_AND_VEILS: "Lines & Veils (limites antecipados)",
};
