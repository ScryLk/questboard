// ── Cache helper minimalista sobre Redis ──
//
// `getOrSet` faz cache-aside: tenta ler do Redis; em miss, executa o
// loader, serializa e persiste com TTL. Falha de Redis NÃO derruba o
// caller — pega o valor fresco do loader e loga.
//
// `invalidate` apaga por padrão (KEYS). Para volume baixo (≤ 10k chaves)
// é OK; quando crescer, trocar por SCAN + UNLINK.

import { redis } from "./redis.js";

export async function getOrSet<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    console.warn(`[cache] read failed for ${key}:`, (err as Error).message);
  }

  const value = await loader();

  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    console.warn(`[cache] write failed for ${key}:`, (err as Error).message);
  }

  return value;
}

/** Invalida todas as chaves que casarem com o padrão (glob estilo Redis). */
export async function invalidate(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return;
    await redis.del(...keys);
  } catch (err) {
    console.warn(
      `[cache] invalidate failed for pattern ${pattern}:`,
      (err as Error).message,
    );
  }
}

/** Apaga uma chave específica. */
export async function invalidateKey(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (err) {
    console.warn(`[cache] del failed for ${key}:`, (err as Error).message);
  }
}
