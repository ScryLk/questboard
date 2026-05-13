"use client";

// Hook simples de fetch+state pra dashboard agregado da campanha.
// Não usamos React Query no projeto — padrão é useState + useEffect.
// Server cacheia 60s (Redis), client redorna em foco e a cada 30s.

import { useEffect, useRef, useState } from "react";
import { getCampaignDashboard } from "@/lib/dashboard-api";
import type { DashboardDto } from "@questboard/validators";

interface State {
  data: DashboardDto | null;
  isLoading: boolean;
  error: string | null;
  /** True quando o backend retornou 404 — a campanha selecionada não existe
   *  mais (ex: foi deletada, ou localStorage tem id stale após reset do DB). */
  notFound: boolean;
}

interface UseCampaignDashboardResult extends State {
  refetch: () => void;
}

const POLL_INTERVAL_MS = 30_000;

export function useCampaignDashboard(
  campaignId: string | null,
): UseCampaignDashboardResult {
  const [state, setState] = useState<State>({
    data: null,
    isLoading: campaignId !== null,
    error: null,
    notFound: false,
  });
  const triggerRef = useRef(0);

  function refetch() {
    triggerRef.current += 1;
    setState((s) => ({ ...s, isLoading: true }));
  }

  useEffect(() => {
    if (!campaignId) {
      setState({ data: null, isLoading: false, error: null, notFound: false });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, isLoading: true }));

    async function load() {
      try {
        const dto = await getCampaignDashboard(campaignId!);
        if (cancelled) return;
        setState({ data: dto, isLoading: false, error: null, notFound: false });
      } catch (err) {
        if (cancelled) return;
        const status = (err as { statusCode?: number }).statusCode;
        // 404 = campanha não existe; UI mostra empty state específico.
        if (status === 404) {
          setState({ data: null, isLoading: false, error: null, notFound: true });
          return;
        }
        setState({
          data: null,
          isLoading: false,
          error:
            (err as { message?: string }).message ??
            "Não foi possível carregar o dashboard.",
          notFound: false,
        });
      }
    }

    void load();

    // Poll silencioso a cada 30s + revalidar em foco.
    const interval = setInterval(load, POLL_INTERVAL_MS);
    function onFocus() {
      void load();
    }
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, triggerRef.current]);

  return { ...state, refetch };
}
