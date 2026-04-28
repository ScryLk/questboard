"use client";

import { Check } from "lucide-react";
import { useDnd5eWizardStore } from "@/lib/dnd5e-wizard-store";

// Backgrounds canônicos do PHB que estão no SRD 5.1. Lista curta —
// quando o backend importar todos, isso vira fetch.

const BACKGROUNDS: Array<{
  slug: string;
  name: string;
  description: string;
  skills: string[];
}> = [
  {
    slug: "acolyte",
    name: "Acólito",
    description:
      "Você passou a vida a serviço de um templo, dedicado a uma divindade ou panteão.",
    skills: ["insight", "religion"],
  },
  {
    slug: "criminal",
    name: "Criminoso",
    description:
      "Você é um criminoso experiente com histórico de violar leis. Conhece os submundos.",
    skills: ["deception", "stealth"],
  },
  {
    slug: "folk-hero",
    name: "Herói do Povo",
    description:
      "Você vem de origens humildes, mas está destinado a algo muito maior. Já enfrentou a injustiça.",
    skills: ["animal-handling", "survival"],
  },
  {
    slug: "noble",
    name: "Nobre",
    description:
      "Você entende riqueza, poder e privilégio. Carrega um título e tem responsabilidades familiares.",
    skills: ["history", "persuasion"],
  },
  {
    slug: "sage",
    name: "Sábio",
    description:
      "Você passou anos em estudo e pesquisa de tomos antigos, dedicado ao conhecimento.",
    skills: ["arcana", "history"],
  },
  {
    slug: "soldier",
    name: "Soldado",
    description:
      "A guerra foi sua vida. Você serviu em um exército, milícia ou guarda treinada.",
    skills: ["athletics", "intimidation"],
  },
  {
    slug: "outlander",
    name: "Forasteiro",
    description:
      "Você cresceu na natureza, longe das comodidades da cidade. Conhece a terra e os animais.",
    skills: ["athletics", "survival"],
  },
  {
    slug: "entertainer",
    name: "Artista",
    description:
      "Você sobreviveu da arte de entreter — música, dança, atuação. Domina uma plateia.",
    skills: ["acrobatics", "performance"],
  },
];

const SKILL_LABELS: Record<string, string> = {
  insight: "Intuição",
  religion: "Religião",
  deception: "Enganação",
  stealth: "Furtividade",
  "animal-handling": "Adestrar Animais",
  survival: "Sobrevivência",
  history: "História",
  persuasion: "Persuasão",
  arcana: "Arcanismo",
  athletics: "Atletismo",
  intimidation: "Intimidação",
  acrobatics: "Acrobacia",
  performance: "Atuação",
};

export function Step4Background() {
  const background = useDnd5eWizardStore((s) => s.background);
  const setBackground = useDnd5eWizardStore((s) => s.setBackground);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-brand-text">
          Escolha o background
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          O background concede 2 perícias adicionais e um traço narrativo.
          Suas perícias se somam às que a classe oferece (sem conflito).
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {BACKGROUNDS.map((bg) => {
          const selected = background === bg.slug;
          return (
            <button
              key={bg.slug}
              onClick={() => setBackground(bg.slug)}
              className={`flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors ${
                selected
                  ? "border-brand-accent bg-brand-accent/10"
                  : "border-brand-border bg-white/[0.02] hover:border-brand-accent/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-cinzel text-sm font-semibold text-brand-text">
                  {bg.name}
                </h3>
                {selected && (
                  <Check className="h-4 w-4 shrink-0 text-brand-accent" />
                )}
              </div>
              <p className="text-[11px] text-brand-muted/90">{bg.description}</p>
              <div className="flex flex-wrap gap-1">
                {bg.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-brand-muted"
                  >
                    {SKILL_LABELS[s] ?? s}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Re-export pra step de revisão consultar
export { BACKGROUNDS };
