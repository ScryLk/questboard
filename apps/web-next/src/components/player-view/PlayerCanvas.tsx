"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MOCK_MAP,
  getAlignmentColor,
  getHpPercent,
  getHpColor,
  gridDistance,
} from "@/lib/gameplay-mock-data";
import { usePlayerViewStore } from "@/lib/player-view-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useNpcConversationStore } from "@/lib/npc-conversation-store";
import { useNPCStore } from "@/lib/npc-store";
import { getHPDescriptionColor } from "@/lib/visibility-filter";
import { FogOverlay } from "../gameplay/map-canvas/overlays/fog-overlay";
import { TerrainOverlay } from "../gameplay/map-canvas/overlays/terrain-overlay";
import { AOEOverlay } from "../gameplay/map-canvas/overlays/aoe-overlay";
import { MarkersOverlay } from "../gameplay/map-canvas/overlays/markers-overlay";
import { DamageFloatOverlay } from "../gameplay/map-canvas/overlays/damage-float-overlay";

export function PlayerCanvas() {
  const visibleTokens = usePlayerViewStore((s) => s.visibleTokens);
  const myToken = usePlayerViewStore((s) => s.myToken);
  const isMyTurn = usePlayerViewStore((s) => s.isMyTurn);
  const combat = usePlayerViewStore((s) => s.combat);
  const movementUsedFt = usePlayerViewStore((s) => s.movementUsedFt);
  const movementMaxFt = usePlayerViewStore((s) => s.movementMaxFt);
  const settings = usePlayerViewStore((s) => s.settings);
  const moveMyToken = usePlayerViewStore((s) => s.moveMyToken);
  const addMovementFt = usePlayerViewStore((s) => s.addMovementFt);

  // Read fog/terrain/aoe from GM store (shared state)
  const fogCells = useGameplayStore((s) => s.fogCells);
  const terrainCells = useGameplayStore((s) => s.terrainCells);
  const aoeInstances = useGameplayStore((s) => s.aoeInstances);
  const damageFloats = useGameplayStore((s) => s.damageFloats);
  const gridVisible = useGameplayStore((s) => s.gridVisible);

  const { gridCols, gridRows, cellSize, cellSizeFt } = MOCK_MAP;
  const scaledCell = cellSize;
  const canvasW = gridCols * scaledCell;
  const canvasH = gridRows * scaledCell;

  // F-33: Reset scroll on scene/map change
  const activeMapId = usePlayerViewStore((s) => s.activeMapId);

  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Drag state for own token
  const dragRef = useRef<{
    tokenId: string;
    originX: number;
    originY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [dragPos, setDragPos] = useState<{ id: string; x: number; y: number } | null>(null);

  // Tooltip
  const [tooltip, setTooltip] = useState<{
    token: typeof visibleTokens[0];
    x: number;
    y: number;
  } | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll state for fog overlay
  const [scrollState, setScrollState] = useState({ left: 0, top: 0, w: 0, h: 0 });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setScrollState({
        left: el.scrollLeft,
        top: el.scrollTop,
        w: el.clientWidth,
        h: el.clientHeight,
      });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  // Center on my token on mount
  useEffect(() => {
    if (!myToken || !scrollRef.current) return;
    const el = scrollRef.current;
    const cx = myToken.x * scaledCell + scaledCell / 2 - el.clientWidth / 2;
    const cy = myToken.y * scaledCell + scaledCell / 2 - el.clientHeight / 2;
    el.scrollTo({ left: cx, top: cy, behavior: "smooth" });
  }, [myToken?.x, myToken?.y, scaledCell]); // eslint-disable-line react-hooks/exhaustive-deps

  // F-33: Reset scroll to origin on map/scene change, then re-center on token
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    if (myToken) {
      const cx = myToken.x * scaledCell + scaledCell / 2 - el.clientWidth / 2;
      const cy = myToken.y * scaledCell + scaledCell / 2 - el.clientHeight / 2;
      el.scrollTo({ left: cx, top: cy, behavior: "instant" });
    } else {
      el.scrollTo({ left: 0, top: 0, behavior: "instant" });
    }
  }, [activeMapId]); // eslint-disable-line react-hooks/exhaustive-deps

  const getGridCell = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!canvasRef.current) return null;
      const rect = canvasRef.current.getBoundingClientRect();
      const sLeft = scrollRef.current?.scrollLeft ?? 0;
      const sTop = scrollRef.current?.scrollTop ?? 0;
      const px = e.clientX - rect.left + sLeft;
      const py = e.clientY - rect.top + sTop;
      return {
        x: Math.max(0, Math.min(gridCols - 1, Math.floor(px / scaledCell))),
        y: Math.max(0, Math.min(gridRows - 1, Math.floor(py / scaledCell))),
      };
    },
    [scaledCell, gridCols, gridRows],
  );

  // Token drag (own token only)
  const handleTokenMouseDown = useCallback(
    (e: React.MouseEvent, tokenId: string) => {
      if (e.button !== 0) return;
      const token = visibleTokens.find((t) => t.id === tokenId);
      if (!token || !token.isMe) return;

      // Can we move?
      const canMove = combat?.active
        ? isMyTurn && settings.canMoveOnTurn
        : settings.canMoveOutOfCombat;
      if (!canMove) return;

      e.stopPropagation();
      e.preventDefault();
      setTooltip(null);

      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const sLeft = scrollRef.current?.scrollLeft ?? 0;
      const sTop = scrollRef.current?.scrollTop ?? 0;

      dragRef.current = {
        tokenId,
        originX: token.x,
        originY: token.y,
        offsetX: e.clientX - rect.left + sLeft - token.x * scaledCell,
        offsetY: e.clientY - rect.top + sTop - token.y * scaledCell,
      };

      function onMove(ev: MouseEvent) {
        if (!dragRef.current || !canvasRef.current) return;
        const r = canvasRef.current.getBoundingClientRect();
        const sl = scrollRef.current?.scrollLeft ?? 0;
        const st = scrollRef.current?.scrollTop ?? 0;
        const gx = Math.max(0, Math.min(gridCols - 1, Math.round((ev.clientX - r.left + sl - dragRef.current.offsetX) / scaledCell)));
        const gy = Math.max(0, Math.min(gridRows - 1, Math.round((ev.clientY - r.top + st - dragRef.current.offsetY) / scaledCell)));
        setDragPos({ id: dragRef.current.tokenId, x: gx, y: gy });
      }

      function onUp() {
        if (dragRef.current && dragPos) {
          const dist = gridDistance(
            dragRef.current.originX,
            dragRef.current.originY,
            dragPos.x,
            dragPos.y,
            cellSizeFt,
          );
          moveMyToken(dragPos.x, dragPos.y);
          addMovementFt(dist);
        }
        dragRef.current = null;
        setDragPos(null);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [visibleTokens, combat, isMyTurn, settings, scaledCell, gridCols, gridRows, cellSizeFt, moveMyToken, addMovementFt, dragPos],
  );

  // NPC conversation
  const getTokenNpcId = useNPCStore((s) => s.getTokenNpcId);
  const npcStore = useNPCStore.getState;
  const getProfile = useNpcConversationStore((s) => s.getProfile);
  const startConversation = useNpcConversationStore((s) => s.startConversation);
  const openPlayerConversation = useNpcConversationStore((s) => s.openPlayerConversation);
  const playerName = usePlayerViewStore((s) => s.playerName);
  const characterId = usePlayerViewStore((s) => s.characterId);

  const handleTokenClick = useCallback(
    (token: typeof visibleTokens[0]) => {
      if (token.isMe) return;
      const npcId = getTokenNpcId(token.id);
      if (!npcId) return;
      const profile = getProfile(npcId);
      if (!profile) return;
      const npc = npcStore().npcs.find((n) => n.id === npcId);
      if (!npc) return;

      const convId = startConversation({
        npcId,
        npcName: npc.name,
        npcPortrait: npc.portrait,
        npcPortraitColor: npc.portraitColor,
        characterId: characterId ?? "p1",
        characterName: playerName || "Jogador",
      });
      openPlayerConversation(convId);
    },
    [getTokenNpcId, getProfile, startConversation, openPlayerConversation, npcStore, playerName, characterId],
  );

  // Hover tooltip
  const handleTokenEnter = useCallback((e: React.MouseEvent, token: typeof visibleTokens[0]) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setTooltip({ token, x: e.clientX, y: e.clientY });
    }, 400);
  }, []);

  const handleTokenLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setTooltip(null);
  }, []);

  return (
    <div
      ref={scrollRef}
      className="scrollbar-hidden relative flex-1 overflow-auto bg-[#0A0A0F]"
    >
      <div
        ref={canvasRef}
        className="relative"
        style={{ width: canvasW, height: canvasH }}
        onClick={() => setTooltip(null)}
      >
        {/* Grid */}
        {gridVisible && (
          <svg
            className="pointer-events-none absolute inset-0"
            width={canvasW}
            height={canvasH}
          >
            {Array.from({ length: gridCols + 1 }, (_, i) => (
              <line
                key={`v${i}`}
                x1={i * scaledCell}
                y1={0}
                x2={i * scaledCell}
                y2={canvasH}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
            ))}
            {Array.from({ length: gridRows + 1 }, (_, i) => (
              <line
                key={`h${i}`}
                x1={0}
                y1={i * scaledCell}
                x2={canvasW}
                y2={i * scaledCell}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
            ))}
          </svg>
        )}

        {/* Terrain */}
        <TerrainOverlay
          cells={terrainCells}
          scaledCell={scaledCell}
          gridCols={gridCols}
          gridRows={gridRows}
        />

        {/* AOE zones */}
        <AOEOverlay
          instances={aoeInstances}
          placing={null}
          scaledCell={scaledCell}
        />

        {/* Movement preview — show movement range when it's my turn */}
        {isMyTurn && myToken && settings.showMovementArea && (
          <MovementRange
            tokenX={dragPos?.id === myToken.id ? dragPos.x : myToken.x}
            tokenY={dragPos?.id === myToken.id ? dragPos.y : myToken.y}
            remainingFt={movementMaxFt - movementUsedFt}
            scaledCell={scaledCell}
            cellSizeFt={cellSizeFt}
            gridCols={gridCols}
            gridRows={gridRows}
          />
        )}

        {/* Tokens */}
        {visibleTokens.map((token) => {
          const isBeingDragged = dragPos?.id === token.id;
          const displayX = isBeingDragged ? dragPos.x : token.x;
          const displayY = isBeingDragged ? dragPos.y : token.y;
          const borderColor = getAlignmentColor(token.type);
          const isDead = token.hpDescription === "Morto";
          const tokenSizePx = token.size * scaledCell;

          return (
            <div
              key={token.id}
              className={`absolute flex flex-col items-center justify-center transition-all ${
                isBeingDragged ? "z-50 scale-110" : "z-10"
              } ${isDead ? "grayscale opacity-50" : ""}`}
              style={{
                left: displayX * scaledCell + 2,
                top: displayY * scaledCell + 2,
                width: tokenSizePx - 4,
                height: tokenSizePx - 4,
                borderRadius: "50%",
                border: `${token.isMe ? 3 : 2}px solid ${borderColor}`,
                backgroundColor: borderColor + "25",
                cursor: token.isMe ? "grab" : "default",
                boxShadow: token.isMe
                  ? `0 0 12px ${borderColor}40, inset 0 0 8px ${borderColor}20`
                  : undefined,
                ...(isBeingDragged ? { cursor: "grabbing" } : {}),
              }}
              onClick={() => handleTokenClick(token)}
              onMouseDown={(e) => handleTokenMouseDown(e, token.id)}
              onMouseEnter={(e) => handleTokenEnter(e, token)}
              onMouseLeave={handleTokenLeave}
            >
              {/* Token icon or initials */}
              <span
                className="text-[10px] font-bold leading-none"
                style={{ color: borderColor }}
              >
                {token.name.slice(0, 2).toUpperCase()}
              </span>

              {/* Name below token */}
              <div
                className="pointer-events-none absolute text-center"
                style={{
                  top: tokenSizePx - 4,
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  className={`rounded-sm px-1 text-[9px] leading-none ${
                    token.isMe ? "font-bold text-brand-text" : "text-brand-muted"
                  }`}
                  style={{ backgroundColor: "rgba(10,10,15,0.8)" }}
                >
                  {token.name}
                </span>
              </div>

              {/* HP bar — own token: exact, allies: bar, enemies: description-based */}
              {token.isMe && token.hp !== undefined && token.maxHp !== undefined && (
                <div
                  className="pointer-events-none absolute"
                  style={{
                    bottom: -2,
                    left: 2,
                    right: 2,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${getHpPercent(token.hp, token.maxHp)}%`,
                      backgroundColor: getHpColor(getHpPercent(token.hp, token.maxHp)),
                    }}
                  />
                </div>
              )}

              {/* Ally HP bar */}
              {!token.isMe && token.hpBarPercent !== undefined && (
                <div
                  className="pointer-events-none absolute"
                  style={{
                    bottom: -2,
                    left: 2,
                    right: 2,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${token.hpBarPercent}%`,
                      backgroundColor: getHpColor(token.hpBarPercent),
                    }}
                  />
                </div>
              )}

              {/* Enemy HP description badge */}
              {token.hpDescription && token.hpDescription !== "Ileso" && (
                <div
                  className="pointer-events-none absolute rounded-full px-1 py-0.5 text-[7px] font-bold"
                  style={{
                    bottom: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                    backgroundColor: "rgba(10,10,15,0.9)",
                    color: getHPDescriptionColor(token.hpDescription),
                    border: `1px solid ${getHPDescriptionColor(token.hpDescription)}30`,
                  }}
                >
                  {token.hpDescription}
                </div>
              )}

              {/* Conditions */}
              {token.conditions.length > 0 && (
                <div
                  className="pointer-events-none absolute flex gap-0.5"
                  style={{ top: -8, right: -4 }}
                >
                  {token.conditions.slice(0, 3).map((cond) => (
                    <div
                      key={cond}
                      className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-warning/20 text-[6px] font-bold text-brand-warning"
                      title={cond}
                    >
                      {cond[0].toUpperCase()}
                    </div>
                  ))}
                </div>
              )}

              {/* Current turn indicator */}
              {combat?.active &&
                combat.currentTurnTokenId === token.id && (
                  <div
                    className="pointer-events-none absolute"
                    style={{
                      inset: -6,
                      borderRadius: "50%",
                      border: "2px solid rgba(108, 92, 231, 0.6)",
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                )}
            </div>
          );
        })}

        {/* Markers */}
        <MarkersOverlay
          markers={useGameplayStore.getState().markers.filter(
            (m) => !m.gmOnly && !fogCells.has(`${m.x},${m.y}`),
          )}
          scaledCell={scaledCell}
        />

        {/* Damage floats */}
        <DamageFloatOverlay
          floats={damageFloats}
          tokens={visibleTokens.map((t) => ({
            id: t.id,
            x: t.x,
            y: t.y,
            size: t.size,
          }))}
          scaledCell={scaledCell}
        />

        {/* Fog of War — rendered on top */}
        <FogOverlay
          canvasW={canvasW}
          canvasH={canvasH}
          scaledCell={scaledCell}
          scrollLeft={scrollState.left}
          scrollTop={scrollState.top}
          viewportW={scrollState.w}
          viewportH={scrollState.h}
        />
      </div>

      {/* Token tooltip */}
      {tooltip && (
        <PlayerTokenTooltip
          token={tooltip.token}
          x={tooltip.x}
          y={tooltip.y}
        />
      )}

      {/* Movement ft badge */}
      {isMyTurn && combat?.active && settings.showMovementTracker && (
        <div className="absolute bottom-3 left-3 z-30 rounded-lg border border-brand-border bg-brand-surface/90 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-xs text-brand-muted">Movimento: </span>
          <span className="text-sm font-bold tabular-nums text-brand-text">
            {movementUsedFt}/{movementMaxFt}ft
          </span>
        </div>
      )}

      {/* "Go to my token" button */}
      {combat?.active && !isMyTurn && myToken && (
        <button
          onClick={() => {
            if (!myToken || !scrollRef.current) return;
            const el = scrollRef.current;
            el.scrollTo({
              left: myToken.x * scaledCell - el.clientWidth / 2,
              top: myToken.y * scaledCell - el.clientHeight / 2,
              behavior: "smooth",
            });
          }}
          className="absolute bottom-3 right-3 z-30 rounded-lg border border-brand-border bg-brand-surface/90 px-3 py-1.5 text-xs font-medium text-brand-accent backdrop-blur-sm transition-colors hover:bg-brand-surface"
        >
          Ir pro meu token
        </button>
      )}
    </div>
  );
}

// ── Movement range overlay ────────────────────────────────────

function MovementRange({
  tokenX,
  tokenY,
  remainingFt,
  scaledCell,
  cellSizeFt,
  gridCols,
  gridRows,
}: {
  tokenX: number;
  tokenY: number;
  remainingFt: number;
  scaledCell: number;
  cellSizeFt: number;
  gridCols: number;
  gridRows: number;
}) {
  const rangeCells = Math.floor(remainingFt / cellSizeFt);
  if (rangeCells <= 0) return null;

  const cells: { x: number; y: number }[] = [];
  for (let dx = -rangeCells; dx <= rangeCells; dx++) {
    for (let dy = -rangeCells; dy <= rangeCells; dy++) {
      const nx = tokenX + dx;
      const ny = tokenY + dy;
      if (nx < 0 || ny < 0 || nx >= gridCols || ny >= gridRows) continue;
      if (Math.max(Math.abs(dx), Math.abs(dy)) <= rangeCells) {
        cells.push({ x: nx, y: ny });
      }
    }
  }

  return (
    <>
      {cells.map(({ x, y }) => (
        <div
          key={`mv_${x}_${y}`}
          className="pointer-events-none absolute"
          style={{
            left: x * scaledCell,
            top: y * scaledCell,
            width: scaledCell,
            height: scaledCell,
            backgroundColor: "rgba(0, 184, 148, 0.08)",
            border: "1px solid rgba(0, 184, 148, 0.15)",
          }}
        />
      ))}
    </>
  );
}

// ── Player token tooltip ──────────────────────────────────────

function PlayerTokenTooltip({
  token,
  x,
  y,
}: {
  token: PlayerToken;
  x: number;
  y: number;
}) {
  return (
    <div
      className="pointer-events-none fixed z-[100] rounded-lg border border-brand-border bg-brand-surface px-3 py-2 shadow-lg"
      style={{ left: x + 12, top: y - 10 }}
    >
      <p className="text-xs font-semibold text-brand-text">{token.name}</p>

      {/* Own token: full info */}
      {token.isMe && token.hp !== undefined && (
        <div className="mt-1">
          <span className="text-[10px] text-brand-muted">
            HP: {token.hp}/{token.maxHp}
          </span>
          {token.ac && (
            <span className="ml-2 text-[10px] text-brand-muted">
              CA: {token.ac}
            </span>
          )}
        </div>
      )}

      {/* Ally: HP bar or numeric */}
      {!token.isMe && token.hp !== undefined && (
        <p className="mt-0.5 text-[10px] text-brand-muted">
          HP: {token.hp}/{token.maxHp}
        </p>
      )}

      {/* Enemy: description */}
      {token.hpDescription && (
        <p
          className="mt-0.5 text-[10px] font-medium"
          style={{ color: getHPDescriptionColor(token.hpDescription) }}
        >
          {token.hpDescription}
        </p>
      )}

      {/* Conditions */}
      {token.conditions.length > 0 && (
        <p className="mt-0.5 text-[10px] text-brand-warning">
          {token.conditions.join(", ")}
        </p>
      )}
    </div>
  );
}

import type { PlayerToken } from "@/lib/player-view-store";
