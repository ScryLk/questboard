"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  MAP_LIMITS,
  MAP_PRESETS,
  isSoftLarge,
  validateMapDimensions,
} from "@questboard/constants";
import { ModalShell } from "@/components/gameplay/modals/modal-shell";
import { useMapLibraryStore } from "@/lib/map-library-store";
import type { MapCategory } from "@/lib/map-types";

export interface AICreationParams {
  description: string;
  regionMode: boolean;
}

interface NewMapModalProps {
  onClose: () => void;
  /** Em modo IA, o 2º argumento traz descrição + regionMode pra o
   *  parent montar a URL correta. */
  onCreated: (id: string, aiParams?: AICreationParams) => void;
  /** Quando true, o modal vira "Gerar com IA" — título, placeholder e
   *  label do botão mudam. A categoria default vira "custom".
   *  Adiciona campo de descrição obrigatório + toggle de região. */
  aiMode?: boolean;
}

const CATEGORIES: { value: MapCategory; label: string }[] = [
  { value: "dungeon", label: "Dungeon" },
  { value: "outdoor", label: "Natureza" },
  { value: "city", label: "Urbano" },
  { value: "cave", label: "Caverna" },
  { value: "custom", label: "Custom" },
];

// Default "Câmara" (preset central) — bate com MAP_LIMITS.DEFAULT_*
const DEFAULT_PRESET_INDEX = MAP_PRESETS.findIndex((p) => p.id === "chamber");

