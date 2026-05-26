"use client";

// Hidrata o cache local de campanhas a partir do backend e revalida em
// foco. Roda no mount do layout do dashboard.
//
// Antes: só pegava ids pra remover fantasmas (criação ainda era local).
// Agora: GET /campaigns devolve o estado completo, então o store passa
// a refletir 1:1 o Postgres.

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { listCampaigns } from "@/lib/campaign-api";
import { useCampaignStore } from "@/lib/campaign-store";

export function useReconcileCampaigns(): void {
  const { isLoaded, isSignedIn } = useUser();
  const hydrate = useCampaignStore((s) => s.hydrateCampaigns);
  const setHydrating = useCampaignStore((s) => s.setHydrating);
  const lastFetchRef = useRef(0);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      // Sem usuário, marca hidratação como concluída (vazio) pra a UI
      // não ficar travada em loading state.
      setHydrating(false);
      return;
    }
    let cancelled = false;

    async function load() {
      if (Date.now() - lastFetchRef.current < 5_000) return;
      lastFetchRef.current = Date.now();
      try {
        const campaigns = await listCampaigns();
        if (cancelled) return;
        hydrate(campaigns);
      } catch (err) {
        if (cancelled) return;
        console.error("[hydrate-campaigns] falha ao listar", err);
        setHydrating(false);
      }
    }

    void load();
    function onFocus() {
      void load();
    }
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [isLoaded, isSignedIn, hydrate, setHydrating]);
}
