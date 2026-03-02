import { Sparkles, Trash2 } from "lucide-react";
import { useEditorStore } from "../../lib/editor-store";
import { getTerrainName, TERRAIN_PALETTE } from "../../lib/terrain-data";
import type { TerrainType } from "@questboard/shared/types";

function NoSelection() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <p className="text-text-muted text-sm">
        Selecione um tile ou objeto no mapa para ver suas propriedades
      </p>
    </div>
  );
}

function TileProperties() {
  const { selection, layers, updateTileDetail, eraseTerrain } = useEditorStore();
  if (!selection || selection.type !== "tile") return null;

  const tile = layers.terrain.tiles[selection.y]?.[selection.x];
  if (!tile) return <NoSelection />;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Tile Header */}
      <div>
        <h3 className="text-base font-semibold text-text-primary">
          {tile.detail?.name ?? getTerrainName(tile.type)}
        </h3>
        <p className="text-xs text-text-muted mt-0.5">
          Posição: ({tile.x}, {tile.y})
        </p>
      </div>

      {/* Type Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-muted">Tipo de Terreno</label>
        <select
          value={tile.type}
          onChange={() => {}}
          className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
        >
          {TERRAIN_PALETTE.map((t) => (
            <option key={t.type} value={t.type}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Variant */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-muted">Variação</label>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((v) => (
            <button
              key={v}
              className={`flex-1 h-8 rounded-lg text-xs font-medium ${
                tile.variant === v
                  ? "bg-accent text-white"
                  : "bg-bg-input text-text-secondary border border-border hover:border-border-hover"
              }`}
            >
              {v + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Elevation */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-text-muted">Elevação</label>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg bg-bg-input border border-border text-text-secondary hover:bg-border flex items-center justify-center text-lg">
            -
          </button>
          <span className="text-sm text-text-primary font-medium flex-1 text-center">
            {tile.elevation}
          </span>
          <button className="w-8 h-8 rounded-lg bg-bg-input border border-border text-text-secondary hover:bg-border flex items-center justify-center text-lg">
            +
          </button>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Detail Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-text-primary">
            Detalhes (in-game)
          </h4>
        </div>

        {tile.detail ? (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted">Nome</label>
              <input
                type="text"
                value={tile.detail.name}
                readOnly
                className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted">Descrição</label>
              <textarea
                value={tile.detail.description}
                readOnly
                rows={3}
                className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary resize-none"
              />
            </div>

            {tile.detail.perception && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-text-muted">
                  Percepção DC {tile.detail.perception.dc}
                </label>
                <p className="text-xs text-text-secondary">
                  {tile.detail.perception.description}
                </p>
              </div>
            )}

            {tile.detail.investigation && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-text-muted">
                  Investigação DC {tile.detail.investigation.dc}
                </label>
                <p className="text-xs text-text-secondary">
                  {tile.detail.investigation.description}
                </p>
              </div>
            )}
          </>
        ) : (
          <button className="flex items-center justify-center gap-2 h-10 rounded-lg border border-accent/30 bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors">
            <Sparkles size={14} />
            Gerar com IA
          </button>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* Interaction Section */}
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold text-text-primary">
          Interação
        </h4>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-muted">Efeito de Terreno</label>
          <select className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary">
            <option value="normal">Terreno Normal</option>
            <option value="difficult">Terreno Difícil</option>
            <option value="slippery">Escorregadio</option>
            <option value="hazardous">Perigoso</option>
          </select>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-medium text-text-muted">Percepção DC</label>
            <input
              type="number"
              placeholder="—"
              className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-medium text-text-muted">Investigação DC</label>
            <input
              type="number"
              placeholder="—"
              className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
            />
          </div>
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => eraseTerrain(selection.x, selection.y)}
        className="flex items-center justify-center gap-2 h-9 rounded-lg border border-danger/30 text-danger text-sm font-medium hover:bg-danger/10 transition-colors mt-2"
      >
        <Trash2 size={14} />
        Remover Tile
      </button>
    </div>
  );
}

export function RightPanel() {
  const { selection } = useEditorStore();

  return (
    <div className="w-[300px] bg-bg-panel border-l border-border flex flex-col overflow-y-auto">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-text-primary">Propriedades</h2>
      </div>

      {selection?.type === "tile" ? <TileProperties /> : <NoSelection />}
    </div>
  );
}
