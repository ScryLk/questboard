"use client";

import { Target, ExternalLink } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import {
  MOCK_PLAYERS,
  getAlignmentColor,
} from "@/lib/gameplay-mock-data";
import type { GameToken } from "@/lib/gameplay-mock-data";
import { HealthBlock } from "./blocks/health-block";
import { DefenseBlock } from "./blocks/defense-block";
import { ConditionsBlock } from "./blocks/conditions-block";
import { AttacksBlock } from "./blocks/attacks-block";
import { MapBlock } from "./blocks/map-block";
import { NotesBlock } from "./blocks/notes-block";

/**
 * Painel "Alvo" (antes "Ficha") — HUD do token selecionado, sistema-agnóstico.
 *
 * Mostra 6 blocos colapsíveis (Vida, Defesa, Condições, Ataques, Mapa, Notas).
 * O bloco de Ataques é um slot que vai receber componente por sistema quando
 * houver `campaign.gameSystem` (ver prompt multi-sistema, PRs #3-#6).
 *
 * Reaproveita:
 *  - `selectedTokenIds` do gameplayStore (mesmo do menu contextual)
 *  - `MOCK_PLAYERS` pra mapear token → jogador dono
 *  - `HPBar` existente
 *  - `centerOnCell` do cameraStore pra Focar Câmera
 *  - `characterSheet` modal pra "Ver ficha completa"
 */
export function TargetPanel() {
  const selectedTokenIds = useGameplayStore((s) => s.selectedTokenIds);
  const tokens = useGameplayStore((s) => s.tokens);
  const currentUserIsGM = useGameplayStore((s) => s.currentUserIsGM);
  const currentUserId = useGameplayStore((s) => s.currentUserId);
  const setCharacterSheetTarget = useGameplayStore(
    (s) => s.setCharacterSheetTarget,
  );
  const openModal = useGameplayStore((s) => s.openModal);

  const token: GameToken | undefined =
    selectedTokenIds.length > 0
      ? tokens.find((t) => t.id === selectedTokenIds[0])
      : undefined;

  if (!token) return <EmptyState />;

  const player = token.playerId
    ? MOCK_PLAYERS.find((p) => p.id === token.playerId)
    : undefined;
  const isNpc = !token.playerId;
  const isMyPc =
    !isNpc && !!currentUserId && token.playerId === currentUserId;
  const typeLabel = isNpc ? "NPC" : isMyPc ? "Você" : "Jogador";
  const alignmentLabel =
    token.alignment === "hostile"
      ? "Hostil"
      : token.alignment === "ally"
        ? "Aliado"
        : "Neutro";

  // Permissões (mesma lógica da matriz do menu contextual):
  //  - GM edita qualquer token; dono edita o próprio.
  const canEditHp = currentUserIsGM || isMyPc;
  const canEditConditions = currentUserIsGM || isMyPc;
  const showGmNotes = currentUserIsGM && !isMyPc;

  const borderColor = getAlignmentColor(token.alignment);

  function openFullSheet() {
    setCharacterSheetTarget(token!.id);
    openModal("characterSheet");
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header — avatar + nome + tipo/índole */}
      <div className="flex items-center gap-3 border-b border-brand-border p-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
          style={{
            backgroundColor: borderColor + "20",
            color: borderColor,
          }}
        >
          {player?.avatarInitials ?? token.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-brand-text">
            {token.name}
          </p>
          <p className="text-[11px] text-brand-muted">
            {typeLabel} · {alignmentLabel}
            {player && ` · ${player.class} Nv. ${player.level}`}
          </p>
          {/* Dica de atribuição — só GM vendo NPC sem dono. */}
          {currentUserIsGM && isNpc && (
            <p className="mt-0.5 text-[10px] text-brand-muted/60">
              Clique direito no token → <span className="text-brand-accent/70">Atribuir a jogador</span>
            </p>
          )}
        </div>
      </div>

      {/* Blocos */}
      <HealthBlock token={token} canEditHp={canEditHp} />
      <DefenseBlock token={token} />
      <ConditionsBlock token={token} canEdit={canEditConditions} />
      <AttacksBlock />
      <MapBlock token={token} />
      {showGmNotes && <NotesBlock token={token} />}

      {/* CTA ficha completa — sempre disponível.
          Hoje abre o modal existente (character-sheet-modal.tsx); quando
          houver suporte multi-sistema, a ficha completa D&D/CoC entra no
          lugar. */}
      <div className="mt-auto border-t border-brand-border p-3">
        <button
          onClick={openFullSheet}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-brand-border py-2 text-xs font-medium text-brand-muted transition-colors hover:border-brand-accent/40 hover:bg-brand-accent/5 hover:text-brand-text"
        >
          <ExternalLink className="h-3 w-3" />
          Ver ficha completa
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <Target className="mb-3 h-10 w-10 text-brand-border" />
      <p className="text-sm font-medium text-brand-muted">
        Nenhum alvo selecionado
      </p>
      <p className="mt-1 text-[11px] text-brand-muted/60">
        Clique em um token no mapa para ver suas informações aqui.
      </p>
    </div>
  );
}
