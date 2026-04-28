"use client";

import type { CampaignCharacter } from "@/types/character";
import type { Dnd5eSheetContext } from "@/hooks/use-dnd5e-derived";

const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"] as const;
const ABILITY_LABELS: Record<(typeof ABILITIES)[number], { short: string; full: string }> = {
  str: { short: "FOR", full: "Força" },
  dex: { short: "DES", full: "Destreza" },
  con: { short: "CON", full: "Constituição" },
  int: { short: "INT", full: "Inteligência" },
  wis: { short: "SAB", full: "Sabedoria" },
  cha: { short: "CAR", full: "Carisma" },
};

const SKILL_LABELS: Record<string, string> = {
  acrobatics: "Acrobacia",
  "animal-handling": "Adestrar Animais",
  arcana: "Arcanismo",
  athletics: "Atletismo",
  deception: "Enganação",
  history: "História",
  insight: "Intuição",
  intimidation: "Intimidação",
  investigation: "Investigação",
  medicine: "Medicina",
  nature: "Natureza",
  perception: "Percepção",
  performance: "Atuação",
  persuasion: "Persuasão",
  religion: "Religião",
  "sleight-of-hand": "Prestidigitação",
  stealth: "Furtividade",
  survival: "Sobrevivência",
};

function fmtMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

interface Props {
  character: CampaignCharacter;
  ctx: Dnd5eSheetContext | null;
}

export function TabAtributos({ character, ctx }: Props) {
  const attrs = ctx?.derived.abilityScores ?? {
    str: character.stats.str,
    dex: character.stats.dex,
    con: character.stats.con,
    int: character.stats.int,
    wis: character.stats.wis,
    cha: character.stats.cha,
  };
  const mods =
    ctx?.derived.abilityModifiers ??
    (Object.keys(attrs) as Array<keyof typeof attrs>).reduce(
      (acc, k) => {
        acc[k] = Math.floor((attrs[k] - 10) / 2);
        return acc;
      },
      {} as Record<keyof typeof attrs, number>,
    );

  return (
    <div className="space-y-5">
      {/* Atributos */}
      <section>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
          Atributos
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {ABILITIES.map((ab) => {
            const score = attrs[ab];
            const mod = mods[ab];
            return (
              <div
                key={ab}
                className="rounded-lg border border-brand-border bg-white/[0.02] p-3 text-center"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                  {ABILITY_LABELS[ab].short}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-brand-text">
                  {score}
                </p>
                <p className="text-xs tabular-nums text-brand-accent">
                  {fmtMod(mod)}
                </p>
                <p className="mt-1 text-[9px] text-brand-muted/70">
                  {ABILITY_LABELS[ab].full}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Saving Throws + Pericias side-by-side */}
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* Resistências */}
        <section>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
            Testes de Resistência
          </h2>
          <div className="space-y-1">
            {ctx ? (
              ctx.derived.savingThrows.map((st) => (
                <div
                  key={st.ability}
                  className={`flex items-center justify-between rounded-md border px-3 py-1.5 text-xs ${
                    st.proficient
                      ? "border-brand-accent/40 bg-brand-accent/10"
                      : "border-brand-border bg-white/[0.02]"
                  }`}
                  title={st.breakdown
                    .map((b) => `${b.source}: ${fmtMod(b.value)}`)
                    .join(" + ")}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        st.proficient
                          ? "bg-brand-accent"
                          : "bg-brand-muted/30"
                      }`}
                    />
                    <span className="text-brand-text">
                      {ABILITY_LABELS[st.ability].full}
                    </span>
                  </span>
                  <span className="font-bold tabular-nums text-brand-accent">
                    {fmtMod(st.modifier)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[11px] italic text-brand-muted">
                Ficha sem dados 5e — sem cálculo automático.
              </p>
            )}
          </div>
        </section>

        {/* Pericias */}
        <section>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
            Perícias
          </h2>
          <div className="grid gap-1 sm:grid-cols-2">
            {ctx ? (
              ctx.derived.skills.map((s) => (
                <div
                  key={s.skill}
                  className={`flex items-center justify-between gap-2 rounded-md border px-3 py-1 text-xs ${
                    s.proficient
                      ? "border-brand-accent/40 bg-brand-accent/10"
                      : "border-brand-border bg-white/[0.02]"
                  }`}
                  title={s.breakdown
                    .map((b) => `${b.source}: ${fmtMod(b.value)}`)
                    .join(" + ")}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        s.expertise
                          ? "bg-purple-400"
                          : s.proficient
                            ? "bg-brand-accent"
                            : "bg-brand-muted/30"
                      }`}
                    />
                    <span className="truncate text-brand-text">
                      {SKILL_LABELS[s.skill] ?? s.skill}
                    </span>
                    <span className="text-[9px] uppercase text-brand-muted">
                      {ABILITY_LABELS[s.ability].short}
                    </span>
                  </span>
                  <span className="font-bold tabular-nums text-brand-accent">
                    {fmtMod(s.modifier)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[11px] italic text-brand-muted">
                Ficha sem dados 5e.
              </p>
            )}
          </div>
        </section>
      </div>

      {ctx && (
        <p className="text-[10px] text-brand-muted/70">
          Bônus de proficiência:{" "}
          <span className="text-brand-accent">
            {fmtMod(ctx.derived.proficiencyBonus)}
          </span>
          {" · "}
          Percepção passiva:{" "}
          <span className="text-brand-text">{ctx.derived.passivePerception}</span>
          {" · "}
          Hover em cada valor pra ver o cálculo.
        </p>
      )}
    </div>
  );
}
