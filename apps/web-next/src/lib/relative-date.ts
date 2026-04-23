/**
 * Formata uma data ISO (ou Date) em forma relativa pt-BR.
 * Ex: "hoje", "ontem", "há 3 dias", "há 2 semanas", "há 1 mês".
 * Datas futuras retornam "em X" (simétrico).
 */
export function formatRelativeDatePtBR(input: string | Date | number | null): string {
  if (input === null) return "nunca";
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const past = diffMs < 0;
  const absMs = Math.abs(diffMs);

  const sec = Math.round(absMs / 1000);
  const min = Math.round(sec / 60);
  const hour = Math.round(min / 60);
  const day = Math.round(hour / 24);
  const week = Math.round(day / 7);
  const month = Math.round(day / 30);
  const year = Math.round(day / 365);

  // < 30s → "agora"
  if (sec < 30) return past ? "agora" : "agora";

  // hoje/ontem
  if (past && day === 0 && date.getDate() === now.getDate()) return "hoje";
  if (past && day <= 1) return "ontem";
  if (!past && day === 0 && date.getDate() === now.getDate()) return "hoje";
  if (!past && day <= 1) return "amanhã";

  const prefix = past ? "há " : "em ";
  if (day < 7) return `${prefix}${day} ${day === 1 ? "dia" : "dias"}`;
  if (week < 4) return `${prefix}${week} ${week === 1 ? "semana" : "semanas"}`;
  if (month < 12) return `${prefix}${month} ${month === 1 ? "mês" : "meses"}`;
  return `${prefix}${year} ${year === 1 ? "ano" : "anos"}`;
}

/**
 * Data absoluta em pt-BR (pra tooltips). "14 de março de 2026"
 */
export function formatAbsoluteDatePtBR(input: string | Date | number): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
