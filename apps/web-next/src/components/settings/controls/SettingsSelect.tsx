"use client";

import { ChevronDown } from "lucide-react";

interface SelectOption<T extends string | number> {
  value: T;
  label: string;
}

interface SettingsSelectProps<T extends string | number> {
  label: string;
  description?: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}

export function SettingsSelect<T extends string | number>({
  label,
  description,
  value,
  options,
  onChange,
}: SettingsSelectProps<T>) {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium text-white">{label}</span>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500">{description}</p>
          )}
        </div>
        <div className="relative">
          <select
            value={String(value)}
            onChange={(e) => {
              const raw = e.target.value;
              const parsed = typeof value === "number" ? Number(raw) : raw;
              onChange(parsed as T);
            }}
            className="appearance-none rounded-lg border border-white/10 bg-white/5 py-1.5 pl-3 pr-8 text-sm text-white outline-none focus:border-brand-accent"
          >
            {options.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)} className="bg-brand-surface text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
