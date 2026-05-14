"use client";

// Cache leve do GET /users/me. Frontend usa pra saber o `id` interno
// do User (DB) — distinto do Clerk externalId. Fetch único na sessão
// do navegador, em memória (sem persist).

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getMe, type MeDto } from "@/lib/me-api";

let cached: MeDto | null = null;
let inflight: Promise<MeDto> | null = null;

export function useMe(): MeDto | null {
  const { isSignedIn, isLoaded } = useUser();
  const [me, setMe] = useState<MeDto | null>(cached);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (cached) {
      setMe(cached);
      return;
    }
    if (!inflight) {
      inflight = getMe()
        .then((dto) => {
          cached = dto;
          return dto;
        })
        .catch((err) => {
          inflight = null;
          throw err;
        });
    }
    let cancelled = false;
    void inflight.then((dto) => {
      if (!cancelled) setMe(dto);
    });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  return me;
}
