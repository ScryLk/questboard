"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useTokenLibraryStore } from "@/lib/token-library-store";
import type { SavedToken, TokenFilter } from "@/lib/token-library-types";
import { SAVED_TOKEN_TYPE_CONFIG } from "@/lib/token-library-types";
import { TokenListItem } from "./token-list-item";

export function MyTokensTab() {
  const savedTokens = useTokenLibraryStore((s) => s.savedTokens);
  const gameTokens = useGameplayStore((s) => s.tokens);
  const [filter, setFilter] = useState<TokenFilter>({});

  // Find map tokens that match saved tokens by name or compendiumId
  const onMapInfo = useMemo(() => {
    const onMapTokens = gameTokens.filter((t) => t.onMap);
    const result: Record<string, string[]> = {};

    for (const saved of savedTokens) {
      const matched = onMapTokens.filter(
        (gt) =>
          gt.name === saved.name ||
          gt.name.startsWith(saved.name + " #"),
      );
      if (matched.length > 0) {
        result[saved.id] = matched.map((m) => m.id);
      }
    }
    return result;
  }, [savedTokens, gameTokens]);

  // Filter tokens
  const filteredTokens = useMemo(() => {
    let result = savedTokens;

    if (filter.search?.trim()) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.creatureType.toLowerCase().includes(q),
      );
    }
    if (filter.type) result = result.filter((t) => t.type === filter.type);
    if (filter.favorite) result = result.filter((t) => t.favorite);
    if (filter.onMap)
      result = result.filter((t) => (onMapInfo[t.id]?.length ?? 0) > 0);

    return result.sort((a, b) => {
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, [savedTokens, filter, onMapInfo]);

  const onMapTokens = filteredTokens.filter(
    (t) => (onMapInfo[t.id]?.length ?? 0) > 0,
  );
  const savedOnly = filteredTokens.filter(
    (t) => (onMapInfo[t.id]?.length ?? 0) === 0,
  );

  return (
    <div>
      {/* Search + filter */}
      <div className="mb-1.5 flex gap-1 px-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-brand-muted/50" />
          <input
            type="text"
            value={filter.search ?? ""}
            onChange={(e) =>
              setFilter((f) => ({ ...f, search: e.target.value }))
            }
            placeholder="Buscar token..."
            className="h-6 w-full rounded-md border border-brand-border bg-brand-primary pl-7 pr-2 text-[10px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
          />
        </div>
        <select
          value={filter.type ?? ""}
          onChange={(e) =>
            setFilter((f) => ({
              ...f,
              type: (e.target.value || undefined) as TokenFilter["type"],
            }))
          }
          className="h-6 rounded-md border border-brand-border bg-brand-primary px-1 text-[10px] text-brand-muted outline-none"
        >
          <option value="">Todos</option>
          {Object.entries(SAVED_TOKEN_TYPE_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          ))}
          <option value="__fav">Favoritos</option>
          <option value="__map">No Mapa</option>
        </select>
      </div>

      {/* Token List */}
      {filteredTokens.length === 0 ? (
        <div className="px-3 py-4 text-center">
          <p className="text-[10px] text-brand-muted">
            {savedTokens.length === 0
              ? "Nenhum token salvo. Crie um com [+] ou salve do Compendio."
              : "Nenhum token encontrado."}
          </p>
        </div>
      ) : (
        <div className="max-h-[260px] overflow-y-auto px-1">
          {/* On Map */}
          {onMapTokens.length > 0 && (
            <div>
              <div className="px-2 pb-0.5 pt-1.5">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-accent">
                  No Mapa ({onMapTokens.length})
                </span>
              </div>
              {onMapTokens.map((token) => (
                <TokenListItem
                  key={token.id}
                  token={token}
                  isOnMap={true}
                  mapTokenIds={onMapInfo[token.id] ?? []}
                />
              ))}
            </div>
          )}

          {/* Saved */}
          {savedOnly.length > 0 && (
            <div>
              <div className="px-2 pb-0.5 pt-1.5">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-muted">
                  Salvos ({savedOnly.length})
                </span>
              </div>
              {savedOnly.map((token) => (
                <TokenListItem
                  key={token.id}
                  token={token}
                  isOnMap={false}
                  mapTokenIds={[]}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
