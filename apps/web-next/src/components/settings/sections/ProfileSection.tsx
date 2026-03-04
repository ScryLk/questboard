"use client";

import { useSettingsStore } from "@/lib/settings-store";
import {
  SettingsSection,
  SettingsInput,
  SettingsRadio,
} from "../controls";
import { Camera, ChevronRight, LogOut, Trash2 } from "lucide-react";

export function ProfileSection() {
  const { profile, updateProfile } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-white">Perfil e Conta</h2>
        <p className="mt-1 text-sm text-gray-500">Gerencie suas informações pessoais e segurança.</p>
      </div>

      <SettingsSection title="Foto de Perfil">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="h-full w-full rounded-full object-cover" />
            ) : (
              <Camera className="h-6 w-6" />
            )}
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg bg-brand-accent/10 px-3 py-1.5 text-sm text-brand-accent hover:bg-brand-accent/20">
              Alterar
            </button>
            {profile.avatar && (
              <button
                onClick={() => updateProfile({ avatar: null })}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-gray-400 hover:bg-white/10"
              >
                Remover
              </button>
            )}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Informações">
        <SettingsInput
          label="Nome de Exibição"
          description="Nome visível para outros jogadores e mestres."
          value={profile.displayName}
          onChange={(v) => updateProfile({ displayName: v })}
          placeholder="Seu nome"
        />
        <SettingsInput
          label="Email"
          value={profile.email}
          onChange={(v) => updateProfile({ email: v })}
          type="email"
          placeholder="seu@email.com"
        />
        <SettingsInput
          label="Título / Bio"
          description="Aparece no seu perfil público."
          value={profile.bio}
          onChange={(v) => updateProfile({ bio: v })}
          placeholder="Mestre de RPG desde 2015"
        />
      </SettingsSection>

      <SettingsSection title="Pronome">
        <SettingsRadio
          label="Gênero do Pronome"
          description="Como o app se refere a você."
          value={profile.pronouns}
          onChange={(v) => updateProfile({ pronouns: v })}
          options={[
            { value: "masculine", label: "Masculino", description: "Mestre, Jogador" },
            { value: "feminine", label: "Feminino", description: "Mestra, Jogadora" },
            { value: "neutral", label: "Neutro", description: "Mestre, Jogador/a" },
          ]}
          columns={3}
        />
      </SettingsSection>

      <SettingsSection title="Papel Padrão">
        <SettingsRadio
          label="Papel"
          value={profile.defaultRole}
          onChange={(v) => updateProfile({ defaultRole: v })}
          options={[
            { value: "gm", label: "Mestre (GM)", description: "Acesso a ferramentas de criação" },
            { value: "player", label: "Jogador", description: "Acesso a fichas e sessões" },
            { value: "both", label: "Ambos", description: "Alternar conforme necessário" },
          ]}
        />
      </SettingsSection>

      <SettingsSection title="Segurança">
        <ActionRow label="Alterar Senha" />
        <ActionRow label="Autenticação em 2 fatores" badge="OFF" />
        <ActionRow label="Sessões ativas" />
        <button className="mt-2 w-full rounded-lg border border-brand-danger/20 bg-brand-danger/5 px-4 py-2.5 text-sm text-brand-danger hover:bg-brand-danger/10">
          <LogOut className="mr-2 inline-block h-4 w-4" />
          Desconectar todos os dispositivos
        </button>
      </SettingsSection>

      <SettingsSection title="Conta">
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm font-medium text-white">Plano atual: Gratuito</span>
            <p className="mt-0.5 text-xs text-gray-500">Upgrade para desbloquear recursos premium.</p>
          </div>
          <button className="rounded-lg bg-brand-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-accent-hover">
            Upgrade
          </button>
        </div>
        <div className="border-t border-white/5 pt-3">
          <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-brand-danger hover:bg-brand-danger/5">
            <span className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Excluir conta
            </span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </SettingsSection>
    </div>
  );
}

function ActionRow({ label, badge }: { label: string; badge?: string }) {
  return (
    <button className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-white hover:bg-white/5">
      <span>{label}</span>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-gray-400">{badge}</span>
        )}
        <ChevronRight className="h-4 w-4 text-gray-500" />
      </div>
    </button>
  );
}
