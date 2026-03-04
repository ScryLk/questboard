"use client";

import { useSettingsStore } from "@/lib/settings-store";
import { SettingsSection, SettingsRadio } from "../controls";

export function LanguageSection() {
  const { language, updateLanguage } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-white">Idioma</h2>
        <p className="mt-1 text-sm text-gray-500">Idioma da interface, termos de RPG e unidades.</p>
      </div>

      <SettingsSection title="Idioma do App">
        <SettingsRadio
          label="Idioma"
          value={language.appLanguage}
          onChange={(v) => updateLanguage({ appLanguage: v })}
          options={[
            { value: "pt-BR", label: "Português (Brasil)" },
            { value: "en-US", label: "English (US)" },
            { value: "es", label: "Español" },
          ]}
        />
      </SettingsSection>

      <SettingsSection title="Termos de RPG">
        <SettingsRadio
          label="Termos"
          value={language.rpgTerms}
          onChange={(v) => updateLanguage({ rpgTerms: v })}
          options={[
            { value: "portuguese", label: "Português", description: "Força, Destreza, Classe de Armadura" },
            { value: "english", label: "Inglês", description: "Strength, Dexterity, Armor Class" },
            { value: "mixed", label: "Misto", description: "Termos técnicos em inglês, UI em português" },
          ]}
        />
      </SettingsSection>

      <SettingsSection title="Unidade de Medida">
        <SettingsRadio
          label="Unidade"
          value={language.measureUnit}
          onChange={(v) => updateLanguage({ measureUnit: v })}
          options={[
            { value: "feet", label: "Feet / ft", description: "Padrão D&D" },
            { value: "meters", label: "Metros / m" },
            { value: "cells", label: "Células (tiles)" },
          ]}
          columns={3}
        />
      </SettingsSection>
    </div>
  );
}
