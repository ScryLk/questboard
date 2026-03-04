"use client";

import { SettingsSection } from "../controls";
import {
  ExternalLink,
  Bug,
  Lightbulb,
  Star,
  FileText,
  Shield,
  Scale,
  Github,
  Globe,
  MessageCircle,
} from "lucide-react";

export function AboutSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-white">Sobre e Feedback</h2>
        <p className="mt-1 text-sm text-gray-500">Informações do app, links e feedback.</p>
      </div>

      <SettingsSection title="QuestBoard">
        <div className="space-y-1 py-2">
          <InfoRow label="Versão" value="0.1.0 (beta)" />
          <InfoRow label="Build" value="2026.03.04" />
        </div>
        <div className="mt-2 flex gap-2">
          <button className="rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10">
            Novidades desta versão
          </button>
          <button className="rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10">
            Changelog completo
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Links">
        <LinkRow icon={Globe} label="Site oficial" />
        <LinkRow icon={FileText} label="Documentação / Wiki" />
        <LinkRow icon={MessageCircle} label="Discord da comunidade" />
        <LinkRow icon={Github} label="GitHub (open source)" />
      </SettingsSection>

      <SettingsSection title="Feedback">
        <div className="space-y-2">
          <button className="flex w-full items-center gap-3 rounded-lg bg-white/5 px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/10">
            <Bug className="h-4 w-4 text-brand-danger" />
            Reportar bug
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg bg-white/5 px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/10">
            <Lightbulb className="h-4 w-4 text-brand-warning" />
            Sugerir funcionalidade
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg bg-white/5 px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/10">
            <Star className="h-4 w-4 text-brand-accent" />
            Avaliar o QuestBoard
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Termos">
        <LinkRow icon={FileText} label="Termos de uso" />
        <LinkRow icon={Shield} label="Política de privacidade" />
        <LinkRow icon={Scale} label="Licenças de terceiros" />
      </SettingsSection>

      <SettingsSection title="Créditos">
        <div className="space-y-2 py-2 text-sm text-gray-400">
          <p>
            Desenvolvido por <span className="text-white">Lucas</span> —{" "}
            <span className="text-brand-accent">github.com/ScryLk</span>
          </p>
          <p>Ícones: Lucide Icons</p>
          <p>Fontes: Inter</p>
        </div>
      </SettingsSection>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-mono text-white">{value}</span>
    </div>
  );
}

function LinkRow({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5">
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-gray-500" />
        {label}
      </span>
      <ExternalLink className="h-3.5 w-3.5 text-gray-600" />
    </button>
  );
}
