// ── Handle do usuário (Riot-style Name#TAG) ──────────────────
//
// Username: 3-16 chars, [a-zA-Z0-9_-], case-preservado mas comparado
// case-insensitive.
// Tag: 4 chars [A-HJ-NP-Z2-9] (sem I/O/0/1 pra evitar confusão).
// Handle completo = `${username}#${tag}` — único globalmente.

import { z } from "zod";

/** Alfabeto seguro pro tag: 24 chars (sem I/O/0/1). */
export const TAG_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Comprimento default do tag. Pode crescer pra 5 se 4 colidir muito. */
export const TAG_LENGTH = 4;

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 16;

/** Regex pro username — letras, dígitos, _, - (sem espaços). */
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

/** Nomes bloqueados (case-insensitive). Manter curto e focado em
 *  impostores; expandir conforme necessário. */
export const RESERVED_USERNAMES = new Set<string>(
  [
    "admin",
    "administrator",
    "root",
    "system",
    "support",
    "help",
    "moderator",
    "mod",
    "staff",
    "gm",
    "questboard",
    "quest-board",
    "questboardrpg",
    "official",
    "anonymous",
    "null",
    "undefined",
    "deleted",
    "user",
    "me",
    "you",
  ].map((s) => s.toLowerCase()),
);

export function isReservedUsername(name: string): boolean {
  return RESERVED_USERNAMES.has(name.toLowerCase());
}

/** Schema do username (campo isolado). */
export const usernameSchema = z
  .string()
  .min(USERNAME_MIN, `Mínimo ${USERNAME_MIN} caracteres.`)
  .max(USERNAME_MAX, `Máximo ${USERNAME_MAX} caracteres.`)
  .regex(USERNAME_REGEX, "Use apenas letras, números, _ e -.")
  .refine((v) => !isReservedUsername(v), {
    message: "Esse nome é reservado.",
  });

/** Schema do tag (campo isolado). Aceita lowercase e normaliza. */
export const tagSchema = z
  .string()
  .length(TAG_LENGTH, `Tag deve ter ${TAG_LENGTH} caracteres.`)
  .regex(new RegExp(`^[${TAG_ALPHABET}]+$`, "i"), "Tag inválido.")
  .transform((v) => v.toUpperCase());

/** Schema do handle completo "Lucas#7H2K". */
export const handleSchema = z.object({
  username: usernameSchema,
  tag: tagSchema,
});

export type Handle = z.infer<typeof handleSchema>;

/** Input pra mudar username (gera novo tag automaticamente). */
export const updateUsernameSchema = z.object({
  username: usernameSchema,
});

/** Input pra rerolar tag (mantém username). */
export const rerollTagSchema = z.object({});

/** Parse de "Lucas#7H2K" pra { username, tag }. Retorna null se mal-formado. */
export function parseHandle(handle: string): Handle | null {
  const m = handle.trim().match(/^([a-zA-Z0-9_-]+)#([a-zA-Z0-9]+)$/);
  if (!m) return null;
  const result = handleSchema.safeParse({ username: m[1], tag: m[2] });
  return result.success ? result.data : null;
}

/** Formata pra "Lucas#7H2K" — uppercase no tag. */
export function formatHandle(username: string, tag: string): string {
  return `${username}#${tag.toUpperCase()}`;
}

/** Slug seguro pra URL: "lucas-7h2k". */
export function handleSlug(username: string, tag: string): string {
  return `${username.toLowerCase()}-${tag.toLowerCase()}`;
}
