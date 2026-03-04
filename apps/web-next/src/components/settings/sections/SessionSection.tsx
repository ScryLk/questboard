"use client";

import { useSettingsStore } from "@/lib/settings-store";
import {
  SettingsSection,
  SettingsToggle,
  SettingsRadio,
  SettingsSelect,
  SettingsNumberInput,
} from "../controls";
import { Copy, QrCode, Download, Upload } from "lucide-react";

export function SessionSection() {
  const { session, updateSession } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-white">Sessão e Campanha</h2>
        <p className="mt-1 text-sm text-gray-500">Configure padrões de sessão, convites e backups.</p>
      </div>

      <SettingsSection title="Campanha Ativa">
        <SettingsSelect
          label="Sistema de Regras"
          value={session.ruleSystem}
          onChange={(v) => updateSession({ ruleSystem: v })}
          options={[
            { value: "dnd5e", label: "D&D 5e" },
            { value: "dnd5e2024", label: "D&D 5e (2024 Revised)" },
            { value: "pathfinder2e", label: "Pathfinder 2e" },
            { value: "tormenta20", label: "Tormenta 20" },
            { value: "savage_worlds", label: "Savage Worlds" },
            { value: "coc", label: "Call of Cthulhu" },
            { value: "homebrew", label: "Genérico / Homebrew" },
          ]}
        />
        <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
          <div>
            <span className="text-xs text-gray-500">Código da Campanha</span>
            <p className="font-mono text-sm text-white">QB-B7M2X4</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg bg-white/5 p-2 text-gray-400 hover:bg-white/10 hover:text-white">
              <Copy className="h-4 w-4" />
            </button>
            <button className="rounded-lg bg-white/5 p-2 text-gray-400 hover:bg-white/10 hover:text-white">
              <QrCode className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Nova Sessão — Padrões">
        <SettingsToggle
          label="Nome automático"
          description={'Formato: "Sessão #N — [data]"'}
          checked={session.autoNameSessions}
          onChange={(v) => updateSession({ autoNameSessions: v })}
        />
        <SettingsToggle
          label="Carregar personagens automaticamente"
          description="Carrega personagens da campanha ao criar sessão."
          checked={session.autoLoadCharacters}
          onChange={(v) => updateSession({ autoLoadCharacters: v })}
        />
        <SettingsToggle
          label="Rolar iniciativa automaticamente"
          description="Ao iniciar combate."
          checked={session.autoRollInitiative}
          onChange={(v) => updateSession({ autoRollInitiative: v })}
        />
      </SettingsSection>

      <SettingsSection title="Timer de Sessão">
        <SettingsToggle
          label="Mostrar timer de duração"
          checked={session.showSessionTimer}
          onChange={(v) => updateSession({ showSessionTimer: v })}
        />
        <SettingsNumberInput
          label="Alarme após (horas)"
          description="Deixe vazio para desativar."
          value={session.sessionTimerAlarm ?? 0}
          onChange={(v) => updateSession({ sessionTimerAlarm: v || null })}
          min={0}
          max={12}
          unit="h"
        />
      </SettingsSection>

      <SettingsSection title="Auto-save">
        <SettingsSelect
          label="Intervalo de salvamento"
          value={session.autoSaveInterval}
          onChange={(v) => updateSession({ autoSaveInterval: v })}
          options={[
            { value: 1, label: "1 minuto" },
            { value: 2, label: "2 minutos" },
            { value: 5, label: "5 minutos" },
            { value: 10, label: "10 minutos" },
            { value: 0, label: "Manual" },
          ]}
        />
      </SettingsSection>

      <SettingsSection title="Backup">
        <SettingsToggle
          label="Criar backup antes de cada sessão"
          checked={session.createBackups}
          onChange={(v) => updateSession({ createBackups: v })}
        />
        <div className="mt-3 flex gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10">
            <Download className="h-4 w-4" />
            Exportar campanha (.json)
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10">
            <Upload className="h-4 w-4" />
            Importar campanha (.json)
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Convite de Jogadores">
        <SettingsRadio
          label="Método padrão"
          value={session.inviteMethod}
          onChange={(v) => updateSession({ inviteMethod: v })}
          options={[
            { value: "code", label: "Código alfanumérico", description: "6 caracteres" },
            { value: "link", label: "Link direto", description: "URL" },
            { value: "qr", label: "QR Code" },
          ]}
          columns={3}
        />
        <SettingsRadio
          label="Jogadores podem entrar"
          value={session.joinPolicy}
          onChange={(v) => updateSession({ joinPolicy: v })}
          options={[
            { value: "anytime", label: "A qualquer momento", description: "Sessão ativa" },
            { value: "before_start", label: "Antes do início" },
            { value: "approval", label: "Com aprovação do mestre" },
          ]}
        />
        <SettingsSelect
          label="Máximo de jogadores"
          value={session.maxPlayers}
          onChange={(v) => updateSession({ maxPlayers: v })}
          options={[
            { value: 2, label: "2" },
            { value: 3, label: "3" },
            { value: 4, label: "4" },
            { value: 5, label: "5" },
            { value: 6, label: "6" },
            { value: 8, label: "8" },
            { value: 10, label: "10" },
            { value: 99, label: "Ilimitado" },
          ]}
        />
        <SettingsToggle
          label="Permitir espectadores"
          description="Observar sem jogar."
          checked={session.allowSpectators}
          onChange={(v) => updateSession({ allowSpectators: v })}
        />
        <SettingsToggle
          label="Re-conexão automática"
          description="Jogador que caiu volta pro personagem."
          checked={session.allowReconnect}
          onChange={(v) => updateSession({ allowReconnect: v })}
        />
      </SettingsSection>
    </div>
  );
}
