"use client";

import { useEffect, useState } from "react";
import { Check, Lock, X } from "lucide-react";
import { useProfileStore } from "@/stores/profileStore";
import type { CosmeticCategory, CosmeticItem } from "@/types/profile";
import {
  COSMETIC_CATEGORY_LABELS,
  COSMETIC_RARITY_LABELS,
  COSMETIC_RARITY_COLORS,
} from "@/types/profile";
import {
  COSMETIC_FRAMES,
  COSMETIC_BANNERS,
  COSMETIC_TITLES,
  COSMETIC_BACKGROUNDS,
  COSMETIC_DICE_SKINS,
} from "@/constants/cosmetics";

const CATEGORY_ITEMS: Record<CosmeticCategory, CosmeticItem[]> = {
  frame: COSMETIC_FRAMES,
  banner: COSMETIC_BANNERS,
  title: COSMETIC_TITLES,
  background: COSMETIC_BACKGROUNDS,
  dice_skin: COSMETIC_DICE_SKINS,
};

const CATEGORIES: CosmeticCategory[] = ["frame", "banner", "title", "background", "dice_skin"];

function getEquippedId(
  equipped: ReturnType<typeof useProfileStore.getState>["profile"]["equipped"],
  category: CosmeticCategory,
): string | null {
  switch (category) {
    case "frame": return equipped.frameId;
    case "banner": return equipped.bannerId;
    case "title": return equipped.titleId;
    case "background": return equipped.backgroundId;
    case "dice_skin": return equipped.diceSkinId;
  }
}

export function CosmeticSelectorModal() {
  const open = useProfileStore((s) => s.cosmeticSelectorOpen);
  const initialCategory = useProfileStore((s) => s.cosmeticSelectorCategory);
  const close = useProfileStore((s) => s.closeCosmeticSelector);
  const equip = useProfileStore((s) => s.equipCosmetic);
  const equipped = useProfileStore((s) => s.profile.equipped);

  const [category, setCategory] = useState<CosmeticCategory>(initialCategory);

  useEffect(() => {
    if (open) setCategory(initialCategory);
  }, [open, initialCategory]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  const items = CATEGORY_ITEMS[category];
  const currentId = getEquippedId(equipped, category);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="w-full max-w-lg rounded-xl border border-brand-border bg-[#111116] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-4">
          <h2 className="text-sm font-semibold text-brand-text">Cosméticos do Perfil</h2>
          <button
            onClick={close}
            className="flex h-7 w-7 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 border-b border-brand-border px-5 py-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-brand-accent/15 text-brand-accent"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              {COSMETIC_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="max-h-[400px] overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => {
              const isEquipped = currentId === item.id;
              const rarityColor = COSMETIC_RARITY_COLORS[item.rarity];

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.unlocked) {
                      equip(category, isEquipped ? null : item.id);
                    }
                  }}
                  disabled={!item.unlocked}
                  className={`relative rounded-xl border p-3 text-left transition-all ${
                    isEquipped
                      ? "border-brand-accent bg-brand-accent/5"
                      : item.unlocked
                        ? "border-brand-border hover:border-brand-border/80 hover:bg-white/[0.02]"
                        : "cursor-not-allowed border-brand-border/50 opacity-50"
                  }`}
                >
                  {/* Equipped badge */}
                  {isEquipped && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-accent">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}

                  {/* Locked overlay */}
                  {!item.unlocked && (
                    <div className="absolute right-2 top-2">
                      <Lock className="h-3.5 w-3.5 text-brand-muted/50" />
                    </div>
                  )}

                  {/* Preview */}
                  {category === "banner" && item.cssStyle && (
                    <div
                      className="mb-2 h-8 w-full rounded-md"
                      style={item.cssStyle}
                    />
                  )}

                  {category === "title" && item.cssStyle && (
                    <p className="mb-1 text-xs font-semibold" style={item.cssStyle}>
                      {item.name}
                    </p>
                  )}

                  {(category === "frame" || category === "background" || category === "dice_skin") && (
                    <div
                      className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${item.cssClass}`}
                      style={{ border: `2px solid ${rarityColor}30` }}
                    >
                      <span className="text-xs font-bold text-brand-muted">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {category !== "title" && (
                    <p className="text-xs font-medium text-brand-text">{item.name}</p>
                  )}

                  <p className="mt-0.5 text-[10px] text-brand-muted">{item.description}</p>

                  {/* Rarity badge */}
                  <span
                    className="mt-1.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                    style={{ color: rarityColor, backgroundColor: rarityColor + "15" }}
                  >
                    {COSMETIC_RARITY_LABELS[item.rarity]}
                  </span>

                  {/* Unlock hint */}
                  {!item.unlocked && item.unlockHint && (
                    <p className="mt-1 text-[9px] text-brand-muted/60">{item.unlockHint}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
