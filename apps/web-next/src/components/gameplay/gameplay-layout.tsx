"use client";

import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { MOCK_SESSION } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import { GameplayToolbar } from "./toolbar/gameplay-toolbar";
import { AoeShapePicker } from "./toolbar/aoe-shape-picker";
import { DrawToolPicker } from "./toolbar/draw-tool-picker";
import { FogToolPicker } from "./toolbar/fog-tool-picker";
import { TerrainToolPicker } from "./toolbar/terrain-tool-picker";
import { WallToolPicker } from "./toolbar/wall-tool-picker";
import { ObjectToolPicker } from "./toolbar/object-tool-picker";
import { GridAlignmentPanel } from "./toolbar/grid-alignment-panel";
import { VisionPanel } from "./toolbar/vision-panel";
import { LeftPanel } from "./left-panel/left-panel";
import { RightPanel } from "./right-panel/right-panel";
import { MapCanvas } from "./map-canvas/map-canvas";
import { GameplayMapPicker } from "./gameplay-map-picker";
import { CombatTurnHUD } from "./combat-turn-hud";
import { ScaleBar } from "./map-overlays/ScaleBar";
import { ZoomControls } from "./map-overlays/ZoomControls";
import { ResizableDivider } from "./shared/resizable-divider";
import { GameplayModals } from "./modals/gameplay-modals";
import { ActionBar } from "./action-bar/action-bar";
import { GameTooltip } from "@/components/ui/game-tooltip";
import { OAAlertVignette } from "./effects/oa-alert-vignette";
import { PhaseModal } from "./PhaseModal";
import { SceneCardIndicator } from "./toolbar/scene-card-indicator";
import { AIGenerationPanel } from "./ai-generation-panel";
import { SFXProvider } from "./audio/sfx-provider";
import { DevIdentityBadge } from "./dev-identity-badge";
import { ActionFeedPanel } from "./action-feed/action-feed-panel";
import { DiceCentralReveal } from "@/components/dice/DiceCentralReveal";
import { MoveApprovalDialog } from "./move-approval-dialog";
import { RadialMenu } from "@/components/shared/radial-menu";
import { useRadialMenuStore } from "@/lib/radial-menu-store";
import { useIdentityFromUrl } from "@/lib/gameplay-sync/use-identity-from-url";
import { useGameplayBroadcastSync } from "@/lib/gameplay-sync/use-gameplay-broadcast-sync";
import { AttackFlowModal } from "@/components/gameplay/combat/attack-flow-modal";
import { useAttackStore } from "@/lib/attack-store";
import { NpcConversationModal } from "./modals/npc-conversation-modal";
import { useNpcConversationStore } from "@/lib/npc-conversation-store";
import { useCharacterStore } from "@/stores/characterStore";
import { MediaBroadcastModal } from "./modals/media-broadcast-modal";
import { MediaBroadcastOverlay } from "./media-broadcast-overlay";
import { useMediaBroadcastDevSync } from "@/lib/media-broadcast-dev-sync";
import { useMediaSocketBridge } from "@/lib/media-socket-bridge";
import { useParams } from "next/navigation";


