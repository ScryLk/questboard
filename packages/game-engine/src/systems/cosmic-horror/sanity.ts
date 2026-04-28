// ── Sistema de Sanidade ──
//
// Mecânica central do horror investigativo. Diferente do D&D, o
// estado mental do personagem é trackeable e degrada ao longo do
// tempo via exposição ao Mythos. Quatro estados: SANE → TEMPORARY
// → INDEFINITE → PERMANENT.
//
// Mythos Knowledge é uma skill especial: cada ponto reduz o teto de
// SAN máxima (`startingMax - mythosKnowledge`).

export type MadnessState = "SANE" | "TEMPORARY" | "INDEFINITE" | "PERMANENT";

export interface SanityState {
  current: number;
  max: number;
  startingMax: number;
  mythosKnowledge: number;
  madness: MadnessState;
}

/** Limite teto de SAN: 99 - mythosKnowledge, capped pelo startingMax. */
export function effectiveMaxSanity(
  startingMax: number,
  mythosKnowledge: number,
): number {
  const ceiling = Math.max(0, 99 - mythosKnowledge);
  return Math.min(startingMax, ceiling);
}

export interface SanityLossOutcome {
  /** Quantidade efetivamente perdida (0 quando passou no teste). */
  lost: number;
  /** SAN nova depois da perda. */
  nextCurrent: number;
  /** Próximo estado de loucura. */
  nextMadness: MadnessState;
  /** Eventos de loucura disparados nessa perda. */
  triggers: {
    /** Perdeu ≥5 SAN numa exposição → bouts of madness (TEMPORARY). */
    bout: boolean;
    /** Perdeu ≥1/5 da SAN máxima em 24h → loucura indefinida. */
    indefinite: boolean;
    /** SAN chegou a 0 → loucura permanente. */
    permanent: boolean;
  };
}

/** Aplica perda de SAN. `passed` indica se o teste de Sanidade foi
 *  bem sucedido — se sim, perda menor; se não, perda maior. Caller
 *  resolve a notação ("1/1d6") e passa só o número final. */
export function applySanityLoss(
  state: SanityState,
  loss: number,
  options: { lossLast24h?: number } = {},
): SanityLossOutcome {
  const lossLast24h = options.lossLast24h ?? 0;
  const lostInOneScene = Math.max(0, loss);
  const nextCurrent = Math.max(0, state.current - lostInOneScene);

  const bout = lostInOneScene >= 5;
  const indefinite =
    state.startingMax > 0 &&
    lossLast24h + lostInOneScene >= Math.floor(state.startingMax / 5);
  const permanent = nextCurrent === 0;

  let nextMadness: MadnessState = state.madness;
  if (permanent) {
    nextMadness = "PERMANENT";
  } else if (
    indefinite &&
    state.madness !== "PERMANENT" &&
    state.madness !== "INDEFINITE"
  ) {
    nextMadness = "INDEFINITE";
  } else if (
    bout &&
    state.madness === "SANE"
  ) {
    nextMadness = "TEMPORARY";
  }

  return {
    lost: lostInOneScene,
    nextCurrent,
    nextMadness,
    triggers: { bout, indefinite, permanent },
  };
}

/** Adiciona ponto de Conhecimento do Mythos. SAN máxima desce 1:1 com
 *  o conhecimento (startingMax - mythos), capped pelo teto absoluto
 *  99 - mythos. Se o teto novo for menor que SAN atual, aplica clamp. */
export function gainMythosKnowledge(
  state: SanityState,
  amount: number,
): SanityState {
  const nextMythos = state.mythosKnowledge + amount;
  const oneToOne = Math.max(0, state.startingMax - nextMythos);
  const ceiling = effectiveMaxSanity(state.startingMax, nextMythos);
  const nextMax = Math.min(oneToOne, ceiling);
  return {
    ...state,
    mythosKnowledge: nextMythos,
    max: nextMax,
    current: Math.min(state.current, nextMax),
  };
}

/** Recupera SAN (terapia, ritual, descanso prolongado). Cap pelo max. */
export function restoreSanity(
  state: SanityState,
  amount: number,
): SanityState {
  const next = Math.min(state.max, state.current + Math.max(0, amount));
  return {
    ...state,
    current: next,
    // Recuperar SAN não desfaz loucura PERMANENT (esse só com
    // intervenção narrativa do GM). Mas tirar de 0 sai de PERMANENT.
    madness:
      state.madness === "PERMANENT" && next > 0 ? "INDEFINITE" : state.madness,
  };
}

/** Parser pra notação tipo "1/1d6" — retorna { onSuccess, onFailure }
 *  como strings de notação de dados pra rolar via engine de dice. */
export function parseSanityLossNotation(
  notation: string,
): { onSuccess: string; onFailure: string } | null {
  const match = notation.match(/^([0-9d+-]+)\s*\/\s*([0-9d+-]+)$/);
  if (!match || !match[1] || !match[2]) return null;
  return {
    onSuccess: match[1].trim(),
    onFailure: match[2].trim(),
  };
}
