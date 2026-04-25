"use client";

// Wizard de criação de campanha — 3 steps mobile-first.
// 1. Essencial: nome, sistema, visibilidade
// 2. Apresentação: capa, sinopse, tags
// 3. Avançado: solo, idioma, frequência, faixa, content warnings, safety, links, pitch
//
// Validação inline por step + safeParse(createCampaignSchema) no submit final.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Castle,
  Check,
  ChevronDown,
  ChevronUp,
  Globe,
  Hash,
  Lock,
  Sparkles,
} from "lucide-react";
import {
  CAMPAIGN_SYSTEMS,
  CAMPAIGN_TAGS,
  CAMPAIGN_TAG_LABELS,
  CONTENT_WARNINGS,
  CONTENT_WARNING_LABELS,
  CAMPAIGN_VISIBILITY_LABELS,
  CAMPAIGN_VISIBILITY_DESCRIPTIONS,
  CAMPAIGN_FREQUENCY_LABELS,
  CAMPAIGN_LENGTH_LABELS,
  AGE_RATING_LABELS,
  SAFETY_TOOL_LABELS,
} from "@questboard/constants";
import {
  createCampaignSchema,
  type CreateCampaignInput,
} from "@questboard/validators";
import type {
  AgeRating,
  CampaignFrequency,
  CampaignLength,
  CampaignVisibility,
  SafetyTool,
} from "@questboard/types";
import { useCampaignStore } from "@/lib/campaign-store";

type Step = 1 | 2 | 3;

interface DraftState {
  // step 1
  name: string;
  system: string;
  visibility: CampaignVisibility;
  // step 2
  coverImageUrl: string;
  synopsis: string;
  tags: string[];
  // step 3
  isSoloStory: boolean;
  language: string;
  frequency: CampaignFrequency | "";
  expectedLength: CampaignLength | "";
  ageRating: AgeRating;
  contentWarnings: string[];
  safetyTools: SafetyTool[];
  discord: string;
  whatsapp: string;
  publicPitch: string;
}

const INITIAL: DraftState = {
  name: "",
  system: "dnd5e",
  visibility: "PRIVATE",
  coverImageUrl: "",
  synopsis: "",
  tags: [],
  isSoloStory: false,
  language: "pt-BR",
  frequency: "",
  expectedLength: "",
  ageRating: "ALL_AGES",
  contentWarnings: [],
  safetyTools: ["OPEN_DOOR", "X_CARD"],
  discord: "",
  whatsapp: "",
  publicPitch: "",
};

