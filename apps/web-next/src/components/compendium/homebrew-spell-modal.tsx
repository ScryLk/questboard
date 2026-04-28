"use client";

// Form modal pra criar/editar magia homebrew. Aceita um `existing` opcional
// pra modo de edição. Salva via useHomebrewStore (persistido no
// localStorage, scoped por campaignId).

import { useState } from "react";
import { Save, X } from "lucide-react";
import { ModalShell } from "@/components/gameplay/modals/modal-shell";
import type { SrdSpell, SpellSchool } from "@/types/srd";
import { useHomebrewStore } from "@/lib/srd/homebrew-store";

const SCHOOL_OPTIONS: { value: SpellSchool; label: string }[] = [
  { value: "abjuration", label: "Abjuração" },
  { value: "conjuration", label: "Conjuração" },
  { value: "divination", label: "Adivinhação" },
  { value: "enchantment", label: "Encantamento" },
  { value: "evocation", label: "Evocação" },
  { value: "illusion", label: "Ilusão" },
  { value: "necromancy", label: "Necromancia" },
  { value: "transmutation", label: "Transmutação" },
];

const COMPONENT_OPTIONS = ["V", "S", "M"] as const;

interface Props {
  campaignId: string;
  /** Quando passado, modal entra em modo edição (slug imutável). */
  existing?: SrdSpell | null;
  onClose: () => void;
  /** Disparado após criar/editar com sucesso. Recebe o slug. */
  onSaved?: (slug: string) => void;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || `homebrew-${Date.now().toString(36)}`;
}

