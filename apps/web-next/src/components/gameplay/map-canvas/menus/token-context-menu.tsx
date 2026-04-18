"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Heart,
  Maximize2,
  RotateCcw,
  Shield,
  Swords,
  Trash2,
  User,
  Users,
  XCircle,
  Zap,
  Bot,
} from "lucide-react";
import type { GameToken, ConditionType, TokenAlignment, TokenVisibility } from "@/lib/gameplay-mock-data";
import { ALL_CONDITIONS, getAlignmentColor } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import { ALIGNMENT_EYE_COLORS, ALIGNMENT_LABELS } from "@/constants/creature-sprites";
import { BEHAVIOR_META } from "@/lib/npc-behavior-types";
import type { BehaviorType } from "@/lib/npc-behavior-types";
import { useNpcBehaviorStore } from "@/lib/npc-behavior-store";

interface TokenContextMenuProps {
  token: GameToken;
  x: number;
  y: number;
  onClose: () => void;
}

const SIZES = [
  { value: 0.5, label: "Minusculo (0.5)" },
  { value: 1, label: "Pequeno/Medio (1x1)" },
  { value: 2, label: "Grande (2x2)" },
  { value: 3, label: "Enorme (3x3)" },
  { value: 4, label: "Colossal (4x4)" },
];

const VISIBILITY_OPTIONS: { value: TokenVisibility; label: string }[] = [
  { value: "visible", label: "Visivel" },
  { value: "hidden", label: "Oculto (so GM)" },
  { value: "invisible", label: "Invisivel (outline)" },
];

