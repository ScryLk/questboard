"use client";

import { useDnd5eWizardStore } from "@/lib/dnd5e-wizard-store";

const ALIGNMENTS = [
  "Leal Bom",
  "Neutro Bom",
  "Caótico Bom",
  "Leal Neutro",
  "Neutro",
  "Caótico Neutro",
  "Leal Mau",
  "Neutro Mau",
  "Caótico Mau",
];

export function Step9Details() {
  const name = useDnd5eWizardStore((s) => s.name);
  const alignment = useDnd5eWizardStore((s) => s.alignment);
  const personalityTraits = useDnd5eWizardStore((s) => s.personalityTraits);
  const ideals = useDnd5eWizardStore((s) => s.ideals);
  const bonds = useDnd5eWizardStore((s) => s.bonds);
  const flaws = useDnd5eWizardStore((s) => s.flaws);
  const setDetail = useDnd5eWizardStore((s) => s.setDetail);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-brand-text">
          Detalhes do personagem
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          Identidade e roleplay. Tudo opcional exceto o nome.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Nome" required>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setDetail("name", e.target.value)}
            maxLength={60}
            placeholder="Aelar Pedraverde"
            className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
          />
        </Field>
        <Field label="Alinhamento">
          <select
            value={alignment}
            onChange={(e) => setDetail("alignment", e.target.value)}
            className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
          >
            <option value="">— a definir —</option>
            {ALIGNMENTS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Traços de personalidade" hint="Ex: 'Sempre falo a verdade, mesmo quando dói.'">
        <textarea
          value={personalityTraits}
          onChange={(e) => setDetail("personalityTraits", e.target.value)}
          rows={2}
          maxLength={500}
          className="w-full resize-y rounded-md border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
        />
      </Field>

      <Field label="Ideais" hint="O que motiva moralmente seu personagem.">
        <textarea
          value={ideals}
          onChange={(e) => setDetail("ideals", e.target.value)}
          rows={2}
          maxLength={500}
          className="w-full resize-y rounded-md border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
        />
      </Field>

      <Field label="Vínculos" hint="Conexões importantes — pessoas, lugares, juras.">
        <textarea
          value={bonds}
          onChange={(e) => setDetail("bonds", e.target.value)}
          rows={2}
          maxLength={500}
          className="w-full resize-y rounded-md border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
        />
      </Field>

      <Field label="Defeitos" hint="Falhas que o levam a problemas.">
        <textarea
          value={flaws}
          onChange={(e) => setDetail("flaws", e.target.value)}
          rows={2}
          maxLength={500}
          className="w-full resize-y rounded-md border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
        />
      </Field>
    </div>
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
