"use client";

// Overview de uma campanha. Mostra capa, badges, sinopse, próxima sessão
// (stub), membros (mock simplificado) e ações de gestão.
//
// As listas de "próxima sessão" e "histórico" usam dados mock até o
// backend de campaigns + sessions vinculados existir. TODO marcado nos
// pontos óbvios.

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Archive,
  Castle,
  Copy,
  Globe,
  Hash,
  Lock,
  RotateCcw,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import { useCampaignStore } from "@/lib/campaign-store";
import { useCampaignModalsStore } from "@/lib/campaign-modals-store";
import { CampaignSubNav } from "@/components/campaigns/campaign-subnav";
import {
  CAMPAIGN_SYSTEMS,
  AGE_RATING_LABELS,
  CAMPAIGN_FREQUENCY_LABELS,
  CAMPAIGN_VISIBILITY_LABELS,
  CAMPAIGN_TAG_LABELS,
  CONTENT_WARNING_LABELS,
  type ContentWarning,
  type CampaignTag,
} from "@questboard/constants";
import type { CampaignVisibility } from "@questboard/types";

const SYSTEM_LABELS = Object.fromEntries(
  CAMPAIGN_SYSTEMS.map((s) => [s.value, s.label] as const),
) as Record<string, string>;

const VISIBILITY_ICON: Record<CampaignVisibility, typeof Lock> = {
  PRIVATE: Lock,
  CODE: Hash,
  PUBLIC: Globe,
};

