"use client";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-brand-surface p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-xs text-gray-600">{description}</p>
      )}
      <div className="mt-4 space-y-1">{children}</div>
    </div>
  );
}
