"use client";

import { useSettingsStore } from "@/lib/settings-store";
import {
  SettingsSection,
  SettingsRadio,
  SettingsSlider,
  SettingsToggle,
  SettingsColorPicker,
} from "../controls";

export function AppearanceSection() {
  const { appearance, updateAppearance } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-white">Aparência e Tema</h2>
        <p className="mt-1 text-sm text-gray-500">Personalize a aparência visual do QuestBoard.</p>
      </div>

      <SettingsSection title="Tema">
        <SettingsRadio
          label="Modo de Tema"
          value={appearance.theme}
          onChange={(v) => updateAppearance({ theme: v })}
          options={[
            { value: "dark", label: "Escuro", description: "Padrão" },
            { value: "light", label: "Claro" },
            { value: "auto", label: "Automático", description: "Segue o sistema" },
            { value: "amoled", label: "AMOLED", description: "Preto puro" },
          ]}
          columns={4}
        />
      </SettingsSection>

      <SettingsSection title="Cor de Destaque">
        <SettingsColorPicker
          label="Accent Color"
          description="Aplicada em botões, bordas ativas, links e badges."
          value={appearance.accentColor}
          onChange={(v) => updateAppearance({ accentColor: v })}
          showInput
        />
      </SettingsSection>

      <SettingsSection title="Fonte">
        <SettingsRadio
          label="Tamanho base"
          value={appearance.fontSize}
          onChange={(v) => updateAppearance({ fontSize: v })}
          options={[
            { value: "small", label: "Pequeno", description: "12px" },
            { value: "normal", label: "Normal", description: "14px" },
            { value: "large", label: "Grande", description: "16px" },
            { value: "xlarge", label: "Extra Grande", description: "18px" },
          ]}
          columns={4}
        />
        <SettingsRadio
          label="Família"
          value={appearance.fontFamily}
          onChange={(v) => updateAppearance({ fontFamily: v })}
          options={[
            { value: "inter", label: "Inter", description: "Padrão" },
            { value: "system", label: "System", description: "Fonte do dispositivo" },
            { value: "mono", label: "Monospace", description: "Vibe terminal/RPG" },
            { value: "serif", label: "Serif", description: "Vibe livro de RPG" },
          ]}
          columns={2}
        />
      </SettingsSection>

      <SettingsSection title="Densidade Visual">
        <SettingsRadio
          label="Densidade"
          value={appearance.density}
          onChange={(v) => updateAppearance({ density: v })}
          options={[
            { value: "compact", label: "Compacta", description: "Mais info na tela" },
            { value: "comfortable", label: "Confortável", description: "Padrão" },
            { value: "spacious", label: "Espaçosa", description: "Mais respiro" },
          ]}
          columns={3}
        />
      </SettingsSection>

      <SettingsSection title="Bordas Arredondadas">
        <SettingsSlider
          label="Border Radius"
          value={appearance.borderRadius}
          min={4}
          max={16}
          step={2}
          unit="px"
          onChange={(v) => updateAppearance({ borderRadius: v })}
        />
      </SettingsSection>

      <SettingsSection title="Animações">
        <SettingsToggle
          label="Ativar animações de transição"
          checked={appearance.enableAnimations}
          onChange={(v) => updateAppearance({ enableAnimations: v })}
        />
        <SettingsToggle
          label="Ativar efeitos de partículas"
          description="Confete, névoa, etc."
          checked={appearance.enableParticles}
          onChange={(v) => updateAppearance({ enableParticles: v })}
        />
        <SettingsToggle
          label="Movimento reduzido"
          description="Desliga todas as animações."
          checked={appearance.reducedMotion}
          onChange={(v) => updateAppearance({ reducedMotion: v })}
        />
      </SettingsSection>

      <SettingsSection title="Fundo do App">
        <SettingsRadio
          label="Estilo de fundo"
          value={appearance.appBackground}
          onChange={(v) => updateAppearance({ appBackground: v })}
          options={[
            { value: "solid", label: "Sólido", description: "#0A0A0F" },
            { value: "gradient", label: "Gradiente sutil", description: "Escuro → mais escuro" },
            { value: "parchment", label: "Pergaminho", description: "Vibe RPG" },
            { value: "leather", label: "Couro", description: "Vibe livro" },
          ]}
          columns={2}
        />
      </SettingsSection>
    </div>
  );
}