export default function NewCampaignPage() {
  const router = useRouter();
  const createCampaign = useCampaignStore((s) => s.createCampaign);

  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<DraftState>(INITIAL);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Aviso amigável se Cthulhu (engine freeform) — não bloqueia, só informa.
  const cthulhuNotice = draft.system === "coc7";

  // Step 1 valid? (mínimos pra avançar)
  const step1Valid = draft.name.trim().length >= 3;

  // Step 3 valid? (apenas refines críticos — Zod vai validar tudo no submit)
  const soloPublicConflict = draft.isSoloStory && draft.visibility === "PUBLIC";

  function update<K extends keyof DraftState>(k: K, v: DraftState[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
    // Limpa erro do campo ao editar
    setFieldErrors((e) => {
      if (!e[k]) return e;
      const { [k]: _, ...rest } = e;
      return rest;
    });
  }

  function toggleTag(tag: string) {
    update(
      "tags",
      draft.tags.includes(tag)
        ? draft.tags.filter((t) => t !== tag)
        : draft.tags.length >= 8
          ? draft.tags // limite atingido
          : [...draft.tags, tag],
    );
  }

  function toggleWarning(w: string) {
    update(
      "contentWarnings",
      draft.contentWarnings.includes(w)
        ? draft.contentWarnings.filter((x) => x !== w)
        : [...draft.contentWarnings, w],
    );
  }

  function toggleSafety(s: SafetyTool) {
    update(
      "safetyTools",
      draft.safetyTools.includes(s)
        ? draft.safetyTools.filter((x) => x !== s)
        : [...draft.safetyTools, s],
    );
  }

  function buildInput(): CreateCampaignInput {
    return {
      name: draft.name.trim(),
      system: draft.system as CreateCampaignInput["system"],
      visibility: draft.visibility,
      coverImageUrl: draft.coverImageUrl.trim() || undefined,
      synopsis: draft.synopsis.trim() || undefined,
      tags: draft.tags as CreateCampaignInput["tags"],
      language: draft.language,
      frequency: draft.frequency || undefined,
      expectedLength: draft.expectedLength || undefined,
      ageRating: draft.ageRating,
      contentWarnings:
        draft.contentWarnings as CreateCampaignInput["contentWarnings"],
      safetyTools: draft.safetyTools,
      isSoloStory: draft.isSoloStory,
      externalChat:
        draft.discord || draft.whatsapp
          ? {
              ...(draft.discord ? { discord: draft.discord } : {}),
              ...(draft.whatsapp ? { whatsapp: draft.whatsapp } : {}),
            }
          : undefined,
      publicPitch: draft.publicPitch.trim() || undefined,
    };
  }

  function handleSubmit() {
    setSubmitError(null);
    setFieldErrors({});
    const input = buildInput();
    const parsed = createCampaignSchema.safeParse(input);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0]?.toString() ?? "_";
        if (!errs[path]) errs[path] = issue.message;
      }
      setFieldErrors(errs);
      setSubmitError("Corrija os campos destacados.");
      // Volta pro step do primeiro erro
      if (errs.name || errs.system || errs.visibility) setStep(1);
      else if (errs.synopsis || errs.tags || errs.coverImageUrl) setStep(2);
      else setStep(3);
      return;
    }
    const created = createCampaign(parsed.data);
    router.push(`/campaigns/${created.id}`);
  }

  const stepProgress = useMemo(() => (step / 3) * 100, [step]);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header com progresso */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => (step === 1 ? router.back() : setStep((step - 1) as Step))}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-brand-border text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="font-cinzel text-lg font-bold text-brand-text">
            Nova campanha
          </h1>
          <p className="text-[11px] text-brand-muted">
            Passo {step} de 3 ·{" "}
            {step === 1 ? "Essencial" : step === 2 ? "Apresentação" : "Avançado"}
          </p>
        </div>
      </div>
      <div className="mb-6 h-1 overflow-hidden rounded-full bg-brand-surface">
        <div
          className="h-full bg-brand-accent transition-all"
          style={{ width: `${stepProgress}%` }}
        />
      </div>

      {/* Step content */}
      <div className="space-y-4">
        {step === 1 && (
          <>
            <Field label="Nome da campanha" required error={fieldErrors.name}>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
                maxLength={80}
                placeholder="Ex: A Sombra de Veridian"
                className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
              />
            </Field>

            <Field label="Sistema" required error={fieldErrors.system}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {CAMPAIGN_SYSTEMS.map((s) => (
                  <RadioCard
                    key={s.value}
                    selected={draft.system === s.value}
                    onClick={() => update("system", s.value)}
                  >
                    <div className="font-medium text-brand-text">{s.label}</div>
                    <div className="text-[10px] uppercase tracking-wider text-brand-muted">
                      Engine: {s.engine}
                    </div>
                  </RadioCard>
                ))}
              </div>
              {cthulhuNotice && (
                <div className="mt-2 flex items-start gap-2 rounded-md border border-brand-warning/30 bg-brand-warning/5 px-3 py-2 text-[11px] text-brand-warning">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Cthulhu usa Sistema Livre na engine atual. Combate por
                    turnos ainda não está disponível para esse sistema.
                  </span>
                </div>
              )}
            </Field>

            <Field label="Visibilidade" required error={fieldErrors.visibility}>
              <div className="space-y-2">
                {(["PRIVATE", "CODE", "PUBLIC"] as CampaignVisibility[]).map((v) => {
                  const Icon =
                    v === "PRIVATE" ? Lock : v === "CODE" ? Hash : Globe;
                  return (
                    <RadioCard
                      key={v}
                      selected={draft.visibility === v}
                      onClick={() => update("visibility", v)}
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
                    </RadioCard>
                  );
                })}
              </div>
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="URL da capa" hint="Cole link de Imgur, Discord, etc." error={fieldErrors.coverImageUrl}>
              <input
                type="url"
                value={draft.coverImageUrl}
                onChange={(e) => update("coverImageUrl", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
              />
              {draft.coverImageUrl && (
                <div className="mt-2 aspect-[16/9] overflow-hidden rounded-md border border-brand-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={draft.coverImageUrl}
                    alt="Pré-visualização da capa"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </Field>

            <Field
              label="Sinopse"
              hint={`${draft.synopsis.length}/2000`}
              error={fieldErrors.synopsis}
            >
              <textarea
                value={draft.synopsis}
                onChange={(e) => update("synopsis", e.target.value)}
                maxLength={2000}
                rows={5}
                placeholder="Conte em poucas linhas o tom da mesa, o conflito principal e o que esperar."
                className="w-full resize-y rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
              />
            </Field>

            <Field
              label="Tags"
              hint={`${draft.tags.length}/8 selecionadas`}
              error={fieldErrors.tags}
            >
              <div className="flex flex-wrap gap-1.5">
                {CAMPAIGN_TAGS.map((tag) => {
                  const selected = draft.tags.includes(tag);
                  const disabled = !selected && draft.tags.length >= 8;
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      disabled={disabled}
                      className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
                        selected
                          ? "border-brand-accent bg-brand-accent/15 text-brand-accent"
                          : disabled
                            ? "cursor-not-allowed border-brand-border/40 text-brand-muted/40"
                            : "border-brand-border text-brand-muted hover:border-brand-accent/40 hover:text-brand-text"
                      }`}
                    >
                      {CAMPAIGN_TAG_LABELS[tag]}
                    </button>
                  );
                })}
              </div>
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <ToggleRow
              icon={Castle}
              title="Modo Solo Story"
              description="Mesa pra um único jogador. Não pode ser combinado com visibilidade pública."
              checked={draft.isSoloStory}
              onChange={(v) => update("isSoloStory", v)}
              error={
                soloPublicConflict
                  ? "Solo Story incompatível com visibilidade pública."
                  : undefined
              }
            />

            <Section title="Idioma e ritmo">
              <Field label="Idioma da mesa">
                <select
                  value={draft.language}
                  onChange={(e) => update("language", e.target.value)}
                  className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </Field>

              <Field label="Frequência">
                <select
                  value={draft.frequency}
                  onChange={(e) =>
                    update("frequency", e.target.value as CampaignFrequency | "")
                  }
                  className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
                >
                  <option value="">— a definir —</option>
                  {(Object.keys(CAMPAIGN_FREQUENCY_LABELS) as CampaignFrequency[]).map(
                    (f) => (
                      <option key={f} value={f}>
                        {CAMPAIGN_FREQUENCY_LABELS[f]}
                      </option>
                    ),
                  )}
                </select>
              </Field>

              <Field label="Duração estimada">
                <select
                  value={draft.expectedLength}
                  onChange={(e) =>
                    update(
                      "expectedLength",
                      e.target.value as CampaignLength | "",
                    )
                  }
                  className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
                >
                  <option value="">— a definir —</option>
                  {(Object.keys(CAMPAIGN_LENGTH_LABELS) as CampaignLength[]).map(
                    (l) => (
                      <option key={l} value={l}>
                        {CAMPAIGN_LENGTH_LABELS[l]}
                      </option>
                    ),
                  )}
                </select>
              </Field>
            </Section>

            <Section title="Faixa etária e segurança">
              <Field label="Faixa etária">
                <div className="grid grid-cols-4 gap-1">
                  {(Object.keys(AGE_RATING_LABELS) as AgeRating[]).map((a) => (
                    <button
                      key={a}
                      onClick={() => update("ageRating", a)}
                      className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                        draft.ageRating === a
                          ? "border-brand-accent bg-brand-accent/15 text-brand-accent"
                          : "border-brand-border text-brand-muted hover:text-brand-text"
                      }`}
                    >
                      {AGE_RATING_LABELS[a]}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Content warnings">
                <div className="flex flex-wrap gap-1.5">
                  {CONTENT_WARNINGS.map((w) => {
                    const selected = draft.contentWarnings.includes(w);
                    return (
                      <button
                        key={w}
                        onClick={() => toggleWarning(w)}
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
                  {(Object.keys(SAFETY_TOOL_LABELS) as SafetyTool[]).map((t) => (
                    <label
                      key={t}
                      className="flex cursor-pointer items-start gap-2 rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-xs text-brand-text"
                    >
                      <input
                        type="checkbox"
                        checked={draft.safetyTools.includes(t)}
                        onChange={() => toggleSafety(t)}
                        className="mt-0.5 accent-brand-accent"
                      />
                      <span>{SAFETY_TOOL_LABELS[t]}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </Section>

            <Section title="Comunicação externa (opcional)">
              <Field label="Link do Discord">
                <input
                  type="url"
                  value={draft.discord}
                  onChange={(e) => update("discord", e.target.value)}
                  placeholder="https://discord.gg/..."
                  className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
                />
              </Field>
              <Field label="Link do WhatsApp">
                <input
                  type="url"
                  value={draft.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
                />
              </Field>
            </Section>

            {draft.visibility === "PUBLIC" && (
              <Section title="Pitch público" defaultOpen>
                <Field
                  label="Pitch curto que aparece no catálogo"
                  hint={`${draft.publicPitch.length}/500`}
                  error={fieldErrors.publicPitch}
                >
                  <textarea
                    value={draft.publicPitch}
                    onChange={(e) => update("publicPitch", e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Uma linha de gancho que faça alguém querer entrar."
                    className="w-full resize-y rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
                  />
                </Field>
              </Section>
            )}
          </>
        )}
      </div>

      {/* Erro global do submit */}
      {submitError && (
        <div className="mt-4 rounded-md border border-brand-danger/40 bg-brand-danger/10 px-3 py-2 text-xs text-brand-danger">
          {submitError}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex justify-between gap-2 border-t border-brand-border pt-4">
        <button
          onClick={() =>
            step === 1 ? router.back() : setStep((step - 1) as Step)
          }
          className="rounded-md border border-brand-border px-3 py-2 text-xs font-medium text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
        >
          {step === 1 ? "Cancelar" : "Anterior"}
        </button>

        {step < 3 ? (
          <button
            onClick={() => {
              if (step === 1 && !step1Valid) {
                setFieldErrors({
                  name: draft.name.trim().length < 3 ? "Mínimo 3 caracteres." : "",
                });
                return;
              }
              setStep((step + 1) as Step);
            }}
            disabled={step === 1 && !step1Valid}
            className="flex items-center gap-1.5 rounded-md bg-brand-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Próximo
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={soloPublicConflict}
            className="flex items-center gap-1.5 rounded-md bg-brand-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Criar campanha
          </button>
        )}
      </div>
    </div>
  );
}

// ── Subcomponents ──

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
          {label}
          {required && <span className="ml-0.5 text-brand-accent">*</span>}
        </label>
        {hint && <span className="text-[10px] text-brand-muted">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="mt-1 text-[11px] text-brand-danger">{error}</p>
      )}
    </div>
  );
}

function RadioCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
        selected
          ? "border-brand-accent bg-brand-accent/10"
          : "border-brand-border bg-brand-surface hover:border-brand-accent/40"
      }`}
    >
      {children}
    </button>
  );
}

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
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-brand-text"
      >
        <span>{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-brand-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-brand-muted" />
        )}
      </button>
      {open && <div className="space-y-3 border-t border-brand-border px-3 py-3">{children}</div>}
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  error,
}: {
  icon: typeof Castle;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
}) {
  return (
    <div
      className={`rounded-md border px-3 py-3 ${
        checked
          ? "border-brand-accent bg-brand-accent/5"
          : "border-brand-border bg-brand-surface"
      }`}
    >
      <label className="flex cursor-pointer items-start gap-3">
        <Icon
          className={`mt-0.5 h-5 w-5 shrink-0 ${
            checked ? "text-brand-accent" : "text-brand-muted"
          }`}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-brand-text">{title}</span>
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              className="accent-brand-accent"
            />
          </div>
          <p className="mt-1 text-[11px] text-brand-muted">{description}</p>
        </div>
      </label>
      {error && (
        <p className="mt-2 text-[11px] text-brand-danger">{error}</p>
      )}
    </div>
  );
}
