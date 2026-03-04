"use client";

import { useSettingsStore } from "@/lib/settings-store";
import {
  SettingsSection,
  SettingsToggle,
  SettingsSelect,
  SettingsInput,
  SettingsSlider,
} from "../controls";

export function NotificationsSection() {
  const { notifications, updateNotifications } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-white">Notificações</h2>
        <p className="mt-1 text-sm text-gray-500">Push notifications, in-app e modo não perturbe.</p>
      </div>

      <SettingsSection title="Push Notifications">
        <SettingsToggle label="Ativar notificações push" checked={notifications.enablePush} onChange={(v) => updateNotifications({ enablePush: v })} />
        <div className="mt-2 border-t border-white/5 pt-2">
          <p className="mb-2 text-xs font-medium text-gray-500">Quando notificar:</p>
          <SettingsToggle label="Sessão iniciada pelo mestre" checked={notifications.sessionStarted} onChange={(v) => updateNotifications({ sessionStarted: v })} />
          <SettingsToggle label="Meu turno no combate" checked={notifications.myTurn} onChange={(v) => updateNotifications({ myTurn: v })} />
          <SettingsToggle label="Mensagem sussurrada pra mim" checked={notifications.whisperReceived} onChange={(v) => updateNotifications({ whisperReceived: v })} />
          <SettingsToggle label="Toda mensagem no chat geral" checked={notifications.allChatMessages} onChange={(v) => updateNotifications({ allChatMessages: v })} />
          <SettingsToggle label="Convite pra nova campanha" checked={notifications.campaignInvite} onChange={(v) => updateNotifications({ campaignInvite: v })} />
          <SettingsToggle label="Sessão agendada em 15 min" checked={notifications.sessionReminder} onChange={(v) => updateNotifications({ sessionReminder: v })} />
          <SettingsToggle label="Personagem tomou dano" checked={notifications.characterDamaged} onChange={(v) => updateNotifications({ characterDamaged: v })} />
          <SettingsToggle label="Sessão pausada/retomada" checked={notifications.sessionPaused} onChange={(v) => updateNotifications({ sessionPaused: v })} />
        </div>
      </SettingsSection>

      <SettingsSection title="Modo Não Perturbe">
        <SettingsToggle label="Ativar DND" description="Desliga todas as notificações." checked={notifications.dndEnabled} onChange={(v) => updateNotifications({ dndEnabled: v })} />
        <div className="flex gap-4">
          <SettingsInput label="Início" value={notifications.dndStart} onChange={(v) => updateNotifications({ dndStart: v })} type="text" placeholder="22:00" />
          <SettingsInput label="Fim" value={notifications.dndEnd} onChange={(v) => updateNotifications({ dndEnd: v })} type="text" placeholder="08:00" />
        </div>
      </SettingsSection>

      <SettingsSection title="In-App Notifications">
        <SettingsToggle label='Banner de turno ("SEU TURNO!")' checked={notifications.showTurnBanner} onChange={(v) => updateNotifications({ showTurnBanner: v })} />
        <SettingsToggle label="Toast de ações" description='"Eldrin tomou 8 de dano".' checked={notifications.showActionToast} onChange={(v) => updateNotifications({ showActionToast: v })} />
        <SettingsToggle label="Badge de mensagens não lidas" checked={notifications.showUnreadBadge} onChange={(v) => updateNotifications({ showUnreadBadge: v })} />
        <SettingsSelect
          label="Posição dos toasts"
          value={notifications.toastPosition}
          onChange={(v) => updateNotifications({ toastPosition: v })}
          options={[
            { value: "bl", label: "Inferior Esquerdo" },
            { value: "br", label: "Inferior Direito" },
            { value: "tl", label: "Superior Esquerdo" },
            { value: "tr", label: "Superior Direito" },
          ]}
        />
        <SettingsSlider label="Duração dos toasts" value={notifications.toastDuration} min={1} max={10} step={1} unit="s" onChange={(v) => updateNotifications({ toastDuration: v })} />
      </SettingsSection>
    </div>
  );
}
