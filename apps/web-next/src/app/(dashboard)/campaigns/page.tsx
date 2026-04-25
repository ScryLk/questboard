"use client";

// Lista "Minhas campanhas" — owner + member.
// Filtros: status (ativas/arquivadas/todas), sistema, busca por nome.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Castle } from "lucide-react";
import { useCampaignStore } from "@/lib/campaign-store";
import { CAMPAIGN_SYSTEMS } from "@questboard/constants";
import { CampaignCard } from "@/components/campaigns/campaign-card";

type StatusFilter = "active" | "archived" | "all";

export default function CampaignsPage() {
  const campaigns = useCampaignStore((s) => s.campaigns);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [systemFilter, setSystemFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      if (statusFilter === "active" && c.status !== "active") return false;
      if (statusFilter === "archived" && c.status !== "archived") return false;
      if (systemFilter !== "all" && c.system !== systemFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!c.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [campaigns, statusFilter, systemFilter, search]);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-cinzel text-2xl font-bold text-brand-text">
            Campanhas
          </h1>
          <p className="text-xs text-brand-muted">
            Suas mesas como mestre ou jogador.
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-brand-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Nova campanha
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome…"
            className="w-full rounded-md border border-brand-border bg-brand-surface py-2 pl-9 pr-3 text-xs text-brand-text outline-none placeholder:text-brand-muted focus:border-brand-accent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-xs text-brand-text outline-none focus:border-brand-accent"
            aria-label="Filtrar por status"
          >
            <option value="active">Ativas</option>
            <option value="archived">Arquivadas</option>
            <option value="all">Todas</option>
          </select>
          <select
            value={systemFilter}
            onChange={(e) => setSystemFilter(e.target.value)}
            className="rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-xs text-brand-text outline-none focus:border-brand-accent"
            aria-label="Filtrar por sistema"
          >
            <option value="all">Todos os sistemas</option>
            {CAMPAIGN_SYSTEMS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState hasAny={campaigns.length > 0} />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-brand-border bg-brand-surface/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent/10">
        <Castle className="h-7 w-7 text-brand-accent" />
      </div>
      <h2 className="mb-1 font-cinzel text-base font-semibold text-brand-text">
        {hasAny ? "Nenhuma campanha bate com os filtros" : "Sem campanhas ainda"}
      </h2>
      <p className="mb-4 max-w-sm text-xs text-brand-muted">
        {hasAny
          ? "Ajuste os filtros pra ver outras campanhas."
          : "Crie sua primeira mesa pra rastrear sessões, membros e biblioteca."}
      </p>
      {!hasAny && (
        <Link
          href="/campaigns/new"
          className="flex items-center gap-1.5 rounded-md bg-brand-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Criar campanha
        </Link>
      )}
    </div>
  );
}