export function GameplayLayout() {
  // Identidade vem da URL (?as=gm|player1|player2) antes do sync ligar.
  useIdentityFromUrl();
  // BroadcastChannel: GM emite snapshots; player receberia — a página
  // principal de gameplay geralmente é GM, mas se alguém abrir essa rota
  // com ?as=player1, o hook respeita e vira listener (dev only).
  useGameplayBroadcastSync();
  useMediaBroadcastDevSync();

  // Backend wiring: usamos sessionId da URL pra REST + socket. Quando
  // ausente (rotas de teste), cai no modo local (dev offline).
  const routeParams = useParams<{ sessionId?: string }>();
  const sessionId = routeParams?.sessionId ?? null;
  useMediaSocketBridge(sessionId);

  const leftPanelOpen = useGameplayStore((s) => s.leftPanelOpen);
  const rightPanelOpen = useGameplayStore((s) => s.rightPanelOpen);
  const leftPanelWidth = useGameplayStore((s) => s.leftPanelWidth);
  const rightPanelWidth = useGameplayStore((s) => s.rightPanelWidth);
  const toggleLeftPanel = useGameplayStore((s) => s.toggleLeftPanel);
  const toggleRightPanel = useGameplayStore((s) => s.toggleRightPanel);
  const setLeftPanelWidth = useGameplayStore((s) => s.setLeftPanelWidth);
  const setRightPanelWidth = useGameplayStore((s) => s.setRightPanelWidth);
  const pendingReaction = useGameplayStore((s) => s.pendingReaction);
  const currentUserIsGM = useGameplayStore((s) => s.currentUserIsGM);

  return (
    <SFXProvider>
    <div
      className="bg-[#0A0A0F]"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <div style={{ flexShrink: 0 }}>
        <GameplayToolbar session={MOCK_SESSION} />
      </div>

      {/* Scene card active indicator */}
      <SceneCardIndicator />

      {/* Floating pickers — at root level so overflow:hidden doesn't clip them */}
      <AoeShapePicker />
      <DrawToolPicker />
      <FogToolPicker />
      <TerrainToolPicker />
      <WallToolPicker />
      <ObjectToolPicker />
      <GridAlignmentPanel />
      <VisionPanel />

      {/* Main content: 3-panel layout */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* Left panel */}
        {leftPanelOpen && (
          <aside
            className="border-r border-brand-border bg-[#111116]"
            style={{
              width: leftPanelWidth,
              minWidth: 200,
              maxWidth: 300,
              flexShrink: 0,
              overflowX: "hidden",
              overflowY: "auto",
            }}
          >
            <LeftPanel />
          </aside>
        )}

        {/* Left collapse toggle */}
        <GameTooltip label={leftPanelOpen ? "Recolher" : "Expandir"} side="right">
          <button
            onClick={toggleLeftPanel}
            className="flex items-center justify-center border-r border-brand-border bg-[#0D0D12] text-brand-muted transition-colors hover:bg-white/[0.03] hover:text-brand-text"
            style={{ width: 20, flexShrink: 0 }}
          >
            {leftPanelOpen ? (
              <PanelLeftClose className="h-3.5 w-3.5" />
            ) : (
              <PanelLeftOpen className="h-3.5 w-3.5" />
            )}
          </button>
        </GameTooltip>

        {/* Left resizable divider */}
        {leftPanelOpen && (
          <ResizableDivider side="left" onResize={setLeftPanelWidth} minWidth={200} maxWidth={300} />
        )}

        {/* Central canvas */}
        <div className="relative flex flex-1" style={{ minWidth: 0 }}>
          <MapCanvas />
          <div className="pointer-events-none absolute left-3 top-3 z-40">
            <GameplayMapPicker />
          </div>
          {/* HUD de combate — topo-centro, sempre visível pro GM */}
          {currentUserIsGM && (
            <div className="pointer-events-none absolute left-1/2 top-3 z-40 -translate-x-1/2">
              <CombatTurnHUD />
            </div>
          )}
          <ScaleBar />
          <ZoomControls />
        </div>

        {/* Right resizable divider */}
        {rightPanelOpen && (
          <ResizableDivider side="right" onResize={setRightPanelWidth} minWidth={260} maxWidth={400} />
        )}

        {/* Right collapse toggle */}
        <GameTooltip label={rightPanelOpen ? "Recolher" : "Expandir"} side="left">
          <button
            onClick={toggleRightPanel}
            className="flex items-center justify-center border-l border-brand-border bg-[#0D0D12] text-brand-muted transition-colors hover:bg-white/[0.03] hover:text-brand-text"
            style={{ width: 20, flexShrink: 0 }}
          >
            {rightPanelOpen ? (
              <PanelRightClose className="h-3.5 w-3.5" />
            ) : (
              <PanelRightOpen className="h-3.5 w-3.5" />
            )}
          </button>
        </GameTooltip>

        {/* Right panel */}
        {rightPanelOpen && (
          <aside
            className="border-l border-brand-border"
            style={{
              width: rightPanelWidth,
              minWidth: 260,
              maxWidth: 400,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <RightPanel />
          </aside>
        )}

        {/* Feed de ações — só GM/CO_GM vê (prompt seção 2 + matriz §6). */}
        {currentUserIsGM && <ActionFeedPanel />}
      </div>

      {/* Action Bar — combat turn controls */}
      <ActionBar />

      {/* Modals */}
      <GameplayModals />

      {/* Phase side panel */}
      <PhaseModal />

      {/* AI Generation Panel */}
      <AIGenerationPanel />

      {/* Dice central reveal — overlay de nat20/nat1 */}
      <DiceCentralReveal />

      {/* Aprovação de movimento do jogador */}
      <MoveApprovalDialog />

      {/* Radial menu — short tap em token. */}
      <RadialMenu
        onSelect={(id) => {
          const target = useRadialMenuStore.getState().target;
          if (!target) return;
          const gp = useGameplayStore.getState();

          // Garante que o alvo está selecionado (target-panel lê do selecionado).
          gp.selectToken(target.tokenId);

          // Abre o painel direito se estiver fechado — ações todas moram lá.
          if (!gp.rightPanelOpen) gp.toggleRightPanel();

          switch (id) {
            case "attack": {
              // Atacante: turno atual (se combate ativo), senão token
              // selecionado pelo GM, senão o próprio alvo (auto-ataque
              // — válido em mock/teste; servidor pode bloquear depois).
              const currentTurnTokenId = gp.combat.active
                ? gp.combat.order[gp.combat.turnIndex]?.tokenId
                : null;
              const attackerId =
                currentTurnTokenId ??
                gp.selectedTokenIds[0] ??
                target.tokenId;
              useAttackStore.getState().openModal({
                attackerTokenId: attackerId,
                targetTokenIds: [target.tokenId],
              });
              return;
            }
            case "inspect":
              gp.setRightTab("sheet");
              break;
            case "converse": {
              // Resolve o NPC associado ao token e abre o modal scripted.
              // Modos AI/HYBRID virão quando o backend Gemini subir.
              const charStore = useCharacterStore.getState();
              const npcId = charStore.getTokenCharacterId(target.tokenId);
              const npc = npcId
                ? charStore.characters.find((c) => c.id === npcId)
                : null;
              if (!npc) {
                // Sem personagem vinculado — fallback no chat.
                gp.setRightTab("chat");
                break;
              }
              useNpcConversationStore
                .getState()
                .open(npc.id, npc.dialogueGreeting);
              break;
            }
            case "test":
              // Rolagem livre com contexto do alvo no campo `context`.
              gp.setRightTab("dice");
              break;
            case "move_to":
              // GM planeja caminho DESTE token (click subsequente no mapa
              // define o destino). Funciona porque GM bypassa colisão.
              gp.enterPathPlanning(target.tokenId);
              break;
          }
        }}
      />

      {/* OA dramatic vignette */}
      <OAAlertVignette active={pendingReaction !== null} />

      {/* Modal de ataque — escuta useAttackStore */}
      <AttackFlowModal />

      {/* Modal de conversa scripted com NPC — escuta useNpcConversationStore */}
      <NpcConversationModal />

      {/* Broadcast de vídeo — overlay aparece pra todos; modal só GM.
          sessionId vem da rota /gameplay/[sessionId]; null cai em modo
          local (BroadcastChannel) pra dev offline. */}
      <MediaBroadcastModal sessionId={sessionId} />
      <MediaBroadcastOverlay />

      {/* Badge de identidade dev (apenas NODE_ENV=development) */}
      <DevIdentityBadge />
    </div>
    </SFXProvider>
  );
}
