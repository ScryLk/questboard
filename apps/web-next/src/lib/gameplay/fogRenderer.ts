import { Graphics, Container } from "pixi.js";
import { CELL_SIZE } from "./constants";

/**
 * Fog of War baseado em CÉLULAS (Set de strings "x,y").
 * Cada célula é um retângulo no espaço do world com tamanho CELL_SIZE fixo.
 * O fogGraphics está no fogLayer → filho do worldContainer →
 * zoom/pan do worldContainer afeta tudo uniformemente.
 */
export class FogRenderer {
  private fogLayer: Container;
  private fogGraphics: Graphics;
  private gridCols: number;
  private gridRows: number;

  // Estado: quais células estão cobertas por fog
  private foggedCells: Set<string> = new Set();

  constructor(fogLayer: Container, gridCols: number, gridRows: number) {
    this.fogLayer = fogLayer;
    this.gridCols = gridCols;
    this.gridRows = gridRows;

    this.fogGraphics = new Graphics();
    this.fogLayer.addChild(this.fogGraphics);
  }

  // ═══ DEFINIR QUAIS CÉLULAS TÊM FOG ═══
  setFogCells(cells: Set<string>) {
    this.foggedCells = new Set(cells);
    this.redraw();
  }

  // Adicionar fog a células
  addFog(cells: string[]) {
    for (const c of cells) this.foggedCells.add(c);
    this.redraw();
  }

  // Remover fog de células
  removeFog(cells: string[]) {
    for (const c of cells) this.foggedCells.delete(c);
    this.redraw();
  }

  // Cobrir TUDO com fog
  coverAll() {
    for (let y = 0; y < this.gridRows; y++) {
      for (let x = 0; x < this.gridCols; x++) {
        this.foggedCells.add(`${x},${y}`);
      }
    }
    this.redraw();
  }

  // Revelar TUDO
  revealAll() {
    this.foggedCells.clear();
    this.redraw();
  }

  // Revelar ao redor de uma posição (raio em células)
  revealAroundCell(centerX: number, centerY: number, radius: number) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.sqrt(dx * dx + dy * dy) <= radius) {
          const cx = centerX + dx;
          const cy = centerY + dy;
          if (cx >= 0 && cx < this.gridCols && cy >= 0 && cy < this.gridRows) {
            this.foggedCells.delete(`${cx},${cy}`);
          }
        }
      }
    }
    this.redraw();
  }

  // ═══ REDESENHAR FOG (a partir do estado de células) ═══
  private redraw() {
    this.fogGraphics.clear();

    // Desenhar APENAS as células que têm fog
    // Posição = célula × CELL_SIZE (constante, nunca muda)
    this.foggedCells.forEach((key) => {
      const sep = key.indexOf(",");
      const x = parseInt(key.substring(0, sep));
      const y = parseInt(key.substring(sep + 1));

      if (x < 0 || x >= this.gridCols || y < 0 || y >= this.gridRows) return;

      this.fogGraphics
        .rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        .fill({ color: 0x0a0a12, alpha: 0.85 });
    });
  }

  hasFog(x: number, y: number): boolean {
    return this.foggedCells.has(`${x},${y}`);
  }

  getFoggedCells(): Set<string> {
    return new Set(this.foggedCells);
  }

  destroy() {
    this.fogGraphics.clear();
    this.fogLayer.removeChild(this.fogGraphics);
    this.fogGraphics.destroy();
  }
}
