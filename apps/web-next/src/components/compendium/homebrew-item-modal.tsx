"use client";

// Form modal pra criar/editar item homebrew. Suporta armas, armaduras
// e itens mágicos com campos relevantes pra cada categoria.

import { useState } from "react";
import { Save, X } from "lucide-react";
import { ModalShell } from "@/components/gameplay/modals/modal-shell";
import type { ItemCategory, ItemRarity, SrdItem } from "@/types/srd";
import { useHomebrewStore } from "@/lib/srd/homebrew-store";

const CATEGORY_OPTIONS: { value: ItemCategory; label: string }[] = [
  { value: "weapon", label: "Arma" },
  { value: "armor", label: "Armadura" },
  { value: "adventuring-gear", label: "Equipamento" },
  { value: "magic-item", label: "Item mágico" },
  { value: "tool", label: "Ferramenta" },
];

const RARITY_OPTIONS: { value: ItemRarity; label: string }[] = [
  { value: "common", label: "Comum" },
  { value: "uncommon", label: "Incomum" },
  { value: "rare", label: "Raro" },
  { value: "very-rare", label: "Muito raro" },
  { value: "legendary", label: "Lendário" },
  { value: "artifact", label: "Artefato" },
];

interface Props {
  campaignId: string;
  existing?: SrdItem | null;
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

export function HomebrewItemModal({
  campaignId,
  existing,
  onClose,
  onSaved,
}: Props) {
  const addItem = useHomebrewStore((s) => s.addItem);
  const updateItem = useHomebrewStore((s) => s.updateItem);
  const isEditing = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? "");
  const [nameEn, setNameEn] = useState(existing?.nameEn ?? "");
  const [category, setCategory] = useState<ItemCategory>(
    existing?.category ?? "magic-item",
  );
  const [rarity, setRarity] = useState<ItemRarity>(
    existing?.rarity ?? "common",
  );
  const [requiresAttunement, setRequiresAttunement] = useState(
    existing?.requiresAttunement ?? false,
  );
  const [weight, setWeight] = useState(existing?.weight?.toString() ?? "");
  const [costQty, setCostQty] = useState(
    existing?.cost?.quantity.toString() ?? "",
  );
  const [costUnit, setCostUnit] = useState<"cp" | "sp" | "ep" | "gp" | "pp">(
    existing?.cost?.unit ?? "gp",
  );
  const [damageDice, setDamageDice] = useState(existing?.damageDice ?? "");
  const [damageType, setDamageType] = useState(existing?.damageType ?? "");
  const [armorBase, setArmorBase] = useState(
    existing?.armorClass?.base.toString() ?? "",
  );
  const [armorDexBonus, setArmorDexBonus] = useState(
    existing?.armorClass?.dexBonus ?? false,
  );
  const [description, setDescription] = useState(existing?.description ?? "");

  const showWeaponFields = category === "weapon";
  const showArmorFields = category === "armor";
  const showRarityFields = category === "magic-item";

  function handleSave() {
    if (!name.trim()) return;
    const slug = isEditing ? existing!.slug : slugify(name);

    const item: SrdItem = {
      slug,
      name: name.trim(),
      nameEn: nameEn.trim() || name.trim(),
      category,
      ...(weight && { weight: Number(weight) }),
      ...(costQty && {
        cost: { quantity: Number(costQty), unit: costUnit },
      }),
      ...(showWeaponFields && damageDice && {
        damageDice: damageDice.trim(),
        damageType: damageType.trim() || "slashing",
      }),
      ...(showArmorFields && armorBase && {
        armorClass: {
          base: Number(armorBase),
          dexBonus: armorDexBonus,
        },
      }),
      ...(showRarityFields && {
        rarity,
        requiresAttunement,
      }),
      description: description.trim() || undefined,
      attribution: {
        source: "HOMEBREW_CAMPAIGN",
        text: "Homebrew · campanha",
      },
    };

    if (isEditing) {
      updateItem(campaignId, slug, item);
    } else {
      addItem(campaignId, item);
    }
    onSaved?.(slug);
    onClose();
  }

  return (
    <ModalShell
      title={isEditing ? "Editar item homebrew" : "Novo item homebrew"}
      maxWidth={600}
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

        <Field label="Categoria">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ItemCategory)}
            className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
          >
            {CATEGORY_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Peso (kg)">
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
          <Field label="Custo (qtd)">
            <input
              type="number"
              value={costQty}
              onChange={(e) => setCostQty(e.target.value)}
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            />
          </Field>
          <Field label="Moeda">
            <select
              value={costUnit}
              onChange={(e) =>
                setCostUnit(
                  e.target.value as "cp" | "sp" | "ep" | "gp" | "pp",
                )
              }
              className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
            >
              <option value="cp">Cobre (cp)</option>
              <option value="sp">Prata (sp)</option>
              <option value="ep">Eletro (ep)</option>
              <option value="gp">Ouro (gp)</option>
              <option value="pp">Platina (pp)</option>
            </select>
          </Field>
        </div>

        {showWeaponFields && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Dano" hint="Ex: 1d8">
              <input
                value={damageDice}
                onChange={(e) => setDamageDice(e.target.value)}
                className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
              />
            </Field>
            <Field label="Tipo de dano" hint="slashing, piercing, fire...">
              <input
                value={damageType}
                onChange={(e) => setDamageType(e.target.value)}
                className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
              />
            </Field>
          </div>
        )}

        {showArmorFields && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="CA base">
              <input
                type="number"
                value={armorBase}
                onChange={(e) => setArmorBase(e.target.value)}
                className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
              />
            </Field>
            <Field label="Soma Destreza?">
              <button
                type="button"
                onClick={() => setArmorDexBonus((v) => !v)}
                className={`h-9 w-full rounded-md border px-3 text-xs font-medium transition-colors ${
                  armorDexBonus
                    ? "border-brand-accent bg-brand-accent/15 text-brand-accent"
                    : "border-brand-border text-brand-muted hover:text-brand-text"
                }`}
              >
                {armorDexBonus ? "Sim (leve/média)" : "Não (pesada)"}
              </button>
            </Field>
          </div>
        )}

        {showRarityFields && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Raridade">
              <select
                value={rarity}
                onChange={(e) => setRarity(e.target.value as ItemRarity)}
                className="h-9 w-full rounded-md border border-brand-border bg-brand-primary px-3 text-sm text-brand-text outline-none focus:border-brand-accent"
              >
                {RARITY_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Requer sintonia">
              <button
                type="button"
                onClick={() => setRequiresAttunement((v) => !v)}
                className={`h-9 w-full rounded-md border px-3 text-xs font-medium transition-colors ${
                  requiresAttunement
                    ? "border-purple-500/40 bg-purple-500/15 text-purple-300"
                    : "border-brand-border text-brand-muted hover:text-brand-text"
                }`}
              >
                {requiresAttunement ? "Sim" : "Não"}
              </button>
            </Field>
          </div>
        )}

        <Field label="Descrição">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full resize-y rounded-md border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
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
            {isEditing ? "Salvar" : "Criar item"}
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
