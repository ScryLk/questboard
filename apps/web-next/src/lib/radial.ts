// Posicionamento do RadialMenu. Fn pura, zero IO — poderia morar em
// `@questboard/game-engine` mas web-next ainda não importa esse package,
// então fica aqui. Se o pacote for ligado depois, mover é 1 arquivo.

export interface RadialPositionInput {
  tokenScreenX: number;
  tokenScreenY: number;
  viewportWidth: number;
  viewportHeight: number;
  radiusPx: number;
  buttonSizePx: number;
  safePaddingPx: number;
}

export interface RadialPosition {
  /** Ângulo inicial do arco (radianos — 0 = direita, CW positivo). */
  arcStartRad: number;
  /** Ângulo final do arco. */
  arcEndRad: number;
  /** Ângulos de cada botão (em rad, dentro do arco). Length === actionCount. */
  angles: number[];
}

const TAU = Math.PI * 2;

/**
 * Escolhe o arco baseado nas bordas disponíveis da viewport:
 *   - Todos os lados cabem → 360°
 *   - 3 lados cabem        → 270° oposto ao lado estreito
 *   - 2 opostos            → 180°
 *   - 2 adjacentes (canto) → 90° diagonal pra dentro
 *   - 1 lado               → 90° pra esse lado
 * Depois distribui `actionCount` ângulos no arco.
 */
export function computeRadialArc(
  input: RadialPositionInput,
  actionCount: number,
): RadialPosition {
  if (actionCount <= 0) {
    return { arcStartRad: 0, arcEndRad: 0, angles: [] };
  }

  const {
    tokenScreenX,
    tokenScreenY,
    viewportWidth,
    viewportHeight,
    radiusPx,
    buttonSizePx,
    safePaddingPx,
  } = input;

  const need = radiusPx + buttonSizePx / 2 + safePaddingPx;

  const fitTop = tokenScreenY >= need;
  const fitBottom = viewportHeight - tokenScreenY >= need;
  const fitLeft = tokenScreenX >= need;
  const fitRight = viewportWidth - tokenScreenX >= need;

  const fitCount = [fitTop, fitBottom, fitLeft, fitRight].filter(Boolean)
    .length;

  let arcCenterRad: number;
  let arcSpanRad: number;

  if (fitCount === 4) {
    // 360°: começa no topo pra ficar simétrico (um botão em cima, os
    // outros distribuídos uniformemente ao redor). Em vez de 0° (direita)
    // que dá arranjo assimétrico.
    arcCenterRad = -Math.PI / 2;
    arcSpanRad = TAU;
  } else if (fitCount === 3) {
    // Arco 270° centrado no lado oposto ao que não cabe
    arcSpanRad = (TAU * 3) / 4;
    if (!fitTop) arcCenterRad = Math.PI / 2; // abre pra baixo
    else if (!fitBottom) arcCenterRad = -Math.PI / 2; // abre pra cima
    else if (!fitLeft) arcCenterRad = 0; // abre pra direita
    else arcCenterRad = Math.PI; // abre pra esquerda
  } else if (fitCount === 2) {
    // Dois lados — pode ser opostos (180°) ou adjacentes/canto (90°)
    if (fitTop && fitBottom) {
      arcCenterRad = fitLeft ? Math.PI : 0;
      arcSpanRad = Math.PI;
    } else if (fitLeft && fitRight) {
      arcCenterRad = fitTop ? -Math.PI / 2 : Math.PI / 2;
      arcSpanRad = Math.PI;
    } else {
      // Canto — diagonal pra dentro
      arcSpanRad = Math.PI / 2;
      if (fitBottom && fitRight) arcCenterRad = Math.PI / 4; // token no top-left
      else if (fitBottom && fitLeft) arcCenterRad = (Math.PI * 3) / 4;
      else if (fitTop && fitRight) arcCenterRad = -Math.PI / 4;
      else arcCenterRad = (-Math.PI * 3) / 4; // top+left, bottom-right do token
    }
  } else {
    // 1 ou 0 — caso extremo. Abre 90° pro único lado que cabe, ou pra
    // direita como fallback (token quase fora da tela).
    arcSpanRad = Math.PI / 2;
    if (fitBottom) arcCenterRad = Math.PI / 2;
    else if (fitTop) arcCenterRad = -Math.PI / 2;
    else if (fitLeft) arcCenterRad = Math.PI;
    else arcCenterRad = 0;
  }

  const arcStartRad = arcCenterRad - arcSpanRad / 2;
  const arcEndRad = arcCenterRad + arcSpanRad / 2;

  const angles: number[] = [];
  if (actionCount === 1) {
    angles.push(arcCenterRad);
  } else if (arcSpanRad >= TAU - 0.0001) {
    // Arco completo — distribui uniforme sem repetir extremos
    const step = TAU / actionCount;
    for (let i = 0; i < actionCount; i++) {
      angles.push(arcCenterRad + i * step);
    }
  } else if (arcSpanRad >= Math.PI - 0.0001) {
    // Arcos largos (≥180°): extremos incluídos
    const step = arcSpanRad / (actionCount - 1);
    for (let i = 0; i < actionCount; i++) {
      angles.push(arcStartRad + i * step);
    }
  } else {
    // Arcos estreitos (<180°): margem de 15° em cada ponta
    const marginRad = (15 * Math.PI) / 180;
    const usable = Math.max(0, arcSpanRad - marginRad * 2);
    const innerStart = arcStartRad + marginRad;
    const step = actionCount > 1 ? usable / (actionCount - 1) : 0;
    for (let i = 0; i < actionCount; i++) {
      angles.push(innerStart + i * step);
    }
  }

  return { arcStartRad, arcEndRad, angles };
}
