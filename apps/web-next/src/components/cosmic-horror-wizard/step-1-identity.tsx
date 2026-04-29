"use client";

import { useCosmicHorrorWizardStore } from "@/lib/cosmic-horror-wizard-store";

export function Step1Identity() {
  const name = useCosmicHorrorWizardStore((s) => s.name);
  const age = useCosmicHorrorWizardStore((s) => s.age);
  const birthplace = useCosmicHorrorWizardStore((s) => s.birthplace);
  const residence = useCosmicHorrorWizardStore((s) => s.residence);
  const setName = useCosmicHorrorWizardStore((s) => s.setName);
  const setAge = useCosmicHorrorWizardStore((s) => s.setAge);
  const setBirthplace = useCosmicHorrorWizardStore((s) => s.setBirthplace);
  const setResidence = useCosmicHorrorWizardStore((s) => s.setResidence);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-white">
          Quem é seu investigador?
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          Em horror investigativo, o personagem é alguém comum que vai descobrir
          coisas extraordinárias. Comece pelo básico — o resto vem nos passos
          seguintes.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            Nome completo
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Dr. Henrique Armitage"
            className="h-10 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text placeholder:text-brand-muted/50 focus:border-purple-400 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            Idade (15–90)
          </span>
          <input
            type="number"
            min={15}
            max={90}
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value, 10) || 30)}
            className="h-10 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text focus:border-purple-400 focus:outline-none"
          />
          <span className="mt-1 block text-[10px] text-brand-muted/70">
            Idade afeta MOV e modificadores de skill (+EDU acima de 40,
            penalidade de mobilidade acima de 50).
          </span>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            Local de nascimento
          </span>
          <input
            type="text"
            value={birthplace}
            onChange={(e) => setBirthplace(e.target.value)}
            placeholder="Arkham, Massachusetts"
            className="h-10 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text placeholder:text-brand-muted/50 focus:border-purple-400 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            Residência atual
          </span>
          <input
            type="text"
            value={residence}
            onChange={(e) => setResidence(e.target.value)}
            placeholder="Universidade Miskatonic"
            className="h-10 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text placeholder:text-brand-muted/50 focus:border-purple-400 focus:outline-none"
          />
        </label>
      </div>
    </div>
  );
}
