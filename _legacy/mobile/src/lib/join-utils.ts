/**
 * Normaliza um código removendo espaços e convertendo para uppercase.
 * "qb-7k3m" → "QB-7K3M"
 * "a3k9f2" → "A3K9F2"
 */
export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

/**
 * Detecta se o código é de campanha (QB-XXXX), sessão (XXXXXX), ou desconhecido.
 */
export function detectCodeType(
  code: string,
): "campaign" | "session" | "unknown" {
  const normalized = normalizeCode(code);

  // Campanha: começa com QB- e tem 4+ chars alfanuméricos após
  if (/^QB-?[A-Z0-9]{4}$/.test(normalized)) return "campaign";
  // Permite input parcial com prefixo QB
  if (/^QB-?[A-Z0-9]{0,3}$/.test(normalized) && normalized.length >= 2)
    return "campaign";

  // Sessão: exatamente 6 chars alfanuméricos sem prefixo QB
  if (/^[A-Z0-9]{6}$/.test(normalized) && !normalized.startsWith("QB"))
    return "session";

  return "unknown";
}

/**
 * Formata o código para display.
 * "QB7K3M" → "QB-7K3M"
 * "A3K9F2" → "A3K9F2"
 */
export function formatDisplayCode(raw: string): string {
  const normalized = normalizeCode(raw);

  // Auto-insere hífen após QB se o usuário não digitou
  if (/^QB[A-Z0-9]/.test(normalized) && !normalized.includes("-")) {
    return `QB-${normalized.slice(2)}`;
  }

  return normalized;
}

/**
 * Verifica se o código está completo e pronto para validação.
 */
export function isCodeComplete(code: string): boolean {
  const normalized = normalizeCode(code);
  const type = detectCodeType(normalized);

  if (type === "campaign") {
    // QB-XXXX = 7 chars com hífen, ou QB + 4 chars = 6 sem hífen
    const clean = normalized.replace("QB-", "").replace("QB", "");
    return clean.length === 4;
  }

  if (type === "session") {
    return normalized.length === 6;
  }

  return false;
}
