"use client";

import type { FullCharacter } from "@/lib/character-types";

interface TabNotasProps {
  character: FullCharacter;
}

export function TabNotas({ character }: TabNotasProps) {
  const { backstory } = character;

  const physicalDetails = [
    { label: "Idade", value: backstory.age },
    { label: "Altura", value: backstory.height },
    { label: "Peso", value: backstory.weight },
    { label: "Olhos", value: backstory.eyes },
    { label: "Cabelo", value: backstory.hair },
    { label: "Pele", value: backstory.skin },
  ];

  return (
    <div className="space-y-6">
      {/* ── Background ───────────────────────────────── */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Antecedente
        </h3>
        <div className="rounded-lg border border-brand-border bg-brand-primary px-3 py-2">
          <p className="text-sm font-medium text-brand-text">
            {backstory.backgroundName}
          </p>
        </div>
      </section>

      {/* ── Tracos de Personalidade ──────────────────── */}
      {backstory.personalityTraits.length > 0 && (
        <section>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Tracos de Personalidade
          </h3>
          <div className="space-y-2">
            {backstory.personalityTraits.map((trait, i) => (
              <div
                key={i}
                className="rounded-lg border border-brand-border bg-brand-primary px-3 py-2"
              >
                <p className="text-sm leading-relaxed text-brand-text">
                  {trait}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Ideal ────────────────────────────────────── */}
      {backstory.ideal && (
        <section>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Ideal
          </h3>
          <div className="rounded-lg border border-brand-border bg-brand-primary px-3 py-2">
            <p className="text-sm leading-relaxed text-brand-text">
              {backstory.ideal}
            </p>
          </div>
        </section>
      )}

      {/* ── Vinculo ──────────────────────────────────── */}
      {backstory.bond && (
        <section>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Vinculo
          </h3>
          <div className="rounded-lg border border-brand-border bg-brand-primary px-3 py-2">
            <p className="text-sm leading-relaxed text-brand-text">
              {backstory.bond}
            </p>
          </div>
        </section>
      )}

      {/* ── Defeito ──────────────────────────────────── */}
      {backstory.flaw && (
        <section>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Defeito
          </h3>
          <div className="rounded-lg border border-brand-border bg-brand-primary px-3 py-2">
            <p className="text-sm leading-relaxed text-brand-text">
              {backstory.flaw}
            </p>
          </div>
        </section>
      )}

      {/* ── Aparencia ────────────────────────────────── */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Aparencia
        </h3>
        {backstory.appearance && (
          <div className="mb-3 rounded-lg border border-brand-border bg-brand-primary px-3 py-2">
            <p className="text-sm leading-relaxed text-brand-text">
              {backstory.appearance}
            </p>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          {physicalDetails.map(
            (detail) =>
              detail.value && (
                <div
                  key={detail.label}
                  className="rounded-lg border border-brand-border bg-brand-primary px-3 py-2"
                >
                  <span className="text-[10px] uppercase tracking-wider text-brand-muted">
                    {detail.label}
                  </span>
                  <p className="mt-0.5 text-sm text-brand-text">
                    {detail.value}
                  </p>
                </div>
              ),
          )}
        </div>
      </section>

      {/* ── Historia ─────────────────────────────────── */}
      {backstory.backstory && (
        <section>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Historia
          </h3>
          <div className="rounded-lg border border-brand-border bg-brand-primary px-3 py-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-text">
              {backstory.backstory}
            </p>
          </div>
        </section>
      )}

      {/* ── Notas ────────────────────────────────────── */}
      {character.notes && (
        <section>
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Notas
          </h3>
          <div className="rounded-lg border border-brand-border bg-brand-primary px-3 py-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-text">
              {character.notes}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
