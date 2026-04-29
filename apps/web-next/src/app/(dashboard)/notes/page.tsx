"use client";

import { useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  StickyNote,
  Trash2,
} from "lucide-react";
import { useCampaignStore } from "@/lib/campaign-store";
import { NoActiveCampaignEmpty } from "@/components/campaigns/no-active-campaign-empty";
import {
  type CampaignNote,
  type NoteCategory,
  NOTE_CATEGORIES,
  NOTE_CATEGORY_COLORS,
  NOTE_CATEGORY_LABELS,
  useNotesStore,
} from "@/lib/notes-store";

type CategoryFilter = NoteCategory | "all";

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min atrás`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d atrás`;
  const weeks = Math.round(days / 7);
  return `${weeks}sem atrás`;
}

export default function NotesPage() {
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const notes = useNotesStore((s) => s.notes);
  const createNote = useNotesStore((s) => s.createNote);
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const scopedNotes = useMemo(() => {
    if (!activeCampaignId) return [];
    let list = notes.filter((n) => n.campaignId === activeCampaignId);
    if (filter !== "all") list = list.filter((n) => n.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q),
      );
    }
    return [...list].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [notes, activeCampaignId, filter, search]);

  if (!activeCampaignId) {
    return <NoActiveCampaignEmpty entityLabel="notas" />;
  }

  const editingNote = editingId
    ? notes.find((n) => n.id === editingId) ?? null
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Notas</h1>
          <p className="mt-1 text-sm text-gray-400">
            {scopedNotes.length} de{" "}
            {notes.filter((n) => n.campaignId === activeCampaignId).length}{" "}
            anotações nessa campanha.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-accent/80"
        >
          <Plus className="h-4 w-4" />
          Nova Nota
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título ou conteúdo..."
            className="h-9 w-full rounded-lg border border-white/10 bg-brand-surface pl-9 pr-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-brand-accent"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-white/10 p-0.5">
          {(["all", ...NOTE_CATEGORIES] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                filter === key
                  ? "bg-brand-accent/15 text-brand-accent"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {key === "all" ? "Todas" : NOTE_CATEGORY_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {scopedNotes.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-gray-500">
          {search.trim() || filter !== "all"
            ? "Nenhuma nota encontrada com esses filtros."
            : "Sem notas — crie a primeira no botão acima."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scopedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => setEditingId(note.id)}
              onDelete={() => {
                if (confirm(`Excluir "${note.title}"?`)) deleteNote(note.id);
              }}
            />
          ))}
        </div>
      )}

      {/* Modais */}
      {creating && (
        <NoteEditorModal
          campaignId={activeCampaignId}
          onClose={() => setCreating(false)}
          onSave={(data) => {
            createNote({ ...data, campaignId: activeCampaignId });
            setCreating(false);
          }}
        />
      )}
      {editingNote && (
        <NoteEditorModal
          campaignId={activeCampaignId}
          initial={editingNote}
          onClose={() => setEditingId(null)}
          onSave={(data) => {
            updateNote(editingNote.id, data);
            setEditingId(null);
          }}
        />
      )}
    </div>
  );
}

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: CampaignNote;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="group rounded-xl border border-white/10 bg-brand-surface p-5 transition-colors hover:border-white/20">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${NOTE_CATEGORY_COLORS[note.category]}`}
        >
          {NOTE_CATEGORY_LABELS[note.category]}
        </span>
        <div className="flex items-center gap-1 text-[10px]">
          {note.isGmOnly ? (
            <span className="flex items-center gap-1 rounded bg-yellow-500/10 px-1.5 py-0.5 text-yellow-400">
              <EyeOff className="h-2.5 w-2.5" />
              GM
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400">
              <Eye className="h-2.5 w-2.5" />
              Pública
            </span>
          )}
        </div>
      </div>
      <h3 className="font-medium text-white">{note.title}</h3>
      <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-gray-400">
        {note.content}
      </p>
      <div className="mt-3 flex items-center justify-between text-[10px]">
        <span className="text-gray-600">{formatRelative(note.updatedAt)}</span>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
      </div>
    </article>
  );
}

function NoteEditorModal({
  campaignId,
  initial,
  onClose,
  onSave,
}: {
  campaignId: string;
  initial?: CampaignNote;
  onClose: () => void;
  onSave: (data: {
    title: string;
    content: string;
    category: NoteCategory;
    isGmOnly: boolean;
  }) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [category, setCategory] = useState<NoteCategory>(
    initial?.category ?? "general",
  );
  const [isGmOnly, setIsGmOnly] = useState(initial?.isGmOnly ?? true);

  const canSave = title.trim().length >= 2;

  function handleSave() {
    if (!canSave) return;
    onSave({
      title: title.trim(),
      content: content.trim(),
      category,
      isGmOnly,
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
        <div className="mb-4 flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-brand-accent" />
          <h2 className="font-heading text-lg font-bold text-white">
            {initial ? "Editar nota" : "Nova nota"}
          </h2>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Título
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              placeholder="Ex: Pistas sobre a Cripta"
              className="w-full rounded-lg border border-white/10 bg-brand-primary px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-brand-accent"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Categoria
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoteCategory)}
                className="h-9 w-full rounded-lg border border-white/10 bg-brand-primary px-3 text-sm text-white outline-none focus:border-brand-accent"
              >
                {NOTE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {NOTE_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex cursor-pointer flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Visibilidade
              </span>
              <button
                type="button"
                onClick={() => setIsGmOnly(!isGmOnly)}
                className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors ${
                  isGmOnly
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {isGmOnly ? (
                  <>
                    <EyeOff className="h-3 w-3" />
                    Só GM
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3" />
                    Pública
                  </>
                )}
              </button>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Conteúdo
            </span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Suas anotações... Markdown simples é renderizado como texto preservando quebras."
              className="w-full resize-none rounded-lg border border-white/10 bg-brand-primary px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-brand-accent"
            />
          </label>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-[10px] text-gray-500">Campanha: {campaignId}</span>
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
