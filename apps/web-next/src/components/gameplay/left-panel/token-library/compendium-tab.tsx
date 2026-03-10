"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Plus,
  Save,
  Search,
  User,
  Swords,
  Eye,
  Shield,
  Footprints,
  Sword,
  Bone,
  Skull,
  PawPrint,
  Axe,
  ShieldAlert,
  EyeOff,
  Ghost,
  Bug,
  Crown,
  Hammer,
  Box,
  Bird,
  Target,
  ShieldCheck,
  HeartPulse,
  Sparkles,
  Brain,
  Crosshair,
  Flame,
  type LucideIcon,
} from "lucide-react";

const CREATURE_ICONS: Record<string, LucideIcon> = {
  user: User,
  swords: Swords,
  eye: Eye,
  shield: Shield,
  footprints: Footprints,
  sword: Sword,
  bone: Bone,
  skull: Skull,
  "paw-print": PawPrint,
  axe: Axe,
  "shield-alert": ShieldAlert,
  "eye-off": EyeOff,
  ghost: Ghost,
  bug: Bug,
  crown: Crown,
  hammer: Hammer,
  box: Box,
  bird: Bird,
  target: Target,
  "shield-check": ShieldCheck,
  "heart-pulse": HeartPulse,
  sparkles: Sparkles,
  brain: Brain,
  crosshair: Crosshair,
  flame: Flame,
};
import { useGameplayStore } from "@/lib/gameplay-store";
import { useTokenLibraryStore } from "@/lib/token-library-store";
import { useCustomCreaturesStore } from "@/lib/custom-creatures-store";
import {
  CREATURE_COMPENDIUM,
  parseCR,
  CR_FILTER_OPTIONS,
  CREATURE_TYPE_LABELS,
  type Creature,
  type CreatureType,
} from "@/lib/creature-data";
import type { TokenAlignment } from "@/lib/gameplay-mock-data";
import { CompendiumInlineStatBlock } from "./compendium-inline-stat-block";

export function CompendiumTab() {
  const [search, setSearch] = useState("");
  const [crFilter, setCrFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const customCreatures = useCustomCreaturesStore((s) => s.creatures);
  const allCreatures = useMemo(
    () => [...CREATURE_COMPENDIUM, ...customCreatures],
    [customCreatures],
  );

  const filtered = useMemo(() => {
    let result = allCreatures;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.nameEn.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (crFilter) {
      const opt = CR_FILTER_OPTIONS.find((o) => o.label === crFilter);
      if (opt) {
        result = result.filter((c) => {
          const cr = parseCR(c.cr);
          return cr >= opt.min && cr <= opt.max;
        });
      }
    }

    if (typeFilter) {
      result = result.filter((c) => c.type === typeFilter);
    }

    return result.sort((a, b) => parseCR(a.cr) - parseCR(b.cr));
  }, [allCreatures, search, crFilter, typeFilter]);

  const openModal = useGameplayStore((s) => s.openModal);

  return (
    <div>
      {/* Search */}
      <div className="mb-1 px-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-brand-muted/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar criatura..."
            className="h-6 w-full rounded-md border border-brand-border bg-brand-primary pl-7 pr-2 text-[10px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-1.5 flex gap-1 px-2">
        <select
          value={crFilter}
          onChange={(e) => setCrFilter(e.target.value)}
          className="h-5 flex-1 rounded border border-brand-border bg-brand-primary px-1 text-[9px] text-brand-muted outline-none"
        >
          <option value="">ND: Todos</option>
          {CR_FILTER_OPTIONS.map((o) => (
            <option key={o.label} value={o.label}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-5 flex-1 rounded border border-brand-border bg-brand-primary px-1 text-[9px] text-brand-muted outline-none"
        >
          <option value="">Tipo: Todos</option>
          {Object.entries(CREATURE_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Creature list */}
      <div className="max-h-[280px] overflow-y-auto px-1">
        {filtered.length === 0 ? (
          <div className="px-2 py-4 text-center text-[10px] text-brand-muted">
            Nenhuma criatura encontrada.
          </div>
        ) : (
          filtered.slice(0, 30).map((creature) => (
            <CompendiumCreatureRow
              key={creature.id}
              creature={creature}
              expanded={expandedId === creature.id}
              onToggle={() =>
                setExpandedId(expandedId === creature.id ? null : creature.id)
              }
            />
          ))
        )}
      </div>

      {/* Open full compendium */}
      <div className="mt-1.5 px-2">
        <button
          onClick={() => openModal("creatureCompendium")}
          className="flex w-full items-center justify-center gap-1 rounded-md border border-brand-border py-1 text-[10px] text-brand-muted transition-colors hover:bg-white/[0.03] hover:text-brand-text"
        >
          <BookOpen className="h-3 w-3" />
          Abrir Compendio Completo
        </button>
      </div>
    </div>
  );
}

function CompendiumCreatureRow({
  creature,
  expanded,
  onToggle,
}: {
  creature: Creature;
  expanded: boolean;
  onToggle: () => void;
}) {
  const addToken = useGameplayStore((s) => s.addToken);
  const linkTokenToCreature = useGameplayStore((s) => s.linkTokenToCreature);
  const saveFromCompendium = useTokenLibraryStore(
    (s) => s.saveFromCompendium,
  );

  function handleAddToMap() {
    const tokenId = `tok_comp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    addToken({
      id: tokenId,
      name: creature.name,
      alignment: "hostile" as TokenAlignment,
      hp: creature.hp,
      maxHp: creature.hp,
      ac: creature.ac,
      speed: parseInt(creature.speed) || 30,
      size: creature.size === "large" ? 2 : creature.size === "huge" ? 3 : creature.size === "gargantuan" ? 4 : 1,
      x: 5,
      y: 5,
      icon: creature.icon || undefined,
    });
    linkTokenToCreature(tokenId, creature.id);
  }

  const IconComponent = CREATURE_ICONS[creature.icon] ?? Sword;

  return (
    <div className="mb-0.5 rounded-md border border-brand-border/50 transition-colors hover:border-brand-border">
      {/* Row header */}
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(
            "application/questboard-compendium",
            creature.id,
          );
          e.dataTransfer.effectAllowed = "copy";
        }}
        className="flex cursor-grab items-center gap-1.5 px-2 py-1 active:cursor-grabbing"
      >
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
          style={{ backgroundColor: creature.color + "18" }}
        >
          <IconComponent className="h-3.5 w-3.5" style={{ color: creature.color }} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium text-brand-text">
            {creature.name}
          </p>
          <div className="flex items-center gap-2 text-[9px] text-brand-muted">
            <span>HP {creature.hp}</span>
            <span>CA {creature.ac}</span>
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-medium text-brand-muted">
          ND {creature.cr}
        </span>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            onClick={handleAddToMap}
            title="Adicionar ao mapa"
            className="flex h-5 w-5 items-center justify-center rounded text-brand-muted/50 transition-colors hover:bg-white/5 hover:text-brand-accent"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            onClick={() => saveFromCompendium(creature)}
            title="Salvar nos Meus Tokens"
            className="flex h-5 w-5 items-center justify-center rounded text-brand-muted/50 transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            <Save className="h-3 w-3" />
          </button>
          <button
            onClick={onToggle}
            title={expanded ? "Fechar stat block" : "Abrir stat block"}
            className="flex h-5 w-5 items-center justify-center rounded text-brand-muted/50 transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            {expanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded stat block */}
      {expanded && <CompendiumInlineStatBlock creature={creature} />}
    </div>
  );
}
