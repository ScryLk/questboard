"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Crosshair,
  Eye,
  Footprints,
  Heart,
  Shield,
  Target,
} from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";
import {
  ALL_CONDITIONS,
  getAlignmentColor,
  getHpPercent,
  getHpColor,
} from "@/lib/gameplay-mock-data";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * Aba "Alvo" — mostra dados públicos do token selecionado (short-tap).
 * Respeita visibilidade do player view: só vê o que o GM permite
 * (via `settings` do store).
 */
export function PlayerTargetTab() {
  const targetId = usePlayerViewStore((s) => s.targetTokenId);
  const visibleTokens = usePlayerViewStore((s) => s.visibleTokens);
  const myToken = usePlayerViewStore((s) => s.myToken);
  const settings = usePlayerViewStore((s) => s.settings);
  const [showMore, setShowMore] = useState(false);

  const target = targetId
    ? visibleTokens.find((t) => t.id === targetId)
    : null;

  if (!target) {
    return (
      <EmptyState
        icon={Target}
        title="Nenhum alvo selecionado"
        description={
          <>
            Toque num token no mapa pra inspecionar. Você verá só o que o
            mestre permite.
          </>
        }
      />
    );
  }

  const borderColor = getAlignmentColor(target.type);
  const isAlly =
    target.type === "ally" ||
    target.type === "neutral" ||
    target.type === "player";
  const isMe = target.id === myToken?.id;

  // HP visível: aliados sempre mostram número se `showAllyHpNumeric`,
  // inimigos usam descrição ("Ferido", "Quase morto") se `showEnemyHpDescription`.
  const showHpNumber =
    target.hp !== undefined &&
    target.maxHp !== undefined &&
    (isMe || (isAlly && settings.showAllyHpNumeric) ||
      (!isAlly && settings.showEnemyHpNumeric));

  const showHpDescription =
    !showHpNumber &&
    target.hpDescription !== undefined &&
    ((isAlly && settings.showAllyHpNumeric) ||
      (!isAlly && settings.showEnemyHpDescription));

  const hpPercent = showHpNumber
    ? getHpPercent(target.hp ?? 0, target.maxHp ?? 1)
    : target.hpBarPercent ?? 100;
  const hpColor = getHpColor(hpPercent);

  // Condições: visíveis conforme setting do GM
  const showConditions = isAlly
    ? settings.showAllyConditions
    : settings.showEnemyConditions;

  const typeLabel =
    target.type === "ally"
      ? "Aliado"
      : target.type === "hostile"
        ? "Hostil"
        : target.type === "neutral"
          ? "Neutro"
          : target.type === "player"
            ? "Jogador"
            : "NPC";

  const hasConditions = showConditions && target.conditions.length > 0;
  const hasPosition = myToken && !isMe;
  const hasSecondary = hasConditions || hasPosition;

  return (
    <div className="flex h-full flex-col overflow-y-auto px-3 py-3">
      {/* Header card */}
      <Card>
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold"
            style={{
              borderColor,
              backgroundColor: borderColor + "25",
              color: borderColor,
            }}
          >
            {target.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-bold text-brand-text">
              {target.name}
            </h2>
            <p className="text-xs text-brand-muted">{typeLabel}</p>
          </div>
        </div>
      </Card>

      {/* HP card */}
      {(showHpNumber || showHpDescription) && (
        <Card>
          <div className="flex items-center gap-2">
            <Heart className="h-3.5 w-3.5" style={{ color: hpColor }} />
            <span className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">
              Pontos de Vida
            </span>
          </div>
          <div
            className="mt-2 overflow-hidden rounded-full bg-white/10"
            style={{ height: 6 }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${hpPercent}%`, backgroundColor: hpColor }}
            />
          </div>
          <div className="mt-1.5">
            {showHpNumber && (
              <span className="text-lg font-bold tabular-nums text-brand-text">
                {target.hp}
                <span className="text-sm text-brand-muted">
                  /{target.maxHp}
                </span>
              </span>
            )}
            {showHpDescription && (
              <span
                className="text-sm font-medium"
                style={{ color: hpColor }}
              >
                {target.hpDescription}
              </span>
            )}
          </div>
        </Card>
      )}

      {/* Stats card (só do próprio ou aliados) */}
      {(isMe || isAlly) && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          <StatCard
            icon={<Shield className="h-3.5 w-3.5 text-brand-info" />}
            label="CA"
            value={target.ac?.toString() ?? "—"}
          />
          <StatCard
            icon={
              <Footprints className="h-3.5 w-3.5 text-brand-success" />
            }
            label="Velocidade"
            value={target.speed ? `${target.speed}ft` : "—"}
          />
        </div>
      )}

      {/* Botão "Mais detalhes" — expande secundárias (condições, posição) */}
      {hasSecondary && (
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="mb-3 flex w-full cursor-pointer items-center justify-between rounded-xl border border-brand-border bg-white/[0.02] px-3 py-2.5 text-xs text-brand-text transition-colors hover:bg-white/[0.04]"
        >
          <span className="flex items-center gap-2">
            <span className="font-medium">
              {showMore ? "Ocultar detalhes" : "Mais detalhes"}
            </span>
            {!showMore && hasConditions && target.conditions.length > 0 && (
              <span className="rounded-full bg-brand-warning/15 px-1.5 py-0.5 text-[9px] text-brand-warning">
                {target.conditions.length} cond.
              </span>
            )}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-brand-muted transition-transform ${
              showMore ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {showMore && (
        <>
          {hasPosition && (
            <Card>
              <div className="flex items-center gap-2">
                <Crosshair className="h-3.5 w-3.5 text-brand-muted" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">
                  Posição
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-brand-text">
                ({target.x}, {target.y})
                <span className="ml-2 text-brand-muted">
                  ·{" "}
                  {chebyshevCells(
                    target.x,
                    target.y,
                    myToken!.x,
                    myToken!.y,
                  )}{" "}
                  células
                </span>
              </p>
            </Card>
          )}

          {hasConditions && (
            <Card>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-brand-warning" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">
                  Condições
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {target.conditions.map((cond) => {
                  const label =
                    ALL_CONDITIONS.find((c) => c.key === cond)?.label ??
                    cond;
                  return (
                    <span
                      key={cond}
                      className="rounded-full bg-brand-warning/10 px-2 py-0.5 text-[10px] font-medium text-brand-warning"
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Nota info limitada — hostis only, ao final */}
      {!isAlly && !isMe && (
        <div className="mt-auto flex items-center gap-2 rounded-xl border border-brand-border/60 bg-white/[0.015] px-3 py-2">
          <Eye className="h-3.5 w-3.5 shrink-0 text-brand-muted" />
          <p className="text-[10px] leading-relaxed text-brand-muted">
            Info limitada — só o que você consegue observar à distância.
          </p>
        </div>
      )}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 rounded-xl border border-brand-border bg-white/[0.02] p-3">
      {children}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-brand-border bg-white/[0.02] py-3">
      {icon}
      <span className="text-sm font-bold tabular-nums text-brand-text">
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-wider text-brand-muted">
        {label}
      </span>
    </div>
  );
}

function chebyshevCells(x1: number, y1: number, x2: number, y2: number) {
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}

