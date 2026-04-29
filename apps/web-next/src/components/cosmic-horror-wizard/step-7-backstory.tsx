"use client";

import { useCosmicHorrorWizardStore } from "@/lib/cosmic-horror-wizard-store";

const FIELDS = [
  {
    key: "personalDescription",
    label: "Descrição pessoal",
    placeholder: "Aparência, vestimenta, modo de andar...",
    rows: 2,
  },
  {
    key: "ideologyBeliefs",
    label: "Ideologia / Crenças",
    placeholder:
      "Pragmático ateu, católico devoto, espírita convicto, niilista...",
    rows: 2,
  },
  {
    key: "significantPeople",
    label: "Pessoas significativas",
    placeholder: "Quem importa pra você? Esposa, mentor, irmã desaparecida...",
    rows: 2,
  },
  {
    key: "meaningfulLocations",
    label: "Lugares marcantes",
    placeholder:
      "Onde sente paz ou trauma? Casa de infância, cemitério, biblioteca...",
    rows: 2,
  },
  {
    key: "treasuredPossessions",
    label: "Posses prezadas",
    placeholder:
      "Objetos não materiais — uma carta, um relógio, um diário velho...",
    rows: 2,
  },
  {
    key: "traits",
    label: "Traços de personalidade",
    placeholder:
      "Pragmático, supersticioso, perfeccionista, leal a estranhos...",
    rows: 2,
  },
  {
    key: "injuriesScars",
    label: "Ferimentos / Cicatrizes",
    placeholder:
      "Cicatriz no rosto, mancha de queimadura na mão, perna que lateja em chuva...",
    rows: 2,
  },
  {
    key: "phobiasManias",
    label: "Fobias / Manias prévias",
    placeholder:
      "Antes mesmo do horror cósmico — medo de barata, mania de contar passos...",
    rows: 2,
  },
] as const;

export function Step7Backstory() {
  const store = useCosmicHorrorWizardStore();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-white">
          Backstory & Personalidade
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          Em horror investigativo, o personagem é tão importante quanto a
          mecânica. Esses campos guiam roleplay, são gancho narrativo do GM e
          alimentam a IA assistente.
        </p>
        <p className="mt-1 text-[11px] text-brand-muted/70">
          Tudo opcional — preencha o que fizer sentido agora. Pode editar
          depois na ficha.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {FIELDS.map(({ key, label, placeholder, rows }) => (
          <label key={key} className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              {label}
            </span>
            <textarea
              value={store[key]}
              onChange={(e) => store.setBackstoryField(key, e.target.value)}
              rows={rows}
              placeholder={placeholder}
              className="w-full resize-none rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted/50 focus:border-purple-400 focus:outline-none"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
