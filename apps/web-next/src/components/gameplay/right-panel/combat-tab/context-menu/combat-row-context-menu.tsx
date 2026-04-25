"use client";

// Menu contextual da linha do combat tracker — separado do menu de
// token do mapa por decisão arquitetural (contextos visuais distintos).
//
// Trigger: right-click na linha (ver CombatRow). Aberto em (x, y) do
// click. Esc/click-outside fecha. Hover em "Condições ▸" abre submenu
// à direita; sair com delay (mesmo padrão do token-context-menu).

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Sword,
  Heart,
  Sliders,
  Shield,
  SkipForward,
  Check,
  ArrowUp,
  ArrowDown,
  Dices,
  Pencil,
  Activity,
  Copy,
  Crosshair,
  Trash2,
} from "lucide-react";
import type { CombatParticipant } from "@questboard/types";
import type { CombatConditionId } from "@questboard/constants";
import {
  MenuItem,
  MenuGroupLabel,
  MenuDivider,
} from "./menu-item";
import { ConditionSubmenu } from "./condition-submenu";

export type ContextMenuAction =
  | { kind: "applyDamage" }
  | { kind: "applyHeal" }
  | { kind: "setHp" }
  | { kind: "setTempHp" }
  | { kind: "skipTurn" }
  | { kind: "toggleActed" }
  | { kind: "moveUp" }
  | { kind: "moveDown" }
  | { kind: "rollInitiative" }
  | { kind: "setInitiative" }
  | { kind: "addCondition"; conditionId: CombatConditionId }
  | { kind: "editCondition"; conditionId: CombatConditionId }
  | { kind: "removeCondition"; conditionId: CombatConditionId }
  | { kind: "duplicate" }
  | { kind: "focusCamera" }
  | { kind: "remove" };

interface Props {
  participant: CombatParticipant;
  /** Coordenadas viewport do click direito. */
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: ContextMenuAction) => void;
}

export function CombatRowContextMenu({
  participant,
  x,
  y,
  onClose,
  onAction,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number }>({
    left: x,
    top: y,
  });
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const requestCloseSubmenu = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setSubmenuOpen(false), 180);
  };
  const openSubmenu = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setSubmenuOpen(true);
  };
  const keepSubmenuOpen = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Click fora / Esc fecha. Atalhos Ctrl+D / Ctrl+H / Del.
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        onAction({ kind: "applyDamage" });
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "h" || e.key === "H")) {
        e.preventDefault();
        onAction({ kind: "applyHeal" });
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onAction({ kind: "remove" });
      }
    }
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onAction]);

  // Reposiciona se sair da viewport.
  useLayoutEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const pad = 8;
    let left = x;
    let top = y;
    if (left + rect.width > window.innerWidth - pad) {
      left = Math.max(pad, window.innerWidth - rect.width - pad);
    }
    if (top + rect.height > window.innerHeight - pad) {
      top = Math.max(pad, window.innerHeight - rect.height - pad);
    }
    if (left !== pos.left || top !== pos.top) setPos({ left, top });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (typeof document === "undefined") return null;

  const wrap = (action: ContextMenuAction) => () => {
    onAction(action);
  };

  return createPortal(
    <div
      ref={ref}
      role="menu"
      aria-label={`Ações para ${participant.name}`}
      className="fixed z-[105] w-60 rounded-md border border-brand-border bg-brand-surface py-1 shadow-2xl"
      style={{ left: pos.left, top: pos.top }}
    >
      {/* VIDA */}
      <MenuGroupLabel>Vida</MenuGroupLabel>
      <MenuItem
        icon={Sword}
        label="Aplicar dano"
        shortcut="Ctrl+D"
        onClick={wrap({ kind: "applyDamage" })}
        onHover={requestCloseSubmenu}
      />
      <MenuItem
        icon={Heart}
        label="Aplicar cura"
        shortcut="Ctrl+H"
        onClick={wrap({ kind: "applyHeal" })}
        onHover={requestCloseSubmenu}
      />
      <MenuItem
        icon={Sliders}
        label="Ajustar HP…"
        onClick={wrap({ kind: "setHp" })}
        onHover={requestCloseSubmenu}
      />
      <MenuItem
        icon={Shield}
        label="HP temporário…"
        onClick={wrap({ kind: "setTempHp" })}
        onHover={requestCloseSubmenu}
      />

      <MenuDivider />

      {/* TURNO */}
      <MenuGroupLabel>Turno</MenuGroupLabel>
      <MenuItem
        icon={SkipForward}
        label="Pular turno"
        onClick={wrap({ kind: "skipTurn" })}
        onHover={requestCloseSubmenu}
      />
      <MenuItem
        icon={Check}
        label={participant.hasActed ? "Desmarcar “já agiu”" : "Marcar “já agiu”"}
        onClick={wrap({ kind: "toggleActed" })}
        onHover={requestCloseSubmenu}
        active={participant.hasActed}
      />
      <MenuItem
        icon={ArrowUp}
        label="Mover pra frente da ordem"
        onClick={wrap({ kind: "moveUp" })}
        onHover={requestCloseSubmenu}
      />
      <MenuItem
        icon={ArrowDown}
        label="Mover pra trás da ordem"
        onClick={wrap({ kind: "moveDown" })}
        onHover={requestCloseSubmenu}
      />

      <MenuDivider />

      {/* INICIATIVA */}
      <MenuGroupLabel>Iniciativa</MenuGroupLabel>
      <MenuItem
        icon={Dices}
        label="Rolar novamente"
        onClick={wrap({ kind: "rollInitiative" })}
        onHover={requestCloseSubmenu}
      />
      <MenuItem
        icon={Pencil}
        label="Editar valor…"
        onClick={wrap({ kind: "setInitiative" })}
        onHover={requestCloseSubmenu}
      />

      <MenuDivider />

      {/* CONDIÇÕES */}
      <div className="relative">
        <MenuItem
          icon={Activity}
          label={`Condições (${participant.conditions.length})`}
          hasSubmenu
          onHover={openSubmenu}
        />
        {submenuOpen && (
          <div
            className="absolute left-full top-0 z-[106] ml-1"
            onMouseEnter={keepSubmenuOpen}
            onMouseLeave={requestCloseSubmenu}
          >
            <ConditionSubmenu
              active={participant.conditions}
              onAdd={(id) => onAction({ kind: "addCondition", conditionId: id })}
              onEdit={(id) =>
                onAction({ kind: "editCondition", conditionId: id })
              }
              onRemove={(id) =>
                onAction({ kind: "removeCondition", conditionId: id })
              }
            />
          </div>
        )}
      </div>

      <MenuDivider />

      {/* PARTICIPANTE */}
      <MenuGroupLabel>Participante</MenuGroupLabel>
      <MenuItem
        icon={Copy}
        label="Duplicar"
        onClick={wrap({ kind: "duplicate" })}
        onHover={requestCloseSubmenu}
      />
      <MenuItem
        icon={Crosshair}
        label="Focar câmera no token"
        shortcut="F"
        onClick={wrap({ kind: "focusCamera" })}
        onHover={requestCloseSubmenu}
        // TODO(focus-camera): habilitar quando existir uma fn de
        // pan/zoom-to-token exposta no Pixi (não há hoje).
        disabled
      />
      <MenuItem
        icon={Trash2}
        label="Remover do combate"
        shortcut="Del"
        onClick={wrap({ kind: "remove" })}
        onHover={requestCloseSubmenu}
        destructive
      />
    </div>,
    document.body,
  );
}
