"use client";

// Hook do badge "MOCK" e flag pra UI. NÃO popula combate automaticamente
// — a partir desta versão, o `start()` da combat-actions é quem constrói
// o combate localmente quando em mock mode (a partir dos tokens reais
// da gameplay store). Isso preserva o fluxo de empty-state → iniciar.

import { isCombatMockMode } from "./use-combat-actions";

export function useCombatMockProvider(): boolean {
  return isCombatMockMode();
}
