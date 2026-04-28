"use client";

import { Check, Sparkles } from "lucide-react";

// MVP: D&D 5e é o único sistema com regras completas. T20/Ordem/CoC
// têm placeholder no compêndio mas wizard ainda não. Este step
// existe pra deixar a estrutura plugável.

export function Step1System() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-brand-text">
          Escolha o sistema
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          Determina as regras, atributos e estrutura da ficha. Você pode ter
          personagens de sistemas diferentes na mesma campanha.
        </p>
      </div>

      <div className="rounded-lg border border-brand-accent bg-brand-accent/10 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-accent/20 text-brand-accent">
            <Check className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-cinzel font-semibold text-brand-text">
              Dungeons &amp; Dragons 5ª Edição
            </p>
            <p className="text-[11px] text-brand-muted">
              SRD 5.1 · CC-BY 4.0 · Engine d20
            </p>
            <p className="mt-2 text-xs text-brand-text/80">
              Sistema mais popular do gênero. Combate por turnos, atributos
              de 1 a 20, classes com progressão por níveis, magias por
              espaços. Motor calcula CA, modificadores, perícias e ataques
              automaticamente.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-brand-warning/20 bg-brand-warning/5 p-3 text-[11px] text-brand-warning">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Tormenta20, Ordem Paranormal e Call of Cthulhu estão na fila — só
            estrutura no MVP. Por ora todo personagem é 5e.
          </span>
        </div>
      </div>
    </div>
  );
}
