"use client";

interface ColorOption {
  value: string;
  label: string;
}

interface SettingsColorPickerProps {
  label: string;
  description?: string;
  value: string;
  colors?: ColorOption[];
  onChange: (value: string) => void;
  showInput?: boolean;
}

const DEFAULT_ACCENT_COLORS: ColorOption[] = [
  { value: "#6C5CE7", label: "Roxo" },
  { value: "#3B82F6", label: "Azul" },
  { value: "#00B894", label: "Verde" },
  { value: "#FF4444", label: "Vermelho" },
  { value: "#F97316", label: "Laranja" },
  { value: "#EC4899", label: "Rosa" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#EAB308", label: "Dourado" },
];

export function SettingsColorPicker({
  label,
  description,
  value,
  colors = DEFAULT_ACCENT_COLORS,
  onChange,
  showInput = false,
}: SettingsColorPickerProps) {
  return (
    <div className="py-2">
      <span className="text-sm font-medium text-white">{label}</span>
      {description && (
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.value}
            type="button"
            title={color.label}
            onClick={() => onChange(color.value)}
            className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
              value === color.value
                ? "border-white scale-110"
                : "border-transparent"
            }`}
            style={{ backgroundColor: color.value }}
          />
        ))}
      </div>
      {showInput && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-white outline-none focus:border-brand-accent"
            maxLength={7}
          />
        </div>
      )}
    </div>
  );
}
