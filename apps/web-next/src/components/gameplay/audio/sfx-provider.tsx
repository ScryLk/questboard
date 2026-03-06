"use client";

import { useEffect, useState } from "react";
import { freesoundEngine } from "@/lib/audio/freesound-engine";
import { SFX_DEFINITIONS } from "@/lib/audio/sfx-definitions";

export function SFXProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    freesoundEngine
      .loadAllSFX(SFX_DEFINITIONS, (loaded, total) => {
        if (!cancelled) setProgress({ loaded, total });
      })
      .then(() => {
        if (!cancelled) {
          setReady(true);
          console.log(`[SFX] ${SFX_DEFINITIONS.length} sons carregados via Freesound`);
        }
      })
      .catch((err) => {
        console.error("[SFX] Failed to load sounds:", err);
      });

    return () => {
      cancelled = true;
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
