"use client";

import { useMemo, useState } from "react";
import {
  Globe,
  Pencil,
  Plus,
  MapPin,
  Scroll,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useCampaignStore } from "@/lib/campaign-store";
import { NoActiveCampaignEmpty } from "@/components/campaigns/no-active-campaign-empty";
import {
  type Disposition,
  type WorldEntity,
  type WorldEntityKind,
  DISPOSITION_COLORS,
  DISPOSITION_LABELS,
  WORLD_KIND_LABELS,
  WORLD_KIND_SINGULAR,
  useWorldStore,
} from "@/lib/world-store";

const TABS: Array<{
  kind: WorldEntityKind;
  icon: typeof Users;
}> = [
  { kind: "npc", icon: Users },
  { kind: "location", icon: MapPin },
  { kind: "faction", icon: Globe },
  { kind: "lore", icon: Scroll },
];

const SUBTITLE_PLACEHOLDER: Record<WorldEntityKind, string> = {
  npc: "Ex: Humano · Taverneiro",
  location: "Ex: Cidade-estado · Costeira",
  faction: "Ex: Guilda mágica",
  lore: "Ex: Profecia antiga",
};

export default function WorldPage() {
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const entities = useWorldStore((s) => s.entities);
  const createEntity = useWorldStore((s) => s.createEntity);
  const updateEntity = useWorldStore((s) => s.updateEntity);
  const deleteEntity = useWorldStore((s) => s.deleteEntity);

  const [activeKind, setActiveKind] = useState<WorldEntityKind>("npc");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const scoped = useMemo(() => {
    if (!activeCampaignId) return [] as WorldEntity[];
    let list = entities.filter(
      (e) => e.campaignId === activeCampaignId && e.kind === activeKind,
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.subtitle?.toLowerCase().includes(q) ?? false),
      );
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [entities, activeCampaignId, activeKind, search]);

  const counts = useMemo(() => {
    if (!activeCampaignId) return {} as Record<WorldEntityKind, number>;
    const init: Record<WorldEntityKind, number> = {
      npc: 0,
      location: 0,
      faction: 0,
      lore: 0,
    };
    for (const e of entities) {
      if (e.campaignId === activeCampaignId) init[e.kind]++;
    }
    return init;
  }, [entities, activeCampaignId]);

  if (!activeCampaignId) {
    return <NoActiveCampaignEmpty entityLabel="entradas do mundo" />;
  }

  const editingEntity = editingId
    ? entities.find((e) => e.id === editingId) ?? null
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Mundo</h1>
          <p className="mt-1 text-sm text-gray-400">
            NPCs, locais, facções e lore da campanha — tudo persiste local.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-accent/80"
        >
          <Plus className="h-4 w-4" />
          Novo {WORLD_KIND_SINGULAR[activeKind]}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map(({ kind, icon: Icon }) => (
          <button
            key={kind}
            onClick={() => setActiveKind(kind)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeKind === kind
                ? "bg-brand-accent/15 text-brand-accent"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {WORLD_KIND_LABELS[kind]}
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-gray-400">
              {counts[kind] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Buscar ${WORLD_KIND_LABELS[activeKind].toLowerCase()}...`}
          className="h-9 w-full rounded-lg border border-white/10 bg-brand-surface pl-9 pr-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-brand-accent"
        />
      </div>

      {/* Grid */}
      {scoped.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-gray-500">
          {search.trim()
            ? "Nada encontrado com esses filtros."
            : `Sem ${WORLD_KIND_LABELS[activeKind].toLowerCase()} nessa campanha.`}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scoped.map((e) => (
            <EntityCard
              key={e.id}
              entity={e}
              onEdit={() => setEditingId(e.id)}
              onDelete={() => {
                if (confirm(`Excluir "${e.name}"?`)) deleteEntity(e.id);
              }}
            />
          ))}
        </div>
      )}

      {creating && (
        <EntityEditorModal
          campaignId={activeCampaignId}
          kind={activeKind}
          onClose={() => setCreating(false)}
          onSave={(data) => {
            createEntity({
              ...data,
              campaignId: activeCampaignId,
              kind: activeKind,
            });
            setCreating(false);
          }}
        />
      )}

      {editingEntity && (
        <EntityEditorModal
          campaignId={activeCampaignId}
          kind={editingEntity.kind}
          initial={editingEntity}
          onClose={() => setEditingId(null)}
          onSave={(data) => {
            updateEntity(editingEntity.id, data);
            setEditingId(null);
          }}
        />
      )}
    </div>
  );
}

function EntityCard({
  entity,
  onEdit,
  onDelete,
}: {
  entity: WorldEntity;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="group rounded-xl border border-white/10 bg-brand-surface p-5 transition-colors hover:border-white/20">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="h-12 w-12 shrink-0 rounded-full bg-white/10" />
        {entity.disposition && entity.disposition !== "unknown" && (
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${DISPOSITION_COLORS[entity.disposition]}`}
          >
            {DISPOSITION_LABELS[entity.disposition]}
          </span>
        )}
      </div>
      <h3 className="font-medium text-white">{entity.name}</h3>
      {entity.subtitle && (
        <p className="text-sm text-gray-500">{entity.subtitle}</p>
      )}
      {entity.location && (
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3 w-3" />
          {entity.location}
        </div>
      )}
      <p className="mt-2 line-clamp-3 text-xs text-gray-400">
        {entity.description}
      </p>
      <div className="mt-3 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={onEdit}
          title="Editar"
          className="rounded p-1 text-gray-500 hover:bg-white/5 hover:text-white"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={onDelete}
          title="Excluir"
          className="rounded p-1 text-gray-500 hover:bg-rose-500/10 hover:text-rose-400"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </article>
  );
}

