/**
 * Calculador de visão baseado em raycasting.
 * Opera inteiramente em coordenadas de CÉLULAS (inteiros).
 * NÃO modifica grid, NÃO modifica scale, NÃO modifica zoom.
 * Apenas calcula quais células são visíveis a partir de uma posição.
 */

export interface VisionResult {
  visibleCells: Set<string>;
}

export type WallChecker = (
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
) => boolean;

export class VisionCalculator {
  private gridCols: number;
  private gridRows: number;
  private wallChecker: WallChecker;

  constructor(
    gridCols: number,
    gridRows: number,
    wallChecker: WallChecker,
  ) {
    this.gridCols = gridCols;
    this.gridRows = gridRows;
    this.wallChecker = wallChecker;
  }

  /**
   * Calcular quais células um token pode ver a partir de sua posição.
   * @param tokenX - coluna do grid (inteiro)
   * @param tokenY - linha do grid (inteiro)
   * @param visionRadius - raio de visão em células
   */
  calculateVision(
    tokenX: number,
    tokenY: number,
    visionRadius: number,
  ): VisionResult {
    const visibleCells = new Set<string>();

    // Sempre vê a própria célula
    visibleCells.add(`${tokenX},${tokenY}`);

    // Raycasting: lançar raios do centro do token em todas as direções
    const numRays = 360; // 1 raio por grau
    const centerX = tokenX + 0.5; // centro da célula (em unidades de célula)
    const centerY = tokenY + 0.5;

    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * Math.PI * 2;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);

      // Avançar ao longo do raio
      let prevCellX = tokenX;
      let prevCellY = tokenY;

      for (let step = 0.5; step <= visionRadius; step += 0.5) {
        const checkX = Math.floor(centerX + dx * step);
        const checkY = Math.floor(centerY + dy * step);

        // Fora do mapa
        if (
          checkX < 0 ||
          checkX >= this.gridCols ||
          checkY < 0 ||
          checkY >= this.gridRows
        ) {
          break;
        }

        // Verificar parede entre a célula anterior e esta
        if (checkX !== prevCellX || checkY !== prevCellY) {
          if (this.wallChecker(prevCellX, prevCellY, checkX, checkY)) {
            break; // parede bloqueia visão
          }
          prevCellX = checkX;
          prevCellY = checkY;
        }

        visibleCells.add(`${checkX},${checkY}`);
      }
    }

    return { visibleCells };
  }

  updateGridSize(cols: number, rows: number) {
    this.gridCols = cols;
    this.gridRows = rows;
  }
}
