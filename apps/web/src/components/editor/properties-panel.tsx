import { useMapEditorStore } from "../../lib/map-editor-store.js";
import { TERRAIN_LABELS, TERRAIN_COLORS } from "../../lib/terrain-data.js";

export function PropertiesPanel() {
  const {
    selectedTile,
    selectedWall,
    selectedDoor,
    selectedObject,
    selectedLight,
    layers,
    updateTileDetail,
    removeWall,
    removeDoor,
    removeObject,
    removeLight,
    updateLight,
    clearSelection,
  } = useMapEditorStore();

  // Selected tile properties
  if (selectedTile) {
    const { x, y } = selectedTile;
    const tile = layers.terrain.tiles[y]?.[x];
    const fogState = layers.fog.tiles[y]?.[x] ?? "hidden";

    return (
      <div className="flex h-full w-[300px] flex-col overflow-y-auto border-l border-white/10 bg-[#111116]">
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Propriedades</h3>
            <button
              onClick={clearSelection}
              className="text-xs text-gray-500 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Tile ({x}, {y})
          </p>
        </div>

        {tile ? (
          <div className="flex-1 space-y-4 p-4">
            {/* Terrain type */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Tipo de Terreno
              </label>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-6 w-6 rounded"
                  style={{ backgroundColor: TERRAIN_COLORS[tile.type] }}
                />
                <span className="text-sm text-white">
                  {TERRAIN_LABELS[tile.type] ?? tile.type}
                </span>
              </div>
            </div>

            {/* Variant */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Variação
              </label>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((v) => (
                  <button
                    key={v}
                    onClick={() => updateTileDetail(x, y, { variant: v })}
                    className={`h-8 w-8 rounded text-xs font-medium ${
                      tile.variant === v
                        ? "bg-brand-accent text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {v + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Elevation */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Elevação
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateTileDetail(x, y, { elevation: tile.elevation - 1 })}
                  className="h-8 w-8 rounded bg-white/5 text-gray-400 hover:bg-white/10"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm text-white">{tile.elevation}</span>
                <button
                  onClick={() => updateTileDetail(x, y, { elevation: tile.elevation + 1 })}
                  className="h-8 w-8 rounded bg-white/5 text-gray-400 hover:bg-white/10"
                >
                  +
                </button>
              </div>
            </div>

            {/* Opacity */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Opacidade ({Math.round(tile.opacity * 100)}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(tile.opacity * 100)}
                onChange={(e) =>
                  updateTileDetail(x, y, { opacity: Number(e.target.value) / 100 })
                }
                className="w-full accent-brand-accent"
              />
            </div>

            {/* Tint color */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Cor de Tint
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={tile.tintColor ?? "#000000"}
                  onChange={(e) => updateTileDetail(x, y, { tintColor: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded border border-white/10 bg-transparent"
                />
                {tile.tintColor && (
                  <button
                    onClick={() => updateTileDetail(x, y, { tintColor: null })}
                    className="text-xs text-gray-500 hover:text-white"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Detalhes (In-Game)
              </h4>

              {tile.detail ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Nome</label>
                    <input
                      type="text"
                      value={tile.detail.name}
                      onChange={(e) =>
                        updateTileDetail(x, y, {
                          detail: { ...tile.detail!, name: e.target.value },
                        })
                      }
                      className="w-full rounded bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-brand-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Descrição</label>
                    <textarea
                      value={tile.detail.description}
                      onChange={(e) =>
                        updateTileDetail(x, y, {
                          detail: { ...tile.detail!, description: e.target.value },
                        })
                      }
                      rows={3}
                      className="w-full rounded bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-brand-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Efeito</label>
                    <select
                      value={tile.detail.difficulty ?? "normal"}
                      onChange={(e) =>
                        updateTileDetail(x, y, {
                          detail: { ...tile.detail!, difficulty: e.target.value },
                        })
                      }
                      className="w-full rounded bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10"
                    >
                      <option value="normal">Terreno Normal</option>
                      <option value="difficult">Terreno Difícil</option>
                      <option value="hazardous">Terreno Perigoso</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-gray-500">Percepção DC</label>
                      <input
                        type="number"
                        value={tile.detail.perception?.dc ?? ""}
                        placeholder="—"
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : undefined;
                          updateTileDetail(x, y, {
                            detail: {
                              ...tile.detail!,
                              perception: val
                                ? {
                                    dc: val,
                                    description:
                                      tile.detail!.perception?.description ?? "",
                                  }
                                : undefined,
                            },
                          });
                        }}
                        className="w-full rounded bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-gray-500">Investigação DC</label>
                      <input
                        type="number"
                        value={tile.detail.investigation?.dc ?? ""}
                        placeholder="—"
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : undefined;
                          updateTileDetail(x, y, {
                            detail: {
                              ...tile.detail!,
                              investigation: val
                                ? {
                                    dc: val,
                                    description:
                                      tile.detail!.investigation?.description ?? "",
                                  }
                                : undefined,
                            },
                          });
                        }}
                        className="w-full rounded bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tile.detail.isInteractable}
                      onChange={(e) =>
                        updateTileDetail(x, y, {
                          detail: { ...tile.detail!, isInteractable: e.target.checked },
                        })
                      }
                      className="accent-brand-accent"
                    />
                    <span className="text-xs text-gray-400">Interativo</span>
                  </div>
                  {tile.detail.isInteractable && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">Ação</label>
                        <input
                          type="text"
                          value={tile.detail.interactionLabel ?? ""}
                          placeholder="Examinar"
                          onChange={(e) =>
                            updateTileDetail(x, y, {
                              detail: { ...tile.detail!, interactionLabel: e.target.value },
                            })
                          }
                          className="w-full rounded bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">Resultado</label>
                        <textarea
                          value={tile.detail.interactionResult ?? ""}
                          placeholder="O que acontece ao interagir..."
                          onChange={(e) =>
                            updateTileDetail(x, y, {
                              detail: { ...tile.detail!, interactionResult: e.target.value },
                            })
                          }
                          rows={2}
                          className="w-full rounded bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Lore (só GM)</label>
                    <textarea
                      value={tile.detail.lore ?? ""}
                      placeholder="Backstory longo..."
                      onChange={(e) =>
                        updateTileDetail(x, y, {
                          detail: { ...tile.detail!, lore: e.target.value },
                        })
                      }
                      rows={2}
                      className="w-full rounded bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10"
                    />
                  </div>
                  <button
                    onClick={() => updateTileDetail(x, y, { detail: null })}
                    className="w-full rounded bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20"
                  >
                    Remover Detalhes
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() =>
                      updateTileDetail(x, y, {
                        detail: {
                          name: TERRAIN_LABELS[tile.type] ?? "Tile",
                          description: "",
                          detailImageUrl: "",
                          isInteractable: false,
                        },
                      })
                    }
                    className="w-full rounded bg-white/5 px-3 py-2 text-xs text-gray-400 hover:bg-white/10"
                  >
                    + Adicionar Detalhes
                  </button>
                  <button className="w-full rounded bg-brand-accent/10 px-3 py-2 text-xs text-brand-accent hover:bg-brand-accent/20">
                    ✨ Gerar com IA
                  </button>
                </div>
              )}
            </div>

            {/* Fog state */}
            <div className="border-t border-white/10 pt-4">
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Fog of War
              </label>
              <span
                className={`inline-block rounded px-2 py-0.5 text-xs ${
                  fogState === "visible"
                    ? "bg-green-500/20 text-green-400"
                    : fogState === "explored"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {fogState === "visible"
                  ? "Visível"
                  : fogState === "explored"
                  ? "Explorado"
                  : "Oculto"}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-4">
            <p className="text-xs text-gray-500">
              Nenhum terreno nesta posição. Use a ferramenta de terreno para pintar.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Selected wall properties
  if (selectedWall) {
    const wall = layers.structures.walls.find((w) => w.id === selectedWall);
    if (wall) {
      return (
        <div className="flex h-full w-[300px] flex-col border-l border-white/10 bg-[#111116]">
          <div className="border-b border-white/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Parede</h3>
              <button onClick={clearSelection} className="text-xs text-gray-500 hover:text-white">✕</button>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <p className="text-xs text-gray-500">
              ({wall.startX}, {wall.startY}) → ({wall.endX}, {wall.endY})
            </p>
            <p className="text-sm text-white">Tipo: {wall.type}</p>
            <p className="text-sm text-white">Espessura: {wall.thickness}</p>
            <p className="text-sm text-white">
              Bloqueia visão: {wall.blocksVision ? "Sim" : "Não"}
            </p>
            <button
              onClick={() => { removeWall(wall.id); clearSelection(); }}
              className="w-full rounded bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20"
            >
              Remover Parede
            </button>
          </div>
        </div>
      );
    }
  }

  // Selected door properties
  if (selectedDoor) {
    const door = layers.structures.doors.find((d) => d.id === selectedDoor);
    if (door) {
      return (
        <div className="flex h-full w-[300px] flex-col border-l border-white/10 bg-[#111116]">
          <div className="border-b border-white/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Porta</h3>
              <button onClick={clearSelection} className="text-xs text-gray-500 hover:text-white">✕</button>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <p className="text-xs text-gray-500">Posição: ({door.x}, {door.y})</p>
            <p className="text-sm text-white">Tipo: {door.type}</p>
            <p className="text-sm text-white">Estado: {door.state}</p>
            <button
              onClick={() => { removeDoor(door.id); clearSelection(); }}
              className="w-full rounded bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20"
            >
              Remover Porta
            </button>
          </div>
        </div>
      );
    }
  }

  // Selected object properties
  if (selectedObject) {
    const obj = layers.objects.objects.find((o) => o.id === selectedObject);
    if (obj) {
      return (
        <div className="flex h-full w-[300px] flex-col border-l border-white/10 bg-[#111116]">
          <div className="border-b border-white/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Objeto</h3>
              <button onClick={clearSelection} className="text-xs text-gray-500 hover:text-white">✕</button>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <p className="text-xs text-gray-500">Posição: ({obj.x}, {obj.y})</p>
            <p className="text-sm text-white">Tipo: {obj.type}</p>
            <p className="text-sm text-white">Nome: {obj.name}</p>
            <p className="text-sm text-white">Tamanho: {obj.width}×{obj.height}</p>
            <button
              onClick={() => { removeObject(obj.id); clearSelection(); }}
              className="w-full rounded bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20"
            >
              Remover Objeto
            </button>
          </div>
        </div>
      );
    }
  }

  // Selected light properties
  if (selectedLight) {
    const light = layers.lighting.sources.find((l) => l.id === selectedLight);
    if (light) {
      return (
        <div className="flex h-full w-[300px] flex-col border-l border-white/10 bg-[#111116]">
          <div className="border-b border-white/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Fonte de Luz</h3>
              <button onClick={clearSelection} className="text-xs text-gray-500 hover:text-white">✕</button>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <p className="text-xs text-gray-500">Posição: ({light.x}, {light.y})</p>
            <p className="text-sm text-white">Tipo: {light.type}</p>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Raio ({light.radius})</label>
              <input
                type="range"
                min={1}
                max={20}
                value={light.radius}
                onChange={(e) => updateLight(light.id, { radius: Number(e.target.value) })}
                className="w-full accent-brand-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Intensidade ({Math.round(light.intensity * 100)}%)</label>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(light.intensity * 100)}
                onChange={(e) => updateLight(light.id, { intensity: Number(e.target.value) / 100 })}
                className="w-full accent-brand-accent"
              />
            </div>
            <label className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Cor</span>
              <input
                type="color"
                value={light.color}
                onChange={(e) => updateLight(light.id, { color: e.target.value })}
                className="h-6 w-8 cursor-pointer rounded border border-white/10 bg-transparent"
              />
            </label>
            <button
              onClick={() => { removeLight(light.id); clearSelection(); }}
              className="w-full rounded bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20"
            >
              Remover Luz
            </button>
          </div>
        </div>
      );
    }
  }

  // Default empty state
  return (
    <div className="flex h-full w-[300px] flex-col border-l border-white/10 bg-[#111116]">
      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Propriedades</h3>
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-center text-xs text-gray-500">
          Selecione um elemento no mapa para ver suas propriedades. Use a
          ferramenta Cursor (↖) para selecionar tiles.
        </p>
      </div>
    </div>
  );
}
