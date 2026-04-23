"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  Map as MapIcon,
  User as UserIcon,
  StickyNote,
  CalendarDays,
  Clock,
  X,
} from "lucide-react";
import type {
  SearchResultItem,
  SearchResponse,
  SearchType,
} from "@questboard/types";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { useSearchStore } from "@/lib/search-store";
import { useGlobalSearchShortcut } from "./use-global-search-shortcut";

export type GlobalSearchContext = "dashboard" | "gameplay";

interface GlobalSearchProps {
  campaignId: string | null;
  context?: GlobalSearchContext;
  /** Handler customizado (gameplay sobrescreve para navegar dentro do canvas). */
  onSelectResult?: (
    item: SearchResultItem,
    context: GlobalSearchContext,
  ) => boolean | void;
  /** Render do trigger; se não fornecido, renderiza o input padrão do header. */
  renderTrigger?: (open: () => void) => React.ReactNode;
}

const TYPE_META: Record<
  SearchType,
  { label: string; Icon: typeof MapIcon }
> = {
  map: { label: "Mapas", Icon: MapIcon },
  character: { label: "Personagens", Icon: UserIcon },
  note: { label: "Notas", Icon: StickyNote },
  session: { label: "Sessões", Icon: CalendarDays },
};

const ORDER: SearchType[] = ["map", "character", "note", "session"];

function flatten(results: SearchResponse | null): SearchResultItem[] {
  if (!results) return [];
  return [
    ...results.results.maps,
    ...results.results.characters,
    ...results.results.notes,
    ...results.results.sessions,
  ];
}

