"use client";

import { useEffect, useState } from "react";
import { apiClient } from "./api";

const STORAGE_KEY = "questboard:activeCampaignId";

interface CampaignSummary {
  id: string;
  name: string;
}

/**
 * Hook stub para a campanha ativa. Resolve, em ordem:
 *   1. valor armazenado em localStorage
 *   2. primeira campanha do usuário via GET /api/v1/campaigns (auto-pick)
 *
 * TODO: substituir por contexto/store real quando o seletor de campanha for
 * incorporado ao header (hoje a campanha exibida é mockada).
 */
export function useActiveCampaignId(): {
  campaignId: string | null;
  setCampaignId: (id: string | null) => void;
} {
  const [campaignId, setState] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setState(stored);
      return;
    }
    let cancelled = false;
    apiClient
      .get<CampaignSummary[]>("/api/v1/campaigns")
      .then((res) => {
        if (cancelled) return;
        const first = res.success && res.data && res.data.length > 0 ? res.data[0] : null;
        if (first) {
          window.localStorage.setItem(STORAGE_KEY, first.id);
          setState(first.id);
        }
      })
      .catch(() => {
        // Sem rede / API offline — busca fica desativada até haver campanha.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setCampaignId = (id: string | null) => {
    setState(id);
    if (typeof window === "undefined") return;
    if (id) window.localStorage.setItem(STORAGE_KEY, id);
    else window.localStorage.removeItem(STORAGE_KEY);
  };

  return { campaignId, setCampaignId };
}
