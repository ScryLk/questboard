import type {
  ApiResponse,
  PaginatedResponse,
  Session,
  SearchRequestInput,
  SearchResponse,
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

  function buildSearchQuery(input: SearchRequestInput): string {
    const params = new URLSearchParams();
    params.set("q", input.q);
    if (input.types && input.types.length > 0) {
      params.set("types", input.types.join(","));
    }
    if (input.limit != null) {
      params.set("limit", String(input.limit));
    }
    return params.toString();
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
    findByCode: (code: string) =>
      request<Session>(`/sessions/by-code/${encodeURIComponent(code)}`),
    joinSession: (id: string, inviteCode: string) =>
      request<unknown>(`/sessions/${id}/join`, {
        method: "POST",
        body: JSON.stringify({ inviteCode }),
      }),
    getCampaigns: () =>
      request<Array<{ id: string; name: string }>>("/campaigns"),
    search: (
      campaignId: string,
      input: SearchRequestInput,
      options?: { signal?: AbortSignal },
    ): Promise<ApiResponse<SearchResponse>> =>
      request<SearchResponse>(
        `/campaigns/${encodeURIComponent(campaignId)}/search?${buildSearchQuery(input)}`,
        { signal: options?.signal },
      ),
  };
}
