"use client";

import { useState } from "react";
import { SettingsNav, type SettingsSectionId } from "@/components/settings/SettingsNav";
import {
  ProfileSection,
  AppearanceSection,
  SessionSection,
  MapSection,
  CombatSection,
  PlayerViewSection,
  ChatSection,
  AudioSection,
  DiceSection,
  NotificationsSection,
  AccessibilitySection,
  PerformanceSection,
  StorageSection,
  LanguageSection,
  AboutSection,
} from "@/components/settings/sections";

const SECTION_COMPONENTS: Record<SettingsSectionId, React.ComponentType> = {
  profile: ProfileSection,
  appearance: AppearanceSection,
  session: SessionSection,
  map: MapSection,
  combat: CombatSection,
  "player-view": PlayerViewSection,
  chat: ChatSection,
  audio: AudioSection,
  dice: DiceSection,
  notifications: NotificationsSection,
  accessibility: AccessibilitySection,
  performance: PerformanceSection,
  storage: StorageSection,
  language: LanguageSection,
  about: AboutSection,
};

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>("profile");

  const ActiveComponent = SECTION_COMPONENTS[activeSection];

  return (
    <div className="flex h-full gap-0">
      {/* Sidebar Navigation */}
      <div className="hidden border-r border-white/5 lg:block">
        <div className="sticky top-0 py-2">
          <h1 className="mb-4 px-3 font-heading text-lg font-bold text-white">Configurações</h1>
          <SettingsNav
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </div>
      </div>

      {/* Mobile Section Selector */}
      <div className="mb-4 w-full lg:hidden">
        <h1 className="mb-3 font-heading text-xl font-bold text-white">Configurações</h1>
        <select
          value={activeSection}
          onChange={(e) => setActiveSection(e.target.value as SettingsSectionId)}
          className="w-full rounded-lg border border-white/10 bg-brand-surface px-4 py-2.5 text-sm text-white outline-none focus:border-brand-accent"
        >
          <option value="profile">Perfil e Conta</option>
          <option value="appearance">Aparência e Tema</option>
          <option value="session">Sessão e Campanha</option>
          <option value="map">Mapa e Canvas</option>
          <option value="combat">Combate e Regras</option>
          <option value="player-view">Visão dos Jogadores</option>
          <option value="chat">Chat e Comunicação</option>
          <option value="audio">Áudio e Trilha Sonora</option>
          <option value="dice">Dados e Rolagem</option>
          <option value="notifications">Notificações</option>
          <option value="accessibility">Acessibilidade</option>
          <option value="performance">Performance</option>
          <option value="storage">Dados e Armazenamento</option>
          <option value="language">Idioma</option>
          <option value="about">Sobre e Feedback</option>
        </select>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-2 lg:px-8">
        <div className="mx-auto max-w-2xl py-2">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
