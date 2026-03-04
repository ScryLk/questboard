"use client";

import { useSettingsStore } from "@/lib/settings-store";
import {
  SettingsSection,
  SettingsToggle,
  SettingsRadio,
  SettingsSelect,
  SettingsSlider,
  SettingsNumberInput,
  SettingsColorPicker,
} from "../controls";

export function MapSection() {
  const { map, updateMap, updateTokenColors } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-white">Mapa e Canvas</h2>
        <p className="mt-1 text-sm text-gray-500">Configurações de grid, zoom, tokens e mini-mapa.</p>
      </div>

      <SettingsSection title="Grid">
        <SettingsRadio
          label="Tipo de Grid"
          value={map.gridType}
          onChange={(v) => updateMap({ gridType: v })}
          options={[
            { value: "square", label: "Quadrado", description: "Padrão D&D" },
            { value: "hex-flat", label: "Hex (flat top)" },
            { value: "hex-pointy", label: "Hex (pointy top)" },
            { value: "none", label: "Sem grid", description: "Teatro da mente" },
          ]}
          columns={2}
        />
        <div className="flex gap-4">
          <SettingsNumberInput label="Largura" value={map.defaultGridSize.width} onChange={(v) => updateMap({ defaultGridSize: { ...map.defaultGridSize, width: v } })} min={5} max={100} unit="cells" />
          <SettingsNumberInput label="Altura" value={map.defaultGridSize.height} onChange={(v) => updateMap({ defaultGridSize: { ...map.defaultGridSize, height: v } })} min={5} max={100} unit="cells" />
        </div>
        <SettingsNumberInput label="Escala" value={map.cellScale} onChange={(v) => updateMap({ cellScale: v })} min={1} max={30} unit="ft/cell" />
        <SettingsSelect
          label="Estilo das linhas"
          value={map.gridStyle}
          onChange={(v) => updateMap({ gridStyle: v })}
          options={[
            { value: "solid", label: "Sólido" },
            { value: "dashed", label: "Tracejado" },
            { value: "dots", label: "Pontos" },
          ]}
        />
        <SettingsSlider label="Opacidade do grid" value={map.gridOpacity} min={0} max={50} step={1} unit="%" onChange={(v) => updateMap({ gridOpacity: v })} />
        <SettingsSelect label="Espessura" value={map.gridThickness} onChange={(v) => updateMap({ gridThickness: v })} options={[{ value: 0.5, label: "0.5px" }, { value: 1, label: "1px" }, { value: 2, label: "2px" }]} />
        <SettingsToggle label="Mostrar coordenadas (A1, B2...)" checked={map.showCoordinates} onChange={(v) => updateMap({ showCoordinates: v })} />
        <SettingsToggle label="Snap to grid" description="Tokens alinham ao grid." checked={map.snapToGrid} onChange={(v) => updateMap({ snapToGrid: v })} />
        <SettingsToggle label="Destacar célula sob o cursor" checked={map.hoverHighlight} onChange={(v) => updateMap({ hoverHighlight: v })} />
        <SettingsToggle label="Destacar célula do token selecionado" checked={map.selectedCellHighlight} onChange={(v) => updateMap({ selectedCellHighlight: v })} />
      </SettingsSection>

      <SettingsSection title="Zoom">
        <SettingsSlider label="Zoom mínimo" value={map.zoomMin} min={10} max={100} step={5} unit="%" onChange={(v) => updateMap({ zoomMin: v })} />
        <SettingsSlider label="Zoom máximo" value={map.zoomMax} min={200} max={800} step={50} unit="%" onChange={(v) => updateMap({ zoomMax: v })} />
        <SettingsSelect label="Velocidade do scroll" value={map.zoomSpeed} onChange={(v) => updateMap({ zoomSpeed: v })} options={[{ value: "slow", label: "Lento" }, { value: "normal", label: "Normal" }, { value: "fast", label: "Rápido" }]} />
        <SettingsToggle label="Zoom suave (lerp)" checked={map.smoothZoom} onChange={(v) => updateMap({ smoothZoom: v })} />
        <SettingsToggle label="Pinch to zoom" checked={map.pinchToZoom} onChange={(v) => updateMap({ pinchToZoom: v })} />
      </SettingsSection>

      <SettingsSection title="Mini-mapa">
        <SettingsToggle label="Mostrar mini-mapa" checked={map.showMinimap} onChange={(v) => updateMap({ showMinimap: v })} />
        <SettingsSelect label="Posição" value={map.minimapPosition} onChange={(v) => updateMap({ minimapPosition: v })} options={[{ value: "bl", label: "Inferior Esquerdo" }, { value: "br", label: "Inferior Direito" }, { value: "tl", label: "Superior Esquerdo" }, { value: "tr", label: "Superior Direito" }]} />
        <SettingsSelect label="Tamanho" value={map.minimapSize} onChange={(v) => updateMap({ minimapSize: v })} options={[{ value: "small", label: "Pequeno" }, { value: "medium", label: "Médio" }, { value: "large", label: "Grande" }]} />
        <SettingsSlider label="Opacidade" value={map.minimapOpacity} min={20} max={100} step={5} unit="%" onChange={(v) => updateMap({ minimapOpacity: v })} />
      </SettingsSection>

      <SettingsSection title="Fundo do Canvas">
        <SettingsRadio label="Estilo" value={map.canvasBackground} onChange={(v) => updateMap({ canvasBackground: v })} options={[{ value: "solid", label: "Cor sólida" }, { value: "gradient", label: "Gradiente" }, { value: "texture", label: "Textura" }, { value: "transparent", label: "Transparente" }]} columns={2} />
      </SettingsSection>

      <SettingsSection title="Diagonal">
        <SettingsRadio label="Regra de diagonal" value={map.diagonalRule} onChange={(v) => updateMap({ diagonalRule: v })} options={[{ value: "5ft", label: "5ft (simplificada)" }, { value: "alternating", label: "5/10/5/10 alternada", description: "Regra oficial D&D" }, { value: "euclidean", label: "Euclidiana", description: "Distância real" }]} />
      </SettingsSection>

      <SettingsSection title="Tokens">
        <SettingsRadio label="Estilo" value={map.tokenStyle} onChange={(v) => updateMap({ tokenStyle: v })} options={[{ value: "circle-initials", label: "Círculo + iniciais" }, { value: "circle-icon", label: "Círculo + ícone" }, { value: "square-initials", label: "Quadrado + iniciais" }, { value: "portrait", label: "Retrato" }]} columns={2} />
        <SettingsSelect label="Tamanho base" value={map.tokenBaseSize} onChange={(v) => updateMap({ tokenBaseSize: v })} options={[{ value: 32, label: "32px" }, { value: 36, label: "36px" }, { value: 40, label: "40px" }, { value: 48, label: "48px" }]} />
      </SettingsSection>

      <SettingsSection title="Barra de HP">
        <SettingsToggle label="Mostrar barra de HP nos tokens" checked={map.showHPBar} onChange={(v) => updateMap({ showHPBar: v })} />
        <SettingsSelect label="Posição" value={map.hpBarPosition} onChange={(v) => updateMap({ hpBarPosition: v })} options={[{ value: "below", label: "Abaixo" }, { value: "inside", label: "Dentro" }, { value: "above", label: "Acima" }]} />
        <SettingsSlider label="Largura" value={map.hpBarWidth} min={30} max={100} step={5} unit="%" onChange={(v) => updateMap({ hpBarWidth: v })} />
      </SettingsSection>

      <SettingsSection title="Nome do Token">
        <SettingsToggle label="Mostrar nome" checked={map.showTokenName} onChange={(v) => updateMap({ showTokenName: v })} />
        <SettingsNumberInput label="Tamanho da fonte" value={map.tokenNameSize} onChange={(v) => updateMap({ tokenNameSize: v })} min={8} max={16} unit="px" />
        <SettingsToggle label="Truncar nomes longos" description="Máximo 8 caracteres." checked={map.truncateTokenNames} onChange={(v) => updateMap({ truncateTokenNames: v })} />
      </SettingsSection>

      <SettingsSection title="Cores por Tipo">
        <ColorRow label="Jogador" value={map.tokenColors.player} onChange={(v) => updateTokenColors({ player: v })} />
        <ColorRow label="Hostil" value={map.tokenColors.hostile} onChange={(v) => updateTokenColors({ hostile: v })} />
        <ColorRow label="Aliado" value={map.tokenColors.ally} onChange={(v) => updateTokenColors({ ally: v })} />
        <ColorRow label="Neutro" value={map.tokenColors.neutral} onChange={(v) => updateTokenColors({ neutral: v })} />
        <ColorRow label="Objeto" value={map.tokenColors.object} onChange={(v) => updateTokenColors({ object: v })} />
      </SettingsSection>

      <SettingsSection title="Condições">
        <SettingsToggle label="Mostrar ícones de condição" checked={map.showConditionIcons} onChange={(v) => updateMap({ showConditionIcons: v })} />
        <SettingsToggle label="Tint de cor por condição" description="Envenenado = verde, etc." checked={map.showConditionTint} onChange={(v) => updateMap({ showConditionTint: v })} />
        <SettingsSelect label="Posição dos ícones" value={map.conditionIconPosition} onChange={(v) => updateMap({ conditionIconPosition: v })} options={[{ value: "top-left", label: "Canto sup. esq." }, { value: "top-right", label: "Canto sup. dir." }, { value: "bottom-left", label: "Canto inf. esq." }, { value: "bottom-right", label: "Canto inf. dir." }]} />
      </SettingsSection>
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-white">{label}</span>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent" />
        <span className="font-mono text-xs text-gray-500">{value}</span>
      </div>
    </div>
  );
}
