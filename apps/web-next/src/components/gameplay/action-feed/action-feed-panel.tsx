"use client";

import { useEffect, useMemo } from "react";
import { ClipboardList, Trash2, X } from "lucide-react";
import {
  useActionFeedStore,
  type FeedFilter,
} from "@/lib/action-feed-store";
import { ActionFeedEntry } from "./action-feed-entry";
import { useFeedTick } from "./use-feed-tick";

const STORAGE_KEY = "qb.action-feed.open";

const FILTERS: { key: FeedFilter; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "movimento", label: "Movimento" },
  { key: "combate", label: "Combate" },
  { key: "dados", label: "Dados" },
  { key: "outros", label: "Outros" },
];

/**
 * Painel lateral direito do GM com feed de ações da sessão.
 *
 * Só renderiza pra `currentUserIsGM` (checked pelo caller no
 * GameplayLayout). Colapsável: estado persiste em localStorage.
 *
 * Desktop-only por ora. Mobile seria drawer bottom; como gameplay
 * inteira é `DesktopOnlyNotice` em <lg, mobile não alcança essa tela.
 */
export function ActionFeedPanel() {
  useFeedTick(); // re-render a cada 1s pra countdown

  const entries = useActionFeedStore((s) => s.entries);
  const filter = useActionFeedStore((s) => s.filter);
  const setFilter = useActionFeedStore((s) => s.setFilter);
  const isOpen = useActionFeedStore((s) => s.isOpen);
  const setOpen = useActionFeedStore((s) => s.setOpen);
  const toggleOpen = useActionFeedStore((s) => s.toggleOpen);
  const clear = useActionFeedStore((s) => s.clear);
  const now = useActionFeedStore((s) => s.tick);

  // Hidrata estado de abertura do localStorage no mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setOpen(stored === "1");
  }, [setOpen]);

  // Persiste toda vez que muda.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, isOpen ? "1" : "0");
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (filter === "todas") return entries;
    return entries.filter((e) => e.category === filter);
  }, [entries, filter]);

  const activeCount = entries.filter(
    (e) => !e.revertedAt && now < e.expiresAt,
  ).length;

  if (!isOpen) {
    // Bordinha colapsada — botão único do feed de ações.
    return (
      <aside className="flex w-10 shrink-0 flex-col items-center border-l border-brand-border bg-[#0D0D12] py-2">
        <button
          onClick={toggleOpen}
          title="Abrir feed de ações"
          className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-brand-muted transition-colors hover:bg-white/[0.04] hover:text-brand-accent"
        >
          <ClipboardList className="h-4 w-4" />
          {activeCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-accent px-1 text-[9px] font-bold tabular-nums text-white">
              {activeCount}
            </span>
          )}
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-l border-brand-border bg-[#0D0D12]">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-brand-border px-3 py-2">
        <ClipboardList className="h-3.5 w-3.5 text-brand-accent" />
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-brand-text">
          Ações recentes
        </span>
        {activeCount > 0 && (
          <span className="rounded-full bg-brand-accent/15 px-1.5 py-0.5 text-[9px] tabular-nums text-brand-accent">
            {activeCount} ativa{activeCount > 1 ? "s" : ""}
          </span>
        )}
        {entries.length > 0 && (
          <button
            onClick={clear}
            title="Limpar histórico local (não reverte ações consolidadas)"
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
        <button
          onClick={toggleOpen}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          title="Fechar"
          aria-label="Fechar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Filtros */}
      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-brand-border px-2 py-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 cursor-pointer rounded-md px-2 py-0.5 text-[10px] transition-colors ${
              filter === f.key
                ? "bg-brand-accent/15 text-brand-accent"
                : "text-brand-muted hover:bg-white/[0.04] hover:text-brand-text"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <ClipboardList className="h-6 w-6 text-brand-muted/40" />
            <p className="text-[11px] text-brand-muted/70">
              {entries.length === 0
                ? "Ações da sessão aparecem aqui em tempo real. Você tem 30s pra reverter cada uma."
                : "Nenhuma ação neste filtro."}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((entry) => (
              <ActionFeedEntry key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
