"use client";

interface RadioOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface SettingsRadioProps<T extends string> {
  label: string;
  description?: string;
  value: T;
  options: RadioOption<T>[];
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3 | 4;
}

export function SettingsRadio<T extends string>({
  label,
  description,
  value,
  options,
  onChange,
  columns = 1,
}: SettingsRadioProps<T>) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <div className="py-2">
      <span className="text-sm font-medium text-white">{label}</span>
      {description && (
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      )}
      <div className={`mt-2 grid gap-2 ${gridCols[columns]}`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
              value === option.value
                ? "border-brand-accent bg-brand-accent/10 text-white"
                : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <div
              className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                value === option.value
                  ? "border-brand-accent bg-brand-accent"
                  : "border-gray-500"
              }`}
            >
              {value === option.value && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <span className="block">{option.label}</span>
              {option.description && (
                <span className="block text-xs text-gray-500">
                  {option.description}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
