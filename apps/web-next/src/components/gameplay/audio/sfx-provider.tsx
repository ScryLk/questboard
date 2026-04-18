"use client";

import { useEffect, useState } from "react";
import { freesoundEngine } from "@/lib/audio/freesound-engine";
import { SFX_DEFINITIONS } from "@/lib/audio/sfx-definitions";

export function SFXProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  const [ready, setReady] = useState(false);

  // Defer SFX loading until first user interaction (respects browser autoplay policy
  // and avoids unnecessary network requests on initial page load)
  useEffect(() => {
    let cancelled = false;

    function startLoading() {
      freesoundEngine
        .loadAllSFX(SFX_DEFINITIONS, (loaded, total) => {
          if (!cancelled) setProgress({ loaded, total });
        })
        .then(() => {
          if (!cancelled) {
            setReady(true);
            /* loaded */
          }
        })
        .catch((err) => {
          console.error("[SFX] Failed to load sounds:", err);
        });
    }

    function handleFirstInteraction() {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      startLoading();
    }

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  return (
    <>
      {!ready && progress.total > 0 && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-brand-border bg-brand-panel px-3 py-2 text-xs text-brand-muted">
          Carregando sons: {progress.loaded}/{progress.total}
        </div>
      )}
      {children}
    </>
  );
}