export function NewMapModal({
  onClose,
  onCreated,
  aiMode = false,
}: NewMapModalProps) {
  const addMap = useMapLibraryStore((s) => s.addMap);

  const [name, setName] = useState("");
  const [cols, setCols] = useState<number>(MAP_LIMITS.DEFAULT_WIDTH);
  const [rows, setRows] = useState<number>(MAP_LIMITS.DEFAULT_HEIGHT);
  const [category, setCategory] = useState<MapCategory>(
    aiMode ? "custom" : "dungeon",
  );

  // AI-only: descrição do local + toggle pra selecionar região depois.
  const [aiDescription, setAiDescription] = useState("");
  const [aiRegionMode, setAiRegionMode] = useState(false);
  // API exige min 10 chars (ai-map.schema.ts). Replicamos aqui pra
  // validação imediata sem round-trip.
  const AI_DESCRIPTION_MIN = 10;
  const aiDescriptionRequired = aiMode && !aiRegionMode;
  const aiDescriptionTrimmed = aiDescription.trim();
  const aiDescriptionMissing =
    aiDescriptionRequired && aiDescriptionTrimmed.length === 0;
  const aiDescriptionTooShort =
    aiDescriptionRequired &&
    aiDescriptionTrimmed.length > 0 &&
    aiDescriptionTrimmed.length < AI_DESCRIPTION_MIN;
  const aiDescriptionInvalid = aiDescriptionMissing || aiDescriptionTooShort;
  const [selectedPreset, setSelectedPreset] = useState<number>(
    DEFAULT_PRESET_INDEX,
  );
  const [customSize, setCustomSize] = useState(false);

  const handlePreset = (index: number) => {
    const p = MAP_PRESETS[index];
    setCols(p.width);
    setRows(p.height);
    setSelectedPreset(index);
    setCustomSize(false);
  };

  // Em modo IA, o schema da API cap em 60 células (ai-map.schema.ts).
  // Travamos aqui pra evitar 400 silencioso.
  const AI_MAX_CELLS = 60;
  const effectiveMaxCells = aiMode ? AI_MAX_CELLS : MAP_LIMITS.HARD_MAX_CELLS;

  const clampCell = (v: number) =>
    Math.max(
      MAP_LIMITS.MIN_CELLS,
      Math.min(effectiveMaxCells, Number(v) || MAP_LIMITS.MIN_CELLS),
    );

  // Validação em tempo real — mostra mensagem pro user, bloqueia criação
  const dimensionError = validateMapDimensions(cols, rows);
  const warnLarge = !dimensionError && isSoftLarge(cols, rows);

  const handleCreate = () => {
    if (dimensionError) return;
    if (aiDescriptionInvalid) return;
    const mapName = name.trim() || (aiMode ? "Mapa IA" : "Novo Mapa");
    const id = addMap({
      version: 1,
      name: mapName,
      description: "",
      tags: [],
      category,
      thumbnail: null,
      width: cols,
      height: rows,
      cellSizeFt: 5,
      terrain: {},
      walls: {},
      objects: [],
      backgroundImage: null,
      backgroundOpacity: 0.5,
      stats: { terrainCount: 0, wallCount: 0, objectCount: 0 },
      collectionId: null,
      order: 0,
    });
    if (aiMode) {
      onCreated(id, {
        description: aiDescription.trim(),
        regionMode: aiRegionMode,
      });
    } else {
      onCreated(id);
    }
    onClose();
  };

  return (
    <ModalShell
      title={aiMode ? "Gerar Mapa com IA" : "Novo Mapa"}
      maxWidth={aiMode ? 620 : 480}
      onClose={onClose}
    >
      {/* Name */}
      <div className="mb-4">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Nome
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={
            aiMode ? "Ex: Masmorra do Necromante" : "Ex: Caverna do Goblin"
          }
          className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text placeholder:text-brand-muted/60 focus:border-brand-accent focus:outline-none"
          autoFocus
        />
      </div>

      {/* Size presets */}
      <div className="mb-4">
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Tamanho
        </label>
        <div className="grid grid-cols-4 gap-2">
          {MAP_PRESETS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => handlePreset(i)}
              title={p.description}
              className={`rounded-lg border px-2 py-2 text-center text-xs transition-colors ${
                !customSize && selectedPreset === i
                  ? "border-brand-accent bg-brand-accent/10 text-white"
                  : "border-brand-border text-brand-muted hover:border-brand-accent/40 hover:text-brand-text"
              }`}
            >
              <div className="font-medium">{p.label}</div>
              <div className="text-[10px] opacity-70">
                {p.width}x{p.height}
              </div>
            </button>
          ))}
        </div>

        {/* Custom toggle */}
        <button
          onClick={() => setCustomSize(!customSize)}
          className={`mt-2 text-[10px] transition-colors ${
            customSize
              ? "text-brand-accent"
              : "text-brand-muted hover:text-brand-text"
          }`}
        >
          {customSize ? "Usar preset" : "Tamanho personalizado"}
        </button>

        {customSize && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min={MAP_LIMITS.MIN_CELLS}
              max={effectiveMaxCells}
              value={cols}
              onChange={(e) => setCols(clampCell(Number(e.target.value)))}
              className="h-8 w-20 rounded border border-brand-border bg-brand-primary px-2 text-center text-xs text-brand-text focus:border-brand-accent focus:outline-none"
            />
            <span className="text-xs text-brand-muted">x</span>
            <input
              type="number"
              min={MAP_LIMITS.MIN_CELLS}
              max={effectiveMaxCells}
              value={rows}
              onChange={(e) => setRows(clampCell(Number(e.target.value)))}
              className="h-8 w-20 rounded border border-brand-border bg-brand-primary px-2 text-center text-xs text-brand-text focus:border-brand-accent focus:outline-none"
            />
            <span className="text-[10px] text-brand-muted/70">
              {MAP_LIMITS.MIN_CELLS}–{effectiveMaxCells}
              {aiMode && (
                <span className="ml-1 text-brand-muted/50">(IA)</span>
              )}
            </span>
          </div>
        )}

        {/* Validação / avisos */}
        {dimensionError && (
          <p className="mt-2 flex items-center gap-1.5 text-[10px] text-brand-danger">
            <AlertTriangle className="h-3 w-3" />
            {dimensionError.message}
          </p>
        )}
        {warnLarge && (
          <p className="mt-2 flex items-center gap-1.5 text-[10px] text-brand-warning">
            <AlertTriangle className="h-3 w-3" />
            Mapa grande (&gt;{MAP_LIMITS.SOFT_MAX_CELLS} células) — pode ficar
            pesado em dispositivos fracos.
          </p>
        )}
      </div>

      {/* AI-only: descrição do local + toggle de região */}
      {aiMode && (
        <div className="mb-3 rounded-lg border border-brand-accent/20 bg-brand-accent/[0.04] p-3">
          <div className="mb-1 flex items-center justify-between gap-3">
            <label className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">
              Descrição do local
              {aiDescriptionRequired && (
                <span className="ml-1 text-brand-danger">*</span>
              )}
              <span className="ml-2 text-[9px] normal-case tracking-normal text-brand-muted/60">
                ({aiRegionMode ? "opcional" : "obrigatório"})
              </span>
            </label>
            <label className="flex shrink-0 cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={aiRegionMode}
                onChange={(e) => setAiRegionMode(e.target.checked)}
                className="h-3.5 w-3.5 accent-brand-accent"
              />
              <span className="text-[10px] text-brand-text">
                Selecionar região no mapa
              </span>
            </label>
          </div>
          <textarea
            value={aiDescription}
            onChange={(e) => setAiDescription(e.target.value)}
            placeholder={
              aiRegionMode
                ? "Opcional — você vai desenhar a área no mapa"
                : "Ex: Masmorra antiga em pedra escura, corredores estreitos com tochas nas paredes, sala central com um altar de obsidiana..."
            }
            rows={2}
            className="w-full resize-none rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-xs text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none"
          />

          {aiDescriptionMissing && (
            <p className="mt-1.5 flex items-center gap-1 text-[10px] text-brand-danger">
              <AlertTriangle className="h-3 w-3" />
              Descreva o local pra IA gerar o mapa.
            </p>
          )}
          {aiDescriptionTooShort && (
            <p className="mt-1.5 flex items-center gap-1 text-[10px] text-brand-danger">
              <AlertTriangle className="h-3 w-3" />
              Descrição precisa de ao menos {AI_DESCRIPTION_MIN} caracteres
              ({aiDescriptionTrimmed.length}/{AI_DESCRIPTION_MIN}).
            </p>
          )}
        </div>
      )}

      {/* Category */}
      <div className="mb-6">
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Categoria
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                category === c.value
                  ? "border-brand-accent bg-brand-accent/10 text-white"
                  : "border-brand-border text-brand-muted hover:border-brand-accent/40 hover:text-brand-text"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-xs text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
        >
          Cancelar
        </button>
        <button
          onClick={handleCreate}
          disabled={!!dimensionError || aiDescriptionInvalid}
          className="rounded-lg bg-brand-accent px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-accent/80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {aiMode
            ? aiRegionMode
              ? "Selecionar região"
              : "Gerar com IA"
            : "Criar Mapa"}
        </button>
      </div>
    </ModalShell>
  );
}
