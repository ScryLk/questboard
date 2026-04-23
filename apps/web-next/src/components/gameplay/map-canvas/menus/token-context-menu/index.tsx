"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Heart,
  Maximize2,
  PlayCircle,
  RotateCcw,
  StopCircle,
  Swords,
  Trash2,
  User,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import type {
  GameToken,
  TokenAlignment,
  TokenVisibility,
} from "@/lib/gameplay-mock-data";
import {
  ALL_CONDITIONS,
  MOCK_PLAYERS,
  getAlignmentColor,
} from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useActionFeedStore } from "@/lib/action-feed-store";
import {
  ALIGNMENT_EYE_COLORS,
  ALIGNMENT_LABELS,
} from "@/constants/creature-sprites";
import { computeTokenMenuVisibility } from "./use-visibility-rules";
import { RemoveConfirmDialog } from "./remove-confirm-dialog";
import { WhisperDialog } from "./whisper-dialog";

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

type Submenu =
  | "conditions"
  | "visibility"
  | "alignment"
  | "size"
  | "owner"
  | null;

export function TokenContextMenu({
  token,
  x,
  y,
  onClose,
}: TokenContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [submenu, setSubmenu] = useState<Submenu>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showWhisper, setShowWhisper] = useState(false);

  // Fechar flyout com delay pra permitir deslocamento diagonal do mouse
  // até ele. Sem isso, hover em itens no caminho dispara setSubmenu(null)
  // antes do mouse alcançar o flyout (bug clássico de menus aninhados).
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestCloseSubmenu = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setSubmenu(null), 180);
  };
  const openSubmenu = (key: Submenu) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setSubmenu(key);
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

  const removeToken = useGameplayStore((s) => s.removeToken);
  const duplicateToken = useGameplayStore((s) => s.duplicateToken);
  const setCurrentTurn = useGameplayStore((s) => s.setCurrentTurn);
  const endCombat = useGameplayStore((s) => s.endCombat);
  const toggleTokenCondition = useGameplayStore((s) => s.toggleTokenCondition);
  const setTokenVisibility = useGameplayStore((s) => s.setTokenVisibility);
  const setTokenAlignment = useGameplayStore((s) => s.setTokenAlignment);
  const setTokenSize = useGameplayStore((s) => s.setTokenSize);
  const setTokenElevation = useGameplayStore((s) => s.setTokenElevation);
  const setTokenPlayerId = useGameplayStore((s) => s.setTokenPlayerId);
  const undoMovement = useGameplayStore((s) => s.undoMovement);
  const setHpAdjustTarget = useGameplayStore((s) => s.setHpAdjustTarget);
  const openModal = useGameplayStore((s) => s.openModal);
  const setRightTab = useGameplayStore((s) => s.setRightTab);
  const selectToken = useGameplayStore((s) => s.selectToken);
  const setAttackLine = useGameplayStore((s) => s.setAttackLine);
  const tokens = useGameplayStore((s) => s.tokens);
  const combat = useGameplayStore((s) => s.combat);
  const currentUserIsGM = useGameplayStore((s) => s.currentUserIsGM);
  const currentUserId = useGameplayStore((s) => s.currentUserId);

  const rules = useMemo(
    () =>
      computeTokenMenuVisibility({
        token,
        currentUserIsGM,
        currentUserId,
        combatActive: combat.active,
      }),
    [token, currentUserIsGM, currentUserId, combat.active],
  );

  const isNpc = !token.playerId;
  const isMyPc = !isNpc && !!currentUserId && token.playerId === currentUserId;
  const typeLabel = isNpc ? "NPC" : isMyPc ? "Você" : "Jogador";
  const isFlying = token.elevation !== undefined && token.elevation !== null;

  const color = getAlignmentColor(token.alignment);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      // Clique fora fecha — a menos que esteja em cima de um diálogo
      // portalado (confirmação ou sussurro, que vivem fora desse ref).
      if (showRemoveConfirm || showWhisper) return;
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !showRemoveConfirm && !showWhisper) onClose();
    }
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, showRemoveConfirm, showWhisper]);

  function handleSeeSheet() {
    selectToken(token.id);
    setRightTab("sheet");
    onClose();
  }

  function handleAdjustHp() {
    setHpAdjustTarget(token.id);
    openModal("hpAdjust");
    onClose();
  }

  function handleAttack() {
    // TODO (dívida técnica — regra de ouro #4): rolagem acontece no cliente.
    // Mover pra socket `dice:roll` quando o backend existir.
    const currentTurnId = combat.active
      ? combat.order[combat.turnIndex]?.tokenId
      : null;
    const attackerId = currentTurnId ?? token.id;
    const targetId = token.id !== attackerId ? token.id : null;
    if (targetId) {
      const roll = Math.floor(Math.random() * 20) + 1 + 5;
      const damage = Math.floor(Math.random() * 8) + 1 + 3;
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
  }

  function handleDuplicate() {
    duplicateToken(token.id);
    onClose();
  }

  function handleSetCurrentTurn() {
    setCurrentTurn(token.id);
    onClose();
  }

  function handleEndCombat() {
    endCombat();
    onClose();
  }

  function handleUndoMovement() {
    // Integração com o feed de ações: se há entry de TOKEN_MOVED deste
    // token ainda revertível, usa ela (mantém feed e movimentHistory em
    // sync). Senão, cai no snapshot `undoMovement` clássico do store.
    const feedStore = useActionFeedStore.getState();
    const now = Date.now();
    const latest = feedStore.entries.find(
      (e) =>
        e.type === "TOKEN_MOVED" &&
        e.payload.tokenId === token.id &&
        !e.revertedAt &&
        now < e.expiresAt,
    );
    if (latest) {
      feedStore.revertEntry(latest.id);
    } else {
      undoMovement(token.id);
    }
    onClose();
  }

  function handleToggleElevation() {
    setTokenElevation(token.id, isFlying ? null : 5);
    onClose();
  }

  function handleRequestRemove() {
    setShowRemoveConfirm(true);
  }

  function handleConfirmRemove() {
    removeToken(token.id);
    setShowRemoveConfirm(false);
    onClose();
  }

  // ── Qualquer grupo fica escondido se nenhuma das suas rows vazar da matriz.
  // Pra evitar divider órfão, calculo "tem algo neste grupo" antes de renderizar.
  const hasInfoGroup =
    rules.canSeeSheet || rules.canSeeFocusCamera || rules.canSendWhisper;
  const hasCombatGroup =
    rules.canAttack ||
    rules.canAdjustHp ||
    rules.canEditConditions ||
    rules.canSetCurrentTurn ||
    rules.canEndCombat;
  const hasAppearanceGroup =
    rules.canChangeAlignment ||
    rules.canChangeVisibility ||
    rules.canChangeSize ||
    rules.canToggleElevation ||
    rules.canChangeOwner;
  const hasManipulationGroup = rules.canDuplicate || rules.canUndoMovement;
  const hasDestructiveGroup = rules.canRemoveFromMap;

  // Posicionamento: renderiza no cursor, depois mede o menu de verdade
  // e clampa pra não vazar do viewport. Scroll interno cobre o caso em
  // que o menu é mais alto que a tela (ex: muitas condições).
  const VIEWPORT_MARGIN = 8;
  const [pos, setPos] = useState<{ top: number; left: number }>({
    top: y,
    left: x,
  });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Se abrir pra direita estoura → gruda a borda direita em x.
    // Se abrir pra baixo estoura → gruda a borda inferior em y.
    const overflowsRight = x + rect.width > vw - VIEWPORT_MARGIN;
    const overflowsBottom = y + rect.height > vh - VIEWPORT_MARGIN;

    const nextLeft = overflowsRight
      ? Math.max(VIEWPORT_MARGIN, x - rect.width)
      : x;
    const nextTop = overflowsBottom
      ? Math.max(VIEWPORT_MARGIN, y - rect.height)
      : y;

    // Evita setState em loop se nada mudou.
    if (nextLeft !== pos.left || nextTop !== pos.top) {
      setPos({ top: nextTop, left: nextLeft });
    }
    // Só re-clampa quando o cursor muda (ou no mount).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, y]);

  return (
    <>
      <div
        ref={ref}
        className="fixed z-50 flex items-start"
        style={{ top: pos.top, left: pos.left }}
      >
        {/* Main menu — max-height relativa ao viewport, scroll interno. */}
        <div
          className="flex min-w-[220px] flex-col overflow-y-auto rounded-lg border border-brand-border bg-[#16161D] py-1 shadow-xl"
          style={{ maxHeight: `calc(100vh - ${VIEWPORT_MARGIN * 2}px)` }}
        >
          {/* ── Header ──────────────────────────────────────── */}
          <div className="flex items-center gap-2 px-3 py-2">
            <div
              className="h-5 w-5 shrink-0 rounded-full"
              style={{
                backgroundColor: color + "40",
                border: `1.5px solid ${color}`,
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-brand-text">
                {token.name}
              </div>
              <div className="text-[10px] text-brand-muted">
                {typeLabel} · {ALIGNMENT_LABELS[token.alignment] ?? "—"}
              </div>
            </div>
          </div>

          {/* ── Grupo 1: INFO ──────────────────────────────── */}
          {hasInfoGroup && <Divider />}
          {rules.canSeeSheet && (
            <MenuItem
              icon={User}
              label="Ver Ficha"
              shortcut="Tab"
              onClick={handleSeeSheet}
              onHover={requestCloseSubmenu}
            />
          )}
          {rules.canSendWhisper && (
            <MenuItem
              icon={EyeOff}
              label="Sussurrar"
              onClick={() => {
                setShowWhisper(true);
                requestCloseSubmenu();
              }}
              onHover={requestCloseSubmenu}
            />
          )}
          {/* Focar Câmera e Notas do Mestre entram no PR #2. */}

          {/* ── Grupo 2: COMBATE ───────────────────────────── */}
          {hasCombatGroup && <Divider />}
          {rules.canAttack && (
            <MenuItem
              icon={Swords}
              label="Atacar"
              shortcut="A"
              onClick={handleAttack}
              onHover={requestCloseSubmenu}
            />
          )}
          {rules.canAdjustHp && (
            <MenuItem
              icon={Heart}
              label={`Ajustar HP (${token.hp}/${token.maxHp})`}
              shortcut="H"
              onClick={handleAdjustHp}
              onHover={requestCloseSubmenu}
            />
          )}
          {rules.canEditConditions && (
            <MenuItem
              icon={Zap}
              label={`Condicoes (${token.conditions.length})`}
              shortcut="C"
              hasSubmenu
              onHover={() => openSubmenu("conditions")}
            />
          )}
          {rules.canSetCurrentTurn && (
            <MenuItem
              icon={PlayCircle}
              label={
                combat.active
                  ? combat.order[combat.turnIndex]?.tokenId === token.id
                    ? "Turno atual (este token)"
                    : "Definir como turno atual"
                  : "Iniciar combate (turno deste)"
              }
              onClick={handleSetCurrentTurn}
              onHover={requestCloseSubmenu}
              disabled={
                combat.active &&
                combat.order[combat.turnIndex]?.tokenId === token.id
              }
            />
          )}
          {rules.canEndCombat && (
            <MenuItem
              icon={StopCircle}
              label="Encerrar combate"
              onClick={handleEndCombat}
              onHover={requestCloseSubmenu}
            />
          )}
          {/* CA e Iniciativa como subheader informativo — não são rows clicáveis. */}
          {hasCombatGroup && (
            <div className="mx-3 mt-1 flex items-center gap-3 border-t border-brand-border/50 pt-1.5 text-[10px] text-brand-muted">
              <span>CA {token.ac}</span>
              <span>
                Iniciativa {token.initiative >= 0 ? "+" : ""}
                {token.initiative}
              </span>
            </div>
          )}

          {/* ── Grupo 3: NARRATIVA ─────────────────────────── */}
          {/* Fora do escopo deste PR — backend de conversa IA / behaviors /
              eventos ainda não existe. TODO: ativar quando houver stack. */}

          {/* ── Grupo 4: APARÊNCIA & COMPORTAMENTO ─────────── */}
          {hasAppearanceGroup && <Divider />}
          {rules.canChangeAlignment && (
            <MenuItem
              icon={Users}
              label="Indole"
              hasSubmenu
              onHover={() => openSubmenu("alignment")}
            />
          )}
          {rules.canChangeVisibility && (
            <MenuItem
              icon={Eye}
              label="Visibilidade"
              hasSubmenu
              onHover={() => openSubmenu("visibility")}
            />
          )}
          {rules.canChangeSize && (
            <MenuItem
              icon={Maximize2}
              label={`Tamanho: ${token.size}x${token.size}`}
              hasSubmenu
              onHover={() => openSubmenu("size")}
            />
          )}
          {rules.canToggleElevation && (
            <MenuItem
              icon={isFlying ? ArrowDown : ArrowUp}
              label={
                isFlying ? "Pousar (voando ativo)" : "Elevar (voando)"
              }
              onClick={handleToggleElevation}
              onHover={requestCloseSubmenu}
            />
          )}
          {rules.canChangeOwner && (
            <MenuItem
              icon={UserCheck}
              label={
                token.playerId
                  ? `Dono: ${MOCK_PLAYERS.find((p) => p.id === token.playerId)?.name ?? token.playerId}`
                  : "Atribuir a jogador"
              }
              hasSubmenu
              onHover={() => openSubmenu("owner")}
            />
          )}

          {/* ── Grupo 5: MANIPULAÇÃO ───────────────────────── */}
          {hasManipulationGroup && <Divider />}
          {rules.canDuplicate && (
            <MenuItem
              icon={Copy}
              label="Duplicar"
              shortcut="Ctrl+D"
              onClick={handleDuplicate}
              onHover={requestCloseSubmenu}
            />
          )}
          {/* Z-order ([ / ]) entra no PR #2. */}
          {rules.canUndoMovement && (
            <MenuItem
              icon={RotateCcw}
              label="Desfazer Movimento"
              shortcut="Ctrl+Z"
              onClick={handleUndoMovement}
              onHover={requestCloseSubmenu}
            />
          )}

          {/* ── Grupo 6: DESTRUTIVO ────────────────────────── */}
          {hasDestructiveGroup && <Divider />}
          {rules.canRemoveFromMap && (
            <MenuItem
              icon={Trash2}
              label="Remover do Mapa"
              shortcut="Del"
              danger
              onClick={handleRequestRemove}
              onHover={requestCloseSubmenu}
            />
          )}
        </div>

        {/* ── Submenus flyout ─────────────────────────────── */}
        {submenu === "conditions" && (
          <div
            onMouseEnter={keepSubmenuOpen}
            className="ml-1 max-h-[320px] min-w-[180px] overflow-y-auto rounded-lg border border-brand-border bg-[#16161D] py-1 shadow-xl"
          >
            {ALL_CONDITIONS.map((c) => {
              const active = token.conditions.includes(c.key);
              return (
                <button
                  key={c.key}
                  onClick={() => toggleTokenCondition(token.id, c.key)}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-xs text-brand-text hover:bg-white/[0.05]"
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
          <div
            onMouseEnter={keepSubmenuOpen}
            className="ml-1 min-w-[160px] rounded-lg border border-brand-border bg-[#16161D] py-1 shadow-xl"
          >
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
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-xs text-brand-text hover:bg-white/[0.05]"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: ALIGNMENT_EYE_COLORS[a],
                      boxShadow: active
                        ? `0 0 6px ${ALIGNMENT_EYE_COLORS[a]}`
                        : undefined,
                    }}
                  />
                  <span
                    style={{
                      color: active ? ALIGNMENT_EYE_COLORS[a] : undefined,
                    }}
                  >
                    {ALIGNMENT_LABELS[a]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {submenu === "visibility" && (
          <div
            onMouseEnter={keepSubmenuOpen}
            className="ml-1 min-w-[160px] rounded-lg border border-brand-border bg-[#16161D] py-1 shadow-xl"
          >
            {VISIBILITY_OPTIONS.map((v) => {
              const active = token.visibility === v.value;
              return (
                <button
                  key={v.value}
                  onClick={() => {
                    setTokenVisibility(token.id, v.value);
                    onClose();
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-xs text-brand-text hover:bg-white/[0.05]"
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
          <div
            onMouseEnter={keepSubmenuOpen}
            className="ml-1 min-w-[180px] rounded-lg border border-brand-border bg-[#16161D] py-1 shadow-xl"
          >
            {SIZES.map((s) => {
              const active = token.size === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => {
                    setTokenSize(token.id, s.value);
                    onClose();
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-xs text-brand-text hover:bg-white/[0.05]"
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

        {submenu === "owner" && (
          <div
            onMouseEnter={keepSubmenuOpen}
            className="ml-1 min-w-[200px] rounded-lg border border-brand-border bg-[#16161D] py-1 shadow-xl"
          >
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
              Atribuir a
            </div>
            {/* Opção "Nenhum" — remove vínculo, token volta a ser NPC puro. */}
            <button
              onClick={() => {
                setTokenPlayerId(token.id, null);
                onClose();
              }}
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-xs text-brand-text hover:bg-white/[0.05]"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] ${
                  !token.playerId
                    ? "border-brand-accent bg-brand-accent/20 text-brand-accent"
                    : "border-brand-border text-brand-muted"
                }`}
              >
                —
              </span>
              <span className="flex-1">Nenhum (NPC)</span>
            </button>
            <div className="mx-2 my-1 h-px bg-brand-border/50" />
            {MOCK_PLAYERS.length === 0 ? (
              <div className="px-3 py-2 text-[10px] text-brand-muted/70">
                Nenhum jogador na sessão. Convide antes.
              </div>
            ) : (
              MOCK_PLAYERS.map((p) => {
                const active = token.playerId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setTokenPlayerId(token.id, p.id);
                      onClose();
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-xs text-brand-text hover:bg-white/[0.05]"
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                      style={{
                        backgroundColor: p.color + "30",
                        color: p.color,
                      }}
                    >
                      {p.avatarInitials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{p.name}</span>
                      <span className="block truncate text-[10px] text-brand-muted">
                        {p.class} · Nv. {p.level}
                      </span>
                    </span>
                    {active && (
                      <span className="text-[10px] text-brand-accent">✓</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {showRemoveConfirm && (
        <RemoveConfirmDialog
          tokenName={token.name}
          onCancel={() => setShowRemoveConfirm(false)}
          onConfirm={handleConfirmRemove}
        />
      )}

      {showWhisper && (
        <WhisperDialog
          token={token}
          onClose={() => {
            setShowWhisper(false);
            onClose();
          }}
        />
      )}
    </>
  );
}

// ── Helpers ────────────────────────────────────────────────────

function Divider() {
  return <div className="mx-2 my-1 h-px bg-brand-border" />;
}

function MenuItem({
  icon: Icon,
  label,
  shortcut,
  danger,
  disabled,
  hasSubmenu,
  onClick,
  onHover,
}: {
  icon: typeof Heart;
  label: string;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  hasSubmenu?: boolean;
  onClick?: () => void;
  onHover?: () => void;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={onHover}
      disabled={disabled}
      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
        disabled
          ? "cursor-not-allowed text-brand-muted/50"
          : danger
            ? "cursor-pointer text-brand-danger hover:bg-brand-danger/10"
            : "cursor-pointer text-brand-text hover:bg-white/[0.05]"
      }`}
    >
      <Icon
        className={`h-3 w-3 shrink-0 ${
          disabled
            ? "text-brand-muted/40"
            : danger
              ? "text-brand-danger"
              : "text-brand-muted"
        }`}
      />
      <span className="flex-1">{label}</span>
      {shortcut && (
        <span className="text-[10px] text-brand-muted">{shortcut}</span>
      )}
      {hasSubmenu && <ChevronRight className="h-3 w-3 text-brand-muted" />}
    </button>
  );
}