export function TokenContextMenu({ token, x, y, onClose }: TokenContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [submenu, setSubmenu] = useState<"conditions" | "visibility" | "alignment" | "size" | "behavior" | null>(null);

  const removeToken = useGameplayStore((s) => s.removeToken);
  const duplicateToken = useGameplayStore((s) => s.duplicateToken);
  const toggleTokenCondition = useGameplayStore((s) => s.toggleTokenCondition);
  const setTokenVisibility = useGameplayStore((s) => s.setTokenVisibility);
  const setTokenAlignment = useGameplayStore((s) => s.setTokenAlignment);
  const setTokenSize = useGameplayStore((s) => s.setTokenSize);
  const undoMovement = useGameplayStore((s) => s.undoMovement);
  const setHpAdjustTarget = useGameplayStore((s) => s.setHpAdjustTarget);
  const openModal = useGameplayStore((s) => s.openModal);
  const setRightTab = useGameplayStore((s) => s.setRightTab);
  const selectToken = useGameplayStore((s) => s.selectToken);
  const setAttackLine = useGameplayStore((s) => s.setAttackLine);
  const tokens = useGameplayStore((s) => s.tokens);
  const combat = useGameplayStore((s) => s.combat);

  const color = getAlignmentColor(token.alignment);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  function MenuItem({
    icon: Icon,
    label,
    shortcut,
    danger,
    hasSubmenu,
    onClick,
    onHover,
  }: {
    icon: typeof Heart;
    label: string;
    shortcut?: string;
    danger?: boolean;
    hasSubmenu?: boolean;
    onClick?: () => void;
    onHover?: () => void;
  }) {
    return (
      <button
        onClick={onClick}
        onMouseEnter={onHover}
        className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
          danger
            ? "text-brand-danger hover:bg-brand-danger/10"
            : "text-brand-text hover:bg-white/[0.05]"
        }`}
      >
        <Icon className={`h-3 w-3 shrink-0 ${danger ? "text-brand-danger" : "text-brand-muted"}`} />
        <span className="flex-1">{label}</span>
        {shortcut && (
          <span className="text-[10px] text-brand-muted">{shortcut}</span>
        )}
        {hasSubmenu && <ChevronRight className="h-3 w-3 text-brand-muted" />}
      </button>
    );
  }

  return (
    <div ref={ref} className="fixed z-50 flex" style={{ left: x, top: y }}>
      {/* Main menu */}
      <div className="min-w-[200px] rounded-lg border border-brand-border bg-[#16161D] py-1 shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-1.5">
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: color + "40", border: `1.5px solid ${color}` }}
          />
          <span className="text-xs font-semibold text-brand-text">{token.name}</span>
        </div>
        <div className="mx-2 my-0.5 h-px bg-brand-border" />

        <MenuItem
          icon={User}
          label="Ver Ficha"
          shortcut="Tab"
          onClick={() => {
            selectToken(token.id);
            setRightTab("sheet");
            onClose();
          }}
        />
        <MenuItem
          icon={Heart}
          label={`Ajustar HP (${token.hp}/${token.maxHp})`}
          shortcut="H"
          onClick={() => {
            setHpAdjustTarget(token.id);
            openModal("hpAdjust");
            onClose();
          }}
          onHover={() => setSubmenu(null)}
        />
        <MenuItem
          icon={Shield}
          label={`CA: ${token.ac}`}
          onHover={() => setSubmenu(null)}
        />
        <div className="mx-2 my-0.5 h-px bg-brand-border" />
        <MenuItem
          icon={Swords}
          label="Atacar"
          shortcut="A"
          onClick={() => {
            // Find closest enemy to attack
            const currentTurnId = combat.active ? combat.order[combat.turnIndex]?.tokenId : null;
            const attackerId = currentTurnId ?? token.id;
            const targetId = token.id !== attackerId ? token.id : null;
            if (targetId) {
              const roll = Math.floor(Math.random() * 20) + 1 + 5; // d20 + mod
              const damage = Math.floor(Math.random() * 8) + 1 + 3; // d8 + mod
              const target = tokens.find((t) => t.id === targetId);
              const isHit = target ? roll >= target.ac : false;
              setAttackLine({
                attackerId,
                targetId,
                roll,
                damage: isHit ? damage : null,
              });
            }
            onClose();
          }}
          onHover={() => setSubmenu(null)}
        />
        <div className="mx-2 my-0.5 h-px bg-brand-border" />
        <MenuItem
          icon={Users}
          label="Indole"
          hasSubmenu
          onHover={() => setSubmenu("alignment")}
        />
        <MenuItem
          icon={Eye}
          label="Visibilidade"
          hasSubmenu
          onHover={() => setSubmenu("visibility")}
        />
        <MenuItem
          icon={Zap}
          label={`Condicoes (${token.conditions.length})`}
          shortcut="C"
          hasSubmenu
          onHover={() => setSubmenu("conditions")}
        />
        <MenuItem
          icon={Maximize2}
          label={`Tamanho: ${token.size}x${token.size}`}
          hasSubmenu
          onHover={() => setSubmenu("size")}
        />
        <MenuItem
          icon={Bot}
          label="Comportamento"
          hasSubmenu
          onHover={() => setSubmenu("behavior")}
        />
        <div className="mx-2 my-0.5 h-px bg-brand-border" />
        <MenuItem
          icon={Copy}
          label="Duplicar"
          shortcut="D"
          onClick={() => { duplicateToken(token.id); onClose(); }}
          onHover={() => setSubmenu(null)}
        />
        <MenuItem
          icon={ArrowDown}
          label="Elevar (voando)"
          onHover={() => setSubmenu(null)}
        />
        <MenuItem
          icon={RotateCcw}
          label="Desfazer Movimento"
          onClick={() => { undoMovement(token.id); onClose(); }}
          onHover={() => setSubmenu(null)}
        />
        <div className="mx-2 my-0.5 h-px bg-brand-border" />
        <MenuItem
          icon={Trash2}
          label="Remover do Mapa"
          shortcut="Del"
          danger
          onClick={() => { removeToken(token.id); onClose(); }}
          onHover={() => setSubmenu(null)}
        />
        <MenuItem
          icon={XCircle}
          label="Remover do Combate"
          danger
          onHover={() => setSubmenu(null)}
        />
      </div>

      {/* Submenu */}
      {submenu === "conditions" && (
        <div className="ml-1 max-h-[320px] min-w-[180px] overflow-y-auto rounded-lg border border-brand-border bg-[#16161D] py-1 shadow-xl">
          {ALL_CONDITIONS.map((c) => {
            const active = token.conditions.includes(c.key);
            return (
              <button
                key={c.key}
                onClick={() => toggleTokenCondition(token.id, c.key)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-brand-text hover:bg-white/[0.05]"
              >
                <div
                  className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                    active
                      ? "border-brand-accent bg-brand-accent"
                      : "border-brand-border"
                  }`}
                >
                  {active && <span className="text-[8px] text-white">✓</span>}
                </div>
                {c.label}
              </button>
            );
          })}
        </div>
      )}

      {submenu === "alignment" && (
        <div className="ml-1 min-w-[160px] rounded-lg border border-brand-border bg-[#16161D] py-1 shadow-xl">
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Indole
          </div>
          {(["hostile", "neutral", "ally"] as TokenAlignment[]).map((a) => {
            const active = token.alignment === a;
            return (
              <button
                key={a}
                onClick={() => {
                  setTokenAlignment(token.id, a);
                  onClose();
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-brand-text hover:bg-white/[0.05]"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: ALIGNMENT_EYE_COLORS[a],
                    boxShadow: active ? `0 0 6px ${ALIGNMENT_EYE_COLORS[a]}` : undefined,
                  }}
                />
                <span style={{ color: active ? ALIGNMENT_EYE_COLORS[a] : undefined }}>
                  {ALIGNMENT_LABELS[a]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {submenu === "visibility" && (
        <div className="ml-1 min-w-[160px] rounded-lg border border-brand-border bg-[#16161D] py-1 shadow-xl">
          {VISIBILITY_OPTIONS.map((v) => {
            const active = token.visibility === v.value;
            return (
              <button
                key={v.value}
                onClick={() => {
                  setTokenVisibility(token.id, v.value);
                  onClose();
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-brand-text hover:bg-white/[0.05]"
              >
                <div
                  className={`h-2 w-2 rounded-full border ${
                    active
                      ? "border-brand-accent bg-brand-accent"
                      : "border-brand-muted"
                  }`}
                />
                {v.label}
              </button>
            );
          })}
        </div>
      )}

      {submenu === "size" && (
        <div className="ml-1 min-w-[180px] rounded-lg border border-brand-border bg-[#16161D] py-1 shadow-xl">
          {SIZES.map((s) => {
            const active = token.size === s.value;
            return (
              <button
                key={s.value}
                onClick={() => {
                  setTokenSize(token.id, s.value);
                  onClose();
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-brand-text hover:bg-white/[0.05]"
              >
                <div
                  className={`h-2 w-2 rounded-full border ${
                    active
                      ? "border-brand-accent bg-brand-accent"
                      : "border-brand-muted"
                  }`}
                />
                {s.label}
              </button>
            );
          })}
        </div>
      )}

      {submenu === "behavior" && (
        <div className="ml-1 min-w-[200px] rounded-lg border border-brand-border bg-[#16161D] py-1 shadow-xl">
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Comportamento
          </div>
          {(Object.keys(BEHAVIOR_META) as BehaviorType[]).map((type) => {
            const meta = BEHAVIOR_META[type];
            const activeBeh = useNpcBehaviorStore.getState().getBehaviorForToken(token.id);
            const isActive = activeBeh?.type === type;
            return (
              <button
                key={type}
                onClick={() => {
                  useGameplayStore.getState().openModal("behaviorCreator");
                  onClose();
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-brand-text hover:bg-white/[0.05]"
              >
                <span className="text-sm">{meta.emoji}</span>
                <div className="flex-1">
                  <span className={isActive ? "text-[#7c5cfc] font-semibold" : ""}>{meta.label}</span>
                  <span className="ml-1.5 text-[9px] text-brand-muted">{meta.description}</span>
                </div>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00B894] animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
