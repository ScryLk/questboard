"use client";

// Busca cross-content do compêndio. Filtra magias, monstros, itens,
// raças, classes e condições por nome (pt + en) e descrição. Visual:
// resultados agrupados por tipo, com link pro detalhe canônico.
//
// Sem fuzzy match no MVP — substring match é suficiente pro tamanho do
// seed. Quando o backend tiver FTS Postgres, esse hook vira fetch.

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Search,
  Skull,
  Sparkles,
  Sword,
  Users,
  Wand2,
} from "lucide-react";
import {
  getSystem,
  listClasses,
  listConditions,
  listItems,
  listMonsters,
  listRaces,
  listSpells,
} from "@/lib/srd";

interface SearchHit {
  type: "spell" | "monster" | "item" | "race" | "class" | "condition";
  slug: string;
  name: string;
  nameEn: string;
  hint: string;
  href: string;
}

const TYPE_ORDER: SearchHit["type"][] = [
  "spell",
  "monster",
  "item",
  "race",
  "class",
  "condition",
];

const TYPE_META: Record<
  SearchHit["type"],
  { label: string; plural: string; icon: typeof Sparkles; color: string }
> = {
  spell: { label: "Magia", plural: "Magias", icon: Sparkles, color: "#a78bfa" },
  monster: { label: "Monstro", plural: "Monstros", icon: Skull, color: "#f87171" },
  item: { label: "Item", plural: "Itens", icon: Sword, color: "#fbbf24" },
  race: { label: "Raça", plural: "Raças", icon: Users, color: "#34d399" },
  class: { label: "Classe", plural: "Classes", icon: Wand2, color: "#60a5fa" },
  condition: { label: "Condição", plural: "Condições", icon: AlertTriangle, color: "#fb7185" },
};

function matches(text: string, q: string): boolean {
  return text.toLowerCase().includes(q);
}

export default function CompendiumSearchPage({
  params,
}: {
  params: Promise<{ systemSlug: string }>;
}) {
  const { systemSlug } = use(params);
  const system = getSystem(systemSlug);
  if (!system) notFound();

  const sp = useSearchParams();
  const initial = sp.get("q") ?? "";
  const [query, setQuery] = useState(initial);

  const hits = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: SearchHit[] = [];

    for (const s of listSpells(systemSlug)) {
      if (
        matches(s.name, q) ||
        matches(s.nameEn, q) ||
        matches(s.description, q)
      ) {
        out.push({
          type: "spell",
          slug: s.slug,
          name: s.name,
          nameEn: s.nameEn,
          hint: `${s.level === 0 ? "Truque" : `${s.level}º nível`} · ${s.school}`,
          href: `/compendium/${systemSlug}/spells/${s.slug}`,
        });
      }
    }

    for (const m of listMonsters(systemSlug)) {
      if (
        matches(m.name, q) ||
        matches(m.nameEn, q) ||
        matches(m.type, q)
      ) {
        out.push({
          type: "monster",
          slug: m.slug,
          name: m.name,
          nameEn: m.nameEn,
          hint: `${m.type} · ND ${m.challengeRating}`,
          href: `/compendium/${systemSlug}/monsters/${m.slug}`,
        });
      }
    }

    for (const it of listItems(systemSlug)) {
      if (
        matches(it.name, q) ||
        matches(it.nameEn, q) ||
        (it.description && matches(it.description, q))
      ) {
        out.push({
          type: "item",
          slug: it.slug,
          name: it.name,
          nameEn: it.nameEn,
          hint: it.subcategory ?? it.category,
          href: `/compendium/${systemSlug}/items/${it.slug}`,
        });
      }
    }

    for (const r of listRaces(systemSlug)) {
      if (
        matches(r.name, q) ||
        matches(r.nameEn, q) ||
        (r.description && matches(r.description, q))
      ) {
        out.push({
          type: "race",
          slug: r.slug,
          name: r.name,
          nameEn: r.nameEn,
          hint: `Tamanho ${r.size}, velocidade ${r.speed}m`,
          href: `/compendium/${systemSlug}/races`,
        });
      }
    }

    for (const c of listClasses(systemSlug)) {
      if (
        matches(c.name, q) ||
        matches(c.nameEn, q) ||
        (c.description && matches(c.description, q))
      ) {
        out.push({
          type: "class",
          slug: c.slug,
          name: c.name,
          nameEn: c.nameEn,
          hint: `d${c.hitDie} HP · Atrib: ${c.primaryAbility.map((a) => a.toUpperCase()).join("/")}`,
          href: `/compendium/${systemSlug}/classes`,
        });
      }
    }

    for (const cond of listConditions(systemSlug)) {
      if (
        matches(cond.name, q) ||
        matches(cond.nameEn, q) ||
        matches(cond.description, q)
      ) {
        out.push({
          type: "condition",
          slug: cond.slug,
          name: cond.name,
          nameEn: cond.nameEn,
          hint: cond.description.slice(0, 80) + "…",
          href: `/compendium/${systemSlug}/conditions`,
        });
      }
    }

    return out;
  }, [query, systemSlug]);

  const grouped = useMemo(() => {
    const map = new Map<SearchHit["type"], SearchHit[]>();
    for (const t of TYPE_ORDER) map.set(t, []);
    for (const h of hits) map.get(h.type)?.push(h);
    return map;
  }, [hits]);

  return (
    <div className="space-y-5">
      <Link
        href={`/compendium/${systemSlug}`}
        className="inline-flex items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {system.shortName}
      </Link>

      <div>
        <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wider text-brand-accent">
          <Search className="h-3.5 w-3.5" />
          Busca global
        </div>
        <h1 className="font-cinzel text-2xl font-bold text-white">
          Buscar no compêndio
        </h1>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Magias, monstros, itens, raças, classes, condições..."
          className="h-12 w-full rounded-xl border border-brand-border bg-brand-primary pl-12 pr-4 text-sm text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none"
        />
      </div>

      {query.trim().length < 2 ? (
        <p className="text-sm text-brand-muted">
          Digite ao menos 2 caracteres pra buscar.
        </p>
      ) : hits.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-brand-border text-sm text-brand-muted">
          Nenhum resultado pra &ldquo;{query.trim()}&rdquo;.
        </div>
      ) : (
        <>
          <p className="text-xs text-brand-muted">
            {hits.length} {hits.length === 1 ? "resultado" : "resultados"} em{" "}
            {Array.from(grouped.values()).filter((g) => g.length > 0).length}{" "}
            categorias
          </p>
          {TYPE_ORDER.map((t) => {
            const group = grouped.get(t) ?? [];
            if (group.length === 0) return null;
            const meta = TYPE_META[t];
            const Icon = meta.icon;
            return (
              <section key={t}>
                <h2
                  className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: meta.color }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {meta.plural} ({group.length})
                </h2>
                <div className="grid gap-1.5">
                  {group.map((h) => (
                    <Link
                      key={`${h.type}-${h.slug}`}
                      href={h.href}
                      className="flex items-start gap-3 rounded-lg border border-brand-border bg-white/[0.02] px-3 py-2 transition-colors hover:border-brand-accent/40"
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                        style={{
                          backgroundColor: meta.color + "15",
                          color: meta.color,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-brand-text">
                          {h.name}
                        </p>
                        <p className="truncate text-[11px] text-brand-muted">
                          {h.hint}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
