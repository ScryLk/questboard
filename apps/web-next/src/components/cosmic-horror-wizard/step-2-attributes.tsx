"use client";

import { Dice5, Pencil } from "lucide-react";
import {
  COSMIC_HORROR_ATTRIBUTES,
  COSMIC_HORROR_ATTRIBUTE_LABELS,
  COSMIC_HORROR_ATTRIBUTE_RANGES,
} from "@questboard/constants";
import { useCosmicHorrorWizardStore } from "@/lib/cosmic-horror-wizard-store";
import type { CosmicHorrorAttrKey } from "@/types/character";

export function Step2Attributes() {
  const attrMethod = useCosmicHorrorWizardStore((s) => s.attrMethod);
  const attributes = useCosmicHorrorWizardStore((s) => s.attributes);
  const setAttrMethod = useCosmicHorrorWizardStore((s) => s.setAttrMethod);
  const setAttribute = useCosmicHorrorWizardStore((s) => s.setAttribute);
  const rollAttributes = useCosmicHorrorWizardStore((s) => s.rollAttributes);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-cinzel text-lg font-semibold text-white">
          Atributos (15–99)
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          Diferente do d20: atributos são percentuais. Você rola{" "}
          <span className="text-brand-text">igual ou abaixo</span> em testes
          diretos. Sistema rola 3d6×5 (ou (2d6+6)×5 para TAM/INT/EDU).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setAttrMethod("roll");
            rollAttributes();
          }}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
            attrMethod === "roll"
              ? "border-purple-400 bg-purple-500/15 text-purple-300"
              : "border-brand-border text-brand-muted hover:text-brand-text"
          }`}
        >
          <Dice5 className="h-3.5 w-3.5" />
          Rolar dados
        </button>
        <button
          onClick={() => setAttrMethod("manual")}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
            attrMethod === "manual"
              ? "border-purple-400 bg-purple-500/15 text-purple-300"
              : "border-brand-border text-brand-muted hover:text-brand-text"
          }`}
        >
          <Pencil className="h-3.5 w-3.5" />
          Inserir manualmente
        </button>
        {attrMethod === "roll" && (
          <button
            onClick={rollAttributes}
            className="ml-auto rounded-lg border border-brand-border px-3 py-2 text-xs font-medium text-brand-muted transition-colors hover:text-brand-text"
          >
            Rolar de novo
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {COSMIC_HORROR_ATTRIBUTES.map((key) => {
          const label = COSMIC_HORROR_ATTRIBUTE_LABELS[key];
          const range = COSMIC_HORROR_ATTRIBUTE_RANGES[key];
          const value = attributes[key as CosmicHorrorAttrKey];
          return (
            <div
              key={key}
              className="rounded-lg border border-brand-border bg-white/[0.02] p-3"
            >
              <div className="mb-2 flex items-baseline justify-between">
                <div>
                  <p className="font-cinzel text-sm font-semibold text-brand-text">
                    {label.full}
                  </p>
                  <p className="text-[10px] text-brand-muted/70">
                    {label.short} · {label.description}
                  </p>
                </div>
                <span className="font-syne text-xl font-bold text-purple-300">
                  {value}
                </span>
              </div>
              <input
                type="range"
                min={range.min}
                max={range.max}
                value={value}
                onChange={(e) =>
                  setAttribute(
                    key as CosmicHorrorAttrKey,
                    parseInt(e.target.value, 10),
                  )
                }
                className="w-full accent-purple-400"
              />
              <p className="mt-1 text-[10px] text-brand-muted/60">
                Geração: {range.gen.dice} × {range.gen.multiplier} (mín {range.min},
                máx {range.max})
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
