// ── Gerador de tag pro handle (Name#TAG) ─────────────────────
//
// Usa `crypto.randomBytes` (já garantido nas regras de ouro #4 pra
// dados) com o alfabeto seguro de 32 chars (sem I/O/0/1).

import { randomBytes } from "node:crypto";
import { TAG_ALPHABET, TAG_LENGTH } from "@questboard/validators";

/** Gera um tag aleatório do alfabeto seguro. */
export function generateTag(length: number = TAG_LENGTH): string {
  const buf = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += TAG_ALPHABET[buf[i]! % TAG_ALPHABET.length];
  }
  return out;
}

/** Tenta gerar um tag único pra um username dado, consultando o DB.
 *  Faz até `maxAttempts` tentativas com `length=4`; se todas
 *  colidirem, escala pra `length=5`. */
export async function generateUniqueTag(opts: {
  username: string;
  isTaken: (tag: string) => Promise<boolean>;
  maxAttempts?: number;
}): Promise<string> {
  const { username, isTaken, maxAttempts = 10 } = opts;

  for (let i = 0; i < maxAttempts; i++) {
    const tag = generateTag(TAG_LENGTH);
    if (!(await isTaken(tag))) return tag;
  }

  // Fallback: tag de 5 chars — espaço 24x maior.
  for (let i = 0; i < maxAttempts; i++) {
    const tag = generateTag(TAG_LENGTH + 1);
    if (!(await isTaken(tag))) return tag;
  }

  throw new Error(
    `Não foi possível gerar tag único pra "${username}" após ${maxAttempts * 2} tentativas.`,
  );
}
