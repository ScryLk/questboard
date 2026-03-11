import type { Camera } from "./camera";
import type { FogRenderer } from "./fogRenderer";
import type { VisionCalculator } from "./visionCalculator";

/**
 * Orquestrador de movimento: mover token + atualizar visão + atualizar fog.
 *
 * REGRAS FUNDAMENTAIS:
 * - NÃO redesenha o grid
 * - NÃO recalcula cellSize
 * - NÃO muda zoom/scale
 * - NÃO muda scale de nenhum layer individual
 * - APENAS muda posição do token e estado do fog
 */
export class MovementHandler {
  private fogRenderer: FogRenderer;
  private visionCalculator: VisionCalculator;
  private camera: Camera;
  private onMoveToken: (
    tokenId: string,
    newX: number,
    newY: number,
  ) => void;

  constructor(
    fogRenderer: FogRenderer,
    visionCalculator: VisionCalculator,
    camera: Camera,
    onMoveToken: (tokenId: string, newX: number, newY: number) => void,
  ) {
    this.fogRenderer = fogRenderer;
    this.visionCalculator = visionCalculator;
    this.camera = camera;
    this.onMoveToken = onMoveToken;
  }

  /**
   * Mover token ao longo de um caminho, atualizando visão/fog em cada célula.
   * @param tokenId - ID do token
   * @param path - sequência de células do caminho
   * @param visionRadius - raio de visão em células
   * @param followCamera - se true, câmera acompanha o token (apenas pan, sem zoom)
   */
  async moveTokenWithVision(
    tokenId: string,
    path: Array<{ x: number; y: number }>,
    visionRadius: number,
    followCamera = false,
  ): Promise<void> {
    for (const cell of path) {
      // 1. MOVER o token (apenas muda posição no store)
      this.onMoveToken(tokenId, cell.x, cell.y);

      // 2. RECALCULAR visão a partir da nova posição
      const vision = this.visionCalculator.calculateVision(
        cell.x,
        cell.y,
        visionRadius,
      );

      // 3. ATUALIZAR fog: revelar células visíveis
      const currentFog = this.fogRenderer.getFoggedCells();
      const cellsToReveal: string[] = [];

      vision.visibleCells.forEach((cellKey) => {
        if (currentFog.has(cellKey)) {
          cellsToReveal.push(cellKey);
        }
      });

      if (cellsToReveal.length > 0) {
        this.fogRenderer.removeFog(cellsToReveal);
      }

      // 4. OPCIONALMENTE: câmera acompanha o token (só pan, sem zoom)
      if (followCamera) {
        this.camera.centerOnCell(cell.x, cell.y, true);
      }

      // Pequena pausa entre cells para efeito visual
      if (path.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * Recalcular visão para um token sem movê-lo.
   * Útil ao selecionar um token ou ao mudar condições de visão.
   */
  updateVisionOnly(
    tokenX: number,
    tokenY: number,
    visionRadius: number,
  ): void {
    const vision = this.visionCalculator.calculateVision(
      tokenX,
      tokenY,
      visionRadius,
    );

    const currentFog = this.fogRenderer.getFoggedCells();
    const cellsToReveal: string[] = [];

    vision.visibleCells.forEach((cellKey) => {
      if (currentFog.has(cellKey)) {
        cellsToReveal.push(cellKey);
      }
    });

    if (cellsToReveal.length > 0) {
      this.fogRenderer.removeFog(cellsToReveal);
    }
  }
}
