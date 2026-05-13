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

const APP_VERSION = "0.1.0 (beta)";
const APP_BUILD = process.env.NEXT_PUBLIC_BUILD_SHA?.slice(0, 7) ?? "dev";

const LINKS = {
  site: "https://questboard.gg",
  docs: "https://questboard.gg/docs",
  discord: "https://discord.gg/questboard",
  github: "https://github.com/ScryLk/questboard",
  changelog: "/legal/changelog",
  terms: "/legal/terms",
  privacy: "/legal/privacy",
  attribution: "/legal/srd-attribution",
} as const;

const FEEDBACK_EMAIL = "feedback@questboard.gg";

function openExternal(url: string) {
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function openMailto(subject: string, body?: string) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  params.set("subject", subject);
  if (body) params.set("body", body);
  window.location.href = `mailto:${FEEDBACK_EMAIL}?${params.toString()}`;
}

export function AboutSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-white">
          Sobre e Feedback
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Informações do app, links e feedback.
        </p>
      </div>

      <SettingsSection title="QuestBoard">
        <div className="space-y-1 py-2">
          <InfoRow label="Versão" value={APP_VERSION} />
          <InfoRow label="Build" value={APP_BUILD} />
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => openExternal(LINKS.changelog)}
            className="cursor-pointer rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
          >
            Novidades desta versão
          </button>
          <button
            type="button"
            onClick={() => openExternal(LINKS.changelog)}
            className="cursor-pointer rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
          >
            Changelog completo
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Links">
        <LinkRow icon={Globe} label="Site oficial" href={LINKS.site} />
        <LinkRow icon={FileText} label="Documentação / Wiki" href={LINKS.docs} />
        <LinkRow
          icon={MessageCircle}
          label="Discord da comunidade"
          href={LINKS.discord}
        />
        <LinkRow icon={Github} label="GitHub (open source)" href={LINKS.github} />
      </SettingsSection>

      <SettingsSection title="Feedback">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() =>
              openMailto(
                "[QuestBoard] Bug report",
                `Descreva o bug:\n\n\n\n---\nVersão: ${APP_VERSION}\nBuild: ${APP_BUILD}\nUser-Agent: ${typeof navigator !== "undefined" ? navigator.userAgent : "n/a"}`,
              )
            }
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg bg-white/5 px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/10"
          >
            <Bug className="h-4 w-4 text-brand-danger" />
            Reportar bug
          </button>
          <button
            type="button"
            onClick={() =>
              openMailto(
                "[QuestBoard] Sugestão de feature",
                "Descreva sua sugestão:\n\n",
              )
            }
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg bg-white/5 px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/10"
          >
            <Lightbulb className="h-4 w-4 text-brand-warning" />
            Sugerir funcionalidade
          </button>
          <button
            type="button"
            onClick={() => openExternal(LINKS.github + "/discussions")}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg bg-white/5 px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/10"
          >
            <Star className="h-4 w-4 text-brand-accent" />
            Avaliar o QuestBoard
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Termos">
        <LinkRow icon={FileText} label="Termos de uso" href={LINKS.terms} />
        <LinkRow icon={Shield} label="Política de privacidade" href={LINKS.privacy} />
        <LinkRow
          icon={Scale}
          label="Licenças de terceiros (SRD)"
          href={LINKS.attribution}
        />
      </SettingsSection>

      <SettingsSection title="Créditos">
        <div className="space-y-2 py-2 text-sm text-gray-400">
          <p>
            Desenvolvido por <span className="text-white">Lucas</span> —{" "}
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer text-brand-accent hover:underline"
            >
              github.com/ScryLk
            </a>
          </p>
          <p>Ícones: Lucide Icons</p>
          <p>Fontes: Inter, Cinzel</p>
          <p>
            Conteúdo D&D 5e baseado no SRD 5.1 (CC-BY-4.0) e Cosmic Horror
            (domínio público).
          </p>
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

function LinkRow({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}) {
  const isExternal = href.startsWith("http");
  return (
    <button
      type="button"
      onClick={() => {
        if (isExternal) openExternal(href);
        else if (typeof window !== "undefined") window.location.href = href;
      }}
      className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-gray-500" />
        {label}
      </span>
      <ExternalLink className="h-3.5 w-3.5 text-gray-600" />
    </button>
  );
}
