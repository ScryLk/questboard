import { Application, Container } from "pixi.js";
import { CELL_SIZE } from "./constants";
import { drawGrid } from "./gridRenderer";

export interface CanvasLayers {
  background: Container;
  terrain: Container;
  grid: Container;
  walls: Container;
  tokens: Container;
  effects: Container;
  fog: Container;
  uiOverlay: Container;
}

export interface CanvasSetup {
  app: Application;
  worldContainer: Container;
  layers: CanvasLayers;
  hudContainer: Container;
}

function createLayer(parent: Container, zIndex: number): Container {
  const layer = new Container();
  layer.zIndex = zIndex;
  parent.addChild(layer);
  return layer;
}

export async function initCanvas(
  containerElement: HTMLDivElement,
  gridCols: number,
  gridRows: number,
): Promise<CanvasSetup> {
  const app = new Application();
  await app.init({
    resizeTo: containerElement,
    background: 0x0a0a10,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  containerElement.appendChild(app.canvas as HTMLCanvasElement);

  // ═══ WORLD CONTAINER — tudo do jogo vive aqui ═══
  const worldContainer = new Container();
  worldContainer.sortableChildren = true;
  app.stage.addChild(worldContainer);

  // Layers dentro do world (ordem de renderização fixa)
  const layers: CanvasLayers = {
    background: createLayer(worldContainer, 0),
    terrain: createLayer(worldContainer, 1),
    grid: createLayer(worldContainer, 2),
    walls: createLayer(worldContainer, 3),
    tokens: createLayer(worldContainer, 4),
    effects: createLayer(worldContainer, 5),
    fog: createLayer(worldContainer, 6),
    uiOverlay: createLayer(worldContainer, 7),
  };

  // ═══ HUD CONTAINER — fixo na tela, NÃO afetado por zoom/pan ═══
  const hudContainer = new Container();
  hudContainer.zIndex = 100;
  app.stage.addChild(hudContainer);
  app.stage.sortableChildren = true;

  // ═══ DESENHAR GRID UMA VEZ (nunca mais redesenhar) ═══
  drawGrid(layers.grid, gridCols, gridRows, CELL_SIZE);

  return { app, worldContainer, layers, hudContainer };
}
