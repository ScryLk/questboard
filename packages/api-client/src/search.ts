import type {
  ApiResponse,
  SearchRequestInput,
  SearchResponse,
} from "@questboard/types";
import type { ApiClient } from "./client";

export interface SearchClient {
  search(
    campaignId: string,
    input: SearchRequestInput,
    options?: { signal?: AbortSignal },
  ): Promise<ApiResponse<SearchResponse>>;
}

function buildQuery(input: SearchRequestInput): string {
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

export function createSearchClient(api: ApiClient): SearchClient {
  return {
    search(campaignId, input, options) {
      const qs = buildQuery(input);
      return api.get<SearchResponse>(
        `/api/v1/campaigns/${encodeURIComponent(campaignId)}/search?${qs}`,
        { signal: options?.signal },
      );
    },
  };
}
