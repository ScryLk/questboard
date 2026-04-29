"use client";

import { useMemo } from "react";
import { Check, Plus } from "lucide-react";
import {
  COSMIC_HORROR_OCCUPATIONS,
  COSMIC_HORROR_SKILLS,
  SKILL_CATEGORY_LABELS,
} from "@questboard/constants";
import {
  useCosmicHorrorWizardStore,
  calculateOccupationSkillPoints,
  calculateInterestSkillPoints,
} from "@/lib/cosmic-horror-wizard-store";

function deriveBase(
  skill: (typeof COSMIC_HORROR_SKILLS)[number],
  attrs: Record<string, number>,
): number {
  if (skill.derivesFrom) {
    const v = attrs[skill.derivesFrom.attr] ?? 0;
    return Math.floor(v / skill.derivesFrom.divisor);
  }
  return skill.base;
}

export function Step4Skills() {
  const occupationSlug = useCosmicHorrorWizardStore((s) => s.occupationSlug);
  const attributes = useCosmicHorrorWizardStore((s) => s.attributes);
  const skills = useCosmicHorrorWizardStore((s) => s.skills);
  const optionalSkillSlugs = useCosmicHorrorWizardStore(
    (s) => s.optionalSkillSlugs,
  );
  const setSkill = useCosmicHorrorWizardStore((s) => s.setSkill);
  const toggleOptionalSkill = useCosmicHorrorWizardStore(
    (s) => s.toggleOptionalSkill,
  );

  const occupation = useMemo(
    () =>
      COSMIC_HORROR_OCCUPATIONS.find((o) => o.slug === occupationSlug) ?? null,
    [occupationSlug],
  );

  if (!occupation) {
    return (
      <div className="rounded-md border border-brand-warning/30 bg-brand-warning/5 px-4 py-3 text-xs text-brand-warning">
        Volte e selecione uma ocupação primeiro.
      </div>
    );
  }

  const occupationPoints = calculateOccupationSkillPoints(
    occupation.skillPointsFormula,
    attributes,
  );
  const interestPoints = calculateInterestSkillPoints(attributes.int);

  // Total gasto = soma de (currentValue - baseValue) para todas as skills
  const totalSpent = useMemo(() => {
    let total = 0;
    for (const skill of COSMIC_HORROR_SKILLS) {
      const base = deriveBase(skill, attributes);
      const current = skills[skill.slug] ?? base;
      if (current > base) total += current - base;
    }
    return total;
  }, [skills, attributes]);

  const totalBudget = occupationPoints + interestPoints;
  const remaining = totalBudget - totalSpent;
  const overBudget = remaining < 0;

  const occupationSkillSlugs = new Set([
    ...occupation.skills.fixed,
    ...optionalSkillSlugs,
  ]);

  const choiceMax = occupation.skills.choice?.count ?? 0;
  const choiceOptions = occupation.skills.choice?.options ?? [];

  // Agrupar por categoria
  const grouped = useMemo(() => {
    const groups = new Map<string, typeof COSMIC_HORROR_SKILLS>();
    for (const skill of COSMIC_HORROR_SKILLS) {
      const list = groups.get(skill.category) ?? [];
      list.push(skill);
      groups.set(skill.category, list);
    }
    return Array.from(groups.entries());
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-white">
          Distribuir pontos de Skill
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          {occupation.name}: {occupationPoints} pontos da ocupação +{" "}
          {interestPoints} pontos de interesse pessoal (INT × 2). Cada skill
          começa na base; pontos elevam o valor.
        </p>
      </div>

      <div className="sticky top-2 z-10 flex items-center justify-between gap-3 rounded-lg border border-brand-border bg-brand-primary/95 px-4 py-2 text-xs backdrop-blur">
        <div>
          <span className="font-semibold text-brand-text/80">Orçamento:</span>{" "}
          <span className="text-brand-muted">
            {totalSpent} / {totalBudget} pts
          </span>
        </div>
        <span
          className={`font-syne text-lg font-bold ${overBudget ? "text-rose-400" : remaining === 0 ? "text-emerald-400" : "text-purple-300"}`}
        >
          {remaining}
        </span>
      </div>

      {choiceMax > 0 && (
        <div className="rounded-lg border border-brand-border bg-white/[0.02] p-3">
          <p className="mb-2 text-[11px] font-semibold text-brand-text/80">
            Escolher {choiceMax} skills opcionais ({optionalSkillSlugs.length}/
            {choiceMax} selecionadas)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {choiceOptions.map((slug) => {
              const skill = COSMIC_HORROR_SKILLS.find((s) => s.slug === slug);
              if (!skill) return null;
              const selected = optionalSkillSlugs.includes(slug);
              return (
                <button
                  key={slug}
                  onClick={() => toggleOptionalSkill(slug, choiceMax)}
                  className={`rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                    selected
                      ? "border-purple-400 bg-purple-500/15 text-purple-300"
                      : "border-brand-border text-brand-muted hover:text-brand-text"
                  }`}
                >
                  {selected && <Check className="-ml-0.5 mr-0.5 inline h-2.5 w-2.5" />}
                  {skill.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {grouped.map(([category, list]) => (
          <div
            key={category}
            className="rounded-lg border border-brand-border bg-white/[0.02] p-3"
          >
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
              {SKILL_CATEGORY_LABELS[category as keyof typeof SKILL_CATEGORY_LABELS]}
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              {list.map((skill) => {
                const base = deriveBase(skill, attributes);
                const current = skills[skill.slug] ?? base;
                const isOccupation = occupationSkillSlugs.has(skill.slug);
                return (
                  <div
                    key={skill.slug}
                    className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs ${
                      isOccupation
                        ? "bg-purple-500/10"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-brand-text">
                        {skill.name}
                        {isOccupation && (
                          <span className="ml-1 text-[9px] text-purple-300">
                            ★
                          </span>
                        )}
                        {skill.rare && (
                          <span className="ml-1 text-[9px] text-amber-300">
                            ✦
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-brand-muted/70">
                        Base {base}
                      </p>
                    </div>
                    <input
                      type="number"
                      min={base}
                      max={99}
                      value={current}
                      onChange={(e) =>
                        setSkill(
                          skill.slug,
                          parseInt(e.target.value, 10) || base,
                        )
                      }
                      className="h-8 w-16 rounded border border-brand-border bg-brand-primary px-2 text-center text-xs text-brand-text focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-brand-muted/70">
        ★ = skill da ocupação · ✦ = skill rara (Mythos exige circunstância
        especial pra subir).
      </p>
    </div>
  );
}
