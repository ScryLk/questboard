"use client";

import { useSettingsStore } from "@/lib/settings-store";
import {
  SettingsSection,
  SettingsToggle,
  SettingsRadio,
  SettingsSelect,
  SettingsNumberInput,
} from "../controls";

export function DiceSection() {
  const { dice, updateDice } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-white">Dados e Rolagem</h2>
        <p className="mt-1 text-sm text-gray-500">Estilo visual, animações, rolagem rápida e favoritos.</p>
      </div>

      <SettingsSection title="Estilo de Dados">
        <SettingsRadio
          label="Visual do resultado"
          value={dice.rollStyle}
          onChange={(v) => updateDice({ rollStyle: v })}
          options={[
            { value: "numeric", label: "Numérico simples", description: '"18"' },
            { value: "3d", label: "Dados 3D animados", description: "Futuro" },
            { value: "styled", label: "Dados estilizados", description: "Ícones" },
          ]}
          columns={3}
        />
      </SettingsSection>

      <SettingsSection title="Animação">
        <SettingsToggle label="Animar resultado (bounce)" checked={dice.animateResult} onChange={(v) => updateDice({ animateResult: v })} />
        <SettingsSelect
          label="Velocidade"
          value={dice.animationSpeed}
          onChange={(v) => updateDice({ animationSpeed: v })}
          options={[
            { value: "fast", label: "Rápida (0.3s)" },
            { value: "normal", label: "Normal (0.8s)" },
            { value: "dramatic", label: "Dramática (1.5s)" },
          ]}
        />
      </SettingsSection>

      <SettingsSection title="Rolagem Rápida">
        <SettingsToggle label="Botões de dado rápido" description="d4, d6, d8, d10, d12, d20, d100." checked={dice.showQuickRollButtons} onChange={(v) => updateDice({ showQuickRollButtons: v })} />
        <SettingsToggle label="Manter histórico de rolagens" checked={dice.keepHistory} onChange={(v) => updateDice({ keepHistory: v })} />
        <SettingsNumberInput label="Limite de histórico" value={dice.historyLimit} onChange={(v) => updateDice({ historyLimit: v })} min={10} max={200} />
        <SettingsToggle label="Favoritos" description='Salvar fórmulas frequentes. Ex: "8d6 Fireball".' checked={dice.enableFavorites} onChange={(v) => updateDice({ enableFavorites: v })} />
      </SettingsSection>

      <SettingsSection title="Rolagem Secreta (GM)">
        <SettingsToggle label="Permitir rolagem secreta" checked={dice.enableSecretRoll} onChange={(v) => updateDice({ enableSecretRoll: v })} />
        <SettingsToggle label="Jogadores veem indicação" description='"[GM rolou em segredo]" no chat.' checked={dice.showSecretRollToPlayers} onChange={(v) => updateDice({ showSecretRollToPlayers: v })} />
        <SettingsToggle label="Não avisar jogadores" description="Rolagem completamente invisível." checked={dice.noSecretRollNotification} onChange={(v) => updateDice({ noSecretRollNotification: v })} />
      </SettingsSection>

      <SettingsSection title="Modificadores">
        <SettingsToggle label="Aplicar bônus de proficiência automaticamente" checked={dice.autoProficiency} onChange={(v) => updateDice({ autoProficiency: v })} />
        <SettingsToggle label="Sugerir modificador baseado na perícia" checked={dice.autoSuggestModifier} onChange={(v) => updateDice({ autoSuggestModifier: v })} />
      </SettingsSection>
    </div>
  );
}
