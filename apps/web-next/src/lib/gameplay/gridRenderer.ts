import { Graphics, Container } from "pixi.js";

/**
 * Desenha o grid UMA VEZ no container fornecido.
 * Este Graphics NUNCA é redesenhado — zoom/pan são feitos no WorldContainer pai.
 */
export function drawGrid(
  gridLayer: Container,
  cols: number,
  rows: number,
  cellSize: number,
): void {
  // Limpar qualquer grid anterior
  gridLayer.removeChildren();

  const gridGraphics = new Graphics();

  const totalWidth = cols * cellSize;
  const totalHeight = rows * cellSize;

  // Estilo da linha do grid
  gridGraphics.setStrokeStyle({
    width: 1,
    color: 0xffffff,
    alpha: 0.08,
  });

  // Linhas VERTICAIS
  for (let x = 0; x <= cols; x++) {
    gridGraphics.moveTo(x * cellSize, 0);
    gridGraphics.lineTo(x * cellSize, totalHeight);
  }

  // Linhas HORIZONTAIS
  for (let y = 0; y <= rows; y++) {
    gridGraphics.moveTo(0, y * cellSize);
    gridGraphics.lineTo(totalWidth, y * cellSize);
  }

  gridGraphics.stroke();
  gridLayer.addChild(gridGraphics);
}