export default function CampaignOverviewPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  const router = useRouter();

  const campaign = useCampaignStore((s) =>
    s.campaigns.find((c) => c.id === id),
  );
  const archive = useCampaignStore((s) => s.archiveCampaign);
  const restore = useCampaignStore((s) => s.restoreCampaign);
  const remove = useCampaignStore((s) => s.deleteCampaign);
  const setActive = useCampaignStore((s) => s.setActiveCampaignId);
  const openSettings = useCampaignModalsStore((s) => s.openSettings);

  const [copied, setCopied] = useState(false);

  if (!campaign) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-16 text-center">
        <Castle className="mb-3 h-10 w-10 text-brand-muted" />
        <h1 className="font-cinzel text-base font-semibold text-brand-text">
          Campanha não encontrada
        </h1>
        <p className="mt-1 text-xs text-brand-muted">
          Pode ter sido excluída ou você não tem acesso.
        </p>
        <Link
          href="/campaigns"
          className="mt-4 rounded-md bg-brand-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-hover"
        >
          Voltar para campanhas
        </Link>
      </div>
    );
  }

  const isArchived = campaign.status === "archived";
  const VisibilityIcon = VISIBILITY_ICON[campaign.visibility];

  function copyJoinCode() {
    if (!campaign?.joinCode) return;
    navigator.clipboard.writeText(campaign.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleArchive() {
    if (!confirm(`Arquivar "${campaign?.name}"? Sessões viram read-only.`))
      return;
    archive(campaign!.id);
  }

  function handleRestore() {
    restore(campaign!.id);
  }

  function handleDelete() {
    if (!campaign) return;
    if (
      !confirm(
        `Excluir "${campaign.name}" permanentemente? Esta ação não pode ser desfeita.`,
      )
    )
      return;
    remove(campaign.id);
    router.push("/campaigns");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Voltar */}
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1 text-xs text-brand-muted transition-colors hover:text-brand-text"
      >
        <ArrowLeft className="h-3 w-3" />
        Campanhas
      </Link>

      <CampaignSubNav campaignId={campaign.id} />

      {/* Hero */}
      <div className="overflow-hidden rounded-lg border border-brand-border bg-brand-surface">
        <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-brand-accent/20 via-brand-surface-light to-brand-accent-muted">
          {campaign.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={campaign.coverImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
          {!campaign.coverImageUrl && (
            <div className="flex h-full w-full items-center justify-center">
              <Castle className="h-16 w-16 text-brand-accent/40" />
            </div>
          )}
          {/* Badges sobre a capa */}
          <div className="absolute inset-x-0 top-3 flex flex-wrap gap-1.5 px-3">
            {campaign.isSoloStory && (
              <Badge tone="accent">Solo Story</Badge>
            )}
            <Badge tone="muted">
              <VisibilityIcon className="h-2.5 w-2.5" />
              {CAMPAIGN_VISIBILITY_LABELS[campaign.visibility]}
            </Badge>
            <Badge tone="muted">{AGE_RATING_LABELS[campaign.ageRating]}</Badge>
            {isArchived && <Badge tone="warning">Arquivada</Badge>}
          </div>
        </div>

        <div className="space-y-2 p-4">
          <h1 className="font-cinzel text-2xl font-bold text-brand-text">
            {campaign.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-brand-muted">
            <span>{SYSTEM_LABELS[campaign.system] ?? campaign.system}</span>
            {campaign.frequency && (
              <span>{CAMPAIGN_FREQUENCY_LABELS[campaign.frequency]}</span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {campaign.memberCount}{" "}
              {campaign.memberCount === 1 ? "membro" : "membros"}
            </span>
            <span>
              {campaign.sessionCount}{" "}
              {campaign.sessionCount === 1 ? "sessão" : "sessões"}
            </span>
          </div>

          {campaign.joinCode && (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-brand-border bg-brand-surface-light px-3 py-2">
              <span className="text-[10px] uppercase tracking-wider text-brand-muted">
                Código de entrada
              </span>
              <code className="font-mono text-sm font-bold tracking-widest text-brand-accent">
                {campaign.joinCode}
              </code>
              <button
                onClick={copyJoinCode}
                className="ml-auto flex items-center gap-1 rounded text-[10px] font-medium text-brand-muted transition-colors hover:text-brand-text"
                title="Copiar código"
              >
                <Copy className="h-3 w-3" />
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sinopse */}
      {campaign.synopsis && (
        <Section title="Sinopse">
          <p className="text-sm leading-relaxed text-brand-text whitespace-pre-line">
            {campaign.synopsis}
          </p>
        </Section>
      )}

      {/* Próxima sessão — stub */}
      <Section title="Próxima sessão">
        {/* TODO(backend-campaigns): listar próxima Session vinculada à campanha. */}
        <div className="rounded-md border border-dashed border-brand-border bg-brand-surface/40 px-4 py-6 text-center">
          <p className="text-xs text-brand-muted">
            Nenhuma sessão agendada.
          </p>
          <button
            onClick={() => {
              setActive(campaign.id);
              // TODO(create-session): integrar com o modal existente
              // (CreateSessionModal) e passar campaignId.
              alert("Criação de sessão integrada virá na próxima fatia.");
            }}
            className="mt-3 rounded-md bg-brand-accent px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-brand-accent-hover"
          >
            Agendar sessão
          </button>
        </div>
      </Section>

      {/* Histórico — stub */}
      <Section title="Histórico de sessões">
        {/* TODO(backend-campaigns): listar Sessions vinculadas em ordem reversa. */}
        <p className="text-xs text-brand-muted">
          As sessões anteriores aparecerão aqui assim que houverem.
        </p>
      </Section>

      {/* Membros — preview com link pra página dedicada */}
      <Section title="Membros">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {campaign.members.slice(0, 6).map((m) => {
              const initials = m.displayName
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <span
                  key={m.userId}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-surface bg-brand-accent/20 text-[10px] font-bold text-brand-accent"
                  title={`${m.displayName} · ${m.role}`}
                >
                  {initials}
                </span>
              );
            })}
            {campaign.members.length > 6 && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-surface bg-brand-surface-light text-[10px] font-bold text-brand-muted">
                +{campaign.members.length - 6}
              </span>
            )}
          </div>
          <Link
            href={`/campaigns/${campaign.id}/members`}
            className="ml-auto flex items-center gap-1.5 rounded-md border border-brand-border px-3 py-1.5 text-[11px] font-medium text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
          >
            <Users className="h-3 w-3" />
            Gerenciar
          </Link>
        </div>
      </Section>

      {/* Tags + content warnings */}
      {(campaign.tags.length > 0 || campaign.contentWarnings.length > 0) && (
        <Section title="Tom e conteúdo">
          <div className="space-y-2">
            {campaign.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {campaign.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-brand-border px-2 py-0.5 text-[10px] text-brand-muted"
                  >
                    {CAMPAIGN_TAG_LABELS[t as CampaignTag] ?? t}
                  </span>
                ))}
              </div>
            )}
            {campaign.contentWarnings.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-brand-muted">
                  Avisos:
                </span>
                {campaign.contentWarnings.map((w) => (
                  <span
                    key={w}
                    className="rounded-full border border-brand-warning/30 bg-brand-warning/5 px-2 py-0.5 text-[10px] text-brand-warning"
                  >
                    {CONTENT_WARNING_LABELS[w as ContentWarning] ?? w}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Ações */}
      <div className="flex flex-wrap gap-2 border-t border-brand-border pt-4">
        <button
          onClick={() => openSettings(campaign.id)}
          className="flex items-center gap-1.5 rounded-md border border-brand-border px-3 py-2 text-xs font-medium text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
        >
          <Settings className="h-3.5 w-3.5" />
          Configurações
        </button>

        {isArchived ? (
          <button
            onClick={handleRestore}
            className="flex items-center gap-1.5 rounded-md border border-brand-accent/40 bg-brand-accent/10 px-3 py-2 text-xs font-semibold text-brand-accent transition-colors hover:bg-brand-accent/20"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reativar
          </button>
        ) : (
          <button
            onClick={handleArchive}
            className="flex items-center gap-1.5 rounded-md border border-brand-border px-3 py-2 text-xs font-medium text-brand-muted transition-colors hover:border-brand-warning/40 hover:text-brand-warning"
          >
            <Archive className="h-3.5 w-3.5" />
            Arquivar
          </button>
        )}

        <button
          onClick={handleDelete}
          className="ml-auto flex items-center gap-1.5 rounded-md border border-brand-danger/40 bg-brand-danger/10 px-3 py-2 text-xs font-semibold text-brand-danger transition-colors hover:bg-brand-danger/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Excluir
        </button>
      </div>
    </div>
  );
}

// ── Subcomponents ──

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-brand-border bg-brand-surface p-4">
      <h2 className="mb-2 font-cinzel text-xs font-semibold uppercase tracking-wider text-brand-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "accent" | "muted" | "warning";
  children: React.ReactNode;
}) {
  const cls =
    tone === "accent"
      ? "border-brand-accent/40 bg-brand-accent/15 text-brand-accent"
      : tone === "warning"
        ? "border-brand-warning/40 bg-brand-warning/15 text-brand-warning"
        : "border-brand-border bg-black/40 text-brand-text";
  return (
    <span
      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm ${cls}`}
    >
      {children}
    </span>
  );
}
