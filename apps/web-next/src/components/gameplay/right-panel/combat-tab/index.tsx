"use client";

import { useCallback, useMemo } from "react";
import { useCombatState } from "@/hooks/use-combat-state";
import { useCombatActions, isCombatMockMode } from "@/hooks/use-combat-actions";
import { useCombatMockProvider } from "@/hooks/use-combat-mock-provider";
import { useGameplayStore } from "@/lib/gameplay-store";
import { CombatEmptyState } from "./combat-empty-state";
import { CombatActiveView } from "./combat-active-view";

// Sessão real virá da rota; no mock, usamos um id fixo só para atender o
// contrato dos intents.
const MOCK_SESSION_ID = "mock-session";

export function CombatTab() {
  useCombatMockProvider();
  const combat = useCombatState();
  const mock = isCombatMockMode();

  // TODO(backend-combat): trocar MOCK_SESSION_ID pelo sessionId real vindo
  // de useParams() quando o backend de combat estiver online.
  const sessionId = combat?.sessionId ?? MOCK_SESSION_ID;
  const actions = useCombatActions(sessionId);

  // Selector retorna a referência estável de `tokens`; derivação em useMemo
  // pra não quebrar o getSnapshot do useSyncExternalStore (filter+map criam
  // array novo a cada call, o que loopa infinitamente).
  const tokens = useGameplayStore((s) => s.tokens);
  const visibleTokenIds = useMemo(
    () => tokens.filter((t) => t.onMap).map((t) => t.id),
    [tokens],
  );

  const startEmpty = useCallback(() => actions.start([]), [actions]);
  const startWithVisible = useCallback(
    () => actions.start(visibleTokenIds),
    [actions, visibleTokenIds],
  );

  return (
    <div className="relative h-full">
      {combat?.isActive ? (
        <CombatActiveView combat={combat} mock={mock} />
      ) : (
        <CombatEmptyState
          onStartWithVisibleTokens={startWithVisible}
          onStartEmpty={startEmpty}
          visibleTokensCount={visibleTokenIds.length}
          mock={mock}
        />
      )}
    </div>
  );
}
