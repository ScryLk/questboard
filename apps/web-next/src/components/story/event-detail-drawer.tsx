"use client";

import { useState } from "react";
import {
  X,
  CheckCircle,
  Circle,
  SkipForward,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import type { EventStatus, EventType } from "@/types/story";
import { EVENT_TYPE_LABELS, EVENT_STATUS_LABELS } from "@/types/story";
import { useStoryStore } from "@/stores/storyStore";

const STATUS_OPTIONS: { value: EventStatus; icon: typeof Circle; label: string }[] = [
  { value: "pending", icon: Circle, label: "Pendente" },
  { value: "in_progress", icon: Circle, label: "Em Andamento" },
  { value: "completed", icon: CheckCircle, label: "Concluído" },
  { value: "skipped", icon: SkipForward, label: "Pulado" },
];

const TYPE_OPTIONS: EventType[] = [
  "encounter",
  "revelation",
  "milestone",
  "exploration",
  "social",
  "rest",
  "custom",
];

export function EventDetailDrawer() {
  const drawerOpen = useStoryStore((s) => s.drawerOpen);
  const selectedEventId = useStoryStore((s) => s.selectedEventId);
  const arcs = useStoryStore((s) => s.arcs);
  const closeDrawer = useStoryStore((s) => s.closeDrawer);
  const updateEvent = useStoryStore((s) => s.updateEvent);
  const toggleTask = useStoryStore((s) => s.toggleTask);
  const addTask = useStoryStore((s) => s.addTask);
  const deleteTask = useStoryStore((s) => s.deleteTask);
  const deleteEvent = useStoryStore((s) => s.deleteEvent);

  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");

  if (!drawerOpen || !selectedEventId) return null;

  const event = arcs.flatMap((a) => a.events).find((e) => e.id === selectedEventId);
  if (!event) return null;

  const arc = arcs.find((a) => a.id === event.arcId);
  const doneCount = event.tasks.filter((t) => t.isDone).length;

  function handleAddTask() {
    if (!newTaskLabel.trim()) return;
    addTask(event!.id, newTaskLabel.trim());
    setNewTaskLabel("");
  }

  function handleMarkComplete() {
    updateEvent(event!.id, { status: "completed" });
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 right-0 top-0 z-50 w-[420px] overflow-y-auto border-l border-brand-border bg-[#111116] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-brand-border bg-[#111116] px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-brand-text">
                {event.title}
              </h2>
              {arc && (
                <p className="mt-0.5 text-[12px] text-brand-muted">
                  {arc.title}
                  {event.sessionNumber != null && ` · Sessão ${event.sessionNumber}`}
                </p>
              )}
            </div>
            <button
              onClick={closeDrawer}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Status & Type selectors */}
          <div className="mt-3 flex gap-2">
            <select
              value={event.status}
              onChange={(e) => updateEvent(event.id, { status: e.target.value as EventStatus })}
              className="h-7 rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={event.type}
              onChange={(e) => updateEvent(event.id, { type: e.target.value as EventType })}
              className="h-7 rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {EVENT_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-5 p-5">
          {/* Description */}
          <section>
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              Descrição
            </h3>
            {editingDescription ? (
              <div>
                <textarea
                  autoFocus
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-xs text-brand-text outline-none placeholder:text-brand-muted/50 focus:border-brand-accent/40"
                />
                <div className="mt-1.5 flex gap-2">
                  <button
                    onClick={() => {
                      updateEvent(event.id, { description: descDraft });
                      setEditingDescription(false);
                    }}
                    className="rounded-md bg-brand-accent px-3 py-1 text-[11px] font-medium text-white hover:bg-brand-accent/80"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditingDescription(false)}
                    className="rounded-md px-3 py-1 text-[11px] text-brand-muted hover:text-brand-text"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="rounded-lg border border-brand-border/40 bg-white/[0.02] px-3 py-2 text-xs leading-relaxed text-brand-text/80">
                  {event.description || "Sem descrição."}
                </p>
                <button
                  onClick={() => {
                    setDescDraft(event.description ?? "");
                    setEditingDescription(true);
                  }}
                  className="mt-1 text-[11px] text-brand-accent hover:underline"
                >
                  Editar
                </button>
              </div>
            )}
          </section>

          {/* Tasks */}
          <section>
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              Tarefas de Preparação
              {event.tasks.length > 0 && (
                <span className="ml-1.5 font-normal tabular-nums">
                  ({doneCount}/{event.tasks.length})
                </span>
              )}
            </h3>
            <div className="space-y-1">
              {event.tasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-white/[0.02]"
                >
                  <button
                    onClick={() => toggleTask(event.id, task.id)}
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${
                      task.isDone
                        ? "bg-emerald-500/20 text-emerald-500"
                        : "border border-brand-border text-transparent"
                    }`}
                  >
                    {task.isDone && <CheckCircle className="h-3 w-3" />}
                  </button>
                  <span
                    className={`flex-1 text-xs ${
                      task.isDone
                        ? "text-brand-muted line-through"
                        : "text-brand-text"
                    }`}
                  >
                    {task.label}
                  </span>
                  <button
                    onClick={() => deleteTask(event.id, task.id)}
                    className="h-4 w-4 shrink-0 text-brand-muted opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-1.5">
              <input
                value={newTaskLabel}
                onChange={(e) => setNewTaskLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                placeholder="Nova tarefa..."
                className="flex-1 rounded-md border border-brand-border bg-brand-primary px-2.5 py-1 text-xs text-brand-text outline-none placeholder:text-brand-muted/50 focus:border-brand-accent/40"
              />
              <button
                onClick={handleAddTask}
                disabled={!newTaskLabel.trim()}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-accent/10 text-brand-accent transition-colors hover:bg-brand-accent/20 disabled:opacity-30"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </section>

          {/* Loot */}
          {event.loot.length > 0 && (
            <section>
              <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
                Loot
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {event.loot.map((item, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-400"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* GM Notes */}
          <section>
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              Notas do Mestre (privado)
            </h3>
            {editingNotes ? (
              <div>
                <textarea
                  autoFocus
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-xs text-brand-text outline-none placeholder:text-brand-muted/50 focus:border-brand-accent/40"
                />
                <div className="mt-1.5 flex gap-2">
                  <button
                    onClick={() => {
                      updateEvent(event.id, { gmNotes: notesDraft });
                      setEditingNotes(false);
                    }}
                    className="rounded-md bg-brand-accent px-3 py-1 text-[11px] font-medium text-white hover:bg-brand-accent/80"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditingNotes(false)}
                    className="rounded-md px-3 py-1 text-[11px] text-brand-muted hover:text-brand-text"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="rounded-lg border border-brand-border/40 bg-white/[0.02] px-3 py-2 text-xs leading-relaxed text-brand-text/80">
                  {event.gmNotes || "Sem notas."}
                </p>
                <button
                  onClick={() => {
                    setNotesDraft(event.gmNotes ?? "");
                    setEditingNotes(true);
                  }}
                  className="mt-1 text-[11px] text-brand-accent hover:underline"
                >
                  Editar
                </button>
              </div>
            )}
          </section>

          {/* AI Suggestion (mock) */}
          <section className="rounded-lg border border-brand-accent/20 bg-brand-accent/[0.04] p-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
              <span className="text-[11px] font-semibold text-brand-accent">
                Sugestão IA
              </span>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-brand-text/70">
              Baseado no progresso, considere adicionar um encontro com Kasimir
              antes deste evento — ele sabe da localização do templo.
            </p>
            <button className="mt-2 rounded-md bg-brand-accent/10 px-3 py-1 text-[11px] font-medium text-brand-accent transition-colors hover:bg-brand-accent/20">
              Criar Evento Sugerido
            </button>
          </section>

          {/* Actions */}
          <div className="flex gap-2 border-t border-brand-border pt-4">
            {event.status !== "completed" && (
              <button
                onClick={handleMarkComplete}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-[12px] font-medium text-white transition-colors hover:bg-emerald-600"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Marcar como Concluído
              </button>
            )}
            <button
              onClick={() => {
                deleteEvent(event.id);
                closeDrawer();
              }}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-brand-border px-3 py-2 text-[12px] text-brand-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
