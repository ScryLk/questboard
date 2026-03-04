"use client";

import { useSettingsStore } from "@/lib/settings-store";
import { SettingsSection, SettingsToggle, SettingsRadio } from "../controls";

export function AccessibilitySection() {
  const { accessibility, updateAccessibility } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-white">Acessibilidade</h2>
        <p className="mt-1 text-sm text-gray-500">Contraste, daltonismo, movimento reduzido e interação.</p>
      </div>

      <SettingsSection title="Visual">
        <SettingsToggle label="Alto contraste" description="Bordas mais visíveis, cores mais vivas." checked={accessibility.highContrast} onChange={(v) => updateAccessibility({ highContrast: v })} />
        <SettingsRadio
          label="Modo daltonismo"
          value={accessibility.colorBlindMode}
          onChange={(v) => updateAccessibility({ colorBlindMode: v })}
          options={[
            { value: "none", label: "Nenhum" },
            { value: "protanopia", label: "Protanopia", description: "Vermelho-verde" },
            { value: "deuteranopia", label: "Deuteranopia", description: "Vermelho-verde" },
            { value: "tritanopia", label: "Tritanopia", description: "Azul-amarelo" },
          ]}
          columns={2}
        />
        <SettingsToggle label="Aumentar tamanho dos tokens" checked={accessibility.largerTokens} onChange={(v) => updateAccessibility({ largerTokens: v })} />
        <SettingsToggle label="Aumentar espessura das bordas" description="2px → 3px." checked={accessibility.thickerBorders} onChange={(v) => updateAccessibility({ thickerBorders: v })} />
        <SettingsToggle label="Tooltip detalhado ao hover/long press" checked={accessibility.detailedTooltips} onChange={(v) => updateAccessibility({ detailedTooltips: v })} />
      </SettingsSection>

      <SettingsSection title="Movimento">
        <SettingsToggle label="Redução de movimento" description="Desligar animações." checked={accessibility.reducedMotion} onChange={(v) => updateAccessibility({ reducedMotion: v })} />
        <SettingsToggle label="Desligar screen shake" checked={accessibility.disableScreenShake} onChange={(v) => updateAccessibility({ disableScreenShake: v })} />
        <SettingsToggle label="Desligar partículas" description="Confete, névoa." checked={accessibility.disableParticles} onChange={(v) => updateAccessibility({ disableParticles: v })} />
        <SettingsToggle label="Desligar flash de tela" description="Dano, cura." checked={accessibility.disableFlash} onChange={(v) => updateAccessibility({ disableFlash: v })} />
      </SettingsSection>

      <SettingsSection title="Interação">
        <SettingsToggle label="Tap targets maiores" description="56px mínimo." checked={accessibility.largerTapTargets} onChange={(v) => updateAccessibility({ largerTapTargets: v })} />
        <SettingsToggle label="Confirmação antes de ações destrutivas" description="Deletar, aplicar dano." checked={accessibility.confirmDestructiveActions} onChange={(v) => updateAccessibility({ confirmDestructiveActions: v })} />
        <SettingsToggle label="Undo disponível" description="Ctrl+Z / shake to undo." checked={accessibility.enableUndo} onChange={(v) => updateAccessibility({ enableUndo: v })} />
        <SettingsToggle label="Modo leitura de tela" description="ARIA labels detalhados." checked={accessibility.screenReaderMode} onChange={(v) => updateAccessibility({ screenReaderMode: v })} />
      </SettingsSection>

      <SettingsSection title="Áudio">
        <SettingsToggle label="Legendas/descrições textuais para sons" checked={accessibility.textDescriptionsForSounds} onChange={(v) => updateAccessibility({ textDescriptionsForSounds: v })} />
        <SettingsToggle label="Feedback háptico em vez de sonoro" checked={accessibility.hapticFeedback} onChange={(v) => updateAccessibility({ hapticFeedback: v })} />
      </SettingsSection>
    </div>
  );
}
