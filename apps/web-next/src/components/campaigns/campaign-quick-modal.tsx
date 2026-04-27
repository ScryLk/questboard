"use client";

// Modal aberto pelo sidebar ao clicar numa campanha. Mostra dados-chave
// (capa, badges, sinopse) e ações rápidas — incluindo "Definir como
// campanha ativa". Hand-rolled, padrão consistente com os outros
// popovers do projeto.

import { useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
  Castle,
  Check,
  Globe,
  Hash,
  Lock,
  LogIn,
  ScrollText,
  Settings,
  Star,
  Users,
  X,
} from "lucide-react";
import type { CampaignDetailed, CampaignVisibility } from "@questboard/types";
import {
  CAMPAIGN_SYSTEMS,
  AGE_RATING_LABELS,
  CAMPAIGN_VISIBILITY_LABELS,
} from "@questboard/constants";
import { useCampaignStore } from "@/lib/campaign-store";
import { useCampaignModalsStore } from "@/lib/campaign-modals-store";

const SYSTEM_LABELS = Object.fromEntries(
  CAMPAIGN_SYSTEMS.map((s) => [s.value, s.label] as const),
) as Record<string, string>;

const VISIBILITY_ICON: Record<CampaignVisibility, typeof Lock> = {
  PRIVATE: Lock,
  CODE: Hash,
  PUBLIC: Globe,
};

/** Wrapper global — lê id da store de modais e renderiza o modal quando há
 *  algum id ativo. Mount uma vez no layout. */
export function CampaignQuickModalHost() {
  const previewId = useCampaignModalsStore((s) => s.previewCampaignId);
  const closePreview = useCampaignModalsStore((s) => s.closePreview);
  const campaign = useCampaignStore((s) =>
    previewId ? s.campaigns.find((c) => c.id === previewId) ?? null : null,
  );
  if (!campaign) return null;
  return <CampaignQuickModal campaign={campaign} onClose={closePreview} />;
}

interface Props {
  campaign: CampaignDetailed;
  onClose: () => void;
}

export function CampaignQuickModal({ campaign: c, onClose }: Props) {
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const setActiveCampaignId = useCampaignStore((s) => s.setActiveCampaignId);
  const openSettings = useCampaignModalsStore((s) => s.openSettings);

  const isActive = activeCampaignId === c.id;
  const isArchived = c.status === "archived";
  const VisibilityIcon = VISIBILITY_ICON[c.visibility];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSetActive() {
    setActiveCampaignId(c.id);
    onClose();
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-label={`Detalhes de ${c.name}`}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#04090f]/55 px-4 backdrop-blur-[1px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-brand-border bg-brand-surface shadow-2xl">
        {/* Cover */}
        <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-brand-accent/20 via-brand-surface-light to-brand-accent-muted">
          {c.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.coverImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Castle className="h-12 w-12 text-brand-accent/40" />
            </div>
          )}

          {/* Badges flutuantes */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {isActive && (
              <Badge tone="gold">
                <Star className="h-2.5 w-2.5" fill="currentColor" />
                Ativa
              </Badge>
            )}
            {c.isSoloStory && <Badge tone="accent">Solo</Badge>}
            {isArchived && <Badge tone="warning">Arquivada</Badge>}
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-brand-border bg-black/50 text-brand-text backdrop-blur-sm transition-colors hover:bg-black/70"
            aria-label="Fechar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 p-4">
          <div>
            <h2 className="font-cinzel text-lg font-bold text-brand-text">
              {c.name}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] uppercase tracking-wider text-brand-muted">
              <span>{SYSTEM_LABELS[c.system] ?? c.system}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <VisibilityIcon className="h-2.5 w-2.5" />
                {CAMPAIGN_VISIBILITY_LABELS[c.visibility]}
              </span>
              <span>·</span>
              <span>{AGE_RATING_LABELS[c.ageRating]}</span>
            </div>
          </div>

          {c.synopsis && (
            <p className="line-clamp-3 text-xs leading-relaxed text-brand-muted">
              {c.synopsis}
            </p>
          )}

          <div className="flex items-center gap-3 text-[11px] text-brand-muted">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {c.memberCount}{" "}
              {c.memberCount === 1 ? "membro" : "membros"}
            </span>
            <span className="flex items-center gap-1">
              <ScrollText className="h-3 w-3" />
              {c.sessionCount}{" "}
              {c.sessionCount === 1 ? "sessão" : "sessões"}
            </span>
          </div>

          {/* Ação primária — definir como ativa */}
          <button
            onClick={handleSetActive}
            disabled={isActive || isArchived}
            className={`flex w-full items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
              isActive
                ? "cursor-not-allowed bg-brand-gold/10 text-brand-gold"
                : isArchived
                  ? "cursor-not-allowed bg-brand-surface-light text-brand-muted"
                  : "bg-brand-accent text-white hover:bg-brand-accent-hover"
            }`}
          >
            {isActive ? (
              <>
                <Check className="h-4 w-4" />
                Já é a campanha ativa
              </>
            ) : isArchived ? (
              "Arquivada — reative para definir como ativa"
            ) : (
              <>
                <Star className="h-4 w-4" />
                Definir como campanha ativa
              </>
            )}
          </button>

          {/* Ações secundárias */}
          <div className="grid grid-cols-3 gap-1">
            <Link
              href={`/campaigns/${c.id}`}
              onClick={onClose}
              className="flex flex-col items-center gap-1 rounded-md border border-brand-border px-2 py-2 text-[10px] font-medium text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
            >
              <LogIn className="h-3.5 w-3.5" />
              Abrir
            </Link>
            <Link
              href={`/campaigns/${c.id}/members`}
              onClick={onClose}
              className="flex flex-col items-center gap-1 rounded-md border border-brand-border px-2 py-2 text-[10px] font-medium text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
            >
              <Users className="h-3.5 w-3.5" />
              Membros
            </Link>
            <button
              onClick={() => {
                onClose();
                openSettings(c.id);
              }}
              className="flex flex-col items-center gap-1 rounded-md border border-brand-border px-2 py-2 text-[10px] font-medium text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
            >
              <Settings className="h-3.5 w-3.5" />
              Config
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "gold" | "accent" | "warning";
  children: React.ReactNode;
}) {
  const cls =
    tone === "gold"
      ? "border-brand-gold/40 bg-brand-gold/15 text-brand-gold"
      : tone === "accent"
        ? "border-brand-accent/40 bg-brand-accent/15 text-brand-accent"
        : "border-brand-warning/40 bg-brand-warning/15 text-brand-warning";
  return (
    <span
      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm ${cls}`}
    >
      {children}
    </span>
  );
}