function EntityEditorModal({
  campaignId,
  kind,
  initial,
  onClose,
  onSave,
}: {
  campaignId: string;
  kind: WorldEntityKind;
  initial?: WorldEntity;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    subtitle?: string;
    location?: string;
    disposition?: Disposition;
    notes?: string;
  }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [disposition, setDisposition] = useState<Disposition>(
    initial?.disposition ?? "neutral",
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const showLocation = kind === "npc" || kind === "faction";
  const showDisposition = kind === "npc" || kind === "faction";

  const canSave = name.trim().length >= 2;

  function handleSave() {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      subtitle: subtitle.trim() || undefined,
      location: showLocation ? location.trim() || undefined : undefined,
      disposition: showDisposition ? disposition : undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-brand-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 font-heading text-lg font-bold text-white">
          {initial ? `Editar ${WORLD_KIND_SINGULAR[kind]}` : `Novo ${WORLD_KIND_SINGULAR[kind]}`}
        </h2>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Nome
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-white/10 bg-brand-primary px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-brand-accent"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Subtítulo
            </span>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder={SUBTITLE_PLACEHOLDER[kind]}
              className="w-full rounded-lg border border-white/10 bg-brand-primary px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-brand-accent"
            />
          </label>

          {(showLocation || showDisposition) && (
            <div className="grid grid-cols-2 gap-3">
              {showLocation && (
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Localização
                  </span>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Vila de Barovia"
                    className="w-full rounded-lg border border-white/10 bg-brand-primary px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-brand-accent"
                  />
                </label>
              )}
              {showDisposition && (
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Disposição
                  </span>
                  <select
                    value={disposition}
                    onChange={(e) => setDisposition(e.target.value as Disposition)}
                    className="h-9 w-full rounded-lg border border-white/10 bg-brand-primary px-3 text-sm text-white outline-none focus:border-brand-accent"
                  >
                    <option value="friendly">{DISPOSITION_LABELS.friendly}</option>
                    <option value="neutral">{DISPOSITION_LABELS.neutral}</option>
                    <option value="hostile">{DISPOSITION_LABELS.hostile}</option>
                    <option value="unknown">{DISPOSITION_LABELS.unknown}</option>
                  </select>
                </label>
              )}
            </div>
          )}

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Descrição
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-lg border border-white/10 bg-brand-primary px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-brand-accent"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Notas (privado, só pro GM)
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ganchos, segredos, motivações ocultas..."
              className="w-full resize-none rounded-lg border border-white/10 bg-brand-primary px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-brand-accent"
            />
          </label>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-[10px] text-gray-500">
            Campanha: {campaignId}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-gray-400 hover:bg-white/5 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="rounded-lg bg-brand-accent px-4 py-2 text-xs font-semibold text-white hover:bg-brand-accent/85 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {initial ? "Salvar" : "Criar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
