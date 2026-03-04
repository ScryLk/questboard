"use client";

interface SettingsNumberInputProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function SettingsNumberInput({
  label,
  description,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
}: SettingsNumberInputProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium text-white">{label}</span>
        {description && (
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-right font-mono text-sm text-white outline-none focus:border-brand-accent"
        />
        {unit && <span className="text-xs text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}
