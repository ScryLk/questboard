"use client";

// Form modal pra criar/editar monstro homebrew. Campos essenciais
// — habilidades especiais, ações lendárias e reações ficam pra um
// editor avançado em fatia futura.

import { useState } from "react";
import { Save, X } from "lucide-react";
import { ModalShell } from "@/components/gameplay/modals/modal-shell";
import type { MonsterSize, SrdMonster } from "@/types/srd";
import { useHomebrewStore } from "@/lib/srd/homebrew-store";

const SIZE_OPTIONS: { value: MonsterSize; label: string }[] = [
  { value: "tiny", label: "Minúsculo" },
  { value: "small", label: "Pequeno" },
  { value: "medium", label: "Médio" },
  { value: "large", label: "Grande" },
  { value: "huge", label: "Enorme" },
  { value: "gargantuan", label: "Colossal" },
];

const CR_OPTIONS = [
  0, 0.125, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
  17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
];

function formatCr(cr: number): string {
  if (cr === 0.125) return "1/8";
  if (cr === 0.25) return "1/4";
  if (cr === 0.5) return "1/2";
  return String(cr);
}

function xpForCr(cr: number): number {
  // Tabela canônica do DMG. Aproximação suficiente pra MVP.
  const map: Record<number, number> = {
    0: 10, 0.125: 25, 0.25: 50, 0.5: 100, 1: 200, 2: 450, 3: 700, 4: 1100,
    5: 1800, 6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900, 11: 7200,
    12: 8400, 13: 10000, 14: 11500, 15: 13000, 16: 15000, 17: 18000,
    18: 20000, 19: 22000, 20: 25000, 21: 33000, 22: 41000, 23: 50000,
    24: 62000, 25: 75000, 26: 90000, 27: 105000, 28: 120000, 29: 135000,
    30: 155000,
  };
  return map[cr] ?? 0;
}

interface Props {
  campaignId: string;
  existing?: SrdMonster | null;
  onClose: () => void;
  onSaved?: (slug: string) => void;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || `homebrew-${Date.now().toString(36)}`;
}

