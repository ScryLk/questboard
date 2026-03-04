"use client";

interface SettingsSliderProps {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function SettingsSlider({
  label,
  description,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: SettingsSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="py-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-white">{label}</span>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500">{description}</p>
          )}
        </div>
        <span className="text-sm font-mono text-brand-accent">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full cursor-pointer accent-brand-accent"
        style={{
          background: `linear-gradient(to right, var(--color-brand-accent) 0%, var(--color-brand-accent) ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`,
          height: "4px",
          borderRadius: "2px",
          WebkitAppearance: "none",
          appearance: "none",
        }}
      />
    </div>
  );
}
