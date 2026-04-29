"use client";

import type { CosmicHorrorSheetContext } from "@/hooks/use-cosmic-horror-derived";

const FIELDS = [
  { key: "personalDescription", label: "Descrição pessoal" },
  { key: "ideologyBeliefs", label: "Ideologia / Crenças" },
  { key: "significantPeople", label: "Pessoas significativas" },
  { key: "meaningfulLocations", label: "Lugares marcantes" },
  { key: "treasuredPossessions", label: "Posses prezadas" },
  { key: "traits", label: "Traços de personalidade" },
  { key: "injuriesScars", label: "Ferimentos / Cicatrizes" },
  { key: "phobiasManias", label: "Fobias / Manias" },
] as const;

interface Props {
  ctx: CosmicHorrorSheetContext;
}

export function CosmicHorrorTabBackstory({ ctx }: Props) {
  const { data } = ctx;

  const populated = FIELDS.filter((f) => data[f.key]?.trim());

  return (
    <div className="space-y-3">
      {populated.length === 0 && (
        <div className="rounded-xl border border-dashed border-brand-border p-8 text-center text-sm text-brand-muted">
          Investigador sem backstory. Use{" "}
          <span className="text-brand-text">Editar</span> pra preencher os
          campos no wizard.
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {populated.map((f) => (
          <div
            key={f.key}
            className="rounded-xl border border-brand-border bg-white/[0.02] p-4"
          >
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
              {f.label}
            </p>
            <p className="whitespace-pre-wrap text-sm text-brand-text/90">
              {data[f.key]}
            </p>
          </div>
        ))}
      </div>

      {data.birthplace && (
        <p className="text-[10px] text-brand-muted">
          Nascido em <span className="text-brand-text">{data.birthplace}</span>.
          {data.residence &&
            ` Reside atualmente em ${data.residence}.`}
        </p>
      )}
    </div>
  );
}
