"use client";

import { useAdminStore } from "@/stores/adminStore";

function SettingsToggle({
  label,
  description,
  checked,
  onChange,
  danger,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-brand-card p-4">
      <div>
        <p className={`text-sm font-medium ${danger ? "text-brand-danger" : "text-brand-text"}`}>
          {label}
        </p>
        <p className="mt-0.5 text-xs text-brand-muted">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? (danger ? "bg-brand-danger" : "bg-brand-accent") : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function SettingsNumber({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-brand-card p-4">
      <div>
        <p className="text-sm font-medium text-brand-text">{label}</p>
        <p className="mt-0.5 text-xs text-brand-muted">{description}</p>
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 rounded-lg border border-brand-border bg-brand-primary px-3 py-1.5 text-right text-sm text-brand-text outline-none focus:border-brand-accent"
      />
    </div>
  );
}

export default function AdminSettingsPage() {
  const settings = useAdminStore((s) => s.systemSettings);
  const updateSettings = useAdminStore((s) => s.updateSystemSettings);
  const updateFlags = useAdminStore((s) => s.updateFeatureFlags);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-brand-text">Configurações do Sistema</h1>

      {/* System */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Sistema
        </p>
        <div className="space-y-2">
          <SettingsToggle
            label="Modo Manutenção"
            description="Bloqueia acesso ao sistema para todos os usuários não-admin"
            checked={settings.maintenanceMode}
            onChange={(v) => updateSettings({ maintenanceMode: v })}
            danger
          />
          <SettingsToggle
            label="Registro Aberto"
            description="Permite que novos usuários se registrem na plataforma"
            checked={settings.registrationOpen}
            onChange={(v) => updateSettings({ registrationOpen: v })}
          />
          <SettingsNumber
            label="Limite de Sessões Simultâneas"
            description="Máximo de sessões ao vivo ao mesmo tempo"
            value={settings.maxConcurrentSessions}
            onChange={(v) => updateSettings({ maxConcurrentSessions: v })}
          />
        </div>
      </div>

      {/* Feature Flags */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Feature Flags
        </p>
        <div className="space-y-2">
          <SettingsToggle
            label="Geração de Mapas com IA"
            description="Habilita a funcionalidade de geração de mapas usando inteligência artificial"
            checked={settings.featureFlags.aiMapGeneration}
            onChange={(v) => updateFlags({ aiMapGeneration: v })}
          />
          <SettingsToggle
            label="Jogo Assíncrono"
            description="Permite sessões no estilo play-by-post"
            checked={settings.featureFlags.asyncPlay}
            onChange={(v) => updateFlags({ asyncPlay: v })}
          />
          <SettingsToggle
            label="Sessões Públicas"
            description="Permite que mestres criem sessões abertas ao público"
            checked={settings.featureFlags.publicSessions}
            onChange={(v) => updateFlags({ publicSessions: v })}
          />
          <SettingsToggle
            label="Player+"
            description="Habilita o plano Player+ para jogadores"
            checked={settings.featureFlags.playerPlus}
            onChange={(v) => updateFlags({ playerPlus: v })}
          />
        </div>
      </div>
    </div>
  );
}
