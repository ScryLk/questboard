"use client";

import { useState, useSyncExternalStore } from "react";
import { Play, RefreshCw, ChevronDown, ChevronRight, Info } from "lucide-react";
import { freesoundEngine } from "@/lib/audio/freesound-engine";
import { audioEngine } from "@/lib/audio/audio-engine";
import { SFX_DEFINITIONS } from "@/lib/audio/sfx-definitions";
import type { SFXDefinition } from "@/lib/audio/sfx-definitions";

// Group definitions by category
const CATEGORIES: Record<string, { label: string; defs: SFXDefinition[] }> = {};
for (const def of SFX_DEFINITIONS) {
  if (!CATEGORIES[def.category]) {
    const labels: Record<string, string> = {
      dice: "Dados",
      combat: "Combate",
      magic: "Magia",
      ui: "Interface",
      session: "Sessão",
      world: "Mundo / Mapa",
      soundboard: "Soundboard",
    };
    CATEGORIES[def.category] = { label: labels[def.category] ?? def.category, defs: [] };
  }
  CATEGORIES[def.category].defs.push(def);
}

function useEngineStatus() {
  return useSyncExternalStore(
    (cb) => freesoundEngine.onStatusChange(cb),
    () => freesoundEngine.getLoadedCount(),
    () => 0,
  );
}

function SFXRow({ def }: { def: SFXDefinition }) {
  const status = freesoundEngine.getStatus(def.id);
  const meta = freesoundEngine.getMeta(def.id);

  async function handleTest() {
    await audioEngine.init();
    freesoundEngine.play(def.id, { volume: def.volume });
  }

  return (
    <div className="flex items-center gap-2 rounded px-1.5 py-1 hover:bg-white/[0.03]">
      <button
        onClick={handleTest}
        disabled={status !== "loaded"}
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-white/[0.06] text-brand-muted transition-colors hover:bg-brand-accent/20 hover:text-brand-accent disabled:opacity-30"
        title="Testar"
      >
        <Play className="h-2.5 w-2.5" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[10px] text-brand-text">{def.name}</div>
        {meta && (
          <div className="truncate text-[8px] text-brand-muted">
            {meta.name} — {meta.author}
          </div>
        )}
      </div>
      <span
        className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
          status === "loaded"
            ? "bg-green-500"
            : status === "loading"
              ? "bg-yellow-500 animate-pulse"
              : status === "error"
                ? "bg-red-500"
                : "bg-white/20"
        }`}
        title={status}
      />
    </div>
  );
}

export function SFXSettingsPanel() {
  const loadedCount = useEngineStatus();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [clearing, setClearing] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  const total = SFX_DEFINITIONS.length;

  function toggleCategory(cat: string) {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  async function handleClearCache() {
    setClearing(true);
    await freesoundEngine.clearCache();
    setClearing(false);
    // Reload page to re-fetch sounds
    window.location.reload();
  }

  const credits = freesoundEngine.getCredits();

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-muted">
          Efeitos Sonoros ({loadedCount}/{total})
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setShowCredits(!showCredits)}
            className="rounded p-0.5 text-brand-muted hover:text-brand-text"
            title="Créditos (CC)"
          >
            <Info className="h-2.5 w-2.5" />
          </button>
          <button
            onClick={handleClearCache}
            disabled={clearing}
            className="rounded p-0.5 text-brand-muted hover:text-brand-text disabled:animate-spin"
            title="Limpar cache e re-baixar"
          >
            <RefreshCw className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {loadedCount < total && (
        <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-brand-accent transition-all"
            style={{ width: `${(loadedCount / total) * 100}%` }}
          />
        </div>
      )}

      {/* Credits modal */}
      {showCredits && credits.length > 0 && (
        <div className="max-h-40 overflow-y-auto rounded border border-brand-border bg-white/[0.02] p-2">
          <div className="mb-1 text-[9px] font-semibold text-brand-muted">
            Sons via Freesound.org (Creative Commons)
          </div>
          {credits.map((c) => (
            <div key={c.sfxId} className="text-[8px] text-brand-muted">
              <span className="text-brand-text">{c.name}</span> por{" "}
              <a
                href={`https://freesound.org/people/${c.author}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-accent hover:underline"
              >
                {c.author}
              </a>{" "}
              — freesound.org/s/{c.freesoundId}
            </div>
          ))}
        </div>
      )}

      {/* Categories */}
      <div className="space-y-0.5">
        {Object.entries(CATEGORIES).map(([cat, { label, defs }]) => (
          <div key={cat}>
            <button
              onClick={() => toggleCategory(cat)}
              className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-[9px] font-medium text-brand-muted hover:bg-white/[0.03] hover:text-brand-text"
            >
              {expanded[cat] ? (
                <ChevronDown className="h-2.5 w-2.5" />
              ) : (
                <ChevronRight className="h-2.5 w-2.5" />
              )}
              {label} ({defs.length})
            </button>
            {expanded[cat] && (
              <div className="ml-1 space-y-0">
                {defs.map((def) => (
                  <SFXRow key={def.id} def={def} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
