"use client";

import type { CampaignObject } from "@/types/object";

interface TabMapaProps {
  form: CampaignObject;
  onUpdate: (updates: Partial<CampaignObject>) => void;
}

const LIGHT_COLORS = [
  { label: "Ambar", color: "#FFF4C2" },
  { label: "Branco", color: "#F0F0FF" },
  { label: "Azul", color: "#74B9FF" },
  { label: "Verde", color: "#55EFC4" },
  { label: "Vermelho", color: "#FF6B6B" },
  { label: "Roxo", color: "#A29BFE" },
];

export function TabMapa({ form, onUpdate }: TabMapaProps) {
  const emitsLight = (form.lightRadius ?? 0) > 0;

  return (
    <div className="space-y-5">
      {/* Dimensions */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Dimensoes (em celulas)
        </h3>
        <div className="flex items-center gap-3">
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Largura
            </label>
            <input
              type="number"
              min={1}
              max={4}
              value={form.widthCells}
              onChange={(e) =>
                onUpdate({
                  widthCells: Math.max(1, Math.min(4, Number(e.target.value))),
                })
              }
              className="h-7 w-16 rounded-md border border-brand-border bg-brand-primary px-2 text-center text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
            />
          </div>
          <span className="mt-4 text-brand-muted">x</span>
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Altura
            </label>
            <input
              type="number"
              min={1}
              max={4}
              value={form.heightCells}
              onChange={(e) =>
                onUpdate({
                  heightCells: Math.max(1, Math.min(4, Number(e.target.value))),
                })
              }
              className="h-7 w-16 rounded-md border border-brand-border bg-brand-primary px-2 text-center text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
            />
          </div>

          {/* Preview grid */}
          <div className="ml-4 flex flex-col items-center gap-1">
            <span className="text-[9px] text-brand-muted">Preview</span>
            <div
              className="grid gap-px rounded border border-brand-border bg-brand-border"
              style={{
                gridTemplateColumns: `repeat(${form.widthCells}, 14px)`,
                gridTemplateRows: `repeat(${form.heightCells}, 14px)`,
              }}
            >
              {Array.from({ length: form.widthCells * form.heightCells }).map(
                (_, i) => (
                  <div
                    key={i}
                    className="rounded-sm"
                    style={{ backgroundColor: form.spriteColor + "30" }}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Blocking */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Fisica
        </h3>

        <label className="flex cursor-pointer items-center gap-2">
          <ToggleSwitch
            checked={form.blocking}
            onChange={(v) => onUpdate({ blocking: v })}
          />
          <span className="text-[11px] text-brand-text">
            Bloqueia passagem de tokens
          </span>
        </label>
        <p className="ml-11 mt-0.5 text-[9px] text-brand-muted">
          Tokens nao podem se mover atraves deste objeto
        </p>
      </section>

      {/* Light */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Emissao de Luz
        </h3>

        <label className="flex cursor-pointer items-center gap-2">
          <ToggleSwitch
            checked={emitsLight}
            onChange={(v) =>
              onUpdate({ lightRadius: v ? 3 : 0, lightColor: form.lightColor || "#FFF4C2" })
            }
          />
          <span className="text-[11px] text-brand-text">Emite luz</span>
        </label>

        {emitsLight && (
          <div className="mt-3 space-y-3 rounded-lg border border-brand-border bg-brand-primary p-3">
            {/* Radius */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-[10px] text-brand-muted">
                  Raio de luz
                </label>
                <span className="text-[10px] font-medium tabular-nums text-brand-text">
                  {form.lightRadius} celulas
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={form.lightRadius ?? 3}
                onChange={(e) =>
                  onUpdate({ lightRadius: Number(e.target.value) })
                }
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-brand-accent"
              />
            </div>

            {/* Light color */}
            <div>
              <label className="mb-1.5 block text-[10px] text-brand-muted">
                Cor da luz
              </label>
              <div className="flex gap-1.5">
                {LIGHT_COLORS.map(({ label, color }) => (
                  <button
                    key={color}
                    onClick={() => onUpdate({ lightColor: color })}
                    className={`flex flex-col items-center gap-0.5 rounded-md border px-1.5 py-1 transition-colors ${
                      form.lightColor === color
                        ? "border-white/30 bg-white/5"
                        : "border-transparent hover:bg-white/5"
                    }`}
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[8px] text-brand-muted">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative h-5 w-9 shrink-0 rounded-full transition-colors"
      style={{
        backgroundColor: checked
          ? "var(--brand-accent, #6C5CE7)"
          : "rgba(255,255,255,0.1)",
      }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
        style={{ left: checked ? 18 : 2 }}
      />
    </button>
  );
}