export function HomebrewMonsterModal({
  campaignId,
  existing,
  onClose,
  onSaved,
}: Props) {
  const addMonster = useHomebrewStore((s) => s.addMonster);
  const updateMonster = useHomebrewStore((s) => s.updateMonster);
  const isEditing = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? "");
  const [nameEn, setNameEn] = useState(existing?.nameEn ?? "");
  const [size, setSize] = useState<MonsterSize>(existing?.size ?? "medium");
  const [type, setType] = useState(existing?.type ?? "humanoid");
  const [alignment, setAlignment] = useState(existing?.alignment ?? "neutro");
  const [armorClass, setArmorClass] = useState(existing?.armorClass ?? 13);
  const [hitPoints, setHitPoints] = useState(existing?.hitPoints ?? 20);
  const [hitDice, setHitDice] = useState(existing?.hitDice ?? "3d8+6");
  const [walkSpeed, setWalkSpeed] = useState(existing?.speed.walk ?? 9);
  const [str, setStr] = useState(existing?.attributes.str ?? 10);
  const [dex, setDex] = useState(existing?.attributes.dex ?? 10);
  const [con, setCon] = useState(existing?.attributes.con ?? 10);
  const [intel, setIntel] = useState(existing?.attributes.int ?? 10);
  const [wis, setWis] = useState(existing?.attributes.wis ?? 10);
  const [cha, setCha] = useState(existing?.attributes.cha ?? 10);
  const [cr, setCr] = useState(existing?.challengeRating ?? 1);
  const [passivePerception, setPassivePerception] = useState(
    existing?.senses.passivePerception ?? 10,
  );
  const [actionsText, setActionsText] = useState(
    existing?.actions
      ?.map((a) => `${a.name}: ${a.description}`)
      .join("\n\n") ?? "",
  );

  function handleSave() {
    if (!name.trim()) return;
    const slug = isEditing ? existing!.slug : slugify(name);

    // Parser simples: cada linha "Nome: descrição" vira uma ação.
    const actions = actionsText
      .split(/\n\n+/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => {
        const idx = block.indexOf(":");
        if (idx === -1) return { name: "Ação", description: block };
        return {
          name: block.slice(0, idx).trim(),
          description: block.slice(idx + 1).trim(),
        };
      });

    const monster: SrdMonster = {
      slug,
      name: name.trim(),
      nameEn: nameEn.trim() || name.trim(),
      size,
      type: type.trim(),
      alignment: alignment.trim(),
      armorClass,
      hitPoints,
      hitDice: hitDice.trim(),
      speed: { walk: walkSpeed },
      attributes: { str, dex, con, int: intel, wis, cha },
      damageResistances: existing?.damageResistances ?? [],
      damageImmunities: existing?.damageImmunities ?? [],
      conditionImmunities: existing?.conditionImmunities ?? [],
      damageVulnerabilities: existing?.damageVulnerabilities ?? [],
      senses: { passivePerception },
      languages: existing?.languages ?? [],
      challengeRating: cr,
      experiencePoints: xpForCr(cr),
      actions: actions.length > 0 ? actions : undefined,
      attribution: {
        source: "HOMEBREW_CAMPAIGN",
        text: "Homebrew · campanha",
      },
    };

    if (isEditing) {
      updateMonster(campaignId, slug, monster);
    } else {
      addMonster(campaignId, monster);
    }
    onSaved?.(slug);
    onClose();
  }

  return (
    <ModalShell
      title={isEditing ? "Editar monstro homebrew" : "Novo monstro homebrew"}
      maxWidth={680}
      onClose={onClose}
    >
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome" required>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
          <Field label="Nome em inglês">
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Tamanho">
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as MonsterSize)}
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            >
              {SIZE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tipo">
            <input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="humanoid, dragon, fiend..."
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
          <Field label="Alinhamento">
            <input
              value={alignment}
              onChange={(e) => setAlignment(e.target.value)}
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="CA">
            <input
              type="number"
              value={armorClass}
              onChange={(e) => setArmorClass(Number(e.target.value))}
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
          <Field label="HP">
            <input
              type="number"
              value={hitPoints}
              onChange={(e) => setHitPoints(Number(e.target.value))}
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
          <Field label="Hit dice">
            <input
              value={hitDice}
              onChange={(e) => setHitDice(e.target.value)}
              placeholder="3d8+6"
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
          <Field label="Velocidade (m)">
            <input
              type="number"
              value={walkSpeed}
              onChange={(e) => setWalkSpeed(Number(e.target.value))}
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
        </div>

        {/* Atributos */}
        <div className="grid grid-cols-6 gap-2">
          {(
            [
              ["FOR", str, setStr],
              ["DES", dex, setDex],
              ["CON", con, setCon],
              ["INT", intel, setIntel],
              ["SAB", wis, setWis],
              ["CAR", cha, setCha],
            ] as const
          ).map(([label, value, setter]) => (
            <div key={label}>
              <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                {label}
              </p>
              <input
                type="number"
                value={value}
                onChange={(e) => setter(Number(e.target.value))}
                className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-1 text-center text-sm tabular-nums text-brand-text outline-none focus:border-brand-accent"
              />
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="ND (Challenge Rating)" hint={`${xpForCr(cr)} XP`}>
            <select
              value={cr}
              onChange={(e) => setCr(Number(e.target.value))}
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            >
              {CR_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  ND {formatCr(c)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Percepção passiva">
            <input
              type="number"
              value={passivePerception}
              onChange={(e) => setPassivePerception(Number(e.target.value))}
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
        </div>

        <Field
          label="Ações"
          hint="Uma ação por bloco, formato 'Nome: descrição'. Linha em branco separa."
        >
          <textarea
            value={actionsText}
            onChange={(e) => setActionsText(e.target.value)}
            rows={5}
            placeholder={`Mordida: Ataque corpo a corpo +5, alcance 1,5m. Acerto: 1d8+3 perfurante.

Sopro de Fogo (Recarga 5-6): Cone de 9m, teste de Des CD 13. 8d6 de fogo (metade em sucesso).`}
            className="w-full resize-y rounded-md border border-brand-border bg-brand-primary px-3 py-2 text-xs text-brand-text outline-none focus:border-brand-accent"
          />
        </Field>

        <div className="flex justify-end gap-2 border-t border-brand-border pt-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-md border border-brand-border px-3 py-2 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            <X className="h-3.5 w-3.5" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center gap-1.5 rounded-md bg-brand-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-accent/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save className="h-3.5 w-3.5" />
            {isEditing ? "Salvar" : "Criar monstro"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          {label}
          {required && <span className="ml-0.5 text-brand-accent">*</span>}
        </label>
        {hint && <span className="text-[10px] text-brand-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
