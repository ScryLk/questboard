// Helpers de formatação pro dashboard. Pt-BR.

const HOURS_FORMATTER = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** "36.5h" — usa `h` (não "horas") porque os cards são compactos. */
export function formatHours(hours: number): string {
  if (hours === 0) return "0h";
  return `${HOURS_FORMATTER.format(hours)}h`;
}

/** "Sab 15/03 20:00" — formato pt-BR compacto. */
export function formatNextSession(iso: string): string {
  const date = new Date(iso);
  const day = DATE_FORMATTER.format(date).replace(",", "").replace(".", "");
  const time = TIME_FORMATTER.format(date);
  // Primeira letra maiúscula (Intl retorna "sab").
  return `${day.charAt(0).toUpperCase() + day.slice(1)} ${time}`;
}

/** "15/03/2026" — pra coluna Data na tabela. */
export function formatPlayedAt(iso: string): string {
  return FULL_DATE_FORMATTER.format(new Date(iso));
}

/** "3h 45m" ou "—" se 0. */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Label pt-BR pro status da sessão. */
export function formatSessionStatus(status: "ENDED" | "CANCELLED"): string {
  return status === "ENDED" ? "Concluída" : "Cancelada";
}
