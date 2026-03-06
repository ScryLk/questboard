"use client";

import { useState } from "react";
import {
  Settings2,
  Map,
  Music,
  Cloud,
  StickyNote,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export function LobbyConfig() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-brand-border bg-white/[0.02]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
      >
        <Settings2 className="h-4 w-4 text-brand-accent" />
        <span className="flex-1 text-xs font-semibold text-brand-text">
          Configuração Rápida
        </span>
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-brand-muted" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-brand-muted" />
        )}
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-brand-border px-3 py-3">
          {/* Map */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-brand-muted">
              <Map className="h-3 w-3" /> Mapa
            </span>
            <button className="rounded-md bg-white/[0.06] px-2 py-1 text-[10px] font-medium text-brand-text transition-colors hover:bg-white/[0.1]">
              Castelo de Ravenloft
            </button>
          </div>

          {/* Music */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-brand-muted">
              <Music className="h-3 w-3" /> Música do Lobby
            </span>
            <button className="rounded-md bg-white/[0.06] px-2 py-1 text-[10px] font-medium text-brand-text transition-colors hover:bg-white/[0.1]">
              Nenhuma
            </button>
          </div>

          {/* Fog */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-brand-muted">
              <Cloud className="h-3 w-3" /> Fog of War
            </span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" defaultChecked className="peer sr-only" />
              <div className="peer h-5 w-9 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-transparent after:bg-white/40 after:transition-all after:content-[''] peer-checked:bg-brand-accent peer-checked:after:translate-x-full peer-checked:after:bg-white" />
            </label>
          </div>

          {/* Notes */}
          <div>
            <span className="flex items-center gap-1.5 text-xs text-brand-muted">
              <StickyNote className="h-3 w-3" /> Notas da Sessão
            </span>
            <textarea
              placeholder="Notas visíveis apenas para o GM..."
              className="mt-1 w-full resize-none rounded-lg border border-brand-border bg-white/[0.04] px-2 py-1.5 text-xs text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}
