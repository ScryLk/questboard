"use client";

import { useCallback, useRef, useState } from "react";
import { Map, Upload, X } from "lucide-react";
import { ModalShell } from "./modal-shell";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useMapSidebarStore } from "@/lib/map-sidebar-store";
import { MOCK_SESSION_MAPS } from "@/lib/gameplay-mock-data";
import type {
  MapObjectCell,
  MapObjectType,
  TerrainCell,
  WallData,
  WallType,
} from "@/lib/gameplay-mock-data";
import type { SceneSavedState } from "@/lib/map-sidebar-types";
import { wallSideToEdgeKey } from "@/lib/wall-helpers";
import { ROOM_TEMPLATES } from "@/lib/room-templates";
import type { RoomTemplate } from "@/lib/room-templates";
import { RoomTemplatePreview } from "./room-template-preview";

interface CreateSceneModalProps {
  onClose: () => void;
}

// Subset curado pra "Nova Cena". Backend trará uma galeria maior; aqui
// pegamos um exemplar de cada vibe (taverna, masmorra, throne, outdoor,
// biblioteca, tesouro) pra dar variedade visual sem encher a tela.
const TEMPLATE_PICKS = [
  "tavern_main",
  "throne_room",
  "small_stone_room",
  "forest_clearing",
  "library",
  "treasure_vault",
];

const CURATED_TEMPLATES = TEMPLATE_PICKS.map((id) =>
  ROOM_TEMPLATES.find((t) => t.id === id),
).filter((t): t is NonNullable<typeof t> => Boolean(t));

