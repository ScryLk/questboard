// Desenha outline pulsante no token do turno atual, sobre um Container
// dedicado adicionado ao worldContainer. Um único PIXI.Application — este
// Container vive dentro do app já criado por PixiCanvas (CLAUDE.md §2).

import { Container, Graphics } from "pixi.js";

interface Target {
  x: number;
  y: number;
  size: number;
}

export class CombatHighlight {
  private readonly layer: Container;
  private graphic: Graphics | null = null;
  private elapsed = 0;
  private target: Target | null = null;
  public cellSize = 64;
  /** Cor do outline (brand-accent). */
  public color = 0x6c5ce7;

  constructor(layer: Container) {
    this.layer = layer;
  }

  /** Passa coordenadas em células de grid (x, y) e `size` em células. */
  setTarget(target: Target | null): void {
    this.target = target;
    if (!target) this.clear();
  }

  /** Chamado dentro do ticker do PIXI.Application. deltaMs em ms. */
  tick(deltaMs: number): void {
    if (!this.target) return;

    this.elapsed += deltaMs;

    if (!this.graphic) {
      this.graphic = new Graphics();
      this.layer.addChild(this.graphic);
    }

    // Loop de pulse 1500ms: alpha e raio oscilam suavemente.
    const phase = (this.elapsed % 1500) / 1500;
    const pulse = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2);
    const alpha = 0.4 + pulse * 0.5;
    const ringExtra = 2 + pulse * 4;

    const { x, y, size } = this.target;
    const centerX = (x + size / 2) * this.cellSize;
    const centerY = (y + size / 2) * this.cellSize;
    const radius = (size / 2) * this.cellSize + ringExtra;

    this.graphic.clear();
    this.graphic.circle(centerX, centerY, radius);
    this.graphic.stroke({ color: this.color, width: 3, alpha });
  }

  clear(): void {
    if (this.graphic) {
      this.graphic.destroy();
      this.graphic = null;
    }
    this.elapsed = 0;
  }

  destroy(): void {
    this.clear();
  }
}

// Singleton acessível de fora do Pixi effect (mesmo padrão do
// setCombatEngine/getCombatEngine usado pelo CombatAnimationEngine).
let instance: CombatHighlight | null = null;
export function setCombatHighlight(h: CombatHighlight | null): void {
  instance = h;
}
export function getCombatHighlight(): CombatHighlight | null {
  return instance;
}