export function GlobalSearch({
  campaignId,
  context = "dashboard",
  onSelectResult,
  renderTrigger,
}: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { query, setQuery, results, isLoading, error } = useGlobalSearch(
    open ? campaignId : null,
  );
  const recent = useSearchStore((s) => s.recent);
  const addRecent = useSearchStore((s) => s.addRecent);
  const removeRecent = useSearchStore((s) => s.removeRecent);
  const clearRecent = useSearchStore((s) => s.clearRecent);

  const openDialog = useCallback(() => setOpen(true), []);
  useGlobalSearchShortcut(openDialog);

  // Reset query ao fechar.
  useEffect(() => {
    if (!open) setQuery("");
  }, [open, setQuery]);

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      addRecent(item);
      setOpen(false);
      const handled = onSelectResult?.(item, context);
      if (handled === true) return;
      router.push(item.url);
    },
    [addRecent, context, onSelectResult, router],
  );

  const showingRecent = query.trim().length < 2;
  const flat = flatten(results);
  const noResults =
    !showingRecent &&
    !isLoading &&
    !error &&
    flat.length === 0 &&
    query.trim().length >= 2;

  return (
    <>
      {renderTrigger ? (
        renderTrigger(openDialog)
      ) : (
        <button
          type="button"
          onClick={openDialog}
          className="flex w-64 items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-left text-sm text-brand-muted transition-colors hover:bg-white/10"
          aria-label="Abrir busca global"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 truncate">Buscar...</span>
          <kbd className="hidden rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-muted sm:inline-flex">
            ⌘K
          </kbd>
        </button>
      )}

      {open && (
        <div
          data-global-search
          className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 px-4 pt-[12vh]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-brand-border bg-[#111116] shadow-2xl">
            <Command shouldFilter={false} loop>
              <div className="flex items-center gap-3 border-b border-brand-border px-4">
                <Search className="h-4 w-4 text-brand-muted" />
                <Command.Input
                  autoFocus
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Buscar em mapas, personagens, notas..."
                  className="flex-1 bg-transparent py-3 text-sm text-brand-text placeholder-brand-muted outline-none"
                />
                <button
                  onClick={() => setOpen(false)}
                  className="rounded p-1 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
                  aria-label="Fechar busca"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <Command.List className="max-h-[60vh] overflow-y-auto px-1 py-2">
                {!campaignId && (
                  <div className="px-4 py-8 text-center text-sm text-brand-muted">
                    Selecione uma campanha para buscar.
                  </div>
                )}

                {campaignId && showingRecent && recent.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-brand-muted">
                    Digite pelo menos 2 caracteres para buscar.
                    <div className="mt-2 text-xs">
                      Dica:{" "}
                      <kbd className="rounded bg-white/10 px-1 py-0.5 text-[10px]">
                        ⌘K
                      </kbd>{" "}
                      abre a busca de qualquer lugar.
                    </div>
                  </div>
                )}

                {campaignId && showingRecent && recent.length > 0 && (
                  <Command.Group
                    heading="Buscas recentes"
                    className="px-2 text-[11px] uppercase tracking-wide text-brand-muted [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1"
                  >
                    {recent.map((r) => {
                      const Meta = TYPE_META[r.type];
                      return (
                        <Command.Item
                          key={`${r.type}:${r.id}`}
                          value={`${r.type}:${r.id}:${r.title}`}
                          onSelect={() =>
                            handleSelect({
                              id: r.id,
                              type: r.type,
                              title: r.title,
                              subtitle: r.subtitle,
                              url: r.url,
                              score: 0,
                            })
                          }
                          className="group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-brand-text data-[selected=true]:bg-white/10"
                        >
                          <Clock className="h-4 w-4 shrink-0 text-brand-muted" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">{r.title}</div>
                            {r.subtitle && (
                              <div className="truncate text-xs text-brand-muted">
                                {r.subtitle}
                              </div>
                            )}
                          </div>
                          <span className="shrink-0 text-[10px] uppercase text-brand-muted">
                            {Meta.label.slice(0, -1)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecent(r.id, r.type);
                            }}
                            className="ml-1 hidden rounded p-1 text-brand-muted hover:bg-white/10 group-data-[selected=true]:inline-flex"
                            aria-label="Remover dos recentes"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Command.Item>
                      );
                    })}
                    <div className="mt-1 px-3 pb-1 text-right">
                      <button
                        onClick={clearRecent}
                        className="text-[11px] text-brand-muted underline-offset-2 hover:text-brand-text hover:underline"
                      >
                        Limpar histórico
                      </button>
                    </div>
                  </Command.Group>
                )}

                {campaignId && !showingRecent && isLoading && (
                  <div className="space-y-2 p-3">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-10 animate-pulse rounded-md bg-white/5"
                      />
                    ))}
                  </div>
                )}

                {campaignId && !showingRecent && error && (
                  <div className="px-4 py-8 text-center text-sm text-red-400">
                    {error}
                  </div>
                )}

                {campaignId && noResults && (
                  <div className="px-4 py-8 text-center text-sm text-brand-muted">
                    Nenhum resultado para <em className="text-brand-text">{query}</em>
                  </div>
                )}

                {campaignId &&
                  !showingRecent &&
                  results &&
                  ORDER.map((type) => {
                    const list = results.results[`${type}s` as const] as SearchResultItem[];
                    if (!list || list.length === 0) return null;
                    const Meta = TYPE_META[type];
                    return (
                      <Command.Group
                        key={type}
                        heading={`${Meta.label} (${list.length})`}
                        className="px-2 text-[11px] uppercase tracking-wide text-brand-muted [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1"
                      >
                        {list.map((item) => (
                          <Command.Item
                            key={`${item.type}:${item.id}`}
                            value={`${item.type}:${item.id}:${item.title}`}
                            onSelect={() => handleSelect(item)}
                            className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-brand-text data-[selected=true]:bg-white/10"
                          >
                            {item.thumbnail ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.thumbnail}
                                alt=""
                                className="h-8 w-8 shrink-0 rounded object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white/5">
                                <Meta.Icon className="h-4 w-4 text-brand-muted" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium">
                                {item.title}
                              </div>
                              {item.subtitle && (
                                <div className="truncate text-xs text-brand-muted">
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    );
                  })}
              </Command.List>

              <div className="flex items-center justify-between border-t border-brand-border px-4 py-2 text-[10px] text-brand-muted">
                <div className="flex items-center gap-3">
                  <span>
                    <kbd className="rounded bg-white/10 px-1 py-0.5">↑↓</kbd> navegar
                  </span>
                  <span>
                    <kbd className="rounded bg-white/10 px-1 py-0.5">↵</kbd> abrir
                  </span>
                  <span>
                    <kbd className="rounded bg-white/10 px-1 py-0.5">Esc</kbd> fechar
                  </span>
                </div>
                {results && !showingRecent && (
                  <span>{results.tookMs}ms</span>
                )}
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
