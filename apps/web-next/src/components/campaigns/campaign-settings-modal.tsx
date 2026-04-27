"use client";

// Modal de configurações da campanha. Mesmo conteúdo da antiga página
// /campaigns/[id]/settings, agora em overlay para acesso rápido sem
// trocar de rota.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Archive,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Globe,
  Hash,
  Lock,
  RefreshCcw,
  RotateCcw,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useCampaignStore, MOCK_OWNER_ID } from "@/lib/campaign-store";
import { useCampaignModalsStore } from "@/lib/campaign-modals-store";
import {
  CAMPAIGN_SYSTEMS,
  CAMPAIGN_TAGS,
  CAMPAIGN_TAG_LABELS,
  CONTENT_WARNINGS,
  CONTENT_WARNING_LABELS,
  CAMPAIGN_FREQUENCY_LABELS,
  CAMPAIGN_LENGTH_LABELS,
  CAMPAIGN_VISIBILITY_LABELS,
  CAMPAIGN_VISIBILITY_DESCRIPTIONS,
  AGE_RATING_LABELS,
  SAFETY_TOOL_LABELS,
} from "@questboard/constants";
import { updateCampaignSchema } from "@questboard/validators";
import type {
  AgeRating,
  CampaignDetailed,
  CampaignFrequency,
  CampaignLength,
  CampaignVisibility,
  SafetyTool,
} from "@questboard/types";

export function CampaignSettingsModal() {
  const settingsCampaignId = useCampaignModalsStore(
    (s) => s.settingsCampaignId,
  );
  const closeSettings = useCampaignModalsStore((s) => s.closeSettings);

  if (!settingsCampaignId) return null;
  return (
    <CampaignSettingsModalInner
      campaignId={settingsCampaignId}
      onClose={closeSettings}
    />
  );
}

