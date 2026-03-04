"use client";

import { useSettingsStore } from "@/lib/settings-store";
import { SettingsSection, SettingsToggle, SettingsSelect } from "../controls";

export function ChatSection() {
  const { chat, updateChat } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-white">Chat e Comunicação</h2>
        <p className="mt-1 text-sm text-gray-500">Canais, mensagens, dados no chat e histórico.</p>
      </div>

      <SettingsSection title="Canais (GM configura)">
        <SettingsToggle label="Canal Geral" description="Todos veem." checked={chat.enableGeneralChannel} onChange={(v) => updateChat({ enableGeneralChannel: v })} />
        <SettingsToggle label='Canal "Mesa do GM"' description="Só mestre." checked={chat.enableGMTable} onChange={(v) => updateChat({ enableGMTable: v })} />
        <SettingsToggle label="Sussurro GM ↔ Jogador" checked={chat.enableWhisperGMPlayer} onChange={(v) => updateChat({ enableWhisperGMPlayer: v })} />
        <SettingsToggle label="Sussurro entre jogadores" checked={chat.enableWhisperBetweenPlayers} onChange={(v) => updateChat({ enableWhisperBetweenPlayers: v })} />
        <SettingsToggle label="Canal In-character" description="Falar como personagem." checked={chat.enableInCharacterChannel} onChange={(v) => updateChat({ enableInCharacterChannel: v })} />
        <SettingsToggle label="Canal Out-of-character" description="Falar como jogador." checked={chat.enableOOCChannel} onChange={(v) => updateChat({ enableOOCChannel: v })} />
      </SettingsSection>

      <SettingsSection title="Mensagens">
        <SettingsToggle label="Mostrar timestamp" checked={chat.showTimestamp} onChange={(v) => updateChat({ showTimestamp: v })} />
        <SettingsSelect
          label="Formato do timestamp"
          value={chat.timestampFormat}
          onChange={(v) => updateChat({ timestampFormat: v })}
          options={[
            { value: "HH:mm", label: "HH:mm" },
            { value: "HH:mm:ss", label: "HH:mm:ss" },
            { value: "relative", label: 'Relativo ("2min atrás")' },
          ]}
        />
        <SettingsToggle label="Mostrar avatar do remetente" checked={chat.showAvatar} onChange={(v) => updateChat({ showAvatar: v })} />
        <SettingsToggle label="Agrupar mensagens do mesmo remetente" description="Dentro de 2 minutos." checked={chat.groupMessages} onChange={(v) => updateChat({ groupMessages: v })} />
        <SettingsToggle label="Som ao receber mensagem" checked={chat.messageSound} onChange={(v) => updateChat({ messageSound: v })} />
        <SettingsToggle label="Scroll automático pra última mensagem" checked={chat.autoScroll} onChange={(v) => updateChat({ autoScroll: v })} />
      </SettingsSection>

      <SettingsSection title="Rolagem de Dados no Chat">
        <SettingsToggle label="Mostrar resultados de dados" checked={chat.showDiceInChat} onChange={(v) => updateChat({ showDiceInChat: v })} />
        <SettingsToggle label="Destacar Nat 20 e Nat 1" description="Cor especial." checked={chat.highlightNat20} onChange={(v) => updateChat({ highlightNat20: v })} />
        <SettingsToggle label="Mostrar fórmula da rolagem" description='Ex: "1d20+5 = 18 [13+5]".' checked={chat.showRollFormula} onChange={(v) => updateChat({ showRollFormula: v })} />
        <SettingsToggle label="Indicar rolagens secretas do GM" description='"[GM rolou em segredo]".' checked={chat.showSecretRollHint} onChange={(v) => updateChat({ showSecretRollHint: v })} />
      </SettingsSection>

      <SettingsSection title="Emojis">
        <SettingsToggle label="Permitir emojis no chat" checked={chat.enableEmojis} onChange={(v) => updateChat({ enableEmojis: v })} />
        <SettingsToggle label="Reações rápidas nas mensagens" description="Like, haha, etc." checked={chat.enableReactions} onChange={(v) => updateChat({ enableReactions: v })} />
      </SettingsSection>

      <SettingsSection title="Histórico">
        <SettingsToggle label="Manter histórico entre sessões" checked={chat.keepHistory} onChange={(v) => updateChat({ keepHistory: v })} />
      </SettingsSection>
    </div>
  );
}
