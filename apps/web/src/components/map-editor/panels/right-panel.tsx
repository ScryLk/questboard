import { useMapEditorStore } from "../../../stores/map-editor-store.js";
import { TERRAIN_PALETTE } from "@questboard/shared/constants";
import type { TerrainDetail } from "@questboard/shared";

export function RightPanel() {
  const { selection } = useMapEditorStore();

  if (selection.type === "terrain" && selection.tileX !== null && selection.tileY !== null) {
    return <TerrainProperties x={selection.tileX} y={selection.tileY} />;
  }

  if (selection.type === "object" && selection.id) {
    return <ObjectProperties objectId={selection.id} />;
  }

  if (selection.type === "wall" && selection.id) {
    return <WallProperties wallId={selection.id} />;
  }

  if (selection.type === "door" && selection.id) {
    return <DoorProperties doorId={selection.id} />;
  }

  if (selection.type === "light" && selection.id) {
    return <LightProperties lightId={selection.id} />;
  }

  return <EmptyProperties />;
}

// ─── Empty State ───

function EmptyProperties() {
  const { biome, setBiome, ambiance, setAmbiance, description, setMapDescription, width, height } =
    useMapEditorStore();

  return (
    <div className="flex h-full w-[300px] flex-col border-l border-white/10 bg-[#111116]">
      <div className="border-b border-white/10 p-4">
        <h3 className="text-xs font-semibold text-gray-400">Propriedades do Mapa</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Tamanho
          </label>
          <p className="text-xs text-gray-300">
            {width} x {height} tiles
          </p>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Bioma
          </label>
          <select
            value={biome}
            onChange={(e) => setBiome(e.target.value as any)}
            className="w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2 text-xs text-white outline-none focus:border-brand-accent"
          >
            <option value="dungeon">Dungeon</option>
            <option value="forest">Floresta</option>
            <option value="city">Cidade</option>
            <option value="cave">Caverna</option>
            <option value="desert">Deserto</option>
            <option value="swamp">Pântano</option>
            <option value="mountain">Montanha</option>
            <option value="coast">Costa</option>
            <option value="underground">Subterrâneo</option>
            <option value="ice">Gelo</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Ambiência
          </label>
          <select
            value={ambiance}
            onChange={(e) => setAmbiance(e.target.value as any)}
            className="w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2 text-xs text-white outline-none focus:border-brand-accent"
          >
            <option value="dark">Sombrio</option>
            <option value="bright">Claro</option>
            <option value="mystical">Místico</option>
            <option value="horror">Horror</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setMapDescription(e.target.value)}
            placeholder="Descreva o cenário do mapa..."
            className="w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2 text-xs text-white outline-none placeholder:text-gray-600 focus:border-brand-accent"
            rows={4}
          />
        </div>

        <div className="rounded-lg bg-white/5 p-3">
          <p className="text-[10px] leading-relaxed text-gray-500">
            Selecione um tile, objeto, parede ou luz no canvas para ver e editar suas propriedades.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Terrain Properties ───

function TerrainProperties({ x, y }: { x: number; y: number }) {
  const { layers, setTerrainDetail, setTerrainElevation, setTerrainVariant } =
    useMapEditorStore();

  const tile = layers.terrain.tiles[y]?.[x];
  const paletteEntry = tile
    ? TERRAIN_PALETTE.find((t) => t.type === tile.type)
    : null;

  return (
    <div className="flex h-full w-[300px] flex-col border-l border-white/10 bg-[#111116]">
      <div className="border-b border-white/10 p-4">
        <h3 className="text-xs font-semibold text-gray-400">
          Tile ({x}, {y})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tile ? (
          <>
            {/* Type display */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Tipo
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded"
                  style={{ backgroundColor: paletteEntry?.color ?? "#333" }}
                />
                <span className="text-sm text-white">{paletteEntry?.label ?? tile.type}</span>
              </div>
            </div>

            {/* Variant */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Variação
              </label>
              <div className="flex gap-1">
                {Array.from({ length: paletteEntry?.variants ?? 4 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTerrainVariant(x, y, i)}
                    className={`h-8 w-8 rounded text-xs ${
                      tile.variant === i
                        ? "bg-brand-accent text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Elevation */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Elevação
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTerrainElevation(x, y, tile.elevation - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded bg-white/5 text-gray-400 hover:bg-white/10"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm text-white">
                  {tile.elevation}
                </span>
                <button
                  onClick={() => setTerrainElevation(x, y, tile.elevation + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded bg-white/5 text-gray-400 hover:bg-white/10"
                >
                  +
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Detalhes (in-game)
              </h4>
            </div>

            {tile.detail ? (
              <TerrainDetailEditor
                detail={tile.detail}
                onChange={(detail) => setTerrainDetail(x, y, detail)}
                onRemove={() => setTerrainDetail(x, y, null)}
              />
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] text-gray-500">
                  Nenhum detalhe configurado. Adicione detalhes interativos para quando jogadores explorarem este tile.
                </p>
                <button
                  onClick={() =>
                    setTerrainDetail(x, y, {
                      name: paletteEntry?.label ?? "Tile",
                      description: "",
                      detailImageUrl: "",
                      isInteractable: false,
                    })
                  }
                  className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 transition hover:bg-white/5"
                >
                  + Adicionar Detalhes
                </button>
                <button
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-muted/20 px-3 py-2 text-xs text-brand-muted transition hover:bg-brand-muted/30"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  Gerar com IA
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-gray-500">Tile vazio. Use a ferramenta de terreno para pintar.</p>
        )}
      </div>
    </div>
  );
}

// ─── Terrain Detail Editor ───

function TerrainDetailEditor({
  detail,
  onChange,
  onRemove,
}: {
  detail: TerrainDetail;
  onChange: (detail: TerrainDetail) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Nome
        </label>
        <input
          type="text"
          value={detail.name}
          onChange={(e) => onChange({ ...detail, name: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2 text-xs text-white outline-none focus:border-brand-accent"
          placeholder="Nome curto do tile"
        />
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Descrição
        </label>
        <textarea
          value={detail.description}
          onChange={(e) => onChange({ ...detail, description: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2 text-xs text-white outline-none placeholder:text-gray-600 focus:border-brand-accent"
          rows={3}
          placeholder="O que o personagem vê, ouve, sente..."
        />
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Efeito
        </label>
        <select
          value={detail.difficulty ?? ""}
          onChange={(e) => onChange({ ...detail, difficulty: e.target.value || undefined })}
          className="w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2 text-xs text-white outline-none focus:border-brand-accent"
        >
          <option value="">Terreno normal</option>
          <option value="terreno difícil">Terreno difícil</option>
          <option value="escorregadio">Escorregadio</option>
          <option value="perigoso">Perigoso</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Efeito Mecânico
        </label>
        <input
          type="text"
          value={detail.effect ?? ""}
          onChange={(e) => onChange({ ...detail, effect: e.target.value || undefined })}
          className="w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2 text-xs text-white outline-none focus:border-brand-accent"
          placeholder="Ex: DC 12 DEX ou cai"
        />
      </div>

      {/* Perception */}
      <div className="rounded-lg border border-white/10 p-2">
        <label className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Percepção
          </span>
          <input
            type="checkbox"
            checked={!!detail.perception}
            onChange={(e) =>
              onChange({
                ...detail,
                perception: e.target.checked ? { dc: 14, description: "" } : null,
              })
            }
            className="accent-brand-accent"
          />
        </label>
        {detail.perception && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">DC:</span>
              <input
                type="number"
                value={detail.perception.dc}
                onChange={(e) =>
                  onChange({
                    ...detail,
                    perception: { ...detail.perception!, dc: parseInt(e.target.value) || 0 },
                  })
                }
                className="w-16 rounded border border-white/10 bg-[#0F0F12] px-2 py-1 text-xs text-white outline-none"
              />
            </div>
            <textarea
              value={detail.perception.description}
              onChange={(e) =>
                onChange({
                  ...detail,
                  perception: { ...detail.perception!, description: e.target.value },
                })
              }
              className="w-full rounded border border-white/10 bg-[#0F0F12] px-2 py-1 text-xs text-white outline-none"
              rows={2}
              placeholder="O que se percebe com sucesso..."
            />
          </div>
        )}
      </div>

      {/* Investigation */}
      <div className="rounded-lg border border-white/10 p-2">
        <label className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Investigação
          </span>
          <input
            type="checkbox"
            checked={!!detail.investigation}
            onChange={(e) =>
              onChange({
                ...detail,
                investigation: e.target.checked ? { dc: 16, description: "" } : null,
              })
            }
            className="accent-brand-accent"
          />
        </label>
        {detail.investigation && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">DC:</span>
              <input
                type="number"
                value={detail.investigation.dc}
                onChange={(e) =>
                  onChange({
                    ...detail,
                    investigation: { ...detail.investigation!, dc: parseInt(e.target.value) || 0 },
                  })
                }
                className="w-16 rounded border border-white/10 bg-[#0F0F12] px-2 py-1 text-xs text-white outline-none"
              />
            </div>
            <textarea
              value={detail.investigation.description}
              onChange={(e) =>
                onChange({
                  ...detail,
                  investigation: { ...detail.investigation!, description: e.target.value },
                })
              }
              className="w-full rounded border border-white/10 bg-[#0F0F12] px-2 py-1 text-xs text-white outline-none"
              rows={2}
              placeholder="O que se descobre investigando..."
            />
          </div>
        )}
      </div>

      {/* Interactable */}
      <div className="rounded-lg border border-white/10 p-2">
        <label className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Interativo
          </span>
          <input
            type="checkbox"
            checked={detail.isInteractable}
            onChange={(e) => onChange({ ...detail, isInteractable: e.target.checked })}
            className="accent-brand-accent"
          />
        </label>
        {detail.isInteractable && (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={detail.interactionLabel ?? ""}
              onChange={(e) => onChange({ ...detail, interactionLabel: e.target.value })}
              className="w-full rounded border border-white/10 bg-[#0F0F12] px-2 py-1 text-xs text-white outline-none"
              placeholder="Label (ex: Examinar, Abrir)"
            />
            <textarea
              value={detail.interactionResult ?? ""}
              onChange={(e) => onChange({ ...detail, interactionResult: e.target.value })}
              className="w-full rounded border border-white/10 bg-[#0F0F12] px-2 py-1 text-xs text-white outline-none"
              rows={2}
              placeholder="Resultado da interação..."
            />
          </div>
        )}
      </div>

      {/* Lore */}
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Lore (só GM)
        </label>
        <textarea
          value={detail.lore ?? ""}
          onChange={(e) => onChange({ ...detail, lore: e.target.value || undefined })}
          className="w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2 text-xs text-white outline-none placeholder:text-gray-600 focus:border-brand-accent"
          rows={2}
          placeholder="Backstory, só visível pro mestre..."
        />
      </div>

      <button
        onClick={onRemove}
        className="w-full rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
      >
        Remover Detalhes
      </button>
    </div>
  );
}

// ─── Object Properties ───

function ObjectProperties({ objectId }: { objectId: string }) {
  const { layers, updateObject, removeObject, rotateObject } = useMapEditorStore();
  const object = layers.objects.objects.find((o) => o.id === objectId);

  if (!object) return <EmptyProperties />;

  return (
    <div className="flex h-full w-[300px] flex-col border-l border-white/10 bg-[#111116]">
      <div className="border-b border-white/10 p-4">
        <h3 className="text-xs font-semibold text-gray-400">Objeto</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Nome
          </label>
          <input
            type="text"
            value={object.name}
            onChange={(e) => updateObject(objectId, { name: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2 text-xs text-white outline-none focus:border-brand-accent"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-[10px] text-gray-500">Posição</label>
            <p className="text-xs text-gray-300">
              ({object.x}, {object.y})
            </p>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-[10px] text-gray-500">Tamanho</label>
            <p className="text-xs text-gray-300">
              {object.width}x{object.height}
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-gray-500">Rotação</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-300">{object.rotation}°</span>
            <button
              onClick={() => rotateObject(objectId)}
              className="rounded bg-white/5 px-2 py-1 text-xs text-gray-400 hover:bg-white/10"
            >
              +90°
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-gray-500">Camada</label>
          <select
            value={object.layer}
            onChange={(e) => updateObject(objectId, { layer: e.target.value as any })}
            className="w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2 text-xs text-white outline-none"
          >
            <option value="below_tokens">Abaixo dos tokens</option>
            <option value="above_tokens">Acima dos tokens</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-gray-500">Opacidade</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={object.opacity}
            onChange={(e) => updateObject(objectId, { opacity: parseFloat(e.target.value) })}
            className="w-full accent-brand-accent"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input
            type="checkbox"
            checked={object.isInteractable}
            onChange={(e) => updateObject(objectId, { isInteractable: e.target.checked })}
            className="accent-brand-accent"
          />
          Interativo
        </label>

        <button
          onClick={() => removeObject(objectId)}
          className="w-full rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
        >
          Remover Objeto
        </button>
      </div>
    </div>
  );
}

// ─── Wall Properties ───

function WallProperties({ wallId }: { wallId: string }) {
  const { layers, updateWall, removeWall } = useMapEditorStore();
  const wall = layers.structures.walls.find((w) => w.id === wallId);

  if (!wall) return <EmptyProperties />;

  return (
    <div className="flex h-full w-[300px] flex-col border-l border-white/10 bg-[#111116]">
      <div className="border-b border-white/10 p-4">
        <h3 className="text-xs font-semibold text-gray-400">Parede</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="mb-1 block text-[10px] text-gray-500">Posição</label>
          <p className="text-xs text-gray-300">
            ({wall.startX}, {wall.startY}) → ({wall.endX}, {wall.endY})
          </p>
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-gray-500">Espessura</label>
          <input
            type="range"
            min="1"
            max="3"
            step="1"
            value={wall.thickness}
            onChange={(e) => updateWall(wallId, { thickness: parseInt(e.target.value) })}
            className="w-full accent-brand-accent"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input
            type="checkbox"
            checked={wall.blocksVision}
            onChange={(e) => updateWall(wallId, { blocksVision: e.target.checked })}
            className="accent-brand-accent"
          />
          Bloqueia Visão
        </label>

        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input
            type="checkbox"
            checked={wall.blocksMovement}
            onChange={(e) => updateWall(wallId, { blocksMovement: e.target.checked })}
            className="accent-brand-accent"
          />
          Bloqueia Movimento
        </label>

        <button
          onClick={() => removeWall(wallId)}
          className="w-full rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
        >
          Remover Parede
        </button>
      </div>
    </div>
  );
}

// ─── Door Properties ───

function DoorProperties({ doorId }: { doorId: string }) {
  const { layers, updateDoor, removeDoor } = useMapEditorStore();
  const door = layers.structures.doors.find((d) => d.id === doorId);

  if (!door) return <EmptyProperties />;

  return (
    <div className="flex h-full w-[300px] flex-col border-l border-white/10 bg-[#111116]">
      <div className="border-b border-white/10 p-4">
        <h3 className="text-xs font-semibold text-gray-400">Porta</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="mb-1 block text-[10px] text-gray-500">Posição</label>
          <p className="text-xs text-gray-300">
            ({door.x}, {door.y}) — {door.side}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-gray-500">Estado</label>
          <select
            value={door.state}
            onChange={(e) => updateDoor(doorId, { state: e.target.value as any })}
            className="w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2 text-xs text-white outline-none"
          >
            <option value="open">Aberta</option>
            <option value="closed">Fechada</option>
            <option value="locked">Trancada</option>
            <option value="barred">Barrada</option>
            <option value="secret">Secreta</option>
            <option value="broken">Quebrada</option>
          </select>
        </div>

        {door.state === "locked" && (
          <div>
            <label className="mb-1 block text-[10px] text-gray-500">DC para Abrir</label>
            <input
              type="number"
              value={door.lockDC ?? 15}
              onChange={(e) => updateDoor(doorId, { lockDC: parseInt(e.target.value) || 15 })}
              className="w-16 rounded border border-white/10 bg-[#0F0F12] px-2 py-1 text-xs text-white outline-none"
            />
          </div>
        )}

        {(door.state === "locked" || door.state === "barred") && (
          <div>
            <label className="mb-1 block text-[10px] text-gray-500">Chave Necessária</label>
            <input
              type="text"
              value={door.keyItem ?? ""}
              onChange={(e) => updateDoor(doorId, { keyItem: e.target.value || undefined })}
              className="w-full rounded border border-white/10 bg-[#0F0F12] px-2 py-1 text-xs text-white outline-none"
              placeholder="Nome do item chave..."
            />
          </div>
        )}

        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input
            type="checkbox"
            checked={door.isInteractable}
            onChange={(e) => updateDoor(doorId, { isInteractable: e.target.checked })}
            className="accent-brand-accent"
          />
          Interativo (jogadores podem usar)
        </label>

        <button
          onClick={() => removeDoor(doorId)}
          className="w-full rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
        >
          Remover Porta
        </button>
      </div>
    </div>
  );
}

// ─── Light Properties ───

function LightProperties({ lightId }: { lightId: string }) {
  const { layers, updateLight, removeLight } = useMapEditorStore();
  const light = layers.lighting.sources.find((l) => l.id === lightId);

  if (!light) return <EmptyProperties />;

  return (
    <div className="flex h-full w-[300px] flex-col border-l border-white/10 bg-[#111116]">
      <div className="border-b border-white/10 p-4">
        <h3 className="text-xs font-semibold text-gray-400">Fonte de Luz</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="mb-1 block text-[10px] text-gray-500">Posição</label>
          <p className="text-xs text-gray-300">({light.x}, {light.y})</p>
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-gray-500">
            Raio: {light.radius} tiles
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={light.radius}
            onChange={(e) => updateLight(lightId, { radius: parseInt(e.target.value) })}
            className="w-full accent-brand-accent"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-gray-500">Cor</label>
          <input
            type="color"
            value={light.color}
            onChange={(e) => updateLight(lightId, { color: e.target.value })}
            className="h-8 w-full cursor-pointer rounded border border-white/10"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-gray-500">
            Intensidade: {Math.round(light.intensity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={light.intensity}
            onChange={(e) => updateLight(lightId, { intensity: parseFloat(e.target.value) })}
            className="w-full accent-brand-accent"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input
            type="checkbox"
            checked={light.flicker}
            onChange={(e) => updateLight(lightId, { flicker: e.target.checked })}
            className="accent-brand-accent"
          />
          Oscilação (flicker)
        </label>

        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input
            type="checkbox"
            checked={light.castsShadows}
            onChange={(e) => updateLight(lightId, { castsShadows: e.target.checked })}
            className="accent-brand-accent"
          />
          Projetar Sombras (premium)
        </label>

        <button
          onClick={() => removeLight(lightId)}
          className="w-full rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
        >
          Remover Luz
        </button>
      </div>
    </div>
  );
}
