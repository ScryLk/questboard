// ── HTTP client mínimo pra apps/api ──
//
// Wrapper genérico de fetch com:
//   - URL base configurável (NEXT_PUBLIC_API_URL ou fallback dev).
//   - Bearer token (Clerk) anexado quando disponível.
//   - Parsing de erro estruturado (`AppError` shape do backend).
//   - Tipo de retorno parametrizável.
//
// Não substitui um client gerado (futuro tRPC ou OpenAPI). Serve pra
// chamadas pontuais de módulos que ainda não têm SDK.

const DEFAULT_BASE_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:3001";

const API_PREFIX = "/api/v1";

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  raw?: unknown;
}

/** Retorna o token Bearer atual. Em browser: leitura do Clerk session
 *  (window.Clerk?.session?.getToken). Quando ausente, retorna null —
 *  endpoints públicos seguem funcionando. */
async function defaultGetToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const clerk = (window as unknown as { Clerk?: { session?: { getToken?: () => Promise<string | null> } } })
    .Clerk;
  if (clerk?.session?.getToken) {
    try {
      return (await clerk.session.getToken()) ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Sobrescreve `defaultGetToken`. Útil em testes ou rotas onde o
   *  caller já tem o token em mãos. */
  getToken?: () => Promise<string | null>;
  /** Sobrescreve a base URL — útil para apontar a outro ambiente. */
  baseUrl?: string;
  /** Quando true, lança erro como `ApiError` em vez de jogar fetch raw. */
  signal?: AbortSignal;
}

export async function apiRequest<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;
  const url = `${baseUrl}${API_PREFIX}${path}`;
  const token = await (opts.getToken ?? defaultGetToken)();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      // Resposta não-JSON; mantemos como texto bruto pra log.
      parsed = text;
    }
  }

  if (!response.ok) {
    const err: ApiError = {
      code: extractCode(parsed),
      message: extractMessage(parsed) ?? `Request falhou (${response.status})`,
      statusCode: response.status,
      raw: parsed,
    };
    throw err;
  }

  // Backend usa `createSuccessResponse({ data })` — extraímos `.data`.
  if (
    parsed &&
    typeof parsed === "object" &&
    "data" in parsed &&
    !("error" in parsed)
  ) {
    return (parsed as { data: T }).data;
  }
  return parsed as T;
}

function extractCode(payload: unknown): string {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "code" in payload.error
  ) {
    return String((payload.error as { code?: unknown }).code ?? "UNKNOWN");
  }
  return "UNKNOWN";
}

function extractMessage(payload: unknown): string | null {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error
  ) {
    return String((payload.error as { message?: unknown }).message ?? "");
  }
  return null;
}

/** Helper pra detectar `ApiError` vs erro genérico. */
export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    "statusCode" in err
  );
}