export function HomebrewSpellModal({
  campaignId,
  existing,
  onClose,
  onSaved,
}: Props) {
  const addSpell = useHomebrewStore((s) => s.addSpell);
  const updateSpell = useHomebrewStore((s) => s.updateSpell);
  const isEditing = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? "");
  const [nameEn, setNameEn] = useState(existing?.nameEn ?? "");
  const [level, setLevel] = useState<number>(existing?.level ?? 1);
  const [school, setSchool] = useState<SpellSchool>(
    existing?.school ?? "evocation",
  );
  const [castingTime, setCastingTime] = useState(existing?.castingTime ?? "1 ação");
  const [range, setRange] = useState(existing?.range ?? "9 metros");
  const [components, setComponents] = useState<string[]>(
    existing?.components ?? ["V", "S"],
  );
  const [duration, setDuration] = useState(existing?.duration ?? "Instantâneo");
  const [ritual, setRitual] = useState(existing?.ritual ?? false);
  const [concentration, setConcentration] = useState(
    existing?.concentration ?? false,
  );
  const [description, setDescription] = useState(existing?.description ?? "");
  const [higherLevels, setHigherLevels] = useState(existing?.higherLevels ?? "");
  const [damageDice, setDamageDice] = useState(existing?.damageDice ?? "");
  const [damageType, setDamageType] = useState(existing?.damageType ?? "");

  function toggleComponent(c: string) {
    setComponents((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  function handleSave() {
    if (!name.trim() || !description.trim()) return;
    const slug = isEditing ? existing!.slug : slugify(name);

    const spell: SrdSpell = {
      slug,
      name: name.trim(),
      nameEn: nameEn.trim() || name.trim(),
      level,
      school,
      castingTime: castingTime.trim() || "1 ação",
      range: range.trim() || "Pessoal",
      components: components.length > 0 ? components : ["V"],
      duration: duration.trim() || "Instantâneo",
      ritual,
      concentration,
      description: description.trim(),
      higherLevels: higherLevels.trim() || undefined,
      damageDice: damageDice.trim() || undefined,
      damageType: damageType.trim() || undefined,
      classes: existing?.classes ?? [],
      attribution: {
        source: "HOMEBREW_CAMPAIGN",
        text: "Homebrew · campanha",
      },
    };

    if (isEditing) {
      updateSpell(campaignId, slug, spell);
    } else {
      addSpell(campaignId, spell);
    }
    onSaved?.(slug);
    onClose();
  }

  return (
    <ModalShell
      title={isEditing ? "Editar magia homebrew" : "Nova magia homebrew"}
      maxWidth={620}
      onClose={onClose}
    >
      <div className="space-y-3">
        {/* Nome + nome en */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome" required>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="Ex: Tempestade Arcana"
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
          <Field label="Nome em inglês">
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              maxLength={80}
              placeholder="Ex: Arcane Storm"
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
        </div>

        {/* Nível + escola */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nível">
            <select
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            >
              <option value={0}>Truque</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  {n}º nível
                </option>
              ))}
            </select>
          </Field>
          <Field label="Escola">
            <select
              value={school}
              onChange={(e) => setSchool(e.target.value as SpellSchool)}
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            >
              {SCHOOL_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Tempo + alcance + duração */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Tempo de conjuração">
            <input
              type="text"
              value={castingTime}
              onChange={(e) => setCastingTime(e.target.value)}
              placeholder="1 ação"
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
          <Field label="Alcance">
            <input
              type="text"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              placeholder="9 metros"
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
          <Field label="Duração">
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Instantâneo"
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
        </div>

        {/* Componentes + flags */}
        <div className="grid gap-3 sm:grid-cols-[auto_auto_auto_1fr]">
          <Field label="Componentes">
            <div className="flex h-9 items-center gap-1">
              {COMPONENT_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleComponent(c)}
                  className={`flex h-9 w-9 items-center justify-center rounded-md border text-xs font-semibold transition-colors ${
                    components.includes(c)
                      ? "border-brand-accent bg-brand-accent/15 text-brand-accent"
                      : "border-brand-border text-brand-muted hover:text-brand-text"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Ritual">
            <button
              type="button"
              onClick={() => setRitual((v) => !v)}
              className={`h-9 rounded-md border px-3 text-xs font-medium transition-colors ${
                ritual
                  ? "border-purple-500/40 bg-purple-500/15 text-purple-300"
                  : "border-brand-border text-brand-muted hover:text-brand-text"
              }`}
            >
              {ritual ? "Sim" : "Não"}
            </button>
          </Field>
          <Field label="Concentração">
            <button
              type="button"
              onClick={() => setConcentration((v) => !v)}
              className={`h-9 rounded-md border px-3 text-xs font-medium transition-colors ${
                concentration
                  ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                  : "border-brand-border text-brand-muted hover:text-brand-text"
              }`}
            >
              {concentration ? "Sim" : "Não"}
            </button>
          </Field>
        </div>

        {/* Dano (opcional) */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Dano (opcional)" hint="Ex: 8d6, 1d4+1">
            <input
              type="text"
              value={damageDice}
              onChange={(e) => setDamageDice(e.target.value)}
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
          <Field label="Tipo de dano (opcional)" hint="Ex: fire, force">
            <input
              type="text"
              value={damageType}
              onChange={(e) => setDamageType(e.target.value)}
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
        </div>

        {/* Descrição */}
        <Field label="Descrição" required>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Como a magia funciona, dado, alvo, efeitos..."
            className="w-full resize-y rounded-md border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
          />
        </Field>

        <Field label="Em níveis superiores (opcional)">
          <textarea
            value={higherLevels}
            onChange={(e) => setHigherLevels(e.target.value)}
            rows={2}
            placeholder="Quando conjurada com espaço de magia de nível X ou superior..."
            className="w-full resize-y rounded-md border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
          />
        </Field>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-brand-border pt-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-md border border-brand-border px-3 py-2 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            <X className="h-3.5 w-3.5" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !description.trim()}
            className="flex items-center gap-1.5 rounded-md bg-brand-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-accent/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save className="h-3.5 w-3.5" />
            {isEditing ? "Salvar" : "Criar magia"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          {label}
          {required && <span className="ml-0.5 text-brand-accent">*</span>}
        </label>
        {hint && <span className="text-[10px] text-brand-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
