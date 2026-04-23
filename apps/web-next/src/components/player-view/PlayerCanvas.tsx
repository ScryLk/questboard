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
import { getHPDescriptionColor } from "@/lib/visibility-filter";
import { Map as MapIcon, UserX } from "lucide-react";
import { FogOverlay } from "../gameplay/map-canvas/overlays/fog-overlay";
import { TerrainOverlay } from "../gameplay/map-canvas/overlays/terrain-overlay";
import { AOEOverlay } from "../gameplay/map-canvas/overlays/aoe-overlay";
import { MarkersOverlay } from "../gameplay/map-canvas/overlays/markers-overlay";
import { DamageFloatOverlay } from "../gameplay/map-canvas/overlays/damage-float-overlay";
import { EmptyState } from "../shared/empty-state";
import { ScaleBar } from "../gameplay/map-overlays/ScaleBar";
import { VisionOverlay } from "./VisionOverlay";
import { PlayerZoomControls } from "./PlayerZoomControls";
import { PlayerToolToggle } from "./PlayerToolToggle";
import { useRadialMenuStore } from "@/lib/radial-menu-store";

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
  const activeMapName = usePlayerViewStore((s) => s.activeMapName);

  // Read fog/terrain/aoe from GM store (shared state)
  const fogCells = useGameplayStore((s) => s.fogCells);
  const terrainCells = useGameplayStore((s) => s.terrainCells);
  const aoeInstances = useGameplayStore((s) => s.aoeInstances);
  const damageFloats = useGameplayStore((s) => s.damageFloats);
  const gridVisible = useGameplayStore((s) => s.gridVisible);

  const { gridCols, gridRows, cellSize, cellSizeFt } = MOCK_MAP;
  const playerZoom = usePlayerViewStore((s) => s.playerZoom);
  const canvasTool = usePlayerViewStore((s) => s.canvasTool);
  const scaledCell = cellSize * playerZoom;
  const canvasW = gridCols * scaledCell;
  const canvasH = gridRows * scaledCell;

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

  // Wheel zoom no player canvas — Ctrl+wheel (comum em editores) evita
  // conflito com scroll padrão. Throttle simples via lastTrigger.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let lastTrigger = 0;
    const onWheel = (e: WheelEvent) => {
      const store = usePlayerViewStore.getState();
      const isPanTool = store.canvasTool === "pan";
      const modifier = e.ctrlKey || e.metaKey;
      // Pan tool: wheel zooma sem modifier. Action tool: precisa Ctrl/Cmd
      // (mantém wheel padrão pra scrollar).
      if (!isPanTool && !modifier) return;
      e.preventDefault();
      const now = performance.now();
      if (now - lastTrigger < 180) return;
      lastTrigger = now;
      if (e.deltaY < 0) store.playerZoomIn();
      else store.playerZoomOut();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Drag-to-pan no modo mão — ignora clique em token (dragRef já trata
  // isso no seu próprio listener). Cursor vira `grabbing` enquanto arrasta.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let panning: { startX: number; startY: number; scrollLeft: number; scrollTop: number } | null = null;

    const onDown = (e: MouseEvent) => {
      const store = usePlayerViewStore.getState();
      if (store.canvasTool !== "pan") return;
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-token-id]") || target.closest("button")) return;
      panning = {
        startX: e.clientX,
        startY: e.clientY,
        scrollLeft: el.scrollLeft,
        scrollTop: el.scrollTop,
      };
      el.style.cursor = "grabbing";
      e.preventDefault();
    };
    const onMove = (e: MouseEvent) => {
      if (!panning) return;
      el.scrollLeft = panning.scrollLeft - (e.clientX - panning.startX);
      el.scrollTop = panning.scrollTop - (e.clientY - panning.startY);
    };
    const onUp = () => {
      if (!panning) return;
      panning = null;
      el.style.cursor = "";
    };

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Cursor reflete a ferramenta atual
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.style.cursor = canvasTool === "pan" ? "grab" : "";
  }, [canvasTool]);

  // Centraliza a câmera no próprio token. Usado no mount e pelo botão
  // "Focar em mim" + atalho F.
  const focusSelf = useCallback(() => {
    if (!myToken || !scrollRef.current) return;
    const el = scrollRef.current;
    el.scrollTo({
      left: myToken.x * scaledCell + scaledCell / 2 - el.clientWidth / 2,
      top: myToken.y * scaledCell + scaledCell / 2 - el.clientHeight / 2,
      behavior: "smooth",
    });
  }, [myToken, scaledCell]);

  // Center on my token on mount + quando token se move (GM move via sync).
  useEffect(() => {
    focusSelf();
  }, [myToken?.x, myToken?.y]); // eslint-disable-line react-hooks/exhaustive-deps

  // Também foca quando o botão "Foco" da actions bar pede (via counter).
  const focusSelfTick = usePlayerViewStore((s) => s.focusSelfTick);
  useEffect(() => {
    if (focusSelfTick === 0) return;
    focusSelf();
  }, [focusSelfTick]); // eslint-disable-line react-hooks/exhaustive-deps

  // Preserva o centro do viewport ao mudar zoom — evita "pulo" da câmera.
  const prevZoomRef = useRef(playerZoom);
  useEffect(() => {
    const el = scrollRef.current;
    const prev = prevZoomRef.current;
    if (!el || prev === playerZoom) return;
    const factor = playerZoom / prev;
    const centerX = el.scrollLeft + el.clientWidth / 2;
    const centerY = el.scrollTop + el.clientHeight / 2;
    el.scrollLeft = centerX * factor - el.clientWidth / 2;
    el.scrollTop = centerY * factor - el.clientHeight / 2;
    prevZoomRef.current = playerZoom;
  }, [playerZoom]);

  // Movimento com aprovação do GM — click em célula stageia, barra de
  // confirmação aparece. Drag legado continua funcionando pra testes.
  const stagedMove = usePlayerViewStore((s) => s.stagedMove);
  const stageMove = usePlayerViewStore((s) => s.stageMove);

  // Atalho F — focar câmera no próprio token.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignora se foco em input/textarea pra não atrapalhar chat.
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      )
        return;
      if ((e.key === "f" || e.key === "F") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        focusSelf();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusSelf]);

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

  // Token drag (own token only) — desabilitado em modo "pan"
  const handleTokenMouseDown = useCallback(
    (e: React.MouseEvent, tokenId: string) => {
      if (e.button !== 0) return;
      if (canvasTool === "pan") return; // pan consome o drag
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
    [visibleTokens, combat, isMyTurn, settings, scaledCell, gridCols, gridRows, cellSizeFt, moveMyToken, addMovementFt, dragPos, canvasTool],
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

  // Short tap em token abre o RadialMenu. Pan mode ignora.
  // TODO(prompt-2): `actions` aqui virá de uma fn real que consulta
  // regras (alcance, turno, role). Por ora é stub.
  const setTargetTokenId = usePlayerViewStore((s) => s.setTargetTokenId);
  const setActiveTab = usePlayerViewStore((s) => s.setActiveTab);
  const setPanelVisible = usePlayerViewStore((s) => s.setPanelVisible);

  const openRadialAtToken = useCallback(
    (clientX: number, clientY: number, token: typeof visibleTokens[0]) => {
      if (canvasTool === "pan") return;
      const dist =
        myToken && myToken.id !== token.id
          ? gridDistance(myToken.x, myToken.y, token.x, token.y, cellSizeFt) /
            cellSizeFt
          : undefined;
      useRadialMenuStore.getState().openAt({
        source: "player",
        screenX: clientX,
        screenY: clientY,
        target: {
          tokenId: token.id,
          namePt: token.name,
          hpText:
            token.hp !== undefined && token.maxHp !== undefined
              ? `HP ${token.hp}/${token.maxHp}`
              : token.hpDescription,
          distanceCells:
            dist !== undefined ? Math.round(dist) : undefined,
        },
        actions: [
          {
            id: "attack",
            labelPt: "Atacar",
            enabled: !token.isMe,
            disabledReasonPt: token.isMe ? "Não dá pra atacar a si mesmo" : undefined,
          },
          {
            id: "converse",
            labelPt: "Conversar",
            enabled: (dist ?? 99) <= 6,
            disabledReasonPt: (dist ?? 99) > 6 ? "Muito longe" : undefined,
          },
          { id: "test", labelPt: "Teste", enabled: true },
          {
            id: "move_to",
            labelPt: "Mover até",
            enabled: !token.isMe,
            disabledReasonPt: token.isMe ? "Você já está aqui" : undefined,
          },
          { id: "inspect", labelPt: "Inspecionar", enabled: true },
        ],
      });

      // Abre a aba "Ficha" em modo alvo (sub-toggle aparece dentro da
      // aba quando targetTokenId é setado).
      setTargetTokenId(token.id);
      setActiveTab("ficha");
      setPanelVisible(true);
    },
    [canvasTool, myToken, cellSizeFt, setTargetTokenId, setActiveTab, setPanelVisible],
  );

  return (
    <div
      ref={scrollRef}
      className="scrollbar-hidden relative flex-1 overflow-auto bg-[#0A0A0F]"
    >
      <div
        ref={canvasRef}
        className="relative"
        style={{ width: canvasW, height: canvasH }}
        onClick={(e) => {
          setTooltip(null);
          // Click-to-stage só no modo "action" — no modo "pan" o clique
          // é consumido pelo drag-to-pan e não deve stagear movimento.
          if (canvasTool !== "action") return;
          // Click-to-stage: se o player tem token e clicou num alvo que
          // não é o próprio token nem está arrastando, stageia o
          // movimento pra aprovação do GM.
          if (!myToken || dragRef.current) return;
          // Ignora clique em botões/UI filhos
          const target = e.target as HTMLElement;
          if (target.closest("[data-token-id]") || target.closest("button"))
            return;
          const cell = getGridCell(e);
          if (!cell) return;
          // Ignora se clicou no próprio token
          if (cell.x === myToken.x && cell.y === myToken.y) return;
          // Se já há um pedido aguardando GM, não sobrescreve.
          if (stagedMove?.awaitingGM) return;
          stageMove(cell.x, cell.y);
        }}
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

        {/* Preview de movimento pendente (aguardando confirmação/GM) */}
        {stagedMove && (
          <div
            className="pointer-events-none absolute"
            style={{
              left: stagedMove.toX * scaledCell,
              top: stagedMove.toY * scaledCell,
              width: scaledCell,
              height: scaledCell,
            }}
          >
            <div
              className={`h-full w-full rounded-md border-2 border-dashed ${
                stagedMove.awaitingGM
                  ? "border-brand-warning bg-brand-warning/10"
                  : "border-brand-accent bg-brand-accent/15"
              }`}
              style={{
                animation: "qb-move-pulse 1.4s ease-in-out infinite",
              }}
            />
            <style jsx>{`
              @keyframes qb-move-pulse {
                0%, 100% { opacity: 0.85; }
                50% { opacity: 0.55; }
              }
            `}</style>
          </div>
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
              data-token-id={token.id}
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
              onMouseDown={(e) => {
                // Long-press inicia drag do próprio token (comportamento
                // existente). Short tap dispara o radial — detectado via
                // timeout local pra não precisar refatorar o handler.
                const x = e.clientX;
                const y = e.clientY;
                const startTime = Date.now();
                handleTokenMouseDown(e, token.id);
                // Marca esse click pra avaliar ao soltar
                const onUp = (ev: MouseEvent) => {
                  const dx = Math.abs(ev.clientX - x);
                  const dy = Math.abs(ev.clientY - y);
                  const duration = Date.now() - startTime;
                  window.removeEventListener("mouseup", onUp, true);
                  // Short tap: <300ms + <8px de movimento → abre radial
                  if (duration < 300 && dx < 8 && dy < 8) {
                    openRadialAtToken(ev.clientX, ev.clientY, token);
                  }
                };
                window.addEventListener("mouseup", onUp, true);
              }}
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

        {/* Vision overlay — escurece células fora do alcance do player.
            Fica DEPOIS do fog pra somar sem conflito. */}
        {myToken && (
          <VisionOverlay
            tokenX={myToken.x}
            tokenY={myToken.y}
            gridCols={gridCols}
            gridRows={gridRows}
            cellSize={scaledCell}
          />
        )}
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

      {/* Foco agora vive na PlayerActionsBar (botão "Foco" + atalho F). */}

      {/* Overlay: sem personagem atribuído — fixed cobre a tela inteira
          (inclusive o painel direito), mantém pointer-events-none pra
          não bloquear interação com chat/tabs através do blur. */}
      {!myToken && (
        <div className="pointer-events-none fixed inset-0 z-[45] flex items-center justify-center bg-[#0A0A0F]/60 backdrop-blur-[3px]">
          <div className="pointer-events-auto w-full max-w-md rounded-xl border border-brand-border bg-brand-surface/95 p-6 shadow-2xl">
            <EmptyState
              icon={UserX}
              title="Sem personagem atribuído"
              description={
                <>
                  O mestre ainda não te conectou a um personagem. Aguarde —
                  enquanto isso você pode assistir e usar o chat.
                </>
              }
            />
          </div>
        </div>
      )}

      {/* Overlay: sem mapa ativo — fullscreen, pointer-events-none no
          backdrop pra manter chat/tabs clicáveis. */}
      {myToken && !activeMapName && (
        <div className="pointer-events-none fixed inset-0 z-[45] flex items-center justify-center bg-[#0A0A0F]/60 backdrop-blur-[3px]">
          <div className="pointer-events-auto w-full max-w-md rounded-xl border border-brand-border bg-brand-surface/95 p-6 shadow-2xl">
            <EmptyState
              icon={MapIcon}
              title="Sem mapa ativo"
              description={
                <>
                  O mestre ainda não escolheu um mapa. Você verá o mapa
                  aqui assim que uma cena for ativada.
                </>
              }
              tone="accent"
            />
          </div>
        </div>
      )}

      {/* Barra de escala + toggle de ferramenta + controles de zoom */}
      <ScaleBar zoomOverride={playerZoom} />
      <PlayerToolToggle />
      <PlayerZoomControls />
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
