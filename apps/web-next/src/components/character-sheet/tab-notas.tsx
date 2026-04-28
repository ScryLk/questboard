"use client";

import type { CampaignCharacter } from "@/types/character";
import type { Dnd5eSheetContext } from "@/hooks/use-dnd5e-derived";

interface Props {
  character: CampaignCharacter;
  ctx: Dnd5eSheetContext | null;
}

export function TabNotas({ character, ctx }: Props) {
  return (
    <div className="space-y-4">
      {character.description && (
        <Section title="Descrição">
          <p className="whitespace-pre-line text-sm leading-relaxed text-brand-text/90">
            {character.description}
          </p>
        </Section>
      )}

      {ctx && (
        <>
          {ctx.data.personalityTraits && (
            <Section title="Traços de personalidade">
              <p className="whitespace-pre-line text-sm text-brand-text/90">
                {ctx.data.personalityTraits}
              </p>
            </Section>
          )}
          {ctx.data.ideals && (
            <Section title="Ideais">
              <p className="whitespace-pre-line text-sm text-brand-text/90">
                {ctx.data.ideals}
              </p>
            </Section>
          )}
          {ctx.data.bonds && (
            <Section title="Vínculos">
              <p className="whitespace-pre-line text-sm text-brand-text/90">
                {ctx.data.bonds}
              </p>
            </Section>
          )}
          {ctx.data.flaws && (
            <Section title="Defeitos">
              <p className="whitespace-pre-line text-sm text-brand-text/90">
                {ctx.data.flaws}
              </p>
            </Section>
          )}
          {!ctx.data.personalityTraits &&
            !ctx.data.ideals &&
            !ctx.data.bonds &&
            !ctx.data.flaws && (
              <p className="text-[11px] italic text-brand-muted">
                Sem notas de roleplay. Edite o personagem pra adicionar.
              </p>
            )}
        </>
      )}

      {!ctx && !character.description && (
        <p className="text-[11px] italic text-brand-muted">
          Sem notas.
        </p>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-brand-border bg-white/[0.02] p-4">
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
        {title}
      </h2>
      {children}
    </section>
  );
}
