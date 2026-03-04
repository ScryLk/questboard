"use client";

interface SettingsInputProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number";
  disabled?: boolean;
  maxLength?: number;
}

export function SettingsInput({
  label,
  description,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  maxLength,
}: SettingsInputProps) {
  return (
    <div className="py-2">
      <label className="block">
        <span className="text-sm font-medium text-white">{label}</span>
        {description && (
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className="mt-1.5 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-accent disabled:opacity-50"
        />
      </label>
    </div>
  );
}
