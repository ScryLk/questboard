"use client";

// Ficha viva D&D 5e (frontend-only, dados do useCharacterStore).
// Quando o backend de Character existir, esta página vira fetch real;
// por ora reusa o store local + dnd5eData persistido pelo wizard.

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Heart,
  Package,
  ScrollText,
  Sparkles,
  Sword,
} from "lucide-react";
import { useCharacterStore } from "@/stores/characterStore";
import { useDnd5eDerived } from "@/hooks/use-dnd5e-derived";
import { SheetHeader } from "@/components/character-sheet/sheet-header";
import { TabAtributos } from "@/components/character-sheet/tab-atributos";
import { TabCombate } from "@/components/character-sheet/tab-combate";
import { TabMagias } from "@/components/character-sheet/tab-magias";
import { TabInventario } from "@/components/character-sheet/tab-inventario";
import { TabNotas } from "@/components/character-sheet/tab-notas";

type TabKey = "atributos" | "combate" | "magias" | "inventario" | "notas";

const TABS: { key: TabKey; label: string; icon: typeof BookOpen }[] = [
  { key: "atributos", label: "Atributos", icon: ScrollText },
  { key: "combate", label: "Combate", icon: Sword },
  { key: "magias", label: "Magias", icon: Sparkles },
  { key: "inventario", label: "Inventário", icon: Package },
  { key: "notas", label: "Notas", icon: Heart },
];

export default function CharacterSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const character = useCharacterStore((s) =>
    s.characters.find((c) => c.id === id),
  );
  const ctx = useDnd5eDerived(character);
  const [tab, setTab] = useState<TabKey>("atributos");

  if (!character) notFound();

  // Abas Magias só fazem sentido pra conjuradores. Esconde se não.
  const visibleTabs = TABS.filter((t) => {
    if (t.key === "magias" && !ctx?.spellcastingAbility) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-10">
      <Link
        href="/characters"
        className="inline-flex items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Personagens
      </Link>

      <SheetHeader character={character} ctx={ctx} />

      {/* Aviso quando não tem dados 5e — wizard de criação preenche isso */}
      {!ctx && (
        <div className="rounded-md border border-brand-warning/30 bg-brand-warning/5 px-4 py-3 text-xs text-brand-warning">
          Esse personagem não foi criado pelo wizard 5e — ficha viva exibe
          apenas valores estáticos. Pra recálculo automático, recrie via
          /characters/new/dnd5e.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-brand-border">
        {visibleTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
              tab === key
                ? "border-brand-accent text-brand-accent"
                : "border-transparent text-brand-muted hover:text-brand-text"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "atributos" && (
        <TabAtributos character={character} ctx={ctx} />
      )}
      {tab === "combate" && <TabCombate character={character} ctx={ctx} />}
      {tab === "magias" && ctx?.spellcastingAbility && (
        <TabMagias characterId={character.id} ctx={ctx} />
      )}
      {tab === "inventario" && (
        <TabInventario characterId={character.id} ctx={ctx} />
      )}
      {tab === "notas" && <TabNotas character={character} ctx={ctx} />}
    </div>
  );
}
