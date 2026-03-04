"use client";

import {
  User,
  Palette,
  Settings,
  Map,
  Swords,
  Eye,
  MessageSquare,
  Volume2,
  Dice5,
  Bell,
  Accessibility,
  Zap,
  Database,
  Globe,
  Info,
} from "lucide-react";

export type SettingsSectionId =
  | "profile"
  | "appearance"
  | "session"
  | "map"
  | "combat"
  | "player-view"
  | "chat"
  | "audio"
  | "dice"
  | "notifications"
  | "accessibility"
  | "performance"
  | "storage"
  | "language"
  | "about";

interface NavItem {
  id: SettingsSectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gmOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: "profile", label: "Perfil e Conta", icon: User },
  { id: "appearance", label: "Aparência e Tema", icon: Palette },
  { id: "session", label: "Sessão e Campanha", icon: Settings, gmOnly: true },
  { id: "map", label: "Mapa e Canvas", icon: Map },
  { id: "combat", label: "Combate e Regras", icon: Swords },
  { id: "player-view", label: "Visão dos Jogadores", icon: Eye, gmOnly: true },
  { id: "chat", label: "Chat e Comunicação", icon: MessageSquare },
  { id: "audio", label: "Áudio e Trilha Sonora", icon: Volume2 },
  { id: "dice", label: "Dados e Rolagem", icon: Dice5 },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "accessibility", label: "Acessibilidade", icon: Accessibility },
  { id: "performance", label: "Performance", icon: Zap },
  { id: "storage", label: "Dados e Armazenamento", icon: Database },
  { id: "language", label: "Idioma", icon: Globe },
  { id: "about", label: "Sobre e Feedback", icon: Info },
];

interface SettingsNavProps {
  activeSection: SettingsSectionId;
  onSectionChange: (section: SettingsSectionId) => void;
}

export function SettingsNav({ activeSection, onSectionChange }: SettingsNavProps) {
  return (
    <nav className="w-60 shrink-0 space-y-0.5 overflow-y-auto pr-4">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSectionChange(item.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              isActive
                ? "bg-brand-accent/10 text-brand-accent"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
            {item.gmOnly && (
              <span className="ml-auto shrink-0 rounded bg-brand-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-brand-accent">
                GM
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
