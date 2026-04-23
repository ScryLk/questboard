// Tipos de busca global. Mantidos sincronizados manualmente com os schemas
// Zod em @questboard/validators (search.schema.ts) — fonte de verdade.

export type SearchType = "map" | "character" | "note" | "session";

export interface SearchRequestInput {
  q: string;
  types?: SearchType[];
  limit?: number;
}

export interface SearchResultItem {
  id: string;
  type: SearchType;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  url: string;
  score: number;
}

export interface SearchResponse {
  query: string;
  results: {
    maps: SearchResultItem[];
    characters: SearchResultItem[];
    notes: SearchResultItem[];
    sessions: SearchResultItem[];
  };
  totalCount: number;
  tookMs: number;
}