export function CreateSceneModal({ onClose }: CreateSceneModalProps) {
  const [name, setName] = useState("");
  const [cols, setCols] = useState("25");
  const [rows, setRows] = useState("25");
  const [cellSize, setCellSize] = useState("40");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBgImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleCreate = () => {
    const gridCols = Math.max(1, parseInt(cols, 10) || 25);
    const gridRows = Math.max(1, parseInt(rows, 10) || 25);
    const sceneName = name.trim() || "Nova Cena";

    const tmpl: RoomTemplate | null = selectedSourceId?.startsWith("tmpl:")
      ? CURATED_TEMPLATES.find(
          (t) => `tmpl:${t.id}` === selectedSourceId,
        ) ?? null
      : null;

    const { terrainCells, wallEdges, mapObjects } = buildSceneContent(
      tmpl,
      gridCols,
      gridRows,
    );

    const sidebar = useMapSidebarStore.getState();

    // Estado salvo da nova cena. Não puxa nada do gameplay-store atual
    // (esta é uma cena nova, em branco) — só o que veio do template.
    const savedState: SceneSavedState = {
      tokens: [],
      fogCells: [],
      markers: [],
      notes: [],
      aoeInstances: [],
      lightSources: [],
      terrainCells,
      wallEdges,
      mapObjects,
      cameraPosition: { scrollLeft: 0, scrollTop: 0, zoom: 1 },
      ambientLight: sidebar.ambientLight,
      gridVisible: true,
    };

    const category = tmpl?.category === "outdoor" ? "Overworld" : "Dungeon";
    const scene = sidebar.addScene({
      name: sceneName,
      category,
      dimensions: `${gridCols}×${gridRows}`,
      savedState,
    });

    // Aplica como ativa — loadSceneState empurra o conteúdo pro gameplay-store.
    sidebar.setActiveScene(scene.id);

    // mapConfig + bg não fazem parte de SceneSavedState, então setamos direto.
    const gp = useGameplayStore.getState();
    gp.setMapConfig({ gridCols, gridRows, name: sceneName });
    if (bgImage) {
      gp.setMapBackgroundImage(bgImage);
    } else {
      // Limpa fundo anterior pra que o terreno do template fique visível.
      gp.setMapBackgroundImage(null);
    }

    onClose();
  };

  return (
    <ModalShell
      title="Nova Cena"
      maxWidth={880}
      maxHeight="none"
      onClose={onClose}
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        {/* ── Coluna esquerda: form + ações no rodapé ── */}
        <div className="flex flex-col gap-4">
          {/* Scene name */}
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-brand-muted">
              Nome da cena
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sala do Trono"
              className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text placeholder:text-brand-muted/60 focus:border-brand-accent focus:outline-none"
            />
          </div>

          {/* Grid dimensions */}
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-brand-muted">
              Dimensões do Grid
            </label>
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
              <div>
                <input
                  type="number"
                  value={cols}
                  onChange={(e) => setCols(e.target.value)}
                  className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary px-2 text-sm text-brand-text focus:border-brand-accent focus:outline-none"
                />
                <span className="mt-0.5 block text-center text-[10px] text-brand-muted">
                  Colunas
                </span>
              </div>
              <span className="self-center text-brand-muted">×</span>
              <div>
                <input
                  type="number"
                  value={rows}
                  onChange={(e) => setRows(e.target.value)}
                  className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary px-2 text-sm text-brand-text focus:border-brand-accent focus:outline-none"
                />
                <span className="mt-0.5 block text-center text-[10px] text-brand-muted">
                  Linhas
                </span>
              </div>
              <span className="self-center text-brand-muted">·</span>
              <div>
                <input
                  type="number"
                  value={cellSize}
                  onChange={(e) => setCellSize(e.target.value)}
                  className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary px-2 text-sm text-brand-text focus:border-brand-accent focus:outline-none"
                />
                <span className="mt-0.5 block text-center text-[10px] text-brand-muted">
                  Célula (px)
                </span>
              </div>
            </div>
          </div>

          {/* Background image upload */}
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-brand-muted">
              Imagem de Fundo (opcional)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {bgImage ? (
              <div className="relative overflow-hidden rounded-lg border border-brand-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bgImage}
                  alt="Background preview"
                  className="h-24 w-full object-cover"
                />
                <button
                  onClick={() => setBgImage(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                  dragging
                    ? "border-brand-accent bg-brand-accent/10"
                    : "border-brand-border bg-brand-primary hover:border-brand-accent/50"
                }`}
              >
                <div className="flex flex-col items-center gap-1 text-brand-muted">
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Arraste ou clique para enviar</span>
                </div>
              </div>
            )}
          </div>

          {/* Spacer empurra ações pro fim da coluna pra alinhar com a galeria */}
          <div className="flex-1" />

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t border-brand-border pt-4">
            <button
              onClick={onClose}
              className="h-9 rounded-lg border border-brand-border px-4 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              className="h-9 rounded-lg bg-brand-accent px-4 text-xs font-medium text-white transition-colors hover:bg-brand-accent/90"
            >
              Criar Cena
            </button>
          </div>
        </div>

        {/* ── Coluna direita: galerias ── */}
        <div className="space-y-4">
          {/* Session maps — lista compacta horizontal pra não duplicar
           *  vertical com Templates abaixo. */}
          {MOCK_SESSION_MAPS.length > 0 && (
            <section>
              <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                Mapas da Sessão
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {MOCK_SESSION_MAPS.map((map) => {
                  const isSelected = selectedSourceId === `session:${map.id}`;
                  return (
                    <button
                      key={map.id}
                      onClick={() => {
                        setName(map.name);
                        setCols(String(map.gridCols));
                        setRows(String(map.gridRows));
                        setSelectedSourceId(`session:${map.id}`);
                      }}
                      className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors ${
                        isSelected
                          ? "border-brand-accent/60 bg-brand-accent/10"
                          : "border-brand-border bg-brand-primary hover:border-brand-accent/40"
                      }`}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded bg-[#0A0A0F]">
                        {map.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={map.thumbnail}
                            alt={map.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Map className="h-3.5 w-3.5 text-brand-muted/60" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium text-brand-text">
                          {map.name}
                        </p>
                        <p className="truncate text-[10px] text-brand-muted">
                          {map.gridCols}×{map.gridRows}
                        </p>
                      </div>
                      {map.isActive && (
                        <span className="shrink-0 rounded-full bg-brand-success/15 px-1 py-0.5 text-[8px] font-medium text-brand-success">
                          Ativo
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Templates */}
          <section>
            <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-brand-muted">
              Templates
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {CURATED_TEMPLATES.map((tmpl) => {
                const isSelected = selectedSourceId === `tmpl:${tmpl.id}`;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      setName(tmpl.name);
                      setCols(String(Math.max(20, tmpl.width * 3)));
                      setRows(String(Math.max(15, tmpl.height * 3)));
                      setSelectedSourceId(`tmpl:${tmpl.id}`);
                    }}
                    className={`flex flex-col gap-1 rounded-lg border p-1.5 text-left transition-colors ${
                      isSelected
                        ? "border-brand-accent/60 bg-brand-accent/10"
                        : "border-brand-border bg-brand-primary hover:border-brand-accent/40"
                    }`}
                  >
                    <div className="aspect-[3/2] w-full overflow-hidden rounded-md">
                      <RoomTemplatePreview
                        template={tmpl}
                        width={120}
                        height={80}
                        className="h-full w-full"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] leading-none">{tmpl.icon}</span>
                      <p className="min-w-0 flex-1 truncate text-[11px] font-medium text-brand-text">
                        {tmpl.name}
                      </p>
                      <span className="shrink-0 text-[9px] text-brand-muted">
                        {tmpl.width}×{tmpl.height}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </ModalShell>
  );
}

// ── Helpers ──

function makeObjectId(): string {
  return `obj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/** Converte um RoomTemplate em arrays prontos pra gameplay-store,
 *  centralizando o conteúdo dentro do grid escolhido. Quando o template
 *  é null (cena em branco), retorna tudo vazio. */
function buildSceneContent(
  tmpl: RoomTemplate | null,
  gridCols: number,
  gridRows: number,
): {
  terrainCells: TerrainCell[];
  wallEdges: Record<string, WallData>;
  mapObjects: MapObjectCell[];
} {
  if (!tmpl) {
    return { terrainCells: [], wallEdges: {}, mapObjects: [] };
  }

  const cx = Math.max(0, Math.floor((gridCols - tmpl.width) / 2));
  const cy = Math.max(0, Math.floor((gridRows - tmpl.height) / 2));

  const terrainCells: TerrainCell[] = [];
  for (const t of tmpl.terrain) {
    const x = cx + t.dx;
    const y = cy + t.dy;
    if (x < 0 || y < 0 || x >= gridCols || y >= gridRows) continue;
    terrainCells.push({ x, y, type: t.type });
  }

  const wallEdges: Record<string, WallData> = {};
  for (const w of tmpl.walls) {
    const x = cx + w.dx;
    const y = cy + w.dy;
    if (x < 0 || y < 0 || x >= gridCols || y >= gridRows) continue;
    let wt: WallType = "wall";
    if (w.isDoor) {
      wt =
        w.doorState === "open"
          ? "door-open"
          : w.doorState === "locked"
            ? "door-locked"
            : "door-closed";
    }
    wallEdges[wallSideToEdgeKey(x, y, w.side)] = { type: wt, style: "stone" };
  }

  const mapObjects: MapObjectCell[] = [];
  for (const o of tmpl.objects) {
    const x = cx + o.dx;
    const y = cy + o.dy;
    if (x < 0 || y < 0 || x >= gridCols || y >= gridRows) continue;
    mapObjects.push({
      id: makeObjectId(),
      x,
      y,
      type: o.type as MapObjectType,
      rotation: 0,
    });
  }

  return { terrainCells, wallEdges, mapObjects };
}