function CampaignSettingsModalInner({
  campaignId,
  onClose,
}: {
  campaignId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const campaign = useCampaignStore((s) =>
    s.campaigns.find((c) => c.id === campaignId),
  );
  const updateCampaign = useCampaignStore((s) => s.updateCampaign);
  const archiveCampaign = useCampaignStore((s) => s.archiveCampaign);
  const restoreCampaign = useCampaignStore((s) => s.restoreCampaign);
  const deleteCampaign = useCampaignStore((s) => s.deleteCampaign);
  const regenerateJoinCode = useCampaignStore((s) => s.regenerateJoinCode);
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const setActiveCampaignId = useCampaignStore((s) => s.setActiveCampaignId);

  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Mock: usuário atual = owner default. TODO(auth): trocar por hook real.
  const currentUserId = MOCK_OWNER_ID;
  const isOwner = campaign?.ownerId === currentUserId;

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

  if (typeof document === "undefined") return null;
  if (!campaign) return null;

  function persist<K extends keyof CampaignDetailed>(
    field: K,
    value: CampaignDetailed[K],
  ) {
    if (!campaign) return;
    const patch = { [field]: value } as Partial<CampaignDetailed>;
    const parsed = updateCampaignSchema.safeParse(patch);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Valor inválido";
      setError(msg);
      return;
    }
    setError(null);
    updateCampaign(campaign.id, patch);
    setSavedAt(Date.now());
  }

  function copyJoinCode() {
    if (!campaign?.joinCode) return;
    navigator.clipboard.writeText(campaign.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleRegen() {
    if (!confirm("Gerar novo código? O atual deixa de funcionar.")) return;
    regenerateJoinCode(campaign!.id);
  }

  function handleDelete() {
    if (!campaign) return;
    if (
      !confirm(
        `Excluir "${campaign.name}" permanentemente? Esta ação não pode ser desfeita.`,
      )
    )
      return;
    deleteCampaign(campaign.id);
    onClose();
    router.push("/campaigns");
  }

  return createPortal(
    <div
      role="dialog"
      aria-label={`Configurações de ${campaign.name}`}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#04090f]/55 px-4 py-6 backdrop-blur-[1px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-brand-border bg-brand-surface shadow-2xl">
        {/* Header sticky */}
        <div className="flex shrink-0 items-center justify-between border-b border-brand-border px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-cinzel text-sm font-semibold text-brand-text">
              Configurações
            </p>
            <p className="truncate text-[10px] text-brand-muted">
              {campaign.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            aria-label="Fechar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body scrollável */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!isOwner ? (
            <p className="rounded-md border border-brand-border bg-brand-surface-light px-3 py-3 text-xs text-brand-muted">
              Apenas o GM e co-mestres podem editar as configurações desta
              campanha.
            </p>
          ) : (
            <div className="space-y-3">
              {error && (
                <div className="rounded-md border border-brand-danger/40 bg-brand-danger/10 px-3 py-2 text-xs text-brand-danger">
                  {error}
                </div>
              )}
              {savedAt && !error && (
                <div className="rounded-md border border-brand-success/40 bg-brand-success/10 px-3 py-2 text-xs text-brand-success">
                  Alterações salvas.
                </div>
              )}

              {/* Geral */}
              <Section title="Geral" defaultOpen>
                <Field label="Nome da campanha">
                  <input
                    type="text"
                    defaultValue={campaign.name}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v !== campaign.name && v.length >= 3)
                        persist("name", v);
                    }}
                    maxLength={80}
                    className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
                  />
                </Field>
                <Field label="Sistema">
                  <select
                    value={campaign.system}
                    onChange={(e) => persist("system", e.target.value)}
                    className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
                  >
                    {CAMPAIGN_SYSTEMS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Idioma da mesa">
                  <select
                    value={campaign.language}
                    onChange={(e) => persist("language", e.target.value)}
                    className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </Field>
              </Section>

              {/* Apresentação */}
              <Section title="Apresentação">
                <Field label="URL da capa" hint="Cole link de Imgur, Discord, etc.">
                  <input
                    type="url"
                    defaultValue={campaign.coverImageUrl ?? ""}
                    onBlur={(e) =>
                      persist("coverImageUrl", e.target.value.trim() || null)
                    }
                    placeholder="https://..."
                    className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
                  />
                  {campaign.coverImageUrl && (
                    <div className="mt-2 aspect-[16/9] overflow-hidden rounded-md border border-brand-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={campaign.coverImageUrl}
                        alt="Capa"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </Field>
                <Field label="Sinopse">
                  <textarea
                    defaultValue={campaign.synopsis ?? ""}
                    onBlur={(e) =>
                      persist("synopsis", e.target.value.trim() || null)
                    }
                    rows={5}
                    maxLength={2000}
                    className="w-full resize-y rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
                  />
                </Field>
                <Field label="Tags" hint={`${campaign.tags.length}/8`}>
                  <TagPicker
                    value={campaign.tags}
                    onChange={(next) => persist("tags", next)}
                  />
                </Field>
                <Field label="Frequência">
                  <select
                    value={campaign.frequency ?? ""}
                    onChange={(e) =>
                      persist(
                        "frequency",
                        (e.target.value || null) as
                          | CampaignFrequency
                          | null,
                      )
                    }
                    className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
                  >
                    <option value="">— a definir —</option>
                    {(Object.keys(
                      CAMPAIGN_FREQUENCY_LABELS,
                    ) as CampaignFrequency[]).map((f) => (
                      <option key={f} value={f}>
                        {CAMPAIGN_FREQUENCY_LABELS[f]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Duração estimada">
                  <select
                    value={campaign.expectedLength ?? ""}
                    onChange={(e) =>
                      persist(
                        "expectedLength",
                        (e.target.value || null) as
                          | CampaignLength
                          | null,
                      )
                    }
                    className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
                  >
                    <option value="">— a definir —</option>
                    {(Object.keys(
                      CAMPAIGN_LENGTH_LABELS,
                    ) as CampaignLength[]).map((l) => (
                      <option key={l} value={l}>
                        {CAMPAIGN_LENGTH_LABELS[l]}
                      </option>
                    ))}
                  </select>
                </Field>
              </Section>

              {/* Tom & segurança */}
              <Section title="Tom e segurança">
                <Field label="Faixa etária">
                  <div className="grid grid-cols-4 gap-1">
                    {(Object.keys(AGE_RATING_LABELS) as AgeRating[]).map(
                      (a) => (
                        <button
                          key={a}
                          onClick={() => persist("ageRating", a)}
                          className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                            campaign.ageRating === a
                              ? "border-brand-accent bg-brand-accent/15 text-brand-accent"
                              : "border-brand-border text-brand-muted hover:text-brand-text"
                          }`}
                        >
                          {AGE_RATING_LABELS[a]}
                        </button>
                      ),
                    )}
                  </div>
                </Field>
                <Field label="Content warnings">
                  <div className="flex flex-wrap gap-1.5">
                    {CONTENT_WARNINGS.map((w) => {
                      const selected = campaign.contentWarnings.includes(w);
                      return (
                        <button
                          key={w}
                          onClick={() => {
                            const next = selected
                              ? campaign.contentWarnings.filter((x) => x !== w)
                              : [...campaign.contentWarnings, w];
                            persist("contentWarnings", next);
                          }}
                          className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
                            selected
                              ? "border-brand-warning/60 bg-brand-warning/10 text-brand-warning"
                              : "border-brand-border text-brand-muted hover:text-brand-text"
                          }`}
                        >
                          {CONTENT_WARNING_LABELS[w]}
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <Field label="Safety tools">
                  <div className="space-y-1.5">
                    {(Object.keys(SAFETY_TOOL_LABELS) as SafetyTool[]).map(
                      (t) => {
                        const selected = campaign.safetyTools.includes(t);
                        return (
                          <label
                            key={t}
                            className="flex cursor-pointer items-start gap-2 rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-xs text-brand-text"
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => {
                                const next = selected
                                  ? campaign.safetyTools.filter((x) => x !== t)
                                  : [...campaign.safetyTools, t];
                                persist("safetyTools", next);
                              }}
                              className="mt-0.5 accent-brand-accent"
                            />
                            <span>{SAFETY_TOOL_LABELS[t]}</span>
                          </label>
                        );
                      },
                    )}
                  </div>
                </Field>
              </Section>

              {/* Visibilidade */}
              <Section title="Visibilidade e acesso">
                <Field label="Visibilidade">
                  <div className="space-y-2">
                    {(["PRIVATE", "CODE", "PUBLIC"] as CampaignVisibility[]).map(
                      (v) => {
                        const Icon =
                          v === "PRIVATE" ? Lock : v === "CODE" ? Hash : Globe;
                        const selected = campaign.visibility === v;
                        const wouldConflict =
                          v === "PUBLIC" && campaign.isSoloStory;
                        return (
                          <button
                            key={v}
                            onClick={() => {
                              if (wouldConflict) {
                                setError(
                                  "Solo Story incompatível com visibilidade pública. Desligue Solo Story primeiro.",
                                );
                                return;
                              }
                              persist("visibility", v);
                            }}
                            className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                              selected
                                ? "border-brand-accent bg-brand-accent/10"
                                : "border-brand-border bg-brand-surface hover:border-brand-accent/40"
                            } ${wouldConflict ? "opacity-50" : ""}`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 shrink-0 text-brand-accent" />
                              <span className="font-medium text-brand-text">
                                {CAMPAIGN_VISIBILITY_LABELS[v]}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-brand-muted">
                              {CAMPAIGN_VISIBILITY_DESCRIPTIONS[v]}
                            </p>
                          </button>
                        );
                      },
                    )}
                  </div>
                </Field>

                {campaign.joinCode && (
                  <Field label="Código de entrada">
                    <div className="flex items-center gap-2 rounded-md border border-brand-border bg-brand-surface-light px-3 py-2">
                      <code className="flex-1 font-mono text-base font-bold tracking-widest text-brand-accent">
                        {campaign.joinCode}
                      </code>
                      <button
                        onClick={copyJoinCode}
                        className="flex items-center gap-1 rounded text-[11px] font-medium text-brand-muted transition-colors hover:text-brand-text"
                      >
                        <Copy className="h-3 w-3" />
                        {copied ? "Copiado!" : "Copiar"}
                      </button>
                      <button
                        onClick={handleRegen}
                        className="flex items-center gap-1 rounded text-[11px] font-medium text-brand-muted transition-colors hover:text-brand-warning"
                        title="Gerar novo código"
                      >
                        <RefreshCcw className="h-3 w-3" />
                        Regenerar
                      </button>
                    </div>
                  </Field>
                )}

                <ToggleRow
                  title="Modo Solo Story"
                  description="Mesa pra um único jogador. Não pode ser combinado com visibilidade pública."
                  checked={campaign.isSoloStory}
                  disabled={campaign.visibility === "PUBLIC"}
                  disabledReason="Não pode ativar com visibilidade pública."
                  onChange={(v) => persist("isSoloStory", v)}
                />
              </Section>

              <Section title="Comunicação externa">
                <Field label="Discord">
                  <input
                    type="url"
                    defaultValue={campaign.externalChat?.discord ?? ""}
                    onBlur={(e) => {
                      const v = e.target.value.trim() || undefined;
                      const next = {
                        ...(campaign.externalChat ?? {}),
                        discord: v,
                      };
                      persist(
                        "externalChat",
                        v || next.whatsapp ? next : null,
                      );
                    }}
                    placeholder="https://discord.gg/..."
                    className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
                  />
                </Field>
                <Field label="WhatsApp">
                  <input
                    type="url"
                    defaultValue={campaign.externalChat?.whatsapp ?? ""}
                    onBlur={(e) => {
                      const v = e.target.value.trim() || undefined;
                      const next = {
                        ...(campaign.externalChat ?? {}),
                        whatsapp: v,
                      };
                      persist(
                        "externalChat",
                        v || next.discord ? next : null,
                      );
                    }}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
                  />
                </Field>
              </Section>

              {campaign.visibility === "PUBLIC" && (
                <Section title="Pitch público" defaultOpen>
                  <Field
                    label="Pitch curto que aparece no catálogo"
                    hint={`${(campaign.publicPitch ?? "").length}/500`}
                  >
                    <textarea
                      defaultValue={campaign.publicPitch ?? ""}
                      onBlur={(e) =>
                        persist("publicPitch", e.target.value.trim() || null)
                      }
                      rows={3}
                      maxLength={500}
                      className="w-full resize-y rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
                    />
                  </Field>
                </Section>
              )}

              {/* Definir como campanha ativa — sutil, antes da zona de perigo */}
              <div className="flex items-center justify-between gap-2 rounded-md border border-brand-border bg-brand-surface/40 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-brand-text">
                    Campanha ativa
                  </p>
                  <p className="text-[10px] text-brand-muted">
                    {activeCampaignId === campaign.id
                      ? "Esta campanha define o contexto atual do sistema."
                      : "Personagens, mapas e jogadores filtram pela ativa."}
                  </p>
                </div>
                {activeCampaignId === campaign.id ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-md border border-brand-gold/30 bg-brand-gold/5 px-2 py-1 text-[10px] font-semibold text-brand-gold">
                    <Check className="h-3 w-3" />
                    Ativa
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveCampaignId(campaign.id)}
                    disabled={campaign.status === "archived"}
                    className="flex shrink-0 items-center gap-1 rounded-md border border-brand-border px-2.5 py-1 text-[10px] font-medium text-brand-muted transition-colors hover:border-brand-gold/40 hover:text-brand-gold disabled:cursor-not-allowed disabled:opacity-50"
                    title={
                      campaign.status === "archived"
                        ? "Reative a campanha primeiro"
                        : "Definir como campanha ativa"
                    }
                  >
                    <Star className="h-3 w-3" />
                    Definir como ativa
                  </button>
                )}
              </div>

              {/* Zona de perigo */}
              <div className="rounded-md border border-brand-danger/30 bg-brand-danger/5 p-3">
                <h2 className="mb-2 font-cinzel text-xs font-semibold uppercase tracking-wider text-brand-danger">
                  Zona de perigo
                </h2>
                <div className="flex flex-wrap gap-2">
                  {campaign.status === "archived" ? (
                    <button
                      onClick={() => restoreCampaign(campaign.id)}
                      className="flex items-center gap-1.5 rounded-md border border-brand-accent/40 bg-brand-accent/10 px-3 py-2 text-xs font-semibold text-brand-accent transition-colors hover:bg-brand-accent/20"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reativar campanha
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Arquivar "${campaign.name}"? Sessões viram read-only e a mesa some das listagens ativas.`,
                          )
                        ) {
                          archiveCampaign(campaign.id);
                        }
                      }}
                      className="flex items-center gap-1.5 rounded-md border border-brand-warning/40 bg-brand-warning/10 px-3 py-2 text-xs font-semibold text-brand-warning transition-colors hover:bg-brand-warning/20"
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
                    Excluir permanentemente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── Subcomponents ──

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-md border border-brand-border bg-brand-surface/40">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-semibold text-brand-text"
      >
        <span>{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-brand-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-brand-muted" />
        )}
      </button>
      {open && (
        <div className="space-y-3 border-t border-brand-border px-3 py-3">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
          {label}
        </label>
        {hint && <span className="text-[10px] text-brand-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function TagPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CAMPAIGN_TAGS.map((tag) => {
        const selected = value.includes(tag);
        const disabled = !selected && value.length >= 8;
        return (
          <button
            key={tag}
            onClick={() => {
              if (selected) onChange(value.filter((t) => t !== tag));
              else if (!disabled) onChange([...value, tag]);
            }}
            disabled={disabled}
            className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
              selected
                ? "border-brand-accent bg-brand-accent/15 text-brand-accent"
                : disabled
                  ? "cursor-not-allowed border-brand-border/40 text-brand-muted/40"
                  : "border-brand-border text-brand-muted hover:text-brand-text"
            }`}
          >
            {CAMPAIGN_TAG_LABELS[tag]}
          </button>
        );
      })}
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  disabled,
  disabledReason,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className={`rounded-md border px-3 py-3 ${
        checked
          ? "border-brand-accent bg-brand-accent/5"
          : "border-brand-border bg-brand-surface"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <label
        className={`flex items-start gap-3 ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-brand-text">{title}</span>
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={(e) => onChange(e.target.checked)}
              className="accent-brand-accent"
            />
          </div>
          <p className="mt-1 text-[11px] text-brand-muted">
            {disabled && disabledReason ? disabledReason : description}
          </p>
        </div>
      </label>
    </div>
  );
}
