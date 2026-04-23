import { ApiClient, createSearchClient } from "@questboard/api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// Em dev (sem Clerk em web-next ainda), o backend aceita x-user-id como bypass.
// Quando Clerk for plugado, troque defaultHeaders por getToken usando o JWT do Clerk.
const DEV_USER_ID =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_DEV_USER_ID ?? "dev-user-default"
    : "dev-user-default";

export const apiClient = new ApiClient({
  baseUrl: API_BASE_URL,
  defaultHeaders: () => ({ "x-user-id": DEV_USER_ID }),
});

export const searchClient = createSearchClient(apiClient);
