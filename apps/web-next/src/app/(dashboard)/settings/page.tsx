import { Settings, User, Bell, Palette, Globe, Shield } from "lucide-react";

const SETTINGS_SECTIONS = [
  { id: "profile", label: "Perfil", icon: User, description: "Nome, avatar e informações pessoais" },
  { id: "notifications", label: "Notificações", icon: Bell, description: "Configurar alertas e notificações" },
  { id: "appearance", label: "Aparência", icon: Palette, description: "Tema, idioma e preferências visuais" },
  { id: "language", label: "Idioma", icon: Globe, description: "Idioma da interface" },
  { id: "privacy", label: "Privacidade", icon: Shield, description: "Visibilidade do perfil e dados" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Configurações</h1>
        <p className="mt-1 text-sm text-gray-400">
          Gerencie suas preferências e configurações da conta.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              className="flex items-start gap-4 rounded-xl border border-white/10 bg-brand-surface p-5 text-left hover:border-white/20"
            >
              <div className="rounded-lg bg-white/5 p-2.5">
                <Icon className="h-5 w-5 text-brand-accent" />
              </div>
              <div>
                <h3 className="font-medium text-white">{section.label}</h3>
                <p className="mt-1 text-sm text-gray-500">{section.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Plan Info */}
      <div className="rounded-xl border border-brand-accent/20 bg-brand-accent/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-semibold text-white">Plano Atual: Free</h3>
            <p className="mt-1 text-sm text-gray-400">
              Upgrade para desbloquear mapas ilimitados, IA avançada e mais.
            </p>
          </div>
          <button className="rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-accent/80">
            Fazer Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
