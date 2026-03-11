"use client";

import {
  Swords,
  Wand2,
  ShieldCheck,
  HandHelping,
  Zap as RunIcon,
  EyeOff,
  ArrowRightLeft,
  Search,
  Dices,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { rollD20 } from "@/lib/dice";
import type { FullCharacter } from "@/lib/character-types";

interface ActionMenuProps {
  character: FullCharacter | undefined;
  onClose: () => void;
  onAttack: () => void;
  onSpell: () => void;
  onSkillCheck: () => void;
}

export function ActionMenu({ character, onClose, onAttack, onSpell, onSkillCheck }: ActionMenuProps) {
  const useAction = useGameplayStore((s) => s.useAction);
  const setDodging = useGameplayStore((s) => s.setDodging);
  const setDashing = useGameplayStore((s) => s.setDashing);
  const setDisengaging = useGameplayStore((s) => s.setDisengaging);
  const addCombatLogMessage = useGameplayStore((s) => s.addCombatLogMessage);
  const addMessage = useGameplayStore((s) => s.addMessage);
  const combat = useGameplayStore((s) => s.combat);
  const tokens = useGameplayStore((s) => s.tokens);
  const turnActions = useGameplayStore((s) => s.turnActions);

  const cantripOnly = turnActions.castBonusSpell;
  const hasSpells = character?.spells && character.spells.length > 0;
  const hasCantrips = character?.spells?.some((s) => s.level === 0) ?? false;

  const currentToken = tokens.find(
    (t) => t.id === combat.order[combat.turnIndex]?.tokenId,
  );
  const name = currentToken?.name ?? "???";

  function doSimpleAction(actionLabel: string, extra?: () => void) {
    useAction();
    addCombatLogMessage(`${name} usa ${actionLabel}.`);
    extra?.();
    onClose();
  }

  function doHide() {
    const stealthSkill = character?.skills.find((s) => s.name === "Furtividade");
    const mod = stealthSkill?.modifier ?? 0;
    const result = rollD20(mod);

    useAction();
    addMessage({
      id: `msg_${Date.now()}`,
      channel: "geral",
      type: "roll",
      sender: name,
      senderInitials: name.slice(0, 2).toUpperCase(),
      isGM: false,
      content: `${name} tenta se esconder!`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      rollFormula: result.formula,
      rollResult: result.total,
      rollDetails: result.details,
      isNat20: result.isNat20,
      isNat1: result.isNat1,
    });
    onClose();
  }

  function doSearch() {
    const perceptionSkill = character?.skills.find((s) => s.name === "Percepção");
    const mod = perceptionSkill?.modifier ?? 0;
    const result = rollD20(mod);

    useAction();
    addMessage({
      id: `msg_${Date.now()}`,
      channel: "geral",
      type: "roll",
      sender: name,
      senderInitials: name.slice(0, 2).toUpperCase(),
      isGM: false,
      content: `${name} procura ao redor (Percepção).`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      rollFormula: result.formula,
      rollResult: result.total,
      rollDetails: result.details,
      isNat20: result.isNat20,
      isNat1: result.isNat1,
    });
    onClose();
  }

  return (
    <div className="mb-2 w-64 rounded-xl border border-brand-border bg-[#16161D] py-1 shadow-2xl">
      <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-brand-muted">
        Combate
      </div>
      <MenuItem icon={Swords} label="Atacar" desc="Ataque corpo a corpo ou a distancia" onClick={onAttack} />
      {hasSpells && (
        <MenuItem
          icon={Wand2}
          label={cantripOnly ? "Conjurar Cantrip" : "Conjurar Magia"}
          desc={cantripOnly ? "So cantrips (usou magia bonus)" : "Usar uma magia preparada"}
          onClick={onSpell}
          disabled={cantripOnly && !hasCantrips}
        />
      )}
      <MenuItem
        icon={ShieldCheck}
        label="Esquivar (Dodge)"
        desc="Ataques contra voce tem desvantagem"
        onClick={() => doSimpleAction("Esquivar (Dodge)", () => setDodging(true))}
      />
      <MenuItem
        icon={HandHelping}
        label="Ajudar (Help)"
        desc="Da vantagem a um aliado"
        onClick={() => doSimpleAction("Ajudar (Help)")}
      />

      <div className="mx-2 my-1 h-px bg-brand-border" />

      <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-brand-muted">
        Utilidade
      </div>
      <MenuItem
        icon={RunIcon}
        label="Correr (Dash)"
        desc="Dobra seu movimento neste turno"
        onClick={() => doSimpleAction("Correr (Dash)", () => setDashing(true))}
      />
      <MenuItem
        icon={EyeOff}
        label="Esconder-se (Hide)"
        desc="Rola Furtividade para se ocultar"
        onClick={doHide}
      />
      <MenuItem
        icon={ArrowRightLeft}
        label="Desengajar (Disengage)"
        desc="Movimento nao provoca ataques de oportunidade"
        onClick={() => doSimpleAction("Desengajar (Disengage)", () => setDisengaging(true))}
      />

      <div className="mx-2 my-1 h-px bg-brand-border" />

      <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-brand-muted">
        Interacao
      </div>
      <MenuItem icon={Search} label="Procurar (Search)" desc="Rola Percepcao" onClick={doSearch} />
      <MenuItem icon={Dices} label="Teste de Habilidade" desc="Rola uma skill qualquer" onClick={() => { onSkillCheck(); }} />
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  desc,
  onClick,
  disabled,
}: {
  icon: typeof Swords;
  label: string;
  desc: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors ${
        disabled ? "cursor-not-allowed opacity-40" : "hover:bg-white/[0.05]"
      }`}
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-muted" />
      <div>
        <div className="text-xs font-medium text-brand-text">{label}</div>
        <div className="text-[10px] text-brand-muted/70">{desc}</div>
      </div>
    </button>
  );
}
