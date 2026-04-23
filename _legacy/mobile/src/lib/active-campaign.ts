import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApi } from "./api-context";

const STORAGE_KEY = "questboard:activeCampaignId";

interface CampaignSummary {
  id: string;
  name: string;
}

/**
 * Hook stub para a campanha ativa. Resolve, em ordem:
 *   1. valor armazenado em AsyncStorage
 *   2. primeira campanha do usuário via GET /campaigns (auto-pick)
 *
 * TODO: substituir por contexto real quando o seletor de campanha for
 * incorporado ao mobile.
 */
export function useActiveCampaignId(): {
  campaignId: string | null;
  setCampaignId: (id: string | null) => Promise<void>;
} {
  const api = useApi();
  const [campaignId, setState] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) return;
        if (stored) {
          setState(stored);
          return;
        }
        const res = await api.getCampaigns();
        if (cancelled || !res.success) return;
        const first = res.data && res.data.length > 0 ? res.data[0] : null;
        if (first) {
          await AsyncStorage.setItem(STORAGE_KEY, first.id);
          setState(first.id);
        }
      } catch {
        // Sem rede — busca fica desativada até haver campanha.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api]);

  const setCampaignId = async (id: string | null) => {
    setState(id);
    if (id) await AsyncStorage.setItem(STORAGE_KEY, id);
    else await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return { campaignId, setCampaignId };
}
