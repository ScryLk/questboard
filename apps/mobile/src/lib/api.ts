import type {
  ApiResponse,
  PaginatedResponse,
  Session,
} from "@questboard/shared";

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export function createApiClient(
  getToken: () => Promise<string | null>,
  userId: string | null | undefined,
) {
  async function request<T>(
    path: string,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    const token = await getToken();
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(userId ? { "x-user-id": userId } : {}),
        ...options?.headers,
      },
    });
    return res.json();
  }

  return {
    getSessions: () => request<Session[]>("/sessions"),
    getPublicSessions: (page = 1, pageSize = 20) =>
      request<PaginatedResponse<Session>>(
        `/sessions/public?page=${page}&pageSize=${pageSize}`,
      ),
    createSession: (input: Record<string, unknown>) =>
      request<Session>("/sessions", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    getSession: (id: string) => request<Session>(`/sessions/${id}`),
    joinSession: (id: string, inviteCode: string) =>
      request<unknown>(`/sessions/${id}/join`, {
        method: "POST",
        body: JSON.stringify({ inviteCode }),
      }),
  };
}
