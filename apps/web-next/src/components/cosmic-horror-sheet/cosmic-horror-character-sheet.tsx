"use client";

import { useState } from "react";
import {
  Brain,
  Briefcase,
  ScrollText,
  Swords,
  Package,
  ScrollIcon,
} from "lucide-react";
import type { CampaignCharacter } from "@/types/character";
import { useCosmicHorrorDerived } from "@/hooks/use-cosmic-horror-derived";
import { CosmicHorrorSheetHeader } from "./sheet-header";
import { CosmicHorrorTabResumo } from "./tab-resumo";
import { CosmicHorrorTabSkills } from "./tab-skills";
import { CosmicHorrorTabCombate } from "./tab-combate";
import { CosmicHorrorTabEquipamento } from "./tab-equipamento";
import { CosmicHorrorTabBackstory } from "./tab-backstory";

type TabKey = "resumo" | "skills" | "combate" | "equipamento" | "backstory";

const TABS: { key: TabKey; label: string; icon: typeof Brain }[] = [
  { key: "resumo", label: "Resumo", icon: Brain },
  { key: "skills", label: "Skills", icon: ScrollText },
  { key: "combate", label: "Combate", icon: Swords },
  { key: "equipamento", label: "Equipamento", icon: Package },
  { key: "backstory", label: "Backstory", icon: ScrollIcon },
];

interface Props {
  character: CampaignCharacter;
}

export function CosmicHorrorCharacterSheet({ character }: Props) {
  const ctx = useCosmicHorrorDerived(character);
  const [tab, setTab] = useState<TabKey>("resumo");

  if (!ctx) return null;

  return (
    <div className="space-y-5">
      <CosmicHorrorSheetHeader character={character} ctx={ctx} />

      <div className="flex gap-1 overflow-x-auto border-b border-brand-border">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
              tab === key
                ? "border-purple-400 text-purple-300"
                : "border-transparent text-brand-muted hover:text-brand-text"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "resumo" && <CosmicHorrorTabResumo ctx={ctx} />}
      {tab === "skills" && <CosmicHorrorTabSkills ctx={ctx} />}
      {tab === "combate" && <CosmicHorrorTabCombate ctx={ctx} />}
      {tab === "equipamento" && <CosmicHorrorTabEquipamento ctx={ctx} />}
      {tab === "backstory" && <CosmicHorrorTabBackstory ctx={ctx} />}

      {ctx.occupation && (
        <p className="text-[10px] text-brand-muted/70">
          <Briefcase className="-mt-0.5 mr-1 inline h-2.5 w-2.5" />
          {ctx.occupation.description}
        </p>
      )}
    </div>
  );
}
