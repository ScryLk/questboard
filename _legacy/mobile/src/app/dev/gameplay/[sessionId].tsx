// ─────────────────────────────────────────────────────────────────────
// Rota `/dev/gameplay/[sessionId]` — acesso direto à gameplay mobile
// existente + sync BroadcastChannel com o GM do web-next.
//
// Fluxo:
//  - Renderiza o <GameplayScreen> do app group (bypassa `(app)/_layout`
//    que exige Clerk auth).
//  - Monta `useWebSync()` que escuta snapshots do GM via BroadcastChannel.
//
// ⚠ Pré-requisito pra sync funcionar: ambos (web-next e mobile via Expo
// Web) precisam rodar no **mesmo origin**. BroadcastChannel é bloqueado
// cross-origin pelo browser. Ver apps/mobile/src/lib/gameplay-sync/README.md
// pro setup de proxy reverso local.
// ─────────────────────────────────────────────────────────────────────

import { useWebSync } from "../../../lib/gameplay-sync/use-web-sync";
import GameplayScreen from "../../(app)/sessions/[sessionId]/gameplay";

export default function DevGameplayRoute() {
  useWebSync();
  return <GameplayScreen />;
}
