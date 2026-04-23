import { useEffect, useRef, useState } from "react";
import type { SearchResponse } from "@questboard/shared";
import { useApi } from "../lib/api-context";

const DEBOUNCE_MS = 250;
const MIN_QUERY = 2;

interface UseGlobalSearchResult {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useGlobalSearch(campaignId: string | null): UseGlobalSearchResult {
  const api = useApi();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!campaignId) {
      setResults(null);
      setError(null);
      return;
    }
    if (query.trim().length < MIN_QUERY) {
      abortRef.current?.abort();
      setResults(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.search(
          campaignId,
          { q: query.trim() },
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        if (res.success) {
          setResults(res.data ?? null);
        } else {
          setResults(null);
          setError(res.error?.message ?? "Falha ao buscar.");
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setResults(null);
        setError("Falha ao conectar com o servidor.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [api, query, campaignId]);

  return { query, setQuery, results, isLoading, error };
}
