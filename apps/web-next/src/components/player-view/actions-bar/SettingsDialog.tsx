"use client";

import { useEffect } from "react";
import { X, Volume2, Bell, Eye, Accessibility, Dices } from "lucide-react";
import {
  usePlayerSettings,
  type FontSize,
  type DiceAnimationMode,
} from "@/lib/player-settings-store";

interface Props {
  onClose: () => void;
}

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: "small", label: "Pequeno" },
  { value: "medium", label: "Médio" },
  { value: "large", label: "Grande" },
];

const DICE_MODES: { value: DiceAnimationMode; label: string; hint: string }[] = [
  { value: "full", label: "Completa", hint: "Inline + central em crítico/falha" },
  { value: "discrete", label: "Discreta", hint: "Só animação inline no chat" },
  { value: "none", label: "Nenhuma", hint: "Resultado direto" },
];

export function SettingsDialog({ onClose }: Props) {
  const settings = usePlayerSettings();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-brand-border bg-[#0D0D12] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-brand-border px-4 py-3">
          <h2 className="text-sm font-semibold text-brand-text">
            Configurações
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <Section icon={Volume2} label="Áudio">
            <Slider
              label="Volume geral"
              value={settings.volumeGeneral}
              onChange={(v) => settings.update("volumeGeneral", v)}
            />
            <Slider
              label="Volume da trilha"
              value={settings.volumeMusic}
              onChange={(v) => settings.update("volumeMusic", v)}
              hint="Em breve — trilha sonora sincronizada"
            />
            <Slider
              label="Volume dos efeitos"
              value={settings.volumeEffects}
              onChange={(v) => settings.update("volumeEffects", v)}
            />
          </Section>

          <Section icon={Bell} label="Notificações">
            <Toggle
              label="Som ao receber mensagem"
              checked={settings.notifySound}
              onChange={(v) => settings.update("notifySound", v)}
            />
            <Toggle
              label="Som ao ser seu turno"
              checked={settings.notifyTurnSound}
              onChange={(v) => settings.update("notifyTurnSound", v)}
            />
            <Toggle
              label="Vibração (mobile)"
              checked={settings.vibrateMobile}
              onChange={(v) => settings.update("vibrateMobile", v)}
            />
          </Section>

          <Section icon={Eye} label="Exibição">
            <Toggle
              label="Mostrar grade"
              checked={settings.showGrid}
              onChange={(v) => settings.update("showGrid", v)}
            />
            <Toggle
              label="Mostrar tooltips"
              checked={settings.showTooltips}
              onChange={(v) => settings.update("showTooltips", v)}
            />
            <div className="mt-2 flex items-center justify-between py-1">
              <span className="text-xs text-brand-text">Tamanho da fonte</span>
              <div className="flex gap-1">
                {FONT_SIZES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => settings.update("fontSize", opt.value)}
                    className={`cursor-pointer rounded-md px-2 py-0.5 text-[10px] transition-colors ${
                      settings.fontSize === opt.value
                        ? "bg-brand-accent/20 text-brand-accent"
                        : "text-brand-muted hover:bg-white/5 hover:text-brand-text"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section icon={Dices} label="Dados">
            <div className="flex flex-col gap-1 py-1">
              <span className="text-xs text-brand-text">Animação de dados</span>
              <div className="mt-1 grid grid-cols-3 gap-1">
                {DICE_MODES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => settings.update("diceAnimation", opt.value)}
                    title={opt.hint}
                    className={`cursor-pointer rounded-md px-2 py-1 text-[10px] transition-colors ${
                      settings.diceAnimation === opt.value
                        ? "bg-brand-accent/20 text-brand-accent"
                        : "text-brand-muted hover:bg-white/5 hover:text-brand-text"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[9px] italic text-brand-muted/60">
                {DICE_MODES.find((m) => m.value === settings.diceAnimation)?.hint}
              </p>
            </div>
          </Section>

          <Section icon={Accessibility} label="Acessibilidade">
            <Toggle
              label="Reduzir animações"
              checked={settings.reduceMotion}
              onChange={(v) => settings.update("reduceMotion", v)}
            />
            <Toggle
              label="Alto contraste"
              checked={settings.highContrast}
              onChange={(v) => settings.update("highContrast", v)}
            />
          </Section>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-brand-border px-4 py-2">
          <button
            type="button"
            onClick={() => settings.reset()}
            className="cursor-pointer text-[11px] text-brand-muted transition-colors hover:text-brand-text"
          >
            Restaurar padrões
          </button>
          <span className="text-[9px] text-brand-muted/60">
            Alterações salvas automaticamente
          </span>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Volume2;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-3 w-3 text-brand-muted" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          {label}
        </span>
      </div>
      <div className="space-y-1 rounded-lg border border-brand-border bg-white/[0.015] px-3 py-2">
        {children}
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="py-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-brand-text">{label}</span>
        <span className="text-[10px] tabular-nums text-brand-muted">
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="mt-1 w-full accent-brand-accent"
      />
      {hint && (
        <p className="mt-0.5 text-[9px] italic text-brand-muted/60">{hint}</p>
      )}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-1">
      <span className="text-xs text-brand-text">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-4 w-7 rounded-full transition-colors ${
          checked ? "bg-brand-accent" : "bg-white/10"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${
            checked ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
